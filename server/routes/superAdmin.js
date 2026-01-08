const express = require('express');
const router = express.Router();
const { superAdmin, isSuperAdmin } = require('../middleware/superAdmin');
const User = require('../models/User');
const ManifestationLog = require('../models/ManifestationLog');
const Affirmation = require('../models/Affirmation');

// ============================================================================
// SUPER ADMIN ROUTES - HIDDEN FROM ALL OTHER USERS
// ============================================================================

// Get super admin dashboard data
router.get('/dashboard', superAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const activeUsers = await User.countDocuments({ isActive: true });
    const blockedUsers = await User.countDocuments({ isActive: false });
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
    console.error('Error fetching super admin dashboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (including admins) - SUPER ADMIN ONLY
router.get('/users', superAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = 'all', status = 'all' } = req.query;
    
    let query = {};
    
    // Exclude super admin from results (keep hidden)
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
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user - SUPER ADMIN ONLY
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

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ message: 'User created successfully', user: userResponse });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user - SUPER ADMIN ONLY
router.put('/users/:userId', superAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Prevent updating super admin
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (isSuperAdmin(user.email)) {
      return res.status(403).json({ message: 'Cannot modify super admin' });
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
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Block/Unblock user - SUPER ADMIN ONLY
router.patch('/users/:userId/status', superAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent blocking super admin
    if (isSuperAdmin(user.email)) {
      return res.status(403).json({ message: 'Cannot modify super admin status' });
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
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Promote/Demote admin - SUPER ADMIN ONLY
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

    // Prevent changing super admin role
    if (isSuperAdmin(user.email)) {
      return res.status(403).json({ message: 'Cannot modify super admin role' });
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
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user - SUPER ADMIN ONLY
router.delete('/users/:userId', superAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting super admin
    if (isSuperAdmin(user.email)) {
      return res.status(403).json({ message: 'Cannot delete super admin' });
    }

    // Delete user's data
    await ManifestationLog.deleteMany({ userId });
    await Affirmation.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Override user calendar/streak data - SUPER ADMIN ONLY
router.patch('/users/:userId/calendar', superAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { calendarData, currentStreak, longestStreak } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update calendar and streak data
    if (calendarData !== undefined) user.calendarData = calendarData;
    if (currentStreak !== undefined) user.currentStreak = currentStreak;
    if (longestStreak !== undefined) user.longestStreak = longestStreak;

    await user.save();

    res.json({ 
      message: 'User calendar data updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        calendarData: user.calendarData,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak
      }
    });
  } catch (error) {
    console.error('Error updating user calendar:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's manifestation data - SUPER ADMIN ONLY
router.get('/users/:userId/manifestations', superAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const manifestations = await ManifestationLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ManifestationLog.countDocuments({ userId });

    res.json({
      manifestations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching user manifestations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Override user manifestation - SUPER ADMIN ONLY
router.patch('/manifestations/:manifestationId', superAdmin, async (req, res) => {
  try {
    const { manifestationId } = req.params;
    const updates = req.body;

    const manifestation = await ManifestationLog.findByIdAndUpdate(
      manifestationId,
      updates,
      { new: true, runValidators: true }
    );

    if (!manifestation) {
      return res.status(404).json({ message: 'Manifestation not found' });
    }

    res.json({ 
      message: 'Manifestation updated successfully',
      manifestation
    });
  } catch (error) {
    console.error('Error updating manifestation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// System health check - SUPER ADMIN ONLY
router.get('/system/health', superAdmin, async (req, res) => {
  try {
    const dbStatus = await User.findOne().lean() ? 'connected' : 'disconnected';
    
    res.json({
      status: 'healthy',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      superAdminConfigured: !!process.env.SUPER_ADMIN_EMAIL
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;