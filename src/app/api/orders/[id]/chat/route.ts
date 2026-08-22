import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { sendOrderChatMessagePush } from '@/lib/pushNotifications';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id: orderId } = params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { business: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    // Verificar que sea el cliente del pedido, el emprendedor del pedido o un admin
    const isClient = order.clienteId === session.id;
    const isEntrepreneur = order.business?.userId === session.id;
    const isAdmin = session.rol === 'ADMIN';

    if (!isClient && !isEntrepreneur && !isAdmin) {
      return NextResponse.json({ error: 'Acceso denegado a este chat' }, { status: 403 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { orderId },
      include: {
        remitente: {
          select: { id: true, nombre: true, foto: true },
        },
      },
      orderBy: { fechaCreacion: 'asc' },
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('Error cargando chat:', error);
    return NextResponse.json({ error: 'Error al obtener mensajes de chat' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id: orderId } = params;
    const body = await request.json();
    const { mensaje } = body;

    if (!mensaje || !mensaje.trim()) {
      return NextResponse.json({ error: 'El mensaje no puede estar vacío' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { business: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    const isClient = order.clienteId === session.id;
    const isEntrepreneur = order.business?.userId === session.id;
    const isAdmin = session.rol === 'ADMIN';

    if (!isClient && !isEntrepreneur && !isAdmin) {
      return NextResponse.json({ error: 'No puedes enviar mensajes en este pedido' }, { status: 403 });
    }

    let rolRemitente = 'CLIENTE';
    if (isAdmin) rolRemitente = 'ADMIN';
    else if (isEntrepreneur) rolRemitente = 'EMPRENDEDOR';

    const newMessage = await prisma.chatMessage.create({
      data: {
        orderId,
        remitenteId: session.id,
        rolRemitente,
        mensaje: mensaje.trim(),
      },
      include: {
        remitente: {
          select: { id: true, nombre: true, foto: true },
        },
      },
    });

    // Enviar notificación push al destinatario
    await sendOrderChatMessagePush({
      order: {
        id: order.id,
        codigoPedido: order.codigoPedido,
        clienteId: order.clienteId,
        business: {
          userId: order.business.userId,
          nombre: order.business.nombre,
        },
      },
      senderId: session.id,
      senderName: session.nombre,
      senderRole: rolRemitente,
      messageSnippet: mensaje.trim(),
    });

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error: any) {
    console.error('Error enviando mensaje:', error);
    return NextResponse.json({ error: 'Error al enviar mensaje' }, { status: 500 });
  }
}
