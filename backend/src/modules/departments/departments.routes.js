const express = require('express');
const router = express.Router();
const {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('./departments.controller');
const { requireAuth, requireRoles } = require('../../middleware/auth.middleware');

router.get('/', requireAuth, getAllDepartments);
router.get('/:id', requireAuth, getDepartmentById);
router.post('/', requireAuth, requireRoles('ADMIN'), createDepartment);
router.put('/:id', requireAuth, requireRoles('ADMIN'), updateDepartment);
router.delete('/:id', requireAuth, requireRoles('ADMIN'), deleteDepartment);

module.exports = router;
