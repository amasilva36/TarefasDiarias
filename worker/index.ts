// To bypass TypeScript errors for Service Worker scope
declare let self: ServiceWorkerGlobalScope;

self.addEventListener('push', function (event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [100, 50, 100],
        data: {
          url: data.url || '/',
        },
      };

      event.waitUntil(self.registration.showNotification(data.title, options));
    } catch (e) {
      // Se não for JSON
      event.waitUntil(
        self.registration.showNotification('O Meu Dia - Lembrete', {
          body: event.data.text(),
          icon: '/icon-192.png',
        })
      );
    }
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(event.notification.data.url) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(event.notification.data.url);
      }
    })
  );
});
