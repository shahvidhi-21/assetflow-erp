const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUser } = require('./users.controller');
const { requireAuth, requireRoles } = require('../../middleware/auth.middleware');

router.get('/', requireAuth, requireRoles('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'), getAllUsers);
router.get('/:id', requireAuth, getUserById);
router.put('/:id', requireAuth, requireRoles('ADMIN'), updateUser);
router.delete('/:id', requireAuth, requireRoles('ADMIN'), deleteUser);

module.exports = router;
