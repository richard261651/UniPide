import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { sendPushToUser } from '@/lib/pushNotifications';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const count = await sendPushToUser(session.id, {
      title: '🔔 ¡Notificación de Prueba UniPide!',
      body: `¡Hola ${session.nombre}! Las notificaciones push están configuradas y funcionando perfectamente en tu dispositivo.`,
      url: '/',
      tag: 'test-notification',
      category: 'general',
      vibrate: [200, 100, 200, 100, 200],
    });

    if (count === 0) {
      return NextResponse.json(
        {
          success: false,
          sentCount: 0,
          message:
            'No se encontraron dispositivos activos para este usuario. Asegúrate de permitir las notificaciones en el navegador.',
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      sentCount: count,
      message: `Notificación enviada a ${count} dispositivo(s) activo(s).`,
    });
  } catch (error: any) {
    console.error('Error enviando notificación de prueba:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al enviar notificación de prueba' },
      { status: 500 }
    );
  }
}
