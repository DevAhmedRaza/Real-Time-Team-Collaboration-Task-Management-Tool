const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// GET /api/users - get list of users
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
