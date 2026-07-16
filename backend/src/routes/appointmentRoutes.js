const express = require('express');
const { createAppointment } = require('../controller/appointmentController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireRole('receptionist'));
router.post('/', createAppointment);

module.exports = router;