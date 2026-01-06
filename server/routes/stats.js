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
    const logs = await ManifestationLog.find({ userId }).sort({ date: -1 });

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let totalCompleted = 0;

    // Count total completed
    totalCompleted = logs.filter(log => log.status === 'done').length;

    // Calculate streaks
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

    // Calculate consistency percentage
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