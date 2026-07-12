const express = require('express');
const router = express.Router();
const {
  getAllAllocations,
  getAllocationsByEmployee,
  allocateAsset,
  returnAsset,
  requestTransfer,
  approveTransfer,
  rejectTransfer,
} = require('./allocation.controller');
const { requireAuth, requireRoles } = require('../../middleware/auth.middleware');

router.get('/', requireAuth, requireRoles('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'), getAllAllocations);
router.get('/employee/:employeeId', requireAuth, getAllocationsByEmployee);
router.post('/', requireAuth, requireRoles('ADMIN', 'ASSET_MANAGER'), allocateAsset);
router.post('/:id/return', requireAuth, requireRoles('ADMIN', 'ASSET_MANAGER'), returnAsset);
router.post('/:id/transfer', requireAuth, requestTransfer);
router.post('/:id/approve-transfer', requireAuth, requireRoles('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'), approveTransfer);
router.post('/:id/reject-transfer', requireAuth, requireRoles('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'), rejectTransfer);

module.exports = router;
