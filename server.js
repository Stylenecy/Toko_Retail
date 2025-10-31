const app = require('./app');
const db = require('./models');
const env = require('./config/environment');
const logger = require('./utils/logger');

const PORT = env.PORT || 3000;

const startServer = async () => {
  try {
    // Test database connection
    await db.sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${env.NODE_ENV}`);
      logger.info(`API Documentation: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  db.sequelize.close(() => {
    logger.info('Database connection closed');
    process.exit(0);
  });
});

startServer();