'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Products', [
      {
        sku: 'SKU-001',
        name: 'Minyak Goreng 2L',
        description: 'Minyak goreng berkualitas premium 2 liter',
        unitPrice: 28000.00,
        quantityInStock: 50,
        reorderThreshold: 20,
        supplierId: 1,
        createdBy: 1,
        updatedBy: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sku: 'SKU-002',
        name: 'Gula Pasir 1kg',
        description: 'Gula pasir putih 1 kilogram',
        unitPrice: 12000.00,
        quantityInStock: 75,
        reorderThreshold: 30,
        supplierId: 2,
        createdBy: 1,
        updatedBy: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sku: 'SKU-003',
        name: 'Beras Putih 5kg',
        description: 'Beras putih berkualitas 5 kilogram',
        unitPrice: 75000.00,
        quantityInStock: 40,
        reorderThreshold: 15,
        supplierId: 3,
        createdBy: 1,
        updatedBy: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sku: 'SKU-004',
        name: 'Garam Halus 1kg',
        description: 'Garam meja halus 1 kilogram',
        unitPrice: 8000.00,
        quantityInStock: 100,
        reorderThreshold: 40,
        supplierId: 1,
        createdBy: 1,
        updatedBy: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sku: 'SKU-005',
        name: 'Tepung Terigu 1kg',
        description: 'Tepung terigu premium 1 kilogram',
        unitPrice: 10000.00,
        quantityInStock: 60,
        reorderThreshold: 25,
        supplierId: 2,
        createdBy: 1,
        updatedBy: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sku: 'SKU-006',
        name: 'Telur Ayam 1 Kg',
        description: 'Telur ayam segar 1 kilogram (kurang lebih 15 butir)',
        unitPrice: 32000.00,
        quantityInStock: 30,
        reorderThreshold: 12,
        supplierId: 4,
        createdBy: 1,
        updatedBy: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sku: 'SKU-007',
        name: 'Mentega 200g',
        description: 'Mentega berkualitas 200 gram',
        unitPrice: 45000.00,
        quantityInStock: 20,
        reorderThreshold: 8,
        supplierId: 3,
        createdBy: 1,
        updatedBy: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sku: 'SKU-008',
        name: 'Susu Cair 1L',
        description: 'Susu cair segar 1 liter',
        unitPrice: 15000.00,
        quantityInStock: 45,
        reorderThreshold: 18,
        supplierId: 2,
        createdBy: 1,
        updatedBy: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sku: 'SKU-009',
        name: 'Kopi Bubuk 500g',
        description: 'Kopi bubuk premium pilihan 500 gram',
        unitPrice: 35000.00,
        quantityInStock: 25,
        reorderThreshold: 10,
        supplierId: 1,
        createdBy: 1,
        updatedBy: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sku: 'SKU-010',
        name: 'Teh Celup 50 Sachet',
        description: 'Teh celup pilihan 50 sachet',
        unitPrice: 18000.00,
        quantityInStock: 55,
        reorderThreshold: 20,
        supplierId: 4,
        createdBy: 1,
        updatedBy: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Products', null, {});
  }
};