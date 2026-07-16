const Patient = require('../models/Patient');

// GET /api/patients?search=
async function listPatients(req, res) {
  const { search = '' } = req.query;
  const query = {};
  if (search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    query.$or = [{ name: regex }, { phone: regex }];
  }
  const patients = await Patient.find(query).sort({ createdAt: -1 });
  res.json({ patients });
}

// POST /api/patients
async function createPatient(req, res) {
  const patient = await Patient.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ patient });
}

// PUT /api/patients/:id
async function updatePatient(req, res) {
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  res.json({ patient });
}

// DELETE /api/patients/:id
async function deletePatient(req, res) {
  const patient = await Patient.findByIdAndDelete(req.params.id);
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  res.json({ message: 'Patient deleted' });
}

module.exports = { listPatients, createPatient, updatePatient, deletePatient };