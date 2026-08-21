import prisma from '@/lib/prisma';

export interface CreateNotificationParams {
  userId: string;
  titulo: string;
  mensaje: string;
  tipo: 'NUEVO_PEDIDO' | 'PAGO_CONFIRMADO' | 'ESTADO_PEDIDO' | 'APROBACION_NEGOCIO' | 'SISTEMA' | 'PQRS';
  url?: string;
}

/**
 * Crea una notificación en la base de datos de manera segura y no bloqueante
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    if (!params.userId) return null;

    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        titulo: params.titulo,
        mensaje: params.mensaje,
        tipo: params.tipo,
        url: params.url || null,
      },
    });

    return notification;
  } catch (error: any) {
    console.error('⚠️ [ERROR NOTIFICACIÓN]', error?.message || error);
    return null;
  }
}
