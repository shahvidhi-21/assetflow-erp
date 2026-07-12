const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('./categories.controller');
const { requireAuth, requireRoles } = require('../../middleware/auth.middleware');

router.get('/', requireAuth, getAllCategories);
router.get('/:id', requireAuth, getCategoryById);
router.post('/', requireAuth, requireRoles('ADMIN', 'ASSET_MANAGER'), createCategory);
router.put('/:id', requireAuth, requireRoles('ADMIN', 'ASSET_MANAGER'), updateCategory);
router.delete('/:id', requireAuth, requireRoles('ADMIN'), deleteCategory);

module.exports = router;
