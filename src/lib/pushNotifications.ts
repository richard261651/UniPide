import prisma from '@/lib/prisma';
import { sendWebPush, PushPayload } from './webpush';
import { createNotification } from './notifications';

export interface PushOptions extends PushPayload {
  category?: 'pedidos' | 'chat' | 'admin' | 'general';
}

/**
 * Envía una notificación push a un usuario específico si tiene las notificaciones activas
 */
export async function sendPushToUser(
  userId: string,
  options: PushOptions
): Promise<number> {
  try {
    if (!userId) return 0;

    // Verificar preferencias del usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        activo: true,
        notifPushEnabled: true,
        notifPedidos: true,
        notifChat: true,
        notifAdmin: true,
      },
    });

    if (!user || !user.activo || !user.notifPushEnabled) {
      return 0;
    }

    // Comprobar filtro por categoría
    if (options.category === 'pedidos' && !user.notifPedidos) return 0;
    if (options.category === 'chat' && !user.notifChat) return 0;
    if (options.category === 'admin' && !user.notifAdmin) return 0;

    // Buscar suscripciones activas del usuario
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId,
        activo: true,
      },
    });

    if (!subscriptions || subscriptions.length === 0) {
      return 0;
    }

    let successCount = 0;
    const promises = subscriptions.map(async (sub) => {
      const res = await sendWebPush(
        {
          endpoint: sub.endpoint,
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
        {
          title: options.title,
          body: options.body,
          icon: options.icon,
          badge: options.badge,
          url: options.url,
          tag: options.tag,
          vibrate: options.vibrate,
          data: options.data,
        }
      );
      if (res.success) successCount++;
    });

    await Promise.allSettled(promises);
    return successCount;
  } catch (error) {
    console.error('⚠️ [ERROR SENDING PUSH TO USER]', error);
    return 0;
  }
}

/**
 * Envía una notificación push a todos los administradores activos del sistema
 */
export async function sendPushToAdmins(options: PushOptions): Promise<number> {
  try {
    const admins = await prisma.user.findMany({
      where: {
        rol: 'ADMIN',
        activo: true,
        notifPushEnabled: true,
        notifAdmin: true,
      },
      select: { id: true },
    });

    let totalSent = 0;
    for (const admin of admins) {
      const count = await sendPushToUser(admin.id, {
        ...options,
        category: 'admin',
      });
      totalSent += count;
    }

    return totalSent;
  } catch (error) {
    console.error('⚠️ [ERROR SENDING PUSH TO ADMINS]', error);
    return 0;
  }
}

/**
 * Dispara notificación push y notificación in-app con tono jocoso y amigable según el estado del pedido
 */
export async function sendOrderStatePush(order: {
  id: string;
  codigoPedido: string;
  clienteId: string;
  estado: string;
  zonaEntregaNombre?: string | null;
  business: { nombre: string; userId?: string };
}) {
  try {
    const bizName = order.business?.nombre || 'el emprendimiento';
    const zona = order.zonaEntregaNombre || 'tu ubicación';
    const orderUrl = `/pedidos/${order.id}`;

    let title = `Actualización Pedido #${order.codigoPedido}`;
    let body = `Tu pedido en "${bizName}" cambió su estado a: ${order.estado}.`;

    switch (order.estado) {
      case 'RECIBIDO':
        title = `🚀 ¡Pedido #${order.codigoPedido} Recibido!`;
        body = `¡Tu orden ya aterrizó en "${bizName}"! El emprendedor está alistando los motores para consentirte.`;
        break;

      case 'EN_PREPARACION':
        title = `👨‍🍳 ¡Manos a la masa! (#${order.codigoPedido})`;
        body = `En "${bizName}" ya están preparando tu antojo con puro sazón y cariño norteño.`;
        break;

      case 'EN_CAMINO':
        title = `🏃‍♂️💨 ¡Pilas que ya vamos volando!`;
        body = `El repartidor va esquivando la calor del campus hacia ${zona}. ¡Ten listo el pago y tu mejor sonrisa!`;
        break;

      case 'ENTREGADO':
        title = `🎉 ¡Misión cumplida! (#${order.codigoPedido})`;
        body = `Tu pedido de "${bizName}" ha sido entregado con éxito. ¡A disfrutar! No olvides dejarle 5 estrellitas ⭐.`;
        break;

      case 'CANCELADO':
        title = `💔 Rayos... Pedido Cancelado`;
        body = `Tu pedido #${order.codigoPedido} en "${bizName}" fue cancelado. ¡Esperamos complacerte en tu próximo antojo!`;
        break;
    }

    // 1. Guardar notificación en base de datos
    await createNotification({
      userId: order.clienteId,
      titulo: title,
      mensaje: body,
      tipo: 'ESTADO_PEDIDO',
      url: orderUrl,
    });

    // 2. Enviar notificación push al navegador / teléfono del cliente
    await sendPushToUser(order.clienteId, {
      title,
      body,
      url: orderUrl,
      tag: `order-${order.id}-${order.estado}`,
      category: 'pedidos',
      vibrate: [200, 100, 200],
    });
  } catch (error) {
    console.error('⚠️ [ERROR SENDING ORDER STATE PUSH]', error);
  }
}

