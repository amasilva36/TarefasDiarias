// Service Worker principal - trata push notifications e caching
// Carrega o service worker de caching gerado pelo next-pwa
try {
  importScripts('/sw-cache.js');
} catch (e) {
  console.log('sw-cache.js nao disponivel, continuando sem cache offline');
}

// --- Push Notifications ---
self.addEventListener('push', function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Tens um lembrete!',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' },
      actions: [{ action: 'open', title: 'Ver' }],
    };
    event.waitUntil(
      self.registration.showNotification(data.title || 'O Meu Dia', options)
    );
  } catch (e) {
    event.waitUntil(
      self.registration.showNotification('O Meu Dia - Lembrete', {
        body: event.data.text(),
        icon: '/icon-192.png',
      })
    );
  }
});

// --- Clique na Notificação ---
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});

// --- Instalação e Ativação ---
self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});
