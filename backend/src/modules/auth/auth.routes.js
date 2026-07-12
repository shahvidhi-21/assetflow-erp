const express = require('express');
const router = express.Router();
const { signup, login, getProfile, googleLogin, updateProfile, changePassword } = require('./auth.controller');
const { requireAuth } = require('../../middleware/auth.middleware');

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, updateProfile);
router.put('/change-password', requireAuth, changePassword);

module.exports = router;