/**
 * Notifica sobre la creación de un nuevo pedido (al emprendedor, al cliente y a los admins)
 */
export async function sendNewOrderPush(order: {
  id: string;
  codigoPedido: string;
  total: number;
  zonaEntregaNombre: string;
  tiempoEstimadoMin?: number;
  business: { id: string; userId: string; nombre: string };
  cliente: { id: string; nombre: string };
}) {
  try {
    const formattedTotal = `$${order.total.toLocaleString('es-CO')}`;

    // 1. Push para el Emprendedor Responsable
    await sendPushToUser(order.business.userId, {
      title: `🔔 ¡Nuevo Pedido #${order.codigoPedido}! 💸`,
      body: `¡${order.cliente.nombre} hizo un pedido por ${formattedTotal}! Entregar en: ${order.zonaEntregaNombre}. ¡A preparar con todo!`,
      url: '/emprendedor/pedidos',
      tag: `new-order-${order.id}`,
      category: 'pedidos',
      vibrate: [300, 100, 300, 100, 300],
    });

    // 2. Push para el Cliente
    await sendPushToUser(order.cliente.id, {
      title: `🚀 ¡Pedido #${order.codigoPedido} Registrado!`,
      body: `Tu pedido en "${order.business.nombre}" fue recibido. Tiempo estimado de entrega: ${order.tiempoEstimadoMin || 15} min.`,
      url: `/pedidos/${order.id}`,
      tag: `order-created-${order.id}`,
      category: 'pedidos',
      vibrate: [100, 50, 100],
    });

    // 3. Push a Administradores para monitoreo
    await sendPushToAdmins({
      title: `📦 Nuevo Pedido en UniPide (#${order.codigoPedido})`,
      body: `${order.cliente.nombre} ordenó ${formattedTotal} en "${order.business.nombre}".`,
      url: '/admin/pedidos',
      tag: `admin-order-${order.id}`,
      category: 'admin',
    });
  } catch (error) {
    console.error('⚠️ [ERROR SENDING NEW ORDER PUSH]', error);
  }
}

/**
 * Notifica a la contraparte cuando se envía un mensaje de chat en un pedido
 */
export async function sendOrderChatMessagePush(params: {
  order: {
    id: string;
    codigoPedido: string;
    clienteId: string;
    business: { userId: string; nombre: string };
  };
  senderId: string;
  senderName: string;
  senderRole: string; // "CLIENTE" | "EMPRENDEDOR" | "ADMIN"
  messageSnippet: string;
}) {
  try {
    const { order, senderId, senderName, senderRole, messageSnippet } = params;
    const shortMessage =
      messageSnippet.length > 80 ? `${messageSnippet.substring(0, 80)}...` : messageSnippet;

    if (senderRole === 'CLIENTE') {
      // El cliente escribió -> Notificar al emprendedor
      await createNotification({
        userId: order.business.userId,
        titulo: `💬 Mensaje de ${senderName}`,
        mensaje: `En el pedido #${order.codigoPedido}: "${shortMessage}"`,
        tipo: 'NUEVO_PEDIDO',
        url: '/emprendedor/pedidos',
      });

      await sendPushToUser(order.business.userId, {
        title: `💬 Mensaje de ${senderName}`,
        body: `En el pedido #${order.codigoPedido}: "${shortMessage}"`,
        url: '/emprendedor/pedidos',
        tag: `chat-${order.id}`,
        category: 'chat',
        vibrate: [150, 100, 150],
      });
    } else {
      // El emprendedor o admin escribió -> Notificar al cliente
      const title = senderRole === 'ADMIN' ? '💬 Soporte UniPide' : `💬 ${order.business.nombre}`;
      const url = `/pedidos/${order.id}`;

      await createNotification({
        userId: order.clienteId,
        titulo: title,
        mensaje: `En tu pedido #${order.codigoPedido}: "${shortMessage}"`,
        tipo: 'ESTADO_PEDIDO',
        url,
      });

      await sendPushToUser(order.clienteId, {
        title,
        body: `En tu pedido #${order.codigoPedido}: "${shortMessage}"`,
        url,
        tag: `chat-${order.id}`,
        category: 'chat',
        vibrate: [150, 100, 150],
      });
    }
  } catch (error) {
    console.error('⚠️ [ERROR SENDING CHAT MESSAGE PUSH]', error);
  }
}

/**
 * Notifica a los administradores (y al emprendedor si aplica) de una nueva PQRS radicada
 */
export async function sendPqrsPush(params: {
  id: string;
  tipo: string;
  asunto: string;
  usuarioNombre: string;
  businessId?: string | null;
  businessName?: string | null;
  businessUserId?: string | null;
}) {
  try {
    const { tipo, asunto, usuarioNombre, businessName, businessUserId } = params;

    // 1. Notificar a administradores
    await sendPushToAdmins({
      title: `📢 Nueva PQRS: ${tipo}`,
      body: `${usuarioNombre} radicó: "${asunto}" ${businessName ? `sobre "${businessName}"` : ''}.`,
      url: '/admin/pqrs',
      tag: `pqrs-${params.id}`,
      category: 'admin',
      vibrate: [200, 100, 200],
    });

    // 2. Si es para un emprendimiento específico, notificar también al emprendedor
    if (businessUserId) {
      await createNotification({
        userId: businessUserId,
        titulo: `Nueva Solicitud / PQRS (${tipo})`,
        mensaje: `${usuarioNombre} radicó una PQRS: "${asunto}".`,
        tipo: 'PQRS',
        url: '/emprendedor/pqrs',
      });

      await sendPushToUser(businessUserId, {
        title: `📢 Nueva PQRS recibida (${tipo})`,
        body: `${usuarioNombre} radicó: "${asunto}".`,
        url: '/emprendedor/pqrs',
        tag: `pqrs-emp-${params.id}`,
        category: 'admin',
      });
    }
  } catch (error) {
    console.error('⚠️ [ERROR SENDING PQRS PUSH]', error);
  }
}

/**
 * Notifica a los administradores de un nuevo emprendimiento registrado
 */
export async function sendNewBusinessPush(business: {
  id: string;
  nombre: string;
  categoria: string;
  userNombre: string;
}) {
  try {
    await sendPushToAdmins({
      title: `🏬 Nuevo Emprendimiento Registrado`,
      body: `"${business.nombre}" (${business.categoria}) fue registrado por ${business.userNombre}.`,
      url: '/admin/negocios',
      tag: `new-biz-${business.id}`,
      category: 'admin',
      vibrate: [250, 100, 250],
    });
  } catch (error) {
    console.error('⚠️ [ERROR SENDING NEW BUSINESS PUSH]', error);
  }
}

/**
 * Notifica al emprendedor cuando su negocio es aprobado
 */
export async function sendBusinessApprovedPush(business: {
  id: string;
  nombre: string;
  userId: string;
}) {
  try {
    await sendPushToUser(business.userId, {
      title: `✨ ¡Tu emprendimiento está APROBADO!`,
      body: `"${business.nombre}" ya está abierto y visible para toda la comunidad Uninorte. ¡Muchos éxitos en tus ventas!`,
      url: '/emprendedor',
      tag: `biz-approved-${business.id}`,
      category: 'general',
      vibrate: [300, 150, 300],
    });
  } catch (error) {
    console.error('⚠️ [ERROR SENDING BUSINESS APPROVED PUSH]', error);
  }
}
