// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration (same as in main app)
const firebaseConfig = {
  apiKey: "AIzaSyDvzqhr6nSdpNTsUFK_ta6lp_vBekP142Q",
  authDomain: "manifestation-circle-2026.firebaseapp.com",
  projectId: "manifestation-circle-2026",
  storageBucket: "manifestation-circle-2026.appspot.com",
  messagingSenderId: "277267386730",
  appId: "1:277267386730:web:3d075ddfc1d2332c0ad513"
};

// Initialize Firebase in service worker
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'Manifestation Circle';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: 'manifestation-reminder',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/favicon.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon.svg'
      }
    ],
    data: {
      url: payload.data?.url || '/',
      ...payload.data
    }
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Get the URL to open
  const urlToOpen = event.notification.data?.url || '/';
  
  // Open the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(urlToOpen);
          return;
        }
      }
      
      // If app is not open, open it
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle push events (fallback)
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  if (event.data) {
    const data = event.data.json();
    const title = data.notification?.title || 'Manifestation Circle';
    const options = {
      body: data.notification?.body || 'You have a new notification',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'manifestation-reminder',
      data: data.data || {}
    };
    
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});