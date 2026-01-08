import React, { useState, useEffect } from 'react';
import { Bell, BellOff, TestTube, Send } from 'lucide-react';
import notificationService from '../services/notificationService';
import { useAuth } from '../context/AuthContext';
import useAlert from '../hooks/useAlert';
import LoadingSpinner from './LoadingSpinner';

const NotificationSettings = () => {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState({
    supported: false,
    permission: 'default',
    hasToken: false,
    initialized: false
  });
  const [reminderEnabled, setReminderEnabled] = useState(true);

  useEffect(() => {
    // Get initial notification status
    const status = notificationService.getStatus();
    setNotificationStatus(status);
    setReminderEnabled(user?.reminderEnabled ?? true);
  }, [user]);

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const result = await notificationService.requestPermissionAndSaveToken();
      
      if (result.success) {
        showAlert('Notifications enabled successfully! 🔔', 'success');
        setNotificationStatus(notificationService.getStatus());
      } else {
        showAlert(result.error || 'Failed to enable notifications', 'error');
      }
    } catch (error) {
      showAlert('Error enabling notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReminders = async () => {
    setLoading(true);
    try {
      const newValue = !reminderEnabled;
      const result = await notificationService.toggleReminders(newValue);
      
      if (result.success) {
        setReminderEnabled(newValue);
        showAlert(
          newValue ? 'Daily reminders enabled 🌙' : 'Daily reminders disabled',
          'success'
        );
      } else {
        showAlert('Failed to update reminder settings', 'error');
      }
    } catch (error) {
      showAlert('Error updating reminder settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setLoading(true);
    try {
      const result = await notificationService.sendTestNotification();
      
      if (result.success) {
        showAlert('Test notification sent! Check your device 📱', 'success');
      } else {
        showAlert(result.error || 'Failed to send test notification', 'error');
      }
    } catch (error) {
      showAlert('Error sending test notification', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendDailyReminder = async () => {
    setLoading(true);
    try {
      const result = await notificationService.sendDailyReminder();
      
      if (result.success) {
        const { successCount, failureCount } = result.data;
        showAlert(
          `Daily reminder sent to ${successCount} users! 📢`,
          'success'
        );
      } else {
        showAlert(result.error || 'Failed to send daily reminder', 'error');
      }
    } catch (error) {
      showAlert('Error sending daily reminder', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!notificationStatus.supported) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <BellOff className="w-6 h-6 text-slate-400" />
          <h3 className="text-xl font-semibold text-white">Push Notifications</h3>
        </div>
        <p className="text-slate-400 text-sm">
          Push notifications are not supported in this browser. 
          For the best experience, use Chrome, Firefox, or Edge on desktop, 
          or install this app on your mobile device.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-semibold text-white">Push Notifications</h3>
      </div>

      <div className="space-y-4">
        {/* Notification Permission Status */}
        <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
          <div>
            <p className="text-white font-medium">Notification Permission</p>
            <p className="text-sm text-slate-400">
              Status: {notificationStatus.permission === 'granted' ? '✅ Granted' : 
                      notificationStatus.permission === 'denied' ? '❌ Denied' : '⏳ Not requested'}
            </p>
          </div>
          {notificationStatus.permission !== 'granted' && (
            <button
              onClick={handleEnableNotifications}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <LoadingSpinner variant="button" /> : <Bell className="w-4 h-4" />}
              Enable
            </button>
          )}
        </div>

        {/* Daily Reminders Toggle */}
        {notificationStatus.permission === 'granted' && (
          <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Daily Reminders</p>
              <p className="text-sm text-slate-400">
                Get reminded at 9:30 PM to complete your manifestations
              </p>
            </div>
            <button
              onClick={handleToggleReminders}
              disabled={loading}
              className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
                reminderEnabled
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-slate-600 hover:bg-slate-700 text-white'
              }`}
            >
              {loading ? (
                <LoadingSpinner variant="button" />
              ) : reminderEnabled ? (
                <Bell className="w-4 h-4" />
              ) : (
                <BellOff className="w-4 h-4" />
              )}
              {reminderEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        )}

        {/* Test Notification */}
        {notificationStatus.permission === 'granted' && (
          <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Test Notification</p>
              <p className="text-sm text-slate-400">
                Send a test notification to verify everything works
              </p>
            </div>
            <button
              onClick={handleTestNotification}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <LoadingSpinner variant="button" /> : <TestTube className="w-4 h-4" />}
              Test
            </button>
          </div>
        )}

        {/* Admin: Send Daily Reminder */}
        {user?.role === 'admin' && notificationStatus.permission === 'granted' && (
          <div className="flex items-center justify-between p-4 bg-purple-900/30 rounded-lg border border-purple-700/50">
            <div>
              <p className="text-white font-medium">Admin: Send Daily Reminder</p>
              <p className="text-sm text-slate-400">
                Manually send daily reminder to all users
              </p>
            </div>
            <button
              onClick={handleSendDailyReminder}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <LoadingSpinner variant="button" /> : <Send className="w-4 h-4" />}
              Send Now
            </button>
          </div>
        )}

        {/* PWA Installation Hint */}
        <div className="p-4 bg-amber-900/20 rounded-lg border border-amber-700/50">
          <p className="text-amber-200 text-sm">
            💡 <strong>Tip:</strong> For the best notification experience on mobile, 
            install this app to your home screen using your browser's "Add to Home Screen" option.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;