const express = require('express');
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/stock', authMiddleware, reportController.getStockReport);
router.get('/sales', authMiddleware, reportController.getSalesReport);
router.get('/dashboard/stats', authMiddleware, reportController.getDashboardStats);

// --- TAMBAHKAN RUTE BARU INI ---
router.get('/sales-summary', authMiddleware, reportController.getSalesSummary);

module.exports = router;
module.exports = router;