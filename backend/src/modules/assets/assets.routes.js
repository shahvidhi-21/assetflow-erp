const express = require('express');
const router = express.Router();
const {
  getAllAssets,
  getAssetById,
  getAssetByTag,
  createAsset,
  updateAsset,
  deleteAsset,
} = require('./assets.controller');
const { requireAuth, requireRoles } = require('../../middleware/auth.middleware');

router.get('/', requireAuth, getAllAssets);
router.get('/tag/:tag', requireAuth, getAssetByTag);
router.get('/:id', requireAuth, getAssetById);
router.post('/', requireAuth, requireRoles('ADMIN', 'ASSET_MANAGER'), createAsset);
router.put('/:id', requireAuth, requireRoles('ADMIN', 'ASSET_MANAGER'), updateAsset);
router.delete('/:id', requireAuth, requireRoles('ADMIN'), deleteAsset);

module.exports = router;
