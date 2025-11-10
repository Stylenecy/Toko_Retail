const express = require('express');
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validationHandler');
const roleCheck = require('../middleware/roleCheck');
const { createProductSchema } = require('../utils/validationSchemas');

const router = express.Router();

router.get('/', authMiddleware, productController.getAllProducts);
router.get('/:id', authMiddleware, productController.getProductById);

router.post('/', 
  authMiddleware, 
  roleCheck(['admin']), 
  validateRequest(createProductSchema),
  productController.createProduct
);

router.put('/:id', 
  authMiddleware, 
  roleCheck(['admin']), 
  validateRequest(createProductSchema),
  productController.updateProduct
);

router.delete('/:id', 
  authMiddleware, 
  roleCheck(['admin']), 
  productController.deleteProduct
);

module.exports = router;