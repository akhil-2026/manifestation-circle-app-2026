import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  // Connect to Socket.IO server with authentication
  connect(token) {
    if (this.socket && this.isConnected) {
      console.log('📡 Socket already connected');
      return;
    }

    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    console.log('📡 Connecting to Socket.IO server:', serverUrl);

    this.socket = io(serverUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.setupEventListeners();
  }

  // Setup Socket.IO event listeners
  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('📡 Socket connected:', this.socket.id);
      this.isConnected = true;
      
      // Emit connection success to listeners
      this.emit('socket:connected', { socketId: this.socket.id });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('📡 Socket disconnected:', reason);
      this.isConnected = false;
      
      // Emit disconnection to listeners
      this.emit('socket:disconnected', { reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('📡 Socket connection error:', error.message);
      this.isConnected = false;
    });

    // Notification event listeners
    this.socket.on('notification:new', (notification) => {
      console.log('🔔 New notification received:', notification);
      this.emit('notification:new', notification);
    });

    // Ping/pong for connection health
    this.socket.on('pong', () => {
      console.log('📡 Pong received');
    });
  }

  // Disconnect from Socket.IO server
  disconnect() {
    if (this.socket) {
      console.log('📡 Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  // Subscribe to events
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
        if (eventListeners.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  // Emit events to listeners
  emit(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in socket event callback:', error);
        }
      });
    }
  }

  // Send ping to server
  ping() {
    if (this.socket && this.isConnected) {
      this.socket.emit('ping');
    }
  }

  // Get connection status
  getStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id
    };
  }
}

export default new SocketService();