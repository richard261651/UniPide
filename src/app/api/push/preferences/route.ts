import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        notifPushEnabled: true,
        notifPedidos: true,
        notifChat: true,
        notifAdmin: true,
        _count: {
          select: {
            pushSubscriptions: {
              where: { activo: true },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      preferences: {
        notifPushEnabled: user.notifPushEnabled,
        notifPedidos: user.notifPedidos,
        notifChat: user.notifChat,
        notifAdmin: user.notifAdmin,
        activeSubscriptionsCount: user._count.pushSubscriptions,
      },
    });
  } catch (error: any) {
    console.error('Error al obtener preferencias push:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al obtener preferencias' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { notifPushEnabled, notifPedidos, notifChat, notifAdmin } = body;

    const updateData: any = {};
    if (typeof notifPushEnabled === 'boolean') updateData.notifPushEnabled = notifPushEnabled;
    if (typeof notifPedidos === 'boolean') updateData.notifPedidos = notifPedidos;
    if (typeof notifChat === 'boolean') updateData.notifChat = notifChat;
    if (typeof notifAdmin === 'boolean') updateData.notifAdmin = notifAdmin;

    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: updateData,
      select: {
        id: true,
        notifPushEnabled: true,
        notifPedidos: true,
        notifChat: true,
        notifAdmin: true,
      },
    });

    return NextResponse.json({
      success: true,
      preferences: updatedUser,
    });
  } catch (error: any) {
    console.error('Error al actualizar preferencias push:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al actualizar preferencias' },
      { status: 500 }
    );
  }
}
