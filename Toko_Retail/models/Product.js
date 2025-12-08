'use strict';

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sku: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    quantityInStock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    reorderThreshold: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    supplierId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Suppliers',
        key: 'id'
      }
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true, 
      references: {
        model: 'Categories',
        key: 'id'
      }
    },
    // -------------------------------------------
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    timestamps: true
  });

  Product.associate = function(models) {
    Product.belongsTo(models.Supplier, {
      foreignKey: 'supplierId',
      as: 'supplier'
    });
    Product.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
    Product.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updater'
    });
    Product.hasMany(models.TransactionItem, {
      foreignKey: 'productId',
      as: 'transactionItems'
    });

    Product.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category' 
    });

  };

  return Product;
};