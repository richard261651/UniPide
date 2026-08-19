import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const existing = await prisma.rating.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Reseña no encontrada' }, { status: 404 });
    }

    const businessId = existing.businessId;

    await prisma.rating.delete({ where: { id } });

    // Recalcular promedio de estrellas del negocio
    const remainingRatings = await prisma.rating.findMany({
      where: { businessId },
    });

    let newPromedio = 5.0;
    let newNumResenas = remainingRatings.length;

    if (newNumResenas > 0) {
      const sum = remainingRatings.reduce((acc, r) => acc + r.puntuacion, 0);
      newPromedio = Number((sum / newNumResenas).toFixed(1));
    }

    await prisma.business.update({
      where: { id: businessId },
      data: {
        calificacionPromedio: newPromedio,
        numCalificaciones: newNumResenas,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Reseña eliminada con éxito y promedio de negocio actualizado',
    });
  } catch (error: any) {
    console.error('Error al eliminar reseña:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la reseña' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { puntuacion, comentario } = await request.json();

    const existing = await prisma.rating.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Reseña no encontrada' }, { status: 404 });
    }

    const updated = await prisma.rating.update({
      where: { id },
      data: {
        puntuacion: puntuacion ? Number(puntuacion) : existing.puntuacion,
        comentario: comentario !== undefined ? comentario : existing.comentario,
      },
    });

    // Recalcular promedio de estrellas del negocio
    const allRatings = await prisma.rating.findMany({
      where: { businessId: existing.businessId },
    });

    const sum = allRatings.reduce((acc, r) => acc + r.puntuacion, 0);
    const newPromedio = Number((sum / allRatings.length).toFixed(1));

    await prisma.business.update({
      where: { id: existing.businessId },
      data: {
        calificacionPromedio: newPromedio,
        numCalificaciones: allRatings.length,
      },
    });

    return NextResponse.json({
      success: true,
      rating: updated,
      message: 'Reseña actualizada correctamente',
    });
  } catch (error: any) {
    console.error('Error al actualizar reseña:', error);
    return NextResponse.json(
      { error: 'Error al modificar la reseña' },
      { status: 500 }
    );
  }
}
