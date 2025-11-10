'use strict';

module.exports = (sequelize, DataTypes) => {
  const TransactionItem = sequelize.define('TransactionItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    transactionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Transactions',
        key: 'id'
      }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    lineTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    }
  }, {
    timestamps: true
  });

  TransactionItem.associate = function(models) {
    TransactionItem.belongsTo(models.Transaction, {
      foreignKey: 'transactionId'
    });
    TransactionItem.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product'
    });
  };

  return TransactionItem;
};