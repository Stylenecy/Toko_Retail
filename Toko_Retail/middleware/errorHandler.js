const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error:', err);

  // Validation errors
  if (err.details) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.details.map(d => d.message)
    });
  }

  // Sequelize errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry'
    });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors.map(e => e.message)
    });
  }

  // Generic errors
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
};

module.exports = errorHandler;