/**
 * Post Model (Mongoose)
 */
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 120
  },
  description: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['Events', 'Announcements', 'General', 'Jobs', 'Lost & Found']
  },
  imageUrl: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Add text index for search functionality
postSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Post', postSchema);
