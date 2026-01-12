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

    // Get the base server URL (remove /api path for Socket.IO)
    let serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    // Remove /api path if present (Socket.IO connects to root)
    if (serverUrl.endsWith('/api')) {
      serverUrl = serverUrl.slice(0, -4);
    }
    
    console.log('📡 Connecting to Socket.IO server:', serverUrl);
    console.log('📡 Environment:', import.meta.env.MODE);
    console.log('📡 Token available:', !!token);

    this.socket = io(serverUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      // Production-specific settings
      upgrade: true,
      rememberUpgrade: true,
      // Handle connection issues in production
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
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
      console.error('📡 Error details:', error);
      this.isConnected = false;
      
      // Emit error details to listeners
      this.emit('socket:error', { 
        error: error.message,
        type: error.type,
        description: error.description 
      });
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