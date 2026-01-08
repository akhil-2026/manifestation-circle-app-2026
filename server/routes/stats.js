const express = require('express');
const ManifestationLog = require('../models/ManifestationLog');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/stats/streak
// @desc    Get user's streak data
// @access  Private
router.get('/streak', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    // Use database streak values if they exist and were overridden by Super Admin
    let currentStreak = 0;
    let longestStreak = 0;
    
    if (user && user.streakOverriddenBy === 'super_admin') {
      // Use Super Admin overridden values
      currentStreak = user.currentStreak || 0;
      longestStreak = user.longestStreak || 0;
    } else {
      // Calculate streaks from logs (original logic)
      const logs = await ManifestationLog.find({ userId }).sort({ date: -1 });
      let tempStreak = 0;

      // Calculate current streak
      const today = ManifestationLog.getDateOnly(new Date());
      let checkDate = new Date(today);
      let foundToday = false;

      // Check if today is completed
      const todayLog = logs.find(log => 
        log.date.getTime() === today.getTime()
      );
      
      if (todayLog && todayLog.status === 'done') {
        foundToday = true;
        currentStreak = 1;
      }

      // Calculate current streak
      if (foundToday) {
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

      // Calculate longest streak
      for (let i = 0; i < logs.length; i++) {
        if (logs[i].status === 'done') {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      // Update user model with calculated values if not overridden
      if (user && user.streakOverriddenBy !== 'super_admin') {
        user.currentStreak = currentStreak;
        user.longestStreak = longestStreak;
        await user.save();
      }
    }

    // Get logs for other stats
    const logs = await ManifestationLog.find({ userId }).sort({ date: -1 });
    const totalCompleted = logs.filter(log => log.status === 'done').length;
    const totalDays = logs.length;
    const consistencyPercentage = totalDays > 0 ? 
      Math.round((totalCompleted / totalDays) * 100) : 0;

    res.json({
      currentStreak,
      longestStreak,
      totalCompleted,
      consistencyPercentage,
      totalDays
    });
  } catch (error) {
    console.error('Get streak error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/stats/consistency
// @desc    Get detailed consistency data
// @access  Private
router.get('/consistency', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentLogs = await ManifestationLog.find({
      userId,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });

    const completed = recentLogs.filter(log => log.status === 'done').length;
    const total = recentLogs.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      last30Days: {
        completed,
        total,
        percentage
      },
      recentActivity: recentLogs.slice(-7) // Last 7 days
    });
  } catch (error) {
    console.error('Get consistency error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;