// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout'; 
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';  
import ProductsPage from './pages/ProductsPage';
import SuppliersPage from './pages/SuppliersPage';
import PosPage from './pages/PosPage';
import TransactionsPage from './pages/TransactionsPage';
import TransactionDetailPage from './pages/TransactionDetailPage'; // <-- BARU
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage'; // <-- BARU

// Cek Otorisasi (Sama seperti sebelumnya)
const PrivateRoute = ({ children }) => {
  return localStorage.getItem('token') ? children : <Navigate to="/login" />;
};

// Cek jika sudah login, jangan biarkan ke halaman login lagi
const PublicRoute = ({ children }) => {
  return localStorage.getItem('token') ? <Navigate to="/" /> : children;
};

function App() {
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
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="pos" element={<PosPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="transactions/:id" element={<TransactionDetailPage />} /> {/* <-- BARU */}
        <Route path="reports" element={<ReportsPage />} />
        <Route path="users" element={<UsersPage />} /> {/* <-- BARU */}
      </Route>

      <Route 
        path="*" 
        element={<Navigate to={localStorage.getItem('token') ? "/" : "/login"} />} 
      />
    </Routes>
  );
}

export default App;