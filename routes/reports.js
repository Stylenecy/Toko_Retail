const express = require('express');
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/stock', authMiddleware, reportController.getStockReport);
router.get('/sales', authMiddleware, reportController.getSalesReport);
router.get('/dashboard/stats', authMiddleware, reportController.getDashboardStats);

module.exports = router;