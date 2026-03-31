const { registerUser, loginUser } = require('../services/authService');
const { generateToken } = require('../utils/jwt');
const prisma = require('../lib/prisma');

// Registers a new user and returns the created profile
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'email and password are required',
      });
    }

    const user = await registerUser({ email, password, name });

    return res.status(201).json({
      success: true,
      data: {
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Signup error:', error.message, error.stack);

    if (error.message === 'User already exists') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};

// Logs in a user and returns token + profile
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'email and password are required',
      });
    }

    const user = await loginUser({ email, password });

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      data: {
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error.message, error.stack);

    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid credentials',
    });
  }
};

// Returns the current authenticated user's profile
const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, role: true, name: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Auth me error:', error.message, error.stack);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
    });
  }
};

module.exports = { register, login, me };