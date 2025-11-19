const express = require('express');
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

router.get('/', authMiddleware, categoryController.getAllCategories);
router.post('/', authMiddleware, roleCheck(['admin']), categoryController.createCategory);
router.put('/:id', authMiddleware, roleCheck(['admin']), categoryController.updateCategory);
router.delete('/:id', authMiddleware, roleCheck(['admin']), categoryController.deleteCategory);

module.exports = router;