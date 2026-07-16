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
// GET /api/appointments/mine?date=YYYY-MM-DD
// Doctor-only. Always scoped to req.user - never trusts a client-supplied doctorId.
async function myAppointments(req, res) {
  const { date } = req.query;

  const dayStart = date ? new Date(date) : new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const appointments = await Appointment.find({
    doctor: req.user._id, // <-- from the verified token, not req.query or req.body
    startTime: { $gte: dayStart, $lt: dayEnd },
  })
    .populate('patient', 'name phone age gender notes')
    .sort({ startTime: 1 });

  res.json({ appointments });
}

// PATCH /api/appointments/:id/status
async function updateAppointmentStatus(req, res) {
  const { status, consultationNote } = req.body;

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

  // A doctor may only update their OWN appointments — checked explicitly,
  // not just implied by the route being doctor-only.
  if (String(appointment.doctor) !== String(req.user._id)) {
    return res.status(403).json({ message: 'You can only update your own appointments' });
  }

  if (status) appointment.status = status;
  if (consultationNote !== undefined) appointment.consultationNote = consultationNote;
  await appointment.save();

  res.json({ appointment });
}
// GET /api/appointments?date=&doctorId=&status=
async function listAppointments(req, res) {
  const { date, doctorId, status } = req.query;

  const query = {};
  if (doctorId) query.doctor = doctorId;
  if (status) query.status = status;
  if (date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    query.startTime = { $gte: dayStart, $lt: dayEnd };
  }

  const appointments = await Appointment.find(query)
    .populate('patient', 'name phone')
    .populate('doctor', 'name specialization')
    .sort({ startTime: 1 });

  res.json({ appointments });
}

module.exports = { createAppointment, myAppointments, updateAppointmentStatus, listAppointments };
