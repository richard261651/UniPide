import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        products: true,
        user: { select: { nombre: true, correo: true, telefono: true } },
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ business });
  } catch (error) {
    return NextResponse.json({ error: 'Error cargando negocio' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;
    const business = await prisma.business.findUnique({ where: { id } });

    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
    }

    if (business.userId !== session.id && session.rol !== 'ADMIN') {
      return NextResponse.json({ error: 'No tienes permiso para editar este negocio' }, { status: 403 });
    }

    const body = await request.json();
    const {
      nombre,
      categoria,
      descripcion,
      logo,
      banner,
      ubicacionCampus,
      zonaCampusCodigo,
      tiempoBasePrepMin,
      activo,
      estadoAprobacion,
    } = body;

    const updated = await prisma.business.update({
      where: { id },
      data: {
        ...(nombre && { nombre }),
        ...(categoria && { categoria }),
        ...(descripcion !== undefined && { descripcion }),
        ...(logo !== undefined && { logo }),
        ...(banner !== undefined && { banner }),
        ...(ubicacionCampus && { ubicacionCampus }),
        ...(zonaCampusCodigo && { zonaCampusCodigo }),
        ...(tiempoBasePrepMin !== undefined && { tiempoBasePrepMin: Number(tiempoBasePrepMin) }),
        ...(activo !== undefined && { activo }),
        ...(estadoAprobacion && session.rol === 'ADMIN' && { estadoAprobacion }),
      },
    });

    return NextResponse.json({ success: true, business: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al actualizar negocio' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (session.rol !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo los administradores pueden eliminar emprendimientos' },
        { status: 403 }
      );
    }

    const { id } = params;
    const business = await prisma.business.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
    }

    // 1. Eliminar ratings vinculados
    await prisma.rating.deleteMany({
      where: { businessId: id },
    });

    // 2. Eliminar items de pedidos de este negocio
    const orders = await prisma.order.findMany({
      where: { businessId: id },
      select: { id: true },
    });
    const orderIds = orders.map((o) => o.id);

    if (orderIds.length > 0) {
      await prisma.orderItem.deleteMany({
        where: { orderId: { in: orderIds } },
      });
      await prisma.order.deleteMany({
        where: { id: { in: orderIds } },
      });
    }

    // 3. Eliminar productos
    await prisma.product.deleteMany({
      where: { businessId: id },
    });

    // 4. Eliminar el negocio
    await prisma.business.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Emprendimiento eliminado correctamente' });
  } catch (error: any) {
    console.error('Error eliminando negocio:', error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar el negocio' },
      { status: 500 }
    );
  }
}
