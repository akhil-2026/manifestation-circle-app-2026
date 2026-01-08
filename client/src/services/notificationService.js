import axios from 'axios';
import { 
  requestNotificationPermission, 
  onMessageListener, 
  isNotificationSupported,
  getNotificationPermission 
} from '../config/firebase';

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.fcmToken = null;
  }

  /**
   * Initialize notification service
   */
  async initialize() {
    try {
      if (!isNotificationSupported()) {
        console.warn('Notifications not supported in this browser');
        return { success: false, error: 'Notifications not supported' };
      }

      // Register service worker
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log('Service Worker registered:', registration);
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      }

      // Set up foreground message listener
      this.setupForegroundListener();
      
      this.isInitialized = true;
      return { success: true };
    } catch (error) {
      console.error('Error initializing notification service:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Request notification permission and save token
   */
  async requestPermissionAndSaveToken() {
    try {
      const permission = getNotificationPermission();
      
      if (permission === 'denied') {
        return { 
          success: false, 
          error: 'Notifications are blocked. Please enable them in your browser settings.' 
        };
      }

      if (permission === 'granted') {
        // Permission already granted, just get the token
        const result = await requestNotificationPermission();
        if (result.success) {
          return await this.saveTokenToServer(result.token);
        }
        return result;
      }

      // Request permission
      const result = await requestNotificationPermission();
      
      if (result.success) {
        return await this.saveTokenToServer(result.token);
      }
      
      return result;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save FCM token to server
   */
  async saveTokenToServer(token) {
    try {
      console.log('Attempting to save FCM token to server:', token);
      await axios.post('/notifications/token', { fcmToken: token });
      this.fcmToken = token;
      console.log('✅ FCM token saved to server successfully');
      return { success: true, token };
    } catch (error) {
      console.error('❌ Error saving FCM token to server:', error);
      return { success: false, error: 'Failed to save notification token' };
    }
  }

  /**
   * Remove FCM token from server (for logout)
   */
  async removeTokenFromServer() {
    try {
      await axios.delete('/notifications/token');
      this.fcmToken = null;
      console.log('FCM token removed from server');
      return { success: true };
    } catch (error) {
      console.error('Error removing FCM token from server:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Toggle reminder notifications
   */
  async toggleReminders(enabled) {
    try {
      await axios.patch('/notifications/reminder', { reminderEnabled: enabled });
      return { success: true };
    } catch (error) {
      console.error('Error toggling reminders:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send test notification (admin only)
   */
  async sendTestNotification() {
    try {
      await axios.post('/notifications/test');
      return { success: true };
    } catch (error) {
      console.error('Error sending test notification:', error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  /**
   * Send daily reminder manually (admin only)
   */
  async sendDailyReminder() {
    try {
      const response = await axios.post('/notifications/daily-reminder');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error sending daily reminder:', error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  /**
   * Set up foreground message listener
   */
  setupForegroundListener() {
    onMessageListener().then((payload) => {
      console.log('Foreground message received:', payload);
      
      // Show browser notification for foreground messages
      if (Notification.permission === 'granted') {
        const notification = new Notification(
          payload.notification?.title || 'Manifestation Circle',
          {
            body: payload.notification?.body || 'You have a new notification',
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            tag: 'manifestation-reminder',
            requireInteraction: true,
            data: payload.data
          }
        );

        notification.onclick = () => {
          window.focus();
          if (payload.data?.url) {
            window.location.href = payload.data.url;
          }
          notification.close();
        };
      }
    }).catch((error) => {
      console.error('Error setting up foreground listener:', error);
    });
  }

  /**
   * Check notification status
   */
  getStatus() {
    return {
      supported: isNotificationSupported(),
      permission: getNotificationPermission(),
      hasToken: !!this.fcmToken,
      initialized: this.isInitialized
    };
  }
}

export default new NotificationService();