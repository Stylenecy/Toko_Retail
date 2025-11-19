'use strict';

// Helper untuk mendapatkan tanggal beberapa hari yang lalu
const getPastDate = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(10 + days, 0, 0, 0); // Menetapkan jam dan hari yang berbeda
  return d;
};

module.exports = {
  async up(queryInterface, Sequelize) {
    // Asumsi: userId=1 (Admin) sudah ada di tabel Users.

    return queryInterface.bulkInsert('Transactions', [
      {
        invoiceNumber: 'TX-2025-001',
        transactionType: 'sale',
        totalAmount: 150000.00,
        userId: 1, 
        notes: 'Transaksi Pos',
        createdAt: getPastDate(1), // Kemarin
        updatedAt: getPastDate(1),
      },
      {
        invoiceNumber: 'TX-2025-002',
        transactionType: 'stock_in',
        totalAmount: 450000.00,
        userId: 1,
        notes: 'Stock in',
        createdAt: getPastDate(3), // 3 hari lalu
        updatedAt: getPastDate(3),
      },
      {
        invoiceNumber: 'TX-2025-003',
        transactionType: 'stock_out',
        totalAmount: 0.00,
        userId: 1,
        notes: 'Stok Opname: 5 unit barang rusak (Loss)',
        createdAt: getPastDate(5), // 5 hari lalu
        updatedAt: getPastDate(5),
      },
      {
        invoiceNumber: 'TX-2025-004',
        transactionType: 'sale',
        totalAmount: 75000.00,
        userId: 1,
        notes: 'Transaksi Pos',
        createdAt: getPastDate(1), // Kemarin (waktu berbeda)
        updatedAt: getPastDate(1),
      },
      {
        invoiceNumber: 'TX-2025-005',
        transactionType: 'return',
        totalAmount: 20000.00,
        userId: 1,
        notes: 'Pengembalian Barang',
        createdAt: getPastDate(2), // 2 hari lalu
        updatedAt: getPastDate(2),
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    // Hapus semua data yang dimasukkan di fungsi up
    return queryInterface.bulkDelete('Transactions', { invoiceNumber: { [Sequelize.Op.in]: ['TX-2025-001', 'TX-2025-002', 'TX-2025-003', 'TX-2025-004', 'TX-2025-005'] } }, {});
  }
};