'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Buat Tabel Categories
    await queryInterface.createTable('Categories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 2. Tambahkan kolom 'categoryId' ke tabel 'Products'
    await queryInterface.addColumn('Products', 'categoryId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Categories', // Nama tabel target
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    // Urutan rollback: Hapus kolom dulu, baru tabel
    await queryInterface.removeColumn('Products', 'categoryId');
    await queryInterface.dropTable('Categories');
  }
};