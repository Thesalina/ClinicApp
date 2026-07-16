const User = require('../models/User');

// GET /api/users/doctors — used to populate the doctor dropdown on the
// booking form. Any authenticated user can call this (not role-restricted),
// since a receptionist needs to see doctors to book, and a doctor might
// reasonably see the list of colleagues too.
async function listDoctors(req, res) {
  const doctors = await User.find({ role: 'doctor' }).select('name specialization');
  res.json({ doctors });
}

module.exports = { listDoctors };