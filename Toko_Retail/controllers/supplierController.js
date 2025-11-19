const { Supplier, Product } = require('../models');
const { calculatePagination } = require('../utils/helpers');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

exports.getAllSuppliers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, searchTerm } = req.query;
    const { offset, limit: pageLimit } = calculatePagination(page, limit);

    const where = {};
    if (searchTerm) {
      where[Op.or] = [
        { name: { [Op.like]: `%${searchTerm}%` } },
        { contact: { [Op.like]: `%${searchTerm}%` } }
      ];
    }

    const { count, rows } = await Supplier.findAndCountAll({
      where,
      include: [{ model: Product, as: 'products' }],
      offset,
      limit: pageLimit,
      order: [['id', 'DESC']]
    });

    res.json({
      success: true,
      message: 'Suppliers retrieved',
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: pageLimit,
        total: count,
        pages: Math.ceil(count / pageLimit)
      }
    });
  } catch (error) {
    logger.error('Get suppliers error:', error);
    next(error);
  }
};

exports.getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id, {
      include: [{ model: Product, as: 'products' }]
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    res.json({
      success: true,
      message: 'Supplier retrieved',
      data: supplier
    });
  } catch (error) {
    logger.error('Get supplier error:', error);
    next(error);
  }
};

exports.createSupplier = async (req, res, next) => {
  try {
    const { name, contact, address } = req.validatedData;

    const supplier = await Supplier.create({
      name,
      contact,
      address
    });

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier
    });
  } catch (error) {
    logger.error('Create supplier error:', error);
    next(error);
  }
};

exports.updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    const { name, contact, address } = req.validatedData;

    await supplier.update({
      name,
      contact,
      address
    });

    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier
    });
  } catch (error) {
    logger.error('Update supplier error:', error);
    next(error);
  }
};

exports.deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    const productCount = await Product.count({ where: { supplierId: supplier.id } });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete supplier with associated products'
      });
    }

    await supplier.destroy();

    res.json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    logger.error('Delete supplier error:', error);
    next(error);
  }
};