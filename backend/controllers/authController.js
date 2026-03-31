const { registerUser,loginUser } = require('../services/authService');
const { generateToken } = require('../utils/jwt');

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'email and password are required',
      });
    }

    const user = await registerUser({ email, password, name });

    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Signup error:', error.message, error.stack);

    if (error.message === 'User already exists') {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({
      message: 'Something went wrong',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'email and password are required',
      });
    }

    const user = await loginUser({ email, password });

    const token = generateToken(user);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message, error.stack);

    return res.status(401).json({
      message: error.message || 'Invalid credentials',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = { register,login };