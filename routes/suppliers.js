const express = require('express');
const supplierController = require('../controllers/supplierController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validationHandler');
const roleCheck = require('../middleware/roleCheck');
const { createSupplierSchema } = require('../utils/validationSchemas');

const router = express.Router();

router.get('/', authMiddleware, supplierController.getAllSuppliers);
router.get('/:id', authMiddleware, supplierController.getSupplierById);

router.post('/', 
  authMiddleware, 
  roleCheck(['admin']), 
  validateRequest(createSupplierSchema),
  supplierController.createSupplier
);

router.put('/:id', 
  authMiddleware, 
  roleCheck(['admin']), 
  validateRequest(createSupplierSchema),
  supplierController.updateSupplier
);

router.delete('/:id', 
  authMiddleware, 
  roleCheck(['admin']), 
  supplierController.deleteSupplier
);

module.exports = router;