const express = require('express');
const { listPatients, createPatient, updatePatient, deletePatient } = require('../controller/patientContoller');
const { requireAuth, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { patientSchema } = require('../schemas/patientSchemas');

const router = express.Router();

// Every route below requires a logged-in receptionist — enforced once, here,
// rather than repeated on each route.
router.use(requireAuth, requireRole('receptionist'));

router.get('/', listPatients);
router.post('/', validate(patientSchema), createPatient);
router.put('/:id', validate(patientSchema), updatePatient);
router.delete('/:id', deletePatient);

module.exports = router;