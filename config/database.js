const env = require('./environment');

module.exports = {
  development: {
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    host: env.DB_HOST,
    port: env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    define: {
      underscored: false,
      timestamps: true,
      charset: 'utf8mb4'
    }
  },
  test: {
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: 'toko_retail_test',
    host: env.DB_HOST,
    dialect: 'mysql',
    logging: false
  },
  production: {
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    host: env.DB_HOST,
    dialect: 'mysql',
    logging: false
  }
};
