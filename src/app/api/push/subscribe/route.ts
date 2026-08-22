import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { subscription, userAgent } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Datos de suscripción incompletos' },
        { status: 400 }
      );
    }

    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys;

    if (!p256dh || !auth) {
      return NextResponse.json(
        { error: 'Claves de cifrado p256dh y auth requeridas' },
        { status: 400 }
      );
    }

    // Upsert subscription
    const savedSubscription = await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        userId: session.id,
        p256dh,
        auth,
        userAgent: userAgent || request.headers.get('user-agent') || null,
        activo: true,
        fechaActualizacion: new Date(),
      },
      create: {
        userId: session.id,
        endpoint,
        p256dh,
        auth,
        userAgent: userAgent || request.headers.get('user-agent') || null,
        activo: true,
      },
    });

    // Asegurar que el usuario tenga notificaciones activadas
    await prisma.user.update({
      where: { id: session.id },
      data: { notifPushEnabled: true },
    });

    return NextResponse.json({ success: true, subscription: savedSubscription });
  } catch (error: any) {
    console.error('Error al guardar suscripción push:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al registrar suscripción push' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint } = body;

    if (endpoint) {
      await prisma.pushSubscription.updateMany({
        where: { endpoint, userId: session.id },
        data: { activo: false },
      });
    } else {
      // Desactivar todas las suscripciones del usuario
      await prisma.pushSubscription.updateMany({
        where: { userId: session.id },
        data: { activo: false },
      });
    }

    return NextResponse.json({ success: true, message: 'Suscripción desactivada' });
  } catch (error: any) {
    console.error('Error al desactivar suscripción push:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al eliminar suscripción push' },
      { status: 500 }
    );
  }
}
