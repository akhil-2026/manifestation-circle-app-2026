const express = require('express');
const router = express.Router();
const { superAdmin } = require('../middleware/superAdmin');
const User = require('../models/User');
const ManifestationLog = require('../models/ManifestationLog');
const Affirmation = require('../models/Affirmation');

// ============================================================================
// CLEAN SUPER ADMIN ROUTES - FULL SYSTEM CONTROL
// ============================================================================

// Get all users and admins (Super Admin can see everyone)
router.get('/users', superAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = 'all', status = 'all' } = req.query;
    
    let query = {};
    
    // Super Admin can see all users (including other admins)
    // But exclude super admin from results to maintain invisibility
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    if (superAdminEmail) {
      query.email = { $ne: superAdminEmail };
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Role filter
    if (role !== 'all') {
      query.role = role;
    }

    // Status filter
    if (status !== 'all') {
      query.isActive = status === 'active';
    }

    const users = await User.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific user details including calendar data
router.get('/users/:userId/details', superAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password -refreshToken');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's manifestation logs for calendar
    const manifestationLogs = await ManifestationLog.find({ userId })
      .sort({ date: -1 })
      .limit(365);

    res.json({
      user,
      manifestationLogs,
      calendarData: user.calendarData || {},
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user calendar and streak data (INCLUDING ADMINS)
router.patch('/users/:userId/calendar', superAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { calendarData, currentStreak, longestStreak, manifestationLogs } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user calendar and streak data
    if (calendarData !== undefined) user.calendarData = calendarData;
    if (currentStreak !== undefined) user.currentStreak = currentStreak;
    if (longestStreak !== undefined) user.longestStreak = longestStreak;

    await user.save();

    // Update manifestation logs if provided
    if (manifestationLogs && Array.isArray(manifestationLogs)) {
      for (const logData of manifestationLogs) {
        if (logData._id) {
          // Update existing log
          await ManifestationLog.findByIdAndUpdate(logData._id, {
            status: logData.status,
            completedAt: logData.completedAt
          });
        } else if (logData.date) {
          // Create new log
          const existingLog = await ManifestationLog.findOne({
            userId,
            date: new Date(logData.date)
          });
          
          if (!existingLog) {
            await ManifestationLog.create({
              userId,
              date: new Date(logData.date),
              status: logData.status || 'done',
              completedAt: logData.completedAt || new Date()
            });
          }
        }
      }
    }

    res.json({ 
      message: 'Calendar data updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        calendarData: user.calendarData,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user
router.post('/users', superAdmin, async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      name,
      email,
      password,
      role,
      isActive: true
    });

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ message: 'User created successfully', user: userResponse });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.put('/users/:userId', superAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove sensitive fields from updates
    delete updates.password;
    delete updates._id;
    delete updates.__v;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Block/Unblock user or admin
router.patch('/users/:userId/status', superAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({ 
      message: `User ${isActive ? 'unblocked' : 'blocked'} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Promote/Demote admin
router.patch('/users/:userId/role', superAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({ 
      message: `User role updated to ${role} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:userId', superAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's data
    await ManifestationLog.deleteMany({ userId });
    await Affirmation.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard stats
router.get('/dashboard', superAdmin, async (req, res) => {
  try {
    // Get all users but exclude super admin from counts
    const allUsers = await User.find();
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const filteredUsers = allUsers.filter(user => user.email !== superAdminEmail);
    
    const totalUsers = filteredUsers.length;
    const totalAdmins = filteredUsers.filter(user => user.role === 'admin').length;
    const activeUsers = filteredUsers.filter(user => user.isActive === true).length;
    const blockedUsers = filteredUsers.filter(user => user.isActive === false).length;
    
    const totalManifestations = await ManifestationLog.countDocuments();
    const totalAffirmations = await Affirmation.countDocuments();

    res.json({
      stats: {
        totalUsers,
        totalAdmins,
        activeUsers,
        blockedUsers,
        totalManifestations,
        totalAffirmations
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;