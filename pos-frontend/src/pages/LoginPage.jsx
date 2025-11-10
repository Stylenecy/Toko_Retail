// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import api from '../services/api';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });
            // 1. Ambil seluruh objek 'data' dari respons
      const responseData = response.data.data; // Ini adalah { id, username, role, token }

      // 2. Ekstrak token
      const token = responseData.token;

      // 3. Buat objek 'user' dari sisa data
      const user = {
        id: responseData.id,
        username: responseData.username,
        role: responseData.role
      };

      // 4. Cek apakah token dan user ada
      if (!token || !user.id) {
        throw new Error("Token atau data user tidak ditemukan di respons API");
      }

      // 5. Simpan ke localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Baris di bawah ini akan me-refresh dan mengarahkan Anda ke dashboard
      window.location.href = '/';
    
    } catch (err) {
      setLoading(false);
      setError('Username atau password salah.');
      console.error('Login gagal', err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Toko Retail POS
        </h2>
        <form className="space-y-6" onSubmit={handleLogin}>
          {/* Input Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username" type="text" required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Gunakan: admin"
            />
          </div>
          {/* Input Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password" type="password" required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Gunakan: admin123"
            />
          </div>
          {/* Error Message */}
          {error && (
            <p className="text-sm text-center text-red-600">{error}</p>
          )}
          {/* Tombol Submit */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {loading ? 'Memuat...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;