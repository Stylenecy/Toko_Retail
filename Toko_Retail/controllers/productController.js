const { Product, Supplier, Category, Transaction, TransactionItem, sequelize } = require('../models'); // Pastikan Category diimpor
const { calculatePagination, generateInvoiceNumber } = require('../utils/helpers');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

exports.getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, supplierId, categoryId, searchTerm } = req.query; // Tambah categoryId di query
    const { offset, limit: pageLimit } = calculatePagination(page, limit);

    const where = {};
    if (supplierId) where.supplierId = supplierId;
    if (categoryId) where.categoryId = categoryId; // Filter berdasarkan kategori jika ada
    if (searchTerm) {
      where[Op.or] = [
        { name: { [Op.like]: `%${searchTerm}%` } },
        { sku: { [Op.like]: `%${searchTerm}%` } }
      ];
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        { model: Supplier, as: 'supplier' },
        { model: Category, as: 'category' } // Include Kategori
      ],
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
      include: [
        { model: Supplier, as: 'supplier' },
        { model: Category, as: 'category' } // Include Kategori
      ]
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
    // Ambil data dari req.body (karena req.validatedData mungkin belum update skema Joi)
    // Atau pastikan middleware validasi Joi Anda sudah membolehkan 'categoryId'
    const { sku, name, description, unitPrice, quantityInStock, reorderThreshold, supplierId, categoryId } = req.body;

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
      categoryId, // Simpan ID Kategori
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    const fullProduct = await Product.findByPk(product.id, {
      include: [
        { model: Supplier, as: 'supplier' },
        { model: Category, as: 'category' }
      ]
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

    // PERBAIKAN 1: Ambil quantityInStock dari req.body
    const { name, description, unitPrice, reorderThreshold, supplierId, categoryId, quantityInStock } = req.body; // <-- TAMBAH quantityInStock

    await product.update({
      name,
      description,
      unitPrice,
      reorderThreshold,
      supplierId,
      categoryId,
      quantityInStock, // <-- PERBAIKAN 2: Izinkan update stok
      updatedBy: req.user.id
    });

    const updatedProduct = await Product.findByPk(product.id, {
      include: [
        { model: Supplier, as: 'supplier' },
        { model: Category, as: 'category' }
      ]
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

exports.stockOpname = async (req, res, next) => {
  const t = await sequelize.transaction(); // Gunakan sequelize instance yang diimport
  try {
    const { id } = req.params;
    const { actualStock, notes } = req.body; 

    const product = await Product.findByPk(id, { transaction: t });

    if (!product) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const currentStock = product.quantityInStock;
    const difference = actualStock - currentStock;

    if (difference === 0) {
      await t.rollback();
      return res.json({ success: true, message: 'Stock matches. No changes made.' });
    }

    const type = difference > 0 ? 'stock_in' : 'stock_out';
    const quantityChange = Math.abs(difference);

    product.quantityInStock = actualStock;
    await product.save({ transaction: t });

    const transaction = await Transaction.create({
      invoiceNumber: generateInvoiceNumber(),
      transactionType: type,
      userId: req.user.id,
      totalAmount: 0,
      notes: `Stok Opname: ${notes || 'Penyesuaian sistem'}. (System: ${currentStock} -> Physical: ${actualStock})`
    }, { transaction: t });

    await TransactionItem.create({
      transactionId: transaction.id,
      productId: product.id,
      quantity: quantityChange,
      unitPrice: product.unitPrice,
      lineTotal: 0
    }, { transaction: t });

    await t.commit();

    res.json({
      success: true,
      message: 'Stock adjusted successfully',
      data: product
    });

  } catch (error) {
    await t.rollback();
    logger.error('Stock opname error:', error);
    next(error);
  }
};