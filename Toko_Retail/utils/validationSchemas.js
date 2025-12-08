const Joi = require('joi');

exports.registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'staff').default('staff')
});

exports.loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

exports.createProductSchema = Joi.object({
  sku: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  unitPrice: Joi.number().precision(2).positive().required(),
  quantityInStock: Joi.number().integer().min(0).required(),
  reorderThreshold: Joi.number().integer().min(0).default(0),
  supplierId: Joi.number().integer().required()
});

exports.createSupplierSchema = Joi.object({
  name: Joi.string().required(),
  contact: Joi.string().required(),
  address: Joi.string().required()
});

exports.createTransactionSchema = Joi.object({
  transactionType: Joi.string().valid('sale', 'stock_in', 'stock_out', 'return').required(),
  userId: Joi.number().integer().required(),
  notes: Joi.string().allow(''),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.number().integer().required(),
      quantity: Joi.number().integer().positive().required(),
      unitPrice: Joi.number().precision(2).min(0).required()
    })
  ).min(1).required()
});

exports.paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});
