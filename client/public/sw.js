// Manifestation Circle - Service Worker for PWA
const CACHE_NAME = 'manifestation-circle-v1';
const STATIC_CACHE_NAME = 'manifestation-circle-static-v1';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/icon-192.svg',
  '/icon-512.svg',
  // Add more static assets as needed
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^\/api\/auth\/me$/,
  /^\/api\/affirmations$/,
  /^\/api\/manifestation\/calendar/,
  /^\/api\/stats/,
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
              console.log('🗑️ Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - Network First strategy
    event.respondWith(handleApiRequest(request));
  } else if (STATIC_FILES.some(file => url.pathname === file || url.pathname.endsWith(file))) {
    // Static files - Cache First strategy
    event.respondWith(handleStaticRequest(request));
  } else {
    // Other requests - Stale While Revalidate strategy
    event.respondWith(handleOtherRequest(request));
  }
});

// Network First strategy for API requests
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses for specific endpoints
    if (networkResponse.ok && shouldCacheApiRequest(url.pathname)) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 Service Worker: Network failed, trying cache for', url.pathname);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Cache First strategy for static files
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(STATIC_CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.error('❌ Service Worker: Failed to fetch static file', request.url);
    throw error;
  }
}

// Stale While Revalidate strategy for other requests
async function handleOtherRequest(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(CACHE_NAME);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => {
    // Return cached version if network fails
    return cachedResponse;
  });
  
  // Return cached version immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

// Check if API request should be cached
function shouldCacheApiRequest(pathname) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(pathname));
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'manifestation-sync') {
    event.waitUntil(syncManifestationData());
  }
});

// Sync manifestation data when back online
async function syncManifestationData() {
  try {
    // Get pending manifestation data from IndexedDB
    // This would be implemented with your offline storage
    console.log('📊 Service Worker: Syncing manifestation data...');
    
    // Example: Send pending manifestations to server
    // const pendingData = await getPendingManifestations();
    // await sendManifestationsToServer(pendingData);
    
    console.log('✅ Service Worker: Manifestation data synced');
  } catch (error) {
    console.error('❌ Service Worker: Failed to sync manifestation data', error);
  }
}

// Handle push notifications (already implemented in firebase-messaging-sw.js)
self.addEventListener('push', (event) => {
  console.log('🔔 Service Worker: Push notification received');
  // This is handled by firebase-messaging-sw.js
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Service Worker: Notification clicked');
  
  event.notification.close();
  
  // Open the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if no existing window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('📨 Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⏭️ Service Worker: Skipping waiting...');
    self.skipWaiting();
  }
});

// Handle beforeinstallprompt for PWA installation
self.addEventListener('beforeinstallprompt', (event) => {
  console.log('🎯 Service Worker: Before install prompt');
  // This event is handled in the main thread
});

console.log('🎯 Service Worker: Manifestation Circle PWA Service Worker loaded');