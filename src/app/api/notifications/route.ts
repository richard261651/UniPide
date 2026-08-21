import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

// GET: Obtener las notificaciones del usuario autenticado
export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ notifications: [], unreadCount: 0 }, { status: 200 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.id },
      orderBy: { fechaCreacion: 'desc' },
      take: 30,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.id,
        leido: false,
      },
    });

    return NextResponse.json({ notifications, unreadCount }, { status: 200 });
  } catch (error: any) {
    console.error('Error al obtener notificaciones:', error);
    return NextResponse.json({ error: 'Error al obtener notificaciones' }, { status: 500 });
  }
}

// PATCH: Marcar TODAS las notificaciones como leídas
export async function PATCH(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await prisma.notification.updateMany({
      where: { userId: session.id, leido: false },
      data: { leido: true },
    });

    return NextResponse.json({ success: true, mensaje: 'Todas las notificaciones fueron marcadas como leídas' });
  } catch (error: any) {
    console.error('Error al marcar notificaciones:', error);
    return NextResponse.json({ error: 'Error al actualizar notificaciones' }, { status: 500 });
  }
}
