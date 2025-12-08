const jwt = require('jsonwebtoken');
const env = require('../config/environment');

// Generate JWT token
exports.generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRY }
  );
};

// Verify JWT token
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Format response
exports.formatResponse = (success, message, data = null) => {
  return {
    success,
    message,
    data
  };
};

// Generate invoice number
exports.generateInvoiceNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `INV-${timestamp.slice(-8)}-${random}`;
};

// Calculate pagination
exports.calculatePagination = (page = 1, limit = 20) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const offset = (pageNum - 1) * limitNum;
  return { offset, limit: limitNum, page: pageNum };
};
