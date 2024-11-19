import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../models/User';
import { auth, adminOnly } from '../middleware/auth';

const router = Router();

// Add password complexity requirements
const validatePassword = (password: string) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
};

// Register user
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;
    console.log('Registration attempt:', { email, fullName });

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check password complexity
    if (!validatePassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters and contain uppercase, lowercase, numbers and special characters'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      fullName,
      phone,
      role: email === 'admin@law.com' ? 'admin' : 'client',
      appointments: []
    });

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'e8af1200637b9e3e56128ea3b5a768f34f8988186f4ce25a1a3f821cef7c71992186b39ea9925189dae62cb3d12c36229e030de6a7200e2fac9804375352cca9',
      { expiresIn: '30d' }
    );

    // Convert user document to plain object and add token
    const userResponse = user.toJSON();

    // Return user data with token
    res.status(201).json({
      ...userResponse,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Failed to register user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email }); // Debug log

    // Check user exists and explicitly include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'e8af1200637b9e3e56128ea3b5a768f34f8988186f4ce25a1a3f821cef7c71992186b39ea9925189dae62cb3d12c36229e030de6a7200e2fac9804375352cca9',
      { expiresIn: '30d' }
    );

    // Generate refresh token
    const generateRefreshToken = (userId: string) => {
      return jwt.sign(
        { id: userId },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: '7d' }
      );
    };

    const refreshToken = generateRefreshToken(user._id);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Get user's appointments
    const userWithAppointments = await User.findById(user._id)
      .populate('appointments')
      .select('-password');

    // Convert user document to plain object and add token
    const userResponse = userWithAppointments?.toJSON();

    // Return user data with token
    res.json({
      ...userResponse,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Failed to login' });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user?.id)
      .populate('appointments')
      .select('-password');
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update user profile
router.patch('/profile', auth, async (req, res) => {
  try {
    const { email, fullName, phone } = req.body;

    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user?.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { 
        email,
        fullName,
        phone,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Get all clients (admin only)
router.get('/clients', auth, adminOnly, async (req, res) => {
  try {
    console.log('Fetching all clients');
    const clients = await User.find({ role: 'client' })
      .select('-password')
      .populate({
        path: 'appointments',
        select: 'date time status caseType'
      });
    
    console.log(`Found ${clients.length} clients`);
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Failed to fetch clients' });
  }
});

export default router; 