const express = require('express');
const router = express.Router();
const {
  createAuditCycle,
  getAllAuditCycles,
  getAuditCycleById,
  verifyAuditReport,
  closeAuditCycle,
} = require('./audit.controller');
const { requireAuth, requireRoles } = require('../../middleware/auth.middleware');

router.post('/', requireAuth, requireRoles('ADMIN', 'ASSET_MANAGER'), createAuditCycle);
router.get('/', requireAuth, requireRoles('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'), getAllAuditCycles);
router.get('/:id', requireAuth, getAuditCycleById);
router.put('/reports/:reportId', requireAuth, verifyAuditReport);
router.put('/:id/close', requireAuth, requireRoles('ADMIN', 'ASSET_MANAGER'), closeAuditCycle);

module.exports = router;
