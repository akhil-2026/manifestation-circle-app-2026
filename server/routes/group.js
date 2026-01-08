const express = require('express');
const User = require('../models/User');
const ManifestationLog = require('../models/ManifestationLog');
const Group = require('../models/Group');
const { auth, adminOnly } = require('../middleware/auth');
const { filterSuperAdmin } = require('../middleware/superAdmin');

const router = express.Router();

// @route   GET /api/group/details
// @desc    Get group overview with all members
// @access  Private
router.get('/details', auth, async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select('name email role joinedAt profilePicture');
    
    // Filter out super admin from group view
    const filteredUsers = filterSuperAdmin(users);
    
    const groupData = await Promise.all(
      filteredUsers.map(async (user) => {
        const logs = await ManifestationLog.find({ userId: user._id });
        const completedLogs = logs.filter(log => log.status === 'done');
        
        // Calculate current streak
        let currentStreak = 0;
        const today = ManifestationLog.getDateOnly(new Date());
        let checkDate = new Date(today);
        
        const todayLog = logs.find(log => 
          log.date.getTime() === today.getTime()
        );
        
        if (todayLog && todayLog.status === 'done') {
          currentStreak = 1;
          checkDate.setDate(checkDate.getDate() - 1);
          
          while (true) {
            const dayLog = logs.find(log => 
              log.date.getTime() === checkDate.getTime()
            );
            
            if (dayLog && dayLog.status === 'done') {
              currentStreak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }
        }

        const consistencyPercentage = logs.length > 0 ? 
          Math.round((completedLogs.length / logs.length) * 100) : 0;

        return {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          currentStreak,
          consistencyPercentage,
          joinedAt: user.joinedAt
        };
      })
    );

    res.json({
      members: groupData,
      totalMembers: filteredUsers.length
    });
  } catch (error) {
    console.error('Get group details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/group/thread
// @desc    Get manifestation thread
// @access  Private
router.get('/thread', auth, async (req, res) => {
  try {
    let group = await Group.findOne().populate('createdBy', 'name');
    
    if (!group) {
      // Create default group if none exists
      group = new Group({
        name: 'Manifestation Circle',
        affirmationThread: 'Welcome to our manifestation journey! 🌙✨',
        createdBy: req.user._id,
        members: [req.user._id]
      });
      await group.save();
      await group.populate('createdBy', 'name');
    }

    res.json({
      thread: group.affirmationThread,
      createdBy: group.createdBy,
      updatedAt: group.updatedAt
    });
  } catch (error) {
    console.error('Get thread error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/group/thread
// @desc    Update manifestation thread (admin only)
// @access  Private (Admin)
router.put('/thread', [auth, adminOnly], async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Thread message is required' });
    }

    let group = await Group.findOne();
    
    if (!group) {
      group = new Group({
        name: 'Manifestation Circle',
        affirmationThread: message,
        createdBy: req.user._id,
        members: [req.user._id]
      });
    } else {
      group.affirmationThread = message;
    }

    await group.save();
    await group.populate('createdBy', 'name');

    res.json({
      message: 'Thread updated successfully',
      thread: group.affirmationThread,
      createdBy: group.createdBy,
      updatedAt: group.updatedAt
    });
  } catch (error) {
    console.error('Update thread error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;