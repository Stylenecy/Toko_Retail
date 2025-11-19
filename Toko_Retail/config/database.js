// database.js
const env = require('./environment');

module.exports = {
  development: {
    username: env.DB_USER,       // Akan diabaikan SQLite
    password: env.DB_PASSWORD,   // Akan diabaikan SQLite
    database: env.DB_NAME,       // Akan diabaikan SQLite
    host: env.DB_HOST,           // Akan diabaikan SQLite
    port: env.DB_PORT,           // Akan diabaikan SQLite
    
    // --- UBAH BAGIAN INI ---
    dialect: env.DB_DIALECT, // Dibaca dari .env (akan jadi 'sqlite')
    storage: env.DB_STORAGE, // Dibaca dari .env (akan jadi './development.sqlite')
    // -----------------------

    logging: false,
    define: {
      underscored: false,
      timestamps: true,
      charset: 'utf8mb4'
    }
  },
  // (Anda bisa biarkan bagian 'test' dan 'production' 
  // atau ubah juga jika diperlukan)
  test: {
    // ...
  },
  production: {
    // ...
  }
};