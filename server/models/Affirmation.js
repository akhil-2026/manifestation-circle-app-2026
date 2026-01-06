const mongoose = require('mongoose');

const affirmationSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Affirmation text is required'],
    trim: true,
    maxlength: [200, 'Affirmation cannot exceed 200 characters']
  },
  order: {
    type: Number,
    required: true,
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for performance (not unique to allow temporary duplicates during swaps)
affirmationSchema.index({ order: 1, isActive: 1 });

module.exports = mongoose.model('Affirmation', affirmationSchema);