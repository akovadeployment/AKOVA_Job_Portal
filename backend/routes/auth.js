const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Validation middleware
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  console.log('🔐 Login attempt:', { email, password });
  
  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      error: 'Please provide both email and password' 
    });
  }
  
  next();
};

// Login route
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔍 Looking for user:', email);
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }
    
    console.log('✅ User found:', user.email);
    console.log('🔑 Stored password:', user.password);
    console.log('🔑 Provided password:', password);
    
    // Check password (plain text comparison)
    if (user.password !== password) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }
    
    console.log('✅ Password matches!');
    
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
    
    console.log('✅ Token created successfully');
    
    res.json({ 
      success: true,
      message: 'Login successful',
      token, 
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
    
  } catch (error) {
    console.error('🔥 Login error:', error);
    console.error('🔥 Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Server error during authentication',
      details: error.message 
    });
  }
});

// Test route - remove this in production
router.get('/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Auth API is working',
    timestamp: new Date().toISOString()
  });
});

// Simple login test endpoint
router.post('/simple-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Simple check without database
    if (email === 'hr@jobportal.com' && password === 'password123') {
      const token = jwt.sign(
        { email: 'hr@jobportal.com', role: 'hr' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return res.json({
        success: true,
        message: 'Login successful (test)',
        token,
        user: {
          email: 'hr@jobportal.com',
          role: 'hr',
          name: 'HR Manager'
        }
      });
    }
    
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
    
  } catch (error) {
    console.error('Simple login error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const verifyToken = (req, res, next) => {
  try {
    console.log('🔐 verifyToken middleware called');
    
    // Get the token from header
    const authHeader = req.headers.authorization;
    console.log('🔐 Authorization header:', authHeader);
    
    if (!authHeader) {
      console.log('❌ No authorization header');
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }
    
    // Check if it's Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      console.log('❌ Not a Bearer token');
      return res.status(401).json({
        success: false,
        error: 'Access denied. Invalid token format.'
      });
    }
    
    const token = authHeader.split(' ')[1];
    console.log('🔐 Token extracted (first 10 chars):', token.substring(0, 10) + '...');
    
    if (!token) {
      console.log('❌ Token is empty');
      return res.status(401).json({
        success: false,
        error: 'Access denied. Invalid token.'
      });
    }
    
    // Verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('✅ Token verified successfully:', verified);
    
    // Attach user to request
    req.user = {
      userId: verified.userId || verified.id || verified._id,
      email: verified.email || 'unknown@example.com',
      role: verified.role || 'hr',
      name: verified.name || 'Unknown User'
    };
    
    console.log('✅ User attached to request:', req.user);
    next();
    
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token has expired'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Server error during authentication'
    });
  }
};

module.exports = verifyToken;
module.exports = router;