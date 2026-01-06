const express = require('express');
const Affirmation = require('../models/Affirmation');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Default affirmations
const defaultAffirmations = [
  "I am very beautiful.",
  "I am healthy and full of energy.",
  "I am wealthy and financially abundant.",
  "Thank you for giving me a high-paying job that I love.",
  "Thank you for keeping my family healthy and safe.",
  "Thank you for keeping my friends healthy and happy.",
  "I do not hate anyone, and I release all grudges peacefully.",
  "I am mentally calm, peaceful, and balanced."
];

// @route   GET /api/affirmations
// @desc    Get all active affirmations
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let affirmations = await Affirmation.find({ isActive: true }).sort({ order: 1 });
    
    // If no affirmations exist, create default ones
    if (affirmations.length === 0) {
      const defaultAffirmationDocs = defaultAffirmations.map((text, index) => ({
        text,
        order: index + 1,
        isActive: true,
        createdBy: req.user._id
      }));
      
      affirmations = await Affirmation.insertMany(defaultAffirmationDocs);
    }

    res.json(affirmations);
  } catch (error) {
    console.error('Get affirmations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/affirmations/reorder
// @desc    Reorder two affirmations (admin only)
// @access  Private (Admin)
router.put('/reorder', [auth, adminOnly], async (req, res) => {
  try {
    const { affirmation1Id, affirmation2Id } = req.body;
    
    // Validate ObjectIds
    if (!affirmation1Id || !affirmation2Id) {
      return res.status(400).json({ message: 'Both affirmation IDs are required' });
    }

    // Check if they are valid ObjectIds
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(affirmation1Id) || !mongoose.Types.ObjectId.isValid(affirmation2Id)) {
      return res.status(400).json({ message: 'Invalid affirmation IDs' });
    }

    // Prevent swapping with itself
    if (affirmation1Id === affirmation2Id) {
      return res.status(400).json({ message: 'Cannot swap affirmation with itself' });
    }
    
    // Get both affirmations
    const [aff1, aff2] = await Promise.all([
      Affirmation.findById(affirmation1Id),
      Affirmation.findById(affirmation2Id)
    ]);

    if (!aff1 || !aff2) {
      return res.status(404).json({ message: 'One or both affirmations not found' });
    }

    // Swap their order values
    const tempOrder = aff1.order;
    aff1.order = aff2.order;
    aff2.order = tempOrder;

    // Save both (using individual saves to avoid conflicts)
    await aff1.save();
    await aff2.save();

    res.json({ 
      message: 'Affirmations reordered successfully',
      affirmations: [aff1, aff2]
    });
  } catch (error) {
    console.error('Reorder affirmations error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return res.status(409).json({ 
        message: 'Order conflict detected. Please refresh and try again.' 
      });
    }
    
    res.status(500).json({ message: 'Server error during reorder operation' });
  }
});

// @route   PUT /api/affirmations/:id
// @desc    Update affirmation (admin only)
// @access  Private (Admin)
router.put('/:id', [auth, adminOnly], async (req, res) => {
  try {
    const { text, order, isActive } = req.body;
    
    const updateData = {};
    if (text !== undefined) updateData.text = text;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const affirmation = await Affirmation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!affirmation) {
      return res.status(404).json({ message: 'Affirmation not found' });
    }

    res.json(affirmation);
  } catch (error) {
    console.error('Update affirmation error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Order number already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/affirmations
// @desc    Create new affirmation (admin only)
// @access  Private (Admin)
router.post('/', [auth, adminOnly], async (req, res) => {
  try {
    const { text, order } = req.body;
    
    const affirmation = new Affirmation({
      text,
      order,
      createdBy: req.user._id
    });

    await affirmation.save();
    res.status(201).json(affirmation);
  } catch (error) {
    console.error('Create affirmation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/affirmations/:id
// @desc    Delete affirmation (admin only)
// @access  Private (Admin)
router.delete('/:id', [auth, adminOnly], async (req, res) => {
  try {
    const affirmation = await Affirmation.findByIdAndDelete(req.params.id);

    if (!affirmation) {
      return res.status(404).json({ message: 'Affirmation not found' });
    }

    res.json({ message: 'Affirmation deleted successfully' });
  } catch (error) {
    console.error('Delete affirmation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;