const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;


  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken(user);
  res.json({ token, user: user.toSafeObject() });
}

// GET /api/auth/me — lets the frontend re-check who's logged in on page refresh
async function me(req, res) {
  res.json({ user: req.user.toSafeObject() });
}

module.exports = { login, me };