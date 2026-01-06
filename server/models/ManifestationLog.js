const mongoose = require('mongoose');

const manifestationLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['done', 'missed'],
    required: true
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Ensure one log per user per day
manifestationLogSchema.index({ userId: 1, date: 1 }, { unique: true });

// Helper method to get date without time
manifestationLogSchema.statics.getDateOnly = function(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

// Method to mark as completed
manifestationLogSchema.methods.markCompleted = function() {
  this.status = 'done';
  this.completedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('ManifestationLog', manifestationLogSchema);