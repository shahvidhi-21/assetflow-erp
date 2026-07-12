const express = require('express');
const router = express.Router();
const {
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequestStatus,
} = require('./maintenance.controller');
const { requireAuth, requireRoles } = require('../../middleware/auth.middleware');

router.get('/', requireAuth, getAllRequests);
router.get('/:id', requireAuth, getRequestById);
router.post('/', requireAuth, createRequest);
router.put('/:id/status', requireAuth, requireRoles('ADMIN', 'ASSET_MANAGER'), updateRequestStatus);

module.exports = router;
