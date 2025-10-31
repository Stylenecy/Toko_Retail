const { Product, Supplier } = require('../models');
const { calculatePagination } = require('../utils/helpers');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

exports.getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, supplierId, searchTerm } = req.query;
    const { offset, limit: pageLimit } = calculatePagination(page, limit);

    const where = {};
    if (supplierId) where.supplierId = supplierId;
    if (searchTerm) {
      where[Op.or] = [
        { name: { [Op.like]: `%${searchTerm}%` } },
        { sku: { [Op.like]: `%${searchTerm}%` } }
      ];
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{ model: Supplier, as: 'supplier' }],
      offset,
      limit: pageLimit,
      order: [['id', 'DESC']]
    });

    const withAlerts = rows.map(p => ({
      ...p.toJSON(),
      lowStock: p.quantityInStock <= p.reorderThreshold
    }));

    res.json({
      success: true,
      message: 'Products retrieved',
      data: withAlerts,
      pagination: {
        page: parseInt(page),
        limit: pageLimit,
        total: count,
        pages: Math.ceil(count / pageLimit)
      }
    });
  } catch (error) {
    logger.error('Get products error:', error);
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Supplier, as: 'supplier' }]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product retrieved',
      data: {
        ...product.toJSON(),
        lowStock: product.quantityInStock <= product.reorderThreshold
      }
    });
  } catch (error) {
    logger.error('Get product error:', error);
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { sku, name, description, unitPrice, quantityInStock, reorderThreshold, supplierId } = req.validatedData;

    const existingSku = await Product.findOne({ where: { sku } });
    if (existingSku) {
      return res.status(400).json({
        success: false,
        message: 'SKU already exists'
      });
    }

    const product = await Product.create({
      sku,
      name,
      description,
      unitPrice,
      quantityInStock,
      reorderThreshold,
      supplierId,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    const fullProduct = await Product.findByPk(product.id, {
      include: [{ model: Supplier, as: 'supplier' }]
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: fullProduct
    });
  } catch (error) {
    logger.error('Create product error:', error);
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const { name, description, unitPrice, reorderThreshold, supplierId } = req.validatedData;

    await product.update({
      name,
      description,
      unitPrice,
      reorderThreshold,
      supplierId,
      updatedBy: req.user.id
    });

    const updatedProduct = await Product.findByPk(product.id, {
      include: [{ model: Supplier, as: 'supplier' }]
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    logger.error('Update product error:', error);
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.destroy();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    logger.error('Delete product error:', error);
    next(error);
  }
};