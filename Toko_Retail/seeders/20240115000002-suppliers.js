'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Suppliers', [
      {
        name: 'PT Maju Jaya Supplier',
        contact: 'Budi Santoso',
        address: 'Jl. Industri No. 45, Jakarta',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'CV Sukses Makmur',
        contact: 'Siti Nurhaliza',
        address: 'Jl. Perdagangan No. 78, Bandung',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'PT Global Distributor',
        contact: 'Ahmad Hidayat',
        address: 'Jl. Logistik No. 12, Surabaya',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'UD Berkah Rezeki',
        contact: 'Nur Chamidah',
        address: 'Jl. Raya No. 99, Medan',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Suppliers', null, {});
  }
};