'use strict';

module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    invoiceNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    transactionType: {
      type: DataTypes.ENUM('sale', 'stock_in', 'stock_out', 'return'),
      allowNull: false
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  Transaction.associate = function(models) {
    Transaction.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    Transaction.hasMany(models.TransactionItem, {
      foreignKey: 'transactionId',
      as: 'items',
      onDelete: 'CASCADE'
    });
  };

  return Transaction;
};