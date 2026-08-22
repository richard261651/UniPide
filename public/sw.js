// Service Worker para Notificaciones Push y PWA de UniPide

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Escuchador de Notificaciones Push
self.addEventListener('push', (event) => {
  let data = {
    title: 'UniPide | Campus Uninorte',
    body: 'Tienes una nueva notificación en UniPide.',
    icon: 'https://res.cloudinary.com/dre8hlhdo/image/upload/v1787119598/icono_uuke26.svg',
    badge: 'https://res.cloudinary.com/dre8hlhdo/image/upload/v1787119598/icono_uuke26.svg',
    url: '/',
    tag: 'unipide-notif',
    vibrate: [200, 100, 200],
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const notificationOptions = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag || 'unipide-general',
    renotify: true,
    vibrate: data.vibrate || [200, 100, 200],
    data: {
      url: data.url || data.data?.url || '/',
      timestamp: Date.now(),
      ...data.data,
    },
    actions: [
      {
        action: 'open_url',
        title: 'Ver Detalles 🚀',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, notificationOptions)
  );
});

// Escuchador de Clic en la Notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una pestaña abierta de UniPide, enfocarla y navegar a la ruta
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.focus();
          if ('navigate' in client && targetUrl) {
            client.navigate(targetUrl);
          }
          return;
        }
      }
      // Si no hay pestañas abiertas, abrir una nueva ventana
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
