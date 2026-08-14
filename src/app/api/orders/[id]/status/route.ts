import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { estado } = body;

    const validStates = ['RECIBIDO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'];
    if (!estado || !validStates.includes(estado)) {
      return NextResponse.json({ error: 'Estado de pedido inválido' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    // Permitir cambios al emprendedor dueño, al admin, o si el cliente desea cancelar un pedido recién creado
    const isBusinessOwner = order.business.userId === session.id;
    const isAdmin = session.rol === 'ADMIN';
    const isClientCancelling = order.clienteId === session.id && estado === 'CANCELADO' && order.estado === 'RECIBIDO';

    if (!isBusinessOwner && !isAdmin && !isClientCancelling) {
      return NextResponse.json(
        { error: 'No tienes permiso para modificar el estado de este pedido' },
        { status: 403 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { estado },
      include: {
        items: true,
        cliente: { select: { nombre: true, correo: true, telefono: true } },
      },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('Error actualizando estado de pedido:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar estado del pedido' },
      { status: 500 }
    );
  }
}
