const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Validation middleware
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Please provide both email and password' 
    });
  }
  
  next();
};

// Login route
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }
    
    // Create token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role,
        name: user.name 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ 
      success: true,
      token, 
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Server error during authentication' 
    });
  }
});

// Register route (for creating initial HR user)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User already exists' 
      });
    }
    
    // Create new user
    const user = new User({
      email,
      password,
      name,
      role: 'hr'
    });
    
    await user.save();
    
    // Create token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role,
        name: user.name 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({ 
      success: true,
      message: 'User created successfully',
      token, 
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    res.status(500).json({ 
      error: 'Server error during registration' 
    });
  }
});

// Check auth status
router.get('/check', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.json({ isAuthenticated: false });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.json({ isAuthenticated: false });
    }
    
    res.json({ 
      isAuthenticated: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
    
  } catch (error) {
    res.json({ isAuthenticated: false });
  }
});

module.exports = router;