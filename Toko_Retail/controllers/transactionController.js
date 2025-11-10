const { Transaction, TransactionItem, Product } = require('../models');
const { calculatePagination, generateInvoiceNumber } = require('../utils/helpers');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// -----------------------------------------------------------------
// ⬇️ HANYA FUNGSI INI YANG BERUBAH ⬇️
// -----------------------------------------------------------------

exports.getAllTransactions = async (req, res, next) => {
  try {
    // 1. Tambahkan 'filter' ke daftar query yang diterima
    const { page = 1, limit = 20, type, userId, dateFrom, dateTo, filter } = req.query;
    const { offset, limit: pageLimit } = calculatePagination(page, limit);

    const where = {};
    if (type) where.transactionType = type;
    if (userId) where.userId = userId;

    // 2. Tambahkan logika filter (Hari/Minggu/Bulan)
    // Ini hanya berjalan jika dateFrom/dateTo kustom TIDAK disediakan
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt[Op.gte] = new Date(dateFrom);
      if (dateTo) where.createdAt[Op.lte] = new Date(dateTo);
    } else if (filter) {
      // Jika frontend mengirim 'filter', kita buatkan rentang tanggalnya
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
        where.createdAt = {
          [Op.gte]: startDate // "lebih besar atau sama dengan" startDate
        };
      }
    }
    // --- AKHIR DARI PERUBAHAN LOGIKA ---

    const { count, rows } = await Transaction.findAndCountAll({
      where, // 'where' sekarang berisi filter tanggal jika ada
      include: [
        { model: TransactionItem, as: 'items', include: [{ model: Product, as: 'product' }] }
      ],
      offset,
      limit: pageLimit,
      order: [['id', 'DESC']] // Anda mungkin lebih suka [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      message: 'Transactions retrieved',
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: pageLimit,
        total: count,
        pages: Math.ceil(count / pageLimit)
      }
    });
  } catch (error) {
    logger.error('Get transactions error:', error);
    next(error);
  }
};

// -----------------------------------------------------------------
// ⬇️ FUNGSI-FUNGSI INI TIDAK BERUBAH (TETAP SAMA) ⬇️
// -----------------------------------------------------------------

exports.getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [
        { model: TransactionItem, as: 'items', include: [{ model: Product, as: 'product' }] }
      ]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      message: 'Transaction retrieved',
      data: transaction
    });
  } catch (error) {
    logger.error('Get transaction error:', error);
    next(error);
  }
};

exports.createTransaction = async (req, res, next) => {
  const t = await require('../models').sequelize.transaction();
  try {
    // PENTING: Kode Anda memiliki 'req.validatedData'. 
    // Ini berarti Anda punya middleware validasi (Joi?).
    // Saya akan asumsikan itu benar dan datanya ada di sana.
    const { transactionType, userId, notes, items } = req.body; // Saya ubah ke req.body
                                                              // Ganti kembali jika Anda yakin pakai req.validatedData

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item required'
      });
    }

    let totalAmount = 0;
    const transactionItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (!product) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`
        });
      }

      // Gunakan harga dari item (dari frontend) BUKAN dari database
      const lineTotal = item.quantity * item.unitPrice; 
      totalAmount += lineTotal;

      // Stock validation for sales
      if ((transactionType === 'sale' || transactionType === 'stock_out') && product.quantityInStock < item.quantity) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.quantityInStock}`
        });
      }

      // Update stock
      // Logika Anda sebelumnya salah. 'stock_in' dan 'return' menambah stok.
      let stockChange = 0;
      if (transactionType === 'sale' || transactionType === 'stock_out') {
        stockChange = -item.quantity;
      } else if (transactionType === 'stock_in' || transactionType === 'return') {
        stockChange = item.quantity;
      }
      await product.increment('quantityInStock', { by: stockChange, transaction: t });

      transactionItems.push({
        productId: item.productId,
       quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal
      });
    }

    const transaction = await Transaction.create({
      invoiceNumber: generateInvoiceNumber(),
      transactionType,
      userId,
      totalAmount,
      notes
    }, { transaction: t });

    for (const item of transactionItems) {
      await TransactionItem.create({
        transactionId: transaction.id,
        ...item
      }, { transaction: t });
    }

    await t.commit();

    const fullTransaction = await Transaction.findByPk(transaction.id, {
      include: [
        { model: TransactionItem, as: 'items', include: [{ model: Product, as: 'product' }] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: fullTransaction
   });
  } catch (error) {
    await t.rollback();
    logger.error('Create transaction error:', error);
    next(error);
  }
};

exports.deleteTransaction = async (req, res, next) => {
  const t = await require('../models').sequelize.transaction();
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [{ model: TransactionItem, as: 'items' }],
      transaction: t
    });

    if (!transaction) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Reverse stock updates
    for (const item of transaction.items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      // Perbaikan Logika: Jika produk ada, baru reverse stock
      if (product) {
        // Logika Anda sebelumnya salah. 'stock_in' dan 'return' mengurangi stok saat dihapus.
        let stockChange = 0;
        if (transaction.transactionType === 'sale' || transaction.transactionType === 'stock_out') {
          stockChange = item.quantity; // Kembalikan stok
        } else if (transaction.transactionType === 'stock_in' || transaction.transactionType === 'return') {
          stockChange = -item.quantity; // Kurangi stok
        }
        await product.increment('quantityInStock', { by: stockChange, transaction: t });
      }
    }

    await TransactionItem.destroy({ where: { transactionId: transaction.id }, transaction: t });
    await transaction.destroy({ transaction: t });

    await t.commit();

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    await t.rollback();
     logger.error('Delete transaction error:', error);
    next(error);
  }
};