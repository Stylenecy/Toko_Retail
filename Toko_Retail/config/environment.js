// environment.js
require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  
  // Variabel DB (biarkan saja, akan diabaikan oleh SQLite)
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 3306,
  DB_NAME: process.env.DB_NAME || 'toko_retail',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  
  // --- TAMBAHKAN DUA BARIS INI ---
  DB_DIALECT: process.env.DB_DIALECT || 'mysql',
  DB_STORAGE: process.env.DB_STORAGE || 'development.sqlite',
  // ------------------------------

  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '24h',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
};