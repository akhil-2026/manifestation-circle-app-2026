import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import socketService from '../services/socketService';

/**
 * Hook for managing real-time notifications with Socket.IO
 */
export const useNotifications = () => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    if (!user || !token) {
      socketService.disconnect();
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      setConnected(false);
      return;
    }

    // Connect to Socket.IO
    socketService.connect(token);
    
    // Set up socket event listeners
    const unsubscribeConnected = socketService.on('socket:connected', () => {
      setConnected(true);
      console.log('📡 Socket connected in useNotifications');
    });

    const unsubscribeDisconnected = socketService.on('socket:disconnected', () => {
      setConnected(false);
      console.log('📡 Socket disconnected in useNotifications');
    });

    const unsubscribeNewNotification = socketService.on('notification:new', (notification) => {
      console.log('🔔 New notification received in hook:', notification);
      
      // Add new notification to the beginning of the list
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    setLoading(false);

    // Cleanup on unmount or user change
    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeNewNotification();
    };
  }, [user, token]);

  // Cleanup on logout
  useEffect(() => {
    if (!user) {
      socketService.disconnect();
      setConnected(false);
    }
  }, [user]);

  // Mark notification as read (placeholder)
  const markAsRead = async (notificationId) => {
    console.log('Mark as read placeholder:', notificationId);
    // Update local state
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all notifications as read (placeholder)
  const markAllAsRead = async () => {
    console.log('Mark all as read placeholder');
    // Update local state
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    loading,
    connected,
    markAsRead,
    markAllAsRead,
    refetch: () => {} // Placeholder
  };
};