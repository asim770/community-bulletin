const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  isPinned: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema);
