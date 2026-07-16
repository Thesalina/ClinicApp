const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { findConflict } = require('../utils/overlap');

async function findConflictingAppointment({ doctorId, startTime, durationMinutes, excludeId }) {
  const newStart = new Date(startTime);
  const newEnd = new Date(newStart.getTime() + durationMinutes * 60000);

  const query = {
    doctor: doctorId,
    status: { $ne: 'Cancelled' },
    startTime: { $lt: newEnd },
  };
  if (excludeId) query._id = { $ne: excludeId };

  // Narrow candidates at the DB level, finish the exact overlap math with
  // the same pure function we already tested in isolation.
  const candidates = await Appointment.find(query).select('startTime durationMinutes');
  return findConflict(newStart, durationMinutes, candidates, excludeId);
}

// POST /api/appointments
async function createAppointment(req, res) {
  const { patientId, doctorId, startTime, durationMinutes = 30, reason } = req.body;

  const [patient, doctor] = await Promise.all([
    Patient.findById(patientId),
    User.findOne({ _id: doctorId, role: 'doctor' }),
  ]);
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

  const conflict = await findConflictingAppointment({ doctorId, startTime, durationMinutes });
  if (conflict) {
    return res.status(409).json({
      message: ` ${doctor.name} already has an appointment overlapping this time slot`,
    });
  }

  const appointment = await Appointment.create({
    patient: patientId,
    doctor: doctorId,
    startTime,
    durationMinutes,
    reason,
    createdBy: req.user._id,
  });

  res.status(201).json({ appointment });
}

module.exports = { createAppointment, findConflictingAppointment };