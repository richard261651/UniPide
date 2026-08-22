import webpush from 'web-push';
import prisma from '@/lib/prisma';

// Claves VAPID predeterminadas seguras para UniPide (pueden ser sobreescritas mediante variables de entorno)
// Generadas con el estándar NIST P-256 (prime256v1)
export const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  process.env.VAPID_PUBLIC_KEY ||
  'BMH464W_nbYgS5YCDroP-ecRgqk_AtviDH5P0bHY6SiYNZqZAKPytF9ztb9yWE7zrxpPow5XPb3es7bW6HhGttE';

export const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ||
  'Z_OYLqus9sJTSkIiUASyhENOty6ujSTxAEvC2svEqDA';

export const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || 'mailto:soporte@unipide.com';

let isVapidConfigured = false;

// Llaves VAPID en memoria por si se requiere fallback dinámico
let activePublicKey = VAPID_PUBLIC_KEY;
let activePrivateKey = VAPID_PRIVATE_KEY;

export function ensureVapidConfigured() {
  if (isVapidConfigured) return;
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, activePublicKey, activePrivateKey);
    isVapidConfigured = true;
  } catch (err) {
    // Si la clave de fallback tiene formato inválido, generar un par VAPID válido en tiempo de ejecución
    try {
      const generated = webpush.generateVAPIDKeys();
      activePublicKey = generated.publicKey;
      activePrivateKey = generated.privateKey;
      webpush.setVapidDetails(VAPID_SUBJECT, activePublicKey, activePrivateKey);
      isVapidConfigured = true;
      console.log('✅ [WEBPUSH] Llaves VAPID generadas y configuradas exitosamente.');
    } catch (innerErr) {
      console.error('⚠️ [WEBPUSH] Error configurando VAPID:', innerErr);
    }
  }
}

export function getVapidPublicKey(): string {
  ensureVapidConfigured();
  return activePublicKey;
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  vibrate?: number[];
  data?: Record<string, any>;
}

export interface SubscriptionKeys {
  endpoint: string;
  p256dh: string;
  auth: string;
}

/**
 * Envía una notificación Web Push a una suscripción específica
 */
export async function sendWebPush(
  subscription: SubscriptionKeys,
  payload: PushPayload
): Promise<{ success: boolean; error?: any }> {
  try {
    ensureVapidConfigured();

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    const pushPayloadString = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon:
        payload.icon ||
        'https://res.cloudinary.com/dre8hlhdo/image/upload/v1787119598/icono_uuke26.svg',
      badge:
        payload.badge ||
        'https://res.cloudinary.com/dre8hlhdo/image/upload/v1787119598/icono_uuke26.svg',
      url: payload.url || '/',
      tag: payload.tag || 'unipide-notif',
      vibrate: payload.vibrate || [200, 100, 200],
      data: {
        url: payload.url || '/',
        timestamp: Date.now(),
        ...payload.data,
      },
    });

    await webpush.sendNotification(pushSubscription, pushPayloadString, {
      TTL: 60 * 60 * 24, // 24 horas
      urgency: 'high',
    });

    return { success: true };
  } catch (error: any) {
    console.error('⚠️ [WEBPUSH ERROR]', error?.statusCode, error?.message || error);

    // Si la suscripción expiró o fue eliminada por el navegador (404 o 410 GONE)
    if (error?.statusCode === 404 || error?.statusCode === 410) {
      try {
        await prisma.pushSubscription.updateMany({
          where: { endpoint: subscription.endpoint },
          data: { activo: false },
        });
      } catch (dbErr) {
        console.error('Error actualizando suscripción caducada:', dbErr);
      }
    }

    return { success: false, error: error?.message || error };
  }
}
