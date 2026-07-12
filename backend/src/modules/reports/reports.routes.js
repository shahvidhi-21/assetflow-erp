const express = require('express');
const router = express.Router();
const {
  getDashboardKPIs,
  getChartsData,
  getAIInsights,
  exportAssetsCSV,
} = require('./reports.controller');
const { requireAuth, requireRoles } = require('../../middleware/auth.middleware');

router.get('/kpis', requireAuth, getDashboardKPIs);
router.get('/charts', requireAuth, getChartsData);
router.get('/insights', requireAuth, requireRoles('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'), getAIInsights);
router.get('/export-csv', requireAuth, requireRoles('ADMIN', 'ASSET_MANAGER'), exportAssetsCSV);

module.exports = router;
