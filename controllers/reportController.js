const { Product, Transaction, TransactionItem, Supplier } = require('../models');
const logger = require('../utils/logger');
const { Op, Sequelize } = require('sequelize');

exports.getStockReport = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Supplier, as: 'supplier' }],
      order: [['quantityInStock', 'ASC']]
    });

    const report = products.map(p => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      quantityInStock: p.quantityInStock,
      reorderThreshold: p.reorderThreshold,
      unitPrice: p.unitPrice,
      totalValue: p.quantityInStock * p.unitPrice,
      supplier: p.supplier.name,
      lowStock: p.quantityInStock <= p.reorderThreshold
    }));

    const summary = {
      totalProducts: report.length,
      lowStockCount: report.filter(p => p.lowStock).length,
      totalInventoryValue: report.reduce((sum, p) => sum + p.totalValue, 0),
      products: report
    };

    res.json({
      success: true,
      message: 'Stock report generated',
      data: summary
    });
  } catch (error) {
    logger.error('Stock report error:', error);
    next(error);
  }
};

exports.getSalesReport = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, productId, type } = req.query;

    const where = {};
    if (type && type !== 'all') where.transactionType = type;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt[Op.gte] = new Date(dateFrom);
      if (dateTo) where.createdAt[Op.lte] = new Date(dateTo);
    }

    // Get transactions
    const transactions = await Transaction.findAll({
      where,
      include: [
        {
          model: TransactionItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }],
          where: productId ? { productId } : undefined
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Group by transaction type
    const byType = {
      sale: { count: 0, totalAmount: 0 },
      stock_in: { count: 0, totalAmount: 0 },
      stock_out: { count: 0, totalAmount: 0 },
      return: { count: 0, totalAmount: 0 }
    };

    transactions.forEach(t => {
      byType[t.transactionType].count++;
      byType[t.transactionType].totalAmount += parseFloat(t.totalAmount);
    });

    // Group by product
    const byProduct = {};
    transactions.forEach(t => {
      t.items.forEach(item => {
        const key = item.product.id;
        if (!byProduct[key]) {
          byProduct[key] = {
            productId: item.productId,
            productName: item.product.name,
            sku: item.product.sku,
            quantity: 0,
            revenue: 0
          };
        }
        byProduct[key].quantity += item.quantity;
        byProduct[key].revenue += parseFloat(item.lineTotal);
      });
    });

    const report = {
      period: { from: dateFrom || 'all', to: dateTo || 'all' },
      totalTransactions: transactions.length,
      byType,
      byProduct: Object.values(byProduct),
      totalRevenue: transactions.reduce((sum, t) => sum + parseFloat(t.totalAmount), 0)
    };

    res.json({
      success: true,
      message: 'Sales report generated',
      data: report
    });
  } catch (error) {
    logger.error('Sales report error:', error);
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalProducts = await Product.count();
    const totalSuppliers = await Supplier.count();
    const totalTransactions = await Transaction.count();

    const lowStockProducts = await Product.count({
      where: Sequelize.where(
        Sequelize.col('quantityInStock'),
        Op.lte,
        Sequelize.col('reorderThreshold')
      )
    });

    const totalInventoryValue = await Product.findAll({
      attributes: [
        [Sequelize.fn('SUM', Sequelize.col('quantityInStock')), 'totalQty']
      ],
      raw: true
    });

    const stats = {
      totalProducts,
      totalSuppliers,
      totalTransactions,
      lowStockProducts,
      inventoryMetrics: {
        totalItems: totalInventoryValue[0].totalQty || 0
      }
    };

    res.json({
      success: true,
      message: 'Dashboard stats retrieved',
      data: stats
    });
  } catch (error) {
    logger.error('Dashboard stats error:', error);
    next(error);
  }
};