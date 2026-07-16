const express = require('express');
const { listDoctors } = require('../controller/userController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/doctors', requireAuth, listDoctors);

module.exports = router;