const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'Manifestation Circle'
  },
  affirmationThread: {
    type: String,
    trim: true,
    maxlength: [1000, 'Thread message cannot exceed 1000 characters']
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  maxMembers: {
    type: Number,
    default: 4,
    max: 4
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Group', groupSchema);