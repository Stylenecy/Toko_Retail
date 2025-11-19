const { Category, Product } = require('../models'); 
const logger = require('../utils/logger');
const {sequelize, Sequelize } = require('../models');

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM Products AS product
              WHERE
                  product.categoryId = Category.id
            )`),
            'productCount' 
          ]
        ]
      }
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    logger.error('Error fetching categories with count:', error);
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.json({ success: true, message: 'Category created', data: category });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    await Category.update(req.body, { where: { id: req.params.id } });
    res.json({ success: true, message: 'Category updated' });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    await Category.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};