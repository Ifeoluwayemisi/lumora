self.addEventListener('install', (event) => { self.skipWaiting(); });
self.addEventListener('activate', (event) => { clients.claim(); });
self.addEventListener('fetch', (event) => {});
self.addEventListener('push', function(event) {
  let data = { title: 'Lumora', body: 'You have a notification', url: '/' };
  try { if (event.data) data = event.data.json(); } catch (e) {}
  const title = data.title || 'Lumora';
  const options = { body: data.body, icon: '/icons/icon-192.svg', badge: '/icons/icon-192.svg', data: { url: data.url || '/' } };
  event.waitUntil(self.registration.showNotification(title, options));
});
