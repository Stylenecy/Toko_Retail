import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useSearchParams } from 'react-router-dom';
import { FiFilter } from 'react-icons/fi';

function ReportsPage() {
  const [stockReport, setStockReport] = useState([]);
  const [salesReport, setSalesReport] = useState(null);
  const [loadingSales, setLoadingSales] = useState(true);
  const [loadingStock, setLoadingStock] = useState(true);

  // --- State untuk filter (sama seperti halaman Transaksi) ---
  const [searchParams, setSearchParams] = useSearchParams();
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');

  // 'useEffect' untuk Laporan Penjualan (bergantung pada filter)
  useEffect(() => {
    const fetchSalesReport = async () => {
      try {
        setLoadingSales(true);
        const params = Object.fromEntries(searchParams.entries());
        
        // Panggil /reports/sales DENGAN parameter filter
        const salesRes = await api.get('/reports/sales', { params });
        setSalesReport(salesRes.data.data);
      } catch (error) {
        console.error("Gagal mengambil laporan penjualan:", error);
      } finally {
        setLoadingSales(false);
      }
    };
    
    fetchSalesReport();
  }, [searchParams]); // Jalankan ulang saat URL query berubah

  // 'useEffect' untuk Laporan Stok (tidak bergantung pada filter)
  useEffect(() => {
    const fetchStockReport = async () => {
      try {
        setLoadingStock(true);
        const stockRes = await api.get('/reports/stock');
        setStockReport(stockRes.data.data.products);
      } catch (error) {
        console.error("Gagal mengambil laporan stok:", error);
      } finally {
        setLoadingStock(false);
      }
    };
    
    fetchStockReport();
  }, []); // Hanya jalankan sekali

  
  // --- Fungsi-fungsi Handler Filter ---
  const handleQuickFilterClick = (filter) => {
    setSearchParams({ filter }); 
    setDateFrom(''); // Hapus tanggal kustom saat filter cepat diklik
    setDateTo('');
  };

  const handleDateFilterApply = (e) => {
    e.preventDefault();
    if (dateFrom && dateTo) {
      setSearchParams({ dateFrom, dateTo });
    }
  };

  const handleResetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSearchParams({ filter: 'all' }); // 'all' akan diabaikan oleh backend (default)
  };

  // --- Helper untuk styling dan judul ---
  const activeFilter = searchParams.get('filter');
  const customDateActive = searchParams.get('dateFrom');

  const getButtonClass = (filter) => {
    return activeFilter === filter && !customDateActive
      ? 'bg-blue-600 text-white'
      : 'bg-white text-gray-700 hover:bg-gray-100';
  };
  
  const getReportTitle = () => {
    if (customDateActive) {
      return `Periode ${dateFrom} s/d ${dateTo}`;
    }
    if (activeFilter === 'today') return 'Hari Ini';
    if (activeFilter === 'week') return '7 Hari Terakhir';
    if (activeFilter === 'month') return '30 Hari Terakhir';
    return 'Semua Waktu';
  };
  // ---

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Laporan</h1>

      {/* --- UI FILTER BARU --- */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Filter Laporan Penjualan</h2>
          {/* Tombol Filter Cepat */}
          <div className="flex space-x-2 p-1 bg-gray-200 rounded-lg">
            <button
              onClick={() => handleQuickFilterClick('all')}
              className={`px-3 py-1 rounded-md font-medium text-sm ${getButtonClass('all')}`}
            >
              Semua
            </button>
            <button
              onClick={() => handleQuickFilterClick('today')}
              className={`px-3 py-1 rounded-md font-medium text-sm ${getButtonClass('today')}`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => handleQuickFilterClick('week')}
              className={`px-3 py-1 rounded-md font-medium text-sm ${getButtonClass('week')}`}
            >
              7 Hari
            </button>
            <button
              onClick={() => handleQuickFilterClick('month')}
              className={`px-3 py-1 rounded-md font-medium text-sm ${getButtonClass('month')}`}
            >
              30 Hari
            </button>
          </div>
        </div>
        
        {/* Form Filter Tanggal Kustom */}
        <form onSubmit={handleDateFilterApply} className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700">Dari Tanggal</label>
            <input 
              type="date" id="dateFrom" value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700">Sampai Tanggal</label>
            <input 
              type="date" id="dateTo" value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            disabled={!dateFrom || !dateTo}
          >
            <FiFilter className="mr-2" /> Terapkan
          </button>
          <button 
            type="button" 
            onClick={handleResetFilters}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Reset
          </button>
        </form>
      </div>
      {/* --- AKHIR UI FILTER --- */}


      {/* Laporan Penjualan */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        {/* Judul dinamis */}
        <h2 className="text-2xl font-semibold mb-4">Laporan Penjualan ({getReportTitle()})</h2>
        {loadingSales ? <p>Memuat laporan penjualan...</p> : (
          salesReport ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 p-4 rounded">
                <p className="text-sm text-gray-600">Total Penjualan</p>
                <p className="text-2xl font-bold">
                  Rp {(salesReport.totalRevenue || 0).toLocaleString('id-ID')}
                </p>
              </div>
              <div className="bg-gray-100 p-4 rounded">
                <p className="text-sm text-gray-600">Total Transaksi</p>
                <p className="text-2xl font-bold">
                  {salesReport.totalTransactions || 0}
                </p>
              </div>
            </div>
          ) : <p>Gagal memuat laporan penjualan.</p>
        )}
      </div>

      {/* Laporan Stok (Tidak berubah) */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <h2 className="text-2xl font-semibold p-6">Laporan Stok (Semua Produk)</h2>
        {loadingStock ? <p className="p-6 text-center">Memuat laporan stok...</p> : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Produk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok Sisa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batas Reorder</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stockReport.map((item) => (
                <tr key={item.id} className={item.lowStock ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.sku}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-bold">{item.quantityInStock}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{item.reorderThreshold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ReportsPage;