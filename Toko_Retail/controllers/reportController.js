const { Product, Transaction, TransactionItem, Supplier } = require('../models');
const logger = require('../utils/logger');
const { Op, Sequelize } = require('sequelize');

exports.getStockReport = async (req, res, next) => {
  // ... (FUNGSI INI TIDAK BERUBAH)
  try {
    const products = await Product.findAll({
      include: [{ model: Supplier, as: 'supplier' }],
      order: [['quantityInStock', 'ASC']]
    });
    const report = products.map(p => ({
      id: p.id, sku: p.sku, name: p.name,
      quantityInStock: p.quantityInStock, reorderThreshold: p.reorderThreshold,
      unitPrice: p.unitPrice, totalValue: p.quantityInStock * p.unitPrice,
      supplier: p.supplier.name, lowStock: p.quantityInStock <= p.reorderThreshold
    }));
    const summary = {
      totalProducts: report.length,
      lowStockCount: report.filter(p => p.lowStock).length,
      totalInventoryValue: report.reduce((sum, p) => sum + p.totalValue, 0),
      products: report
    };
    res.json({
      success: true, message: 'Stock report generated', data: summary
    });
  } catch (error) {
    logger.error('Stock report error:', error);
    next(error);
  }
};

exports.getSalesReport = async (req, res, next) => {
  try {
    // 1. Tambahkan 'filter'
    const { dateFrom, dateTo, productId, type, filter } = req.query;

    const where = {};
    if (type && type !== 'all') where.transactionType = type;

    // 2. Logika filter gabungan (TETAP SAMA)
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        where.createdAt[Op.gte] = from;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        where.createdAt[Op.lte] = to;
      }
    } else if (filter) {
      const now = new Date();
      let startDate;
      if (filter === 'today') {
        startDate = new Date(now.setHours(0, 0, 0, 0));
      } else if (filter === 'week') {
        startDate = new Date(now.setDate(now.getDate() - 7));
        startDate.setHours(0, 0, 0, 0);
      } else if (filter === 'month') {
        startDate = new Date(now.setDate(now.getDate() - 30));
        startDate.setHours(0, 0, 0, 0);
      }
      if (startDate) {
        where.createdAt = { [Op.gte]: startDate };
      }
    }

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

    const byProduct = {};
    transactions.forEach(t => {
      t.items.forEach(item => {
        if (item.product) { 
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
          // Hanya hitung revenue produk jika tipe transaksi adalah SALE
          if (t.transactionType === 'sale') {
            byProduct[key].quantity += item.quantity;
            byProduct[key].revenue += parseFloat(item.lineTotal);
          }
        }
      });
    });

    // --- PERBAIKAN LOGIKA TOTAL REVENUE DI SINI ---
    const totalRevenue = transactions.reduce((sum, t) => {
        // Hanya jumlahkan jika tipe adalah 'sale'
        if (t.transactionType === 'sale') {
            return sum + parseFloat(t.totalAmount);
        }
        // Opsional: Kurangi jika 'return' (retur penjualan)
        // if (t.transactionType === 'return') {
        //    return sum - parseFloat(t.totalAmount);
        // }
        
        // ABAIKAN 'stock_in' dan 'stock_out' dalam perhitungan UANG Masuk
        return sum;
    }, 0);
    // -----------------------------------------------

    const report = {
      period: { 
        filter: filter || 'all', 
        from: dateFrom || 'N/A', 
        to: dateTo || 'N/A' 
      },
      totalTransactions: transactions.length,
      byType,
      byProduct: Object.values(byProduct),
      totalRevenue: totalRevenue // Gunakan hasil perhitungan yang sudah diperbaiki
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

//GetDashboard
exports.getDashboardStats = async (req, res, next) => {
  // ... (Fungsi ini tidak berubah, kode Anda sudah benar)
  try {
    const totalProducts = await Product.count();
    const totalSuppliers = await Supplier.count();
    const totalTransactions = await Transaction.count();
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date();
    const transactionsMonth = await Transaction.count({
      where: {
        createdAt: {
          [Op.gte]: startOfMonth,
          [Op.lte]: endOfMonth
        }
      }
    });
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
      transactionsMonth: transactionsMonth,
      lowStockProducts,
      inventoryMetrics: {
        totalItems: (totalInventoryValue[0] && totalInventoryValue[0].totalQty) || 0
      }
    };
    res.json({
      success: true, message: 'Dashboard stats retrieved', data: stats
    });
  } catch (error) {
    logger.error('Dashboard stats error:', error);
    next(error);
  }
};


//Grafik
exports.getSalesSummary = async (req, res, next) => {
  try {
    // Ambil data 7 hari terakhir
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const salesData = await Transaction.findAll({
      where: {
        transactionType: 'sale',
        createdAt: {
          [Op.gte]: sevenDaysAgo
        }
      },
      attributes: [
        // Kelompokkan berdasarkan tanggal
        [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
        // Hitung total penjualan per tanggal
        [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'totalSales']
      ],
      group: [Sequelize.fn('DATE', Sequelize.col('createdAt'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('createdAt')), 'ASC']],
      raw: true // Ambil data mentah
    });

    // Format data agar siap digunakan oleh Chart.js
    const labels = salesData.map(d => new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }));
    const data = salesData.map(d => d.totalSales);

    res.json({
      success: true,
      message: 'Sales summary retrieved',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total Penjualan',
          data: data,
          fill: true,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          tension: 0.1
        }]
      }
    });
  } catch (error) {
    logger.error('Sales summary error:', error);
    next(error);
  }
};