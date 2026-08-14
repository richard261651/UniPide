import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { codigoPedido: id }],
      },
      include: {
        cliente: {
          select: { id: true, nombre: true, correo: true, telefono: true, foto: true },
        },
        business: {
          select: {
            id: true,
            nombre: true,
            slug: true,
            logo: true,
            ubicacionCampus: true,
            zonaCampusCodigo: true,
            user: { select: { telefono: true, correo: true } },
          },
        },
        items: {
          include: {
            product: { select: { id: true, nombre: true, foto: true, categoria: true } },
          },
        },
        rating: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    // Validar permisos de visualización
    const isOwner = order.clienteId === session.id;
    const isMerchant = order.business.id === session.businessId || session.rol === 'EMPRENDEDOR';
    const isAdmin = session.rol === 'ADMIN';

    if (!isOwner && !isMerchant && !isAdmin) {
      return NextResponse.json({ error: 'No tienes permiso para ver este pedido' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error('Error obteniendo detalle de pedido:', error);
    return NextResponse.json({ error: 'Error al obtener información del pedido' }, { status: 500 });
  }
}
