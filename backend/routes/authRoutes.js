const express = require('express');
const router = express.Router();

const { register, login, me } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Auth routes
router.post('/register', register);
router.post('/signup', register);
router.post('/login', login);
router.get('/me', verifyToken, me);

module.exports = router;