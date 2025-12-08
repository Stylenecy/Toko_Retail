const { User } = require('../models');
const { generateToken } = require('../utils/helpers');
const { registerSchema, loginSchema } = require('../utils/validationSchemas');
const logger = require('../utils/logger');

exports.register = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(d => d.message)
      });
    }

    const existingUser = await User.findOne({ where: { username: value.username } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    const user = await User.create({
      username: value.username,
      password: value.password,
      role: value.role || 'staff'
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        token
      }
    });
  } catch (error) {
    logger.error('Register error:', error);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(d => d.message)
      });
    }

    const user = await User.findOne({ where: { username: value.username } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const isPasswordValid = await user.validatePassword(value.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        token
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

// --- TAMBAHKAN FUNGSI BARU INI ---

exports.getAllUsers = async (req, res, next) => {
  try {
    // Ambil semua user, tapi HANYA kolom yang aman (tanpa password)
    const users = await User.findAll({
      attributes: ['id', 'username', 'role', 'createdAt'],
      order: [['id', 'DESC']]
    });

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: users
    });
  } catch (error) {
    logger.error('Get all users error:', error);
    next(error);
  }
};