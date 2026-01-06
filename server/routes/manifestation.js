const express = require('express');
const ManifestationLog = require('../models/ManifestationLog');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/manifestation/mark
// @desc    Mark today's manifestation as done
// @access  Private
router.post('/mark', auth, async (req, res) => {
  try {
    const today = ManifestationLog.getDateOnly(new Date());
    const userId = req.user._id;

    // Check if already marked today
    const existingLog = await ManifestationLog.findOne({ userId, date: today });
    if (existingLog) {
      return res.status(400).json({ message: 'Already marked for today' });
    }

    // Create new log
    const log = new ManifestationLog({
      userId,
      date: today,
      status: 'done',
      completedAt: new Date()
    });

    await log.save();

    res.json({ 
      message: 'Manifestation marked as complete!',
      log 
    });
  } catch (error) {
    console.error('Mark manifestation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/manifestation/today
// @desc    Get today's manifestation status
// @access  Private
router.get('/today', auth, async (req, res) => {
  try {
    const today = ManifestationLog.getDateOnly(new Date());
    const log = await ManifestationLog.findOne({ 
      userId: req.user._id, 
      date: today 
    });

    res.json({
      completed: !!log,
      log: log || null
    });
  } catch (error) {
    console.error('Get today error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/manifestation/calendar/:year/:month
// @desc    Get calendar data for specific month
// @access  Private
router.get('/calendar/:year/:month', auth, async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const logs = await ManifestationLog.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    // Create calendar data
    const calendar = {};
    logs.forEach(log => {
      const day = log.date.getDate();
      calendar[day] = {
        status: log.status,
        completedAt: log.completedAt
      };
    });

    res.json({
      year: parseInt(year),
      month: parseInt(month),
      calendar
    });
  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;