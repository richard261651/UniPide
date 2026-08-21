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

    await prisma.rating.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Reseña eliminada con éxito',
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
