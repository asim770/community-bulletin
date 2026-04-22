/**
 * User Model (Mongoose)
 */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true // adds createdAt and updatedAt automatically
});

// Remove passwordHash when converting to JSON
userSchema.methods.toSafeUser = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  obj.id = obj._id.toString();
  return obj;
};

module.exports = mongoose.model('User', userSchema);
