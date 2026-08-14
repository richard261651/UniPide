import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Debes iniciar sesión para calificar' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, businessId, puntuacion, comentario } = body;

    if (!orderId || !businessId || !puntuacion) {
      return NextResponse.json(
        { error: 'orderId, businessId y puntuación (1 a 5) son obligatorios' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    if (order.clienteId !== session.id) {
      return NextResponse.json(
        { error: 'Solo el cliente que realizó el pedido puede calificarlo' },
        { status: 403 }
      );
    }

    if (order.estado !== 'ENTREGADO') {
      return NextResponse.json(
        { error: 'Solo puedes calificar pedidos que ya hayan sido entregados' },
        { status: 400 }
      );
    }

    // Verificar si ya fue calificado
    const existingRating = await prisma.rating.findUnique({
      where: { orderId },
    });

    if (existingRating) {
      return NextResponse.json(
        { error: 'Este pedido ya ha sido calificado anteriormente' },
        { status: 400 }
      );
    }

    const rating = await prisma.rating.create({
      data: {
        orderId,
        clienteId: session.id,
        businessId,
        puntuacion: Math.min(5, Math.max(1, Number(puntuacion))),
        comentario: comentario?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, rating });
  } catch (error: any) {
    console.error('Error enviando calificación:', error);
    return NextResponse.json(
      { error: error.message || 'Error al guardar la calificación' },
      { status: 500 }
    );
  }
}
