const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const notificationService = require('../utils/notificationService');

// Save/Update FCM token for authenticated user
router.post('/token', auth, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    
    if (!fcmToken) {
      return res.status(400).json({ message: 'FCM token is required' });
    }

    // Update user's FCM token
    await User.findByIdAndUpdate(req.user.id, { fcmToken });
    console.log('FCM token saved for user:', req.user.email);
    
    res.json({ message: 'FCM token saved successfully' });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove FCM token (for logout)
router.delete('/token', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $unset: { fcmToken: 1 } });
    res.json({ message: 'FCM token removed successfully' });
  } catch (error) {
    console.error('Error removing FCM token:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle reminder notifications
router.patch('/reminder', auth, async (req, res) => {
  try {
    const { reminderEnabled } = req.body;
    
    await User.findByIdAndUpdate(req.user.id, { reminderEnabled });
    
    res.json({ message: 'Reminder preference updated successfully' });
  } catch (error) {
    console.error('Error updating reminder preference:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test notification (admin only)
router.post('/test', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user.fcmToken) {
      return res.status(400).json({ message: 'No FCM token found for user. Please enable notifications first.' });
    }

    const notification = {
      title: '🧪 Test Notification',
      body: 'This is a test notification from Manifestation Circle!'
    };

    const data = {
      type: 'test',
      url: '/dashboard'
    };

    const result = await notificationService.sendToUser(user.fcmToken, notification, data);
    
    if (result.success) {
      res.json({ message: 'Test notification sent successfully (simulated)' });
    } else {
      res.status(500).json({ message: 'Failed to send test notification', error: result.error });
    }
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send daily reminder manually (admin only)
router.post('/daily-reminder', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const result = await notificationService.sendDailyReminder();
    
    if (result.success) {
      res.json({ 
        message: 'Daily reminder sent successfully',
        successCount: result.successCount,
        failureCount: result.failureCount
      });
    } else {
      res.status(500).json({ message: 'Failed to send daily reminder', error: result.error });
    }
  } catch (error) {
    console.error('Error sending daily reminder:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;