'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedStaffPassword = await bcrypt.hash('staff123', 10);

    await queryInterface.bulkInsert('Users', [
      {
        username: 'admin',
        password: hashedAdminPassword,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'staff1',
        password: hashedStaffPassword,
        role: 'staff',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'staff2',
        password: hashedStaffPassword,
        role: 'staff',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};