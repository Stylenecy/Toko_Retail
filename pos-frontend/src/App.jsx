// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout'; // <-- Perbaikan huruf besar 'Layout'
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';  
import ProductsPage from './pages/ProductsPage';
import SuppliersPage from './pages/SuppliersPage';
import PosPage from './pages/PosPage';
import TransactionsPage from './pages/TransactionsPage';
import TransactionDetailPage from './pages/TransactionDetailPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage'; 
import CategoriesPage from './pages/CategoriesPage'; // <-- Tambahkan Category

// Fungsi untuk mendapatkan data user dari localStorage
const getUser = () => {
  const userString = localStorage.getItem('user');
  if (userString) {
    try {
      return JSON.parse(userString);
    } catch (e) {
      return null;
    }
  }
  return null;
};


// Cek Otorisasi (Sama seperti sebelumnya)
const PrivateRoute = ({ children }) => {
  return localStorage.getItem('token') ? children : <Navigate to="/login" />;
};

// Cek jika sudah login, jangan biarkan ke halaman login lagi
const PublicRoute = ({ children }) => {
  return localStorage.getItem('token') ? <Navigate to="/" /> : children;
};

function App() {
  const user = getUser();
  const isStaff = user?.role === 'staff';

  return (
    <Routes>
      <Route
        path="/login"
        element={<PublicRoute><LoginPage /></PublicRoute>}
      />

      <Route
        path="/"
        element={<PrivateRoute><Layout /></PrivateRoute>}
      >
        {/* PERBAIKAN RBAC: Jika staff, redirect ke POS */}
        <Route 
            index 
            element={isStaff ? <Navigate to="/pos" replace /> : <DashboardPage />} 
        />
        {/* END PERBAIKAN RBAC */}
        
        <Route path="products" element={<ProductsPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="categories" element={<CategoriesPage />} /> {/* <-- TAMBAHAN KATEGORI */}
        <Route path="pos" element={<PosPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="transactions/:id" element={<TransactionDetailPage />} /> 
        <Route path="reports" element={<ReportsPage />} />
        <Route path="users" element={<UsersPage />} /> 
      </Route>

      <Route 
        path="*" 
        element={<Navigate to={localStorage.getItem('token') ? "/" : "/login"} />} 
      />
    </Routes>
  );
}

export default App;