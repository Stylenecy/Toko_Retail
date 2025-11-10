import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiBox, FiUsers, FiCreditCard, FiAlertTriangle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

// --- 1. IMPOR KOMPONEN BARU ---
import SalesChart from '../components/charts/SalesChart';
import RecentTransactions from '../components/RecentTransactions';

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/reports/dashboard/stats');
        setStats(response.data.data);
      } catch (error) {
        console.error("Gagal mengambil statistik dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const StatCard = ({ icon, title, value, to }) => (
    <Link 
      to={to} 
      className="bg-white p-6 rounded-lg shadow-md flex items-center transition-transform hover:scale-105 hover:shadow-lg"
    >
      <div className="mr-4 text-blue-500">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </Link>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      {/* Kartu Statistik (Tidak Berubah) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<FiBox size={32} className="text-blue-500" />}
          title="Total Produk"
          value={stats?.totalProducts || 0}
          to="/products"
        />
        <StatCard 
          icon={<FiUsers size={32} className="text-green-500" />}
          title="Total Supplier"
          value={stats?.totalSuppliers || 0}
          to="/suppliers"
        />
        <StatCard 
          icon={<FiCreditCard size={32} className="text-yellow-500" />}
          title="Transaksi (Bulan Ini)"
          value={stats?.transactionsMonth || 0}
          to="/transactions?filter=month" // <-- Bonus: Langsung filter
        />
        <StatCard 
          icon={<FiAlertTriangle size={32} className="text-red-500" />}
          title="Stok Hampir Habis"
          value={stats?.lowStockProducts || 0}
          to="/products?status=lowstock"
        />
      </div>

      {/* --- 2. TAMBAHKAN GRID BARU UNTUK GRAFIK & AKTIVITAS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        {/* Grafik (memakan 2/3 tempat) */}
        <div className="lg:col-span-2">
          <SalesChart />
        </div>

        {/* Aktivitas Terbaru (memakan 1/3 tempat) */}
        <div className="lg:col-span-1">
          <RecentTransactions />
        </div>

      </div>
    </div>
  );
}

export default DashboardPage;