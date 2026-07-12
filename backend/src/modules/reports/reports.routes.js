const express = require('express');
const router = express.Router();
const {
  getDashboardKPIs,
  getChartsData,
  getAIInsights,
  exportAssetsCSV,
  handleChatQuery,
  handleDemoSimulation,
} = require('./reports.controller');
const { requireAuth, requireRoles } = require('../../middleware/auth.middleware');

router.get('/kpis', requireAuth, getDashboardKPIs);
router.get('/charts', requireAuth, getChartsData);
router.get('/insights', requireAuth, requireRoles('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'), getAIInsights);
router.get('/export-csv', requireAuth, requireRoles('ADMIN', 'ASSET_MANAGER'), exportAssetsCSV);

// New Hackathon Unique Endpoints (AI Chatbot & Judge Sandbox)
router.post('/chat', requireAuth, handleChatQuery);
router.post('/simulate', requireAuth, requireRoles('ADMIN'), handleDemoSimulation);

module.exports = router;
