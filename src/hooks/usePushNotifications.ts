'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export interface PushPreferences {
  notifPushEnabled: boolean;
  notifPedidos: boolean;
  notifChat: boolean;
  notifAdmin: boolean;
  activeSubscriptionsCount?: number;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [preferences, setPreferences] = useState<PushPreferences>({
    notifPushEnabled: true,
    notifPedidos: true,
    notifChat: true,
    notifAdmin: true,
    activeSubscriptionsCount: 0,
  });

  // Inicializar y comprobar soporte del navegador
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      registerServiceWorker();
    } else {
      setIsSupported(false);
      setLoading(false);
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      const existingSub = await registration.pushManager.getSubscription();
      setIsSubscribed(Boolean(existingSub));
    } catch (err) {
      console.error('Error registrando Service Worker:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar preferencias del backend cuando el usuario esté autenticado
  const fetchPreferences = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/push/preferences');
      if (res.ok) {
        const data = await res.json();
        if (data.preferences) {
          setPreferences(data.preferences);
        }
      }
    } catch (err) {
      console.error('Error obteniendo preferencias push:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user, fetchPreferences]);

  /**
   * Suscribe el navegador a notificaciones Push y guarda en la base de datos
   */
  const subscribeToPush = async (): Promise<{ success: boolean; error?: string }> => {
    if (!isSupported) {
      return { success: false, error: 'Tu navegador no soporta notificaciones Push.' };
    }

    try {
      setLoading(true);

      // 1. Solicitar permiso al usuario
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        return {
          success: false,
          error: 'Permiso de notificaciones denegado en tu navegador.',
        };
      }

      // 2. Obtener clave pública VAPID
      const vapidRes = await fetch('/api/push/vapid-public-key');
      const { publicKey } = await vapidRes.json();

      if (!publicKey) {
        throw new Error('No se pudo obtener la clave VAPID pública.');
      }

      // 3. Registrar suscripción en el navegador
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const convertedVapidKey = urlBase64ToUint8Array(publicKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
      }

      // 4. Enviar suscripción al backend
      const subJson = subscription.toJSON();
      const saveRes = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subJson,
          userAgent: navigator.userAgent,
        }),
      });

      if (!saveRes.ok) {
        throw new Error('Error al guardar suscripción en el servidor');
      }

      setIsSubscribed(true);
      setPreferences((prev) => ({ ...prev, notifPushEnabled: true }));
      await fetchPreferences();

      return { success: true };
    } catch (err: any) {
      console.error('Error al suscribir a push:', err);
      return { success: false, error: err?.message || 'Error al activar notificaciones' };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Desuscribe el navegador de las notificaciones push
   */
  const unsubscribeFromPush = async (): Promise<boolean> => {
    try {
      setLoading(true);
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();

        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint }),
        });
      }

      setIsSubscribed(false);
      setPreferences((prev) => ({ ...prev, notifPushEnabled: false }));
      await fetchPreferences();
      return true;
    } catch (err) {
      console.error('Error al desuscribir:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualiza las preferencias del usuario (interruptores específicos)
   */
  const updatePreferences = async (newPrefs: Partial<PushPreferences>) => {
    try {
      const res = await fetch('/api/push/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrefs),
      });

      if (res.ok) {
        const data = await res.json();
        setPreferences((prev) => ({ ...prev, ...data.preferences }));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error actualizando preferencias:', err);
      return false;
    }
  };

  /**
   * Envía una notificación de prueba instantánea al dispositivo
   */
  const sendTestNotification = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/push/send-test', {
        method: 'POST',
      });
      const data = await res.json();
      return {
        success: data.success || false,
        message: data.message || 'Prueba completada',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Error enviando notificación de prueba',
      };
    }
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    loading,
    preferences,
    subscribeToPush,
    unsubscribeFromPush,
    updatePreferences,
    sendTestNotification,
    fetchPreferences,
  };
}
