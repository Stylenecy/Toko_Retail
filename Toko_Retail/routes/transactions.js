  const express = require('express');
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validationHandler');
const roleCheck = require('../middleware/roleCheck');
const { createTransactionSchema } = require('../utils/validationSchemas');

const router = express.Router();

router.get('/', authMiddleware, transactionController.getAllTransactions);
router.get('/:id', authMiddleware, transactionController.getTransactionById);

router.post('/', 
  authMiddleware, 
  validateRequest(createTransactionSchema),
  transactionController.createTransaction
);

// router.delete('/:id', 
//   authMiddleware, 
//   roleCheck(['admin']), 
//   transactionController.deleteTransaction
// );

module.exports = router;