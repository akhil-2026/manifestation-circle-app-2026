const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Initialize Firebase Admin SDK
const { initializeFirebase } = require('./config/firebase');
initializeFirebase();

// Import routes
const authRoutes = require('./routes/auth');
const manifestationRoutes = require('./routes/manifestation');
const statsRoutes = require('./routes/stats');
const groupRoutes = require('./routes/group');
const affirmationRoutes = require('./routes/affirmation');
const profileRoutes = require('./routes/profile');
const notificationRoutes = require('./routes/notifications');
const superAdminRoutes = require('./routes/superAdmin');

const app = express();

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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
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
app.use('/api/notifications', notificationRoutes);
app.use('/api/super-admin', superAdminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
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
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});