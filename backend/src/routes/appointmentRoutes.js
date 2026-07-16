const express = require('express');
const { createAppointment, myAppointments, updateAppointmentStatus } = require('../controller/appointmentController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth); // everyone below must be logged in

router.post('/', requireRole('receptionist'), createAppointment);
router.get('/mine', requireRole('doctor'), myAppointments);
router.patch('/:id/status', requireRole('doctor'), updateAppointmentStatus);

module.exports = router;