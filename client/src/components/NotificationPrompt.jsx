import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import notificationService from '../services/notificationService';

const NotificationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if we should show the notification prompt
    const checkNotificationStatus = () => {
      const status = notificationService.getStatus();
      const hasPrompted = localStorage.getItem('notification-prompted');
      
      // Show prompt if:
      // 1. Notifications are supported
      // 2. Permission is default (not granted or denied)
      // 3. User hasn't been prompted before (or it's been a while)
      if (status.supported && 
          status.permission === 'default' && 
          !hasPrompted) {
        setShowPrompt(true);
      }
    };

    // Delay the check to avoid showing immediately on page load
    const timer = setTimeout(checkNotificationStatus, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const result = await notificationService.requestPermissionAndSaveToken();
      
      if (result.success) {
        setShowPrompt(false);
        localStorage.setItem('notification-prompted', 'true');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember that user dismissed the prompt (don't show again for 7 days)
    const dismissedUntil = Date.now() + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem('notification-prompted', dismissedUntil.toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg shadow-lg border border-purple-500 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Bell className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm mb-1">
              Enable Daily Reminders
            </h3>
            <p className="text-purple-100 text-xs mb-3">
              Get notified at 9:30 PM to complete your daily manifestations 🌙
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleEnableNotifications}
                disabled={loading}
                className="px-3 py-1.5 bg-white text-purple-600 rounded text-xs font-medium hover:bg-purple-50 transition-colors disabled:opacity-50"
              >
                {loading ? 'Enabling...' : 'Enable'}
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 text-purple-100 hover:text-white text-xs transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-purple-200 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPrompt;