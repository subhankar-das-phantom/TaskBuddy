import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const router = express.Router();

// Signup
router.route('/signup').post(async (req, res) => {
  console.log('--- SIGNUP REQUEST ---');
  try {
    console.log('Request Body:', req.body);
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      console.log('Validation failed: Missing fields');
      return res.status(400).json({ success: false, message: 'Please provide username, email, and password' });
    }

    console.log('Signup attempt:', { username, email, passwordLength: password.length });

    // Check existing user
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      console.log('User already exists:', existingUser.username);
      return res.status(400).json({ 
        success: false,
        message: 'User already exists' 
      });
    }

    console.log('User does not exist. Proceeding with hashing password.');

    // Hash password - CRITICAL STEP
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('Original password length:', password.length);
    console.log('Hashed password length:', hashedPassword.length);

    // Create user with hashed password
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    console.log('User saved successfully:', savedUser);
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: { username: savedUser.username, email: savedUser.email }
    });

  } catch (err) {
    console.error('--- SIGNUP ERROR ---', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during signup' 
    });
  }
});

// Login
router.route('/login').post(async (req, res) => {
  console.log('--- LOGIN REQUEST ---');
  try {
    console.log('Request Body:', req.body);
    const { username, password } = req.body;

    if (!username || !password) {
      console.log('Validation failed: Missing fields');
      return res.status(400).json({ success: false, message: 'Please provide username and password' });
    }

    console.log('Login attempt:', { username, passwordLength: password.length });

    // Find user by username OR email
    const user = await User.findOne({ 
      $or: [{ username }, { email: username }] 
    });

    if (!user) {
      console.log('User not found for username/email:', username);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('User found:', user);

    // Compare password with hash
    console.log('Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Password mismatch for user:', user.username);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    console.log('Password matched. Generating JWT.');

    // Generate JWT
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'your-default-secret', 
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (err) {
    console.error('--- LOGIN ERROR ---', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
}); 

// Test route for debugging
router.get('/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Users route is working!' 
  });
});

export default router;
