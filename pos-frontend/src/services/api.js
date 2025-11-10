import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api' // Pastikan port ini benar
});

// -----------------------------------------------------------------
// INTERCEPTOR REQUEST (Kode Anda yang sudah ada)
// Ini berjalan SEBELUM setiap request dikirim
// -----------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// -----------------------------------------------------------------
// INTERCEPTOR RESPONSE (Kode BARU)
// Ini berjalan SETELAH setiap response diterima
// -----------------------------------------------------------------
api.interceptors.response.use(
  (response) => {
    // Jika response sukses (status 2xx), langsung teruskan
    return response;
  },
  (error) => {
    // Ini adalah bagian penting untuk menangani error
    
    // Cek jika error memiliki 'response' (artinya error dari API, bukan error jaringan)
    // dan statusnya adalah 401 (Unauthorized) atau 403 (Forbidden)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      
      console.error("Token tidak valid atau kadaluwarsa. Logout otomatis...");

      // 1. Hapus token yang tidak valid dari localStorage
      localStorage.removeItem('token');
      
      // 2. Arahkan paksa pengguna ke halaman login
      // Kita gunakan window.location.href agar halaman di-refresh penuh
      window.location.href = '/login'; 
    }
    
    // Teruskan error agar bisa ditangani oleh .catch() di komponen (jika perlu)
    return Promise.reject(error);
  }
);


export default api;