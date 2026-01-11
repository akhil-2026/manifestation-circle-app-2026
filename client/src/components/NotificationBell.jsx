import { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, X, Wifi, WifiOff } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
  const { notifications, unreadCount, connected, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Navigate to notification URL if provided
    if (notification.url) {
      window.location.href = notification.url;
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'admin':
        return '👑';
      case 'super_admin':
        return '🛡️';
      case 'warning':
        return '⚠️';
      case 'update':
        return '🔄';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'admin':
        return 'border-l-purple-500';
      case 'super_admin':
        return 'border-l-red-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'update':
        return 'border-l-blue-500';
      case 'info':
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon with Badge and Connection Status */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-dark-300 hover:text-white transition-colors duration-200"
        title={`${unreadCount} unread notifications ${connected ? '(Connected)' : '(Disconnected)'}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {/* Connection status indicator */}
        <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-orange-400'}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-dark-900 border border-dark-700 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-dark-700">
            <div className="flex items-center space-x-2">
              <h3 className="text-white font-semibold">Notifications</h3>
              {connected ? (
                <Wifi className="w-4 h-4 text-green-400" title="Connected" />
              ) : (
                <WifiOff className="w-4 h-4 text-orange-400" title="Disconnected" />
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-purple-400 hover:text-purple-300 text-sm flex items-center space-x-1"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-dark-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-dark-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-dark-800 cursor-pointer transition-colors border-l-4 ${getNotificationColor(notification.type)} ${
                      !notification.read ? 'bg-dark-800/50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </span>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-medium ${
                            !notification.read ? 'text-white' : 'text-dark-300'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        
                        <p className={`text-sm mt-1 ${
                          !notification.read ? 'text-dark-200' : 'text-dark-400'
                        }`}>
                          {notification.message}
                        </p>
                        
                        <p className="text-xs text-dark-500 mt-2">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-dark-700 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-dark-400 hover:text-white text-sm transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;