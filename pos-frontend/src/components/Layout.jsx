// src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar';

function Layout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {/* Outlet adalah tempat Halaman Anda (Dashboard, Produk, dll) akan ditampilkan */}
        <Outlet /> 
      </main>
    </div>
  );
}

export default Layout;