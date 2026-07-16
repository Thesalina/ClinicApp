const express = require('express');
const { login, me } = require('../controller/authController');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { loginSchema } = require('../schemas/authSchemas');
const router = express.Router();

router.post('/login', validate(loginSchema), login);
router.get('/me', requireAuth, me);

module.exports = router;