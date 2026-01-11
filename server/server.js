const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const manifestationRoutes = require('./routes/manifestation');
const statsRoutes = require('./routes/stats');
const groupRoutes = require('./routes/group');
const affirmationRoutes = require('./routes/affirmation');
const profileRoutes = require('./routes/profile');
const superAdminRoutes = require('./routes/superAdmin');

const app = express();
const server = createServer(app);

// Trust proxy when running behind reverse proxy (Render, Vercel, etc.)
app.set('trust proxy', true);

// Additional proxy handling middleware
app.use((req, res, next) => {
  // Log proxy headers for debugging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Proxy headers:', {
      'x-forwarded-for': req.get('X-Forwarded-For'),
      'x-real-ip': req.get('X-Real-IP'),
      'x-forwarded-proto': req.get('X-Forwarded-Proto'),
      'req.ip': req.ip,
      'req.ips': req.ips
    });
  }
  next();
});

// Security middleware
app.use(helmet());

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    console.log('🌐 CORS request from origin:', origin)
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.CORS_ORIGIN,
      'http://localhost:5173', // Development
      'http://localhost:3000',  // Alternative dev port
      'https://manifestation-circle-2026-app.vercel.app', // Hardcoded for debugging
      'https://manifestation-circle-app-2026.vercel.app', // Alternative URL pattern
      // Add more potential Vercel URLs
      /^https:\/\/.*\.vercel\.app$/ // Allow any vercel.app subdomain for now
    ].filter(Boolean);
    
    console.log('🔒 Allowed origins:', allowedOrigins)
    
    // Check string origins
    if (allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return allowed === origin;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    })) {
      console.log('✅ CORS allowed for:', origin)
      callback(null, true);
    } else {
      console.log('❌ CORS blocked for:', origin)
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

// Rate limiting with proper proxy support
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Use a custom key generator that works with proxies
  keyGenerator: (req) => {
    // Get the real IP from various proxy headers
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           'unknown';
  },
  // Custom handler for when limit is exceeded
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.round(limiter.windowMs / 1000)
    });
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 45000, // 45 seconds
  connectTimeoutMS: 30000, // 30 seconds
  maxPoolSize: 10, // Maintain up to 10 socket connections
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/manifestation', manifestationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/group', groupRoutes);
app.use('/api/affirmations', affirmationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/super-admin', superAdminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    proxy: {
      trustProxy: app.get('trust proxy'),
      clientIP: req.ip,
      forwardedIPs: req.ips,
      headers: {
        'x-forwarded-for': req.get('X-Forwarded-For'),
        'x-real-ip': req.get('X-Real-IP'),
        'x-forwarded-proto': req.get('X-Forwarded-Proto')
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        process.env.CORS_ORIGIN,
        'http://localhost:5173',
        'http://localhost:3000',
        'https://manifestation-circle-2026-app.vercel.app',
        'https://manifestation-circle-app-2026.vercel.app',
        /^https:\/\/.*\.vercel\.app$/
      ].filter(Boolean);
      
      if (allowedOrigins.some(allowed => {
        if (typeof allowed === 'string') {
          return allowed === origin;
        } else if (allowed instanceof RegExp) {
          return allowed.test(origin);
        }
        return false;
      })) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }
});

// Socket.IO Authentication Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to socket
    socket.userId = decoded.userId;
    socket.userEmail = decoded.email;
    socket.userRole = decoded.role;
    
    console.log(`🔐 Socket authenticated for user: ${decoded.email}`);
    next();
  } catch (error) {
    console.error('Socket authentication failed:', error.message);
    next(new Error('Authentication failed'));
  }
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log(`📡 User connected: ${socket.userEmail} (${socket.id})`);
  
  // Handle test notification from Super Admin
  socket.on('notification:test', (data) => {
    console.log(`🧪 Test notification request from ${socket.userEmail}:`, data);
    
    // Only allow Super Admin to send test notifications
    if (socket.userEmail === process.env.SUPER_ADMIN_EMAIL) {
      const notification = {
        id: Date.now(),
        title: data.title || '🧪 Test Notification',
        message: data.message || 'This is a test notification',
        type: data.type || 'info',
        createdAt: new Date(),
        read: false
      };
      
      // Send notification to target user
      const sent = global.emitNotification(data.targetEmail, notification);
      
      // Send confirmation back to Super Admin
      socket.emit('notification:test:result', {
        success: sent,
        targetEmail: data.targetEmail,
        message: sent ? 'Notification sent successfully' : 'Target user not connected'
      });
    } else {
      socket.emit('notification:test:result', {
        success: false,
        message: 'Unauthorized: Only Super Admin can send test notifications'
      });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`📡 User disconnected: ${socket.userEmail} (${reason})`);
  });
  
  // Handle ping for connection health
  socket.on('ping', () => {
    socket.emit('pong');
  });
});

// Simple notification emitter function (for testing)
global.emitNotification = (userEmail, notification) => {
  const sockets = Array.from(io.sockets.sockets.values());
  const userSocket = sockets.find(s => s.userEmail === userEmail);
  
  if (userSocket) {
    userSocket.emit('notification:new', notification);
    console.log(`📤 Notification sent to ${userEmail}:`, notification.title);
    return true;
  } else {
    console.log(`⚠️ User ${userEmail} not connected`);
    return false;
  }
};

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready`);
});