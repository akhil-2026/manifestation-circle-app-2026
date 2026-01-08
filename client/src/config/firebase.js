import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: `1:${import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID}:web:3d075ddfc1d2332c0ad513`
};

// Initialize Firebase
let app;
let messaging;

try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');
  
  // Initialize Firebase Cloud Messaging and get a reference to the service
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    messaging = getMessaging(app);
    console.log('Firebase messaging initialized successfully');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

// VAPID key for web push notifications
const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async () => {
  try {
    if (!messaging) {
      throw new Error('Firebase messaging not initialized');
    }

    // Check if notifications are supported
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      
      // Get FCM token
      const token = await getToken(messaging, { vapidKey });
      
      if (token) {
        console.log('FCM token generated:', token);
        return { success: true, token };
      } else {
        throw new Error('No registration token available');
      }
    } else {
      throw new Error('Notification permission denied');
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Listen for foreground messages
 */
export const onMessageListener = () => {
  return new Promise((resolve) => {
    if (!messaging) {
      console.warn('Firebase messaging not initialized');
      return;
    }

    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      resolve(payload);
    });
  });
};

/**
 * Check if notifications are supported
 */
export const isNotificationSupported = () => {
  return 'Notification' in window && 'serviceWorker' in navigator && messaging;
};

/**
 * Get current notification permission status
 */
export const getNotificationPermission = () => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};

export { messaging };