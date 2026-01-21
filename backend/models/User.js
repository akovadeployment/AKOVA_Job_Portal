const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['hr', 'admin'],
    default: 'hr'
  },
  name: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Remove password from JSON response
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

// Simple password comparison (no hashing)
userSchema.methods.comparePassword = function(candidatePassword) {
  return this.password === candidatePassword;
};

module.exports = mongoose.model('User', userSchema);