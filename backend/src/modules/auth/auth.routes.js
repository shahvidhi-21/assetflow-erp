const express = require('express');
const router = express.Router();
const { signup, login, getProfile } = require('./auth.controller');
const { requireAuth } = require('../../middleware/auth.middleware');

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', requireAuth, getProfile);

module.exports = router;
