import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { FiFilter, FiPackage, FiFileText, FiEye } from 'react-icons/fi';

function ReportsPage() {
  const [stockReport, setStockReport] = useState([]);
  const [salesReport, setSalesReport] = useState(null);
  const [transactionList, setTransactionList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const location = useLocation(); // Untuk menangkap URL saat ini buat tombol back

  // --- 1. Filter Logic & TAB LOGIC (Sekarang Tab disimpan di URL) ---
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Baca Tab Aktif dari URL. Default ke 'products' jika tidak ada di URL.
  const activeTab = searchParams.get('tab') || 'products';

  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');

  useEffect(() => {
    fetchAllReports();
  }, [searchParams]);

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(searchParams.entries());

      // 1. Ambil Laporan Analitik
      const salesRes = await api.get('/reports/sales', { params });
      setSalesReport(salesRes.data.data);

      // 2. Ambil Daftar Transaksi
      const transRes = await api.get('/transactions', { 
        params: { ...params, type: 'sale', limit: 100 }
      });
      setTransactionList(transRes.data.data);

      // 3. Ambil Laporan Stok
      const stockRes = await api.get('/reports/stock');
      setStockReport(stockRes.data.data.products);

    } catch (error) {
      console.error("Gagal mengambil laporan:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Handler Filter & Tab (DIPERBARUI untuk menjaga Tab) ---
  
  // Fungsi ganti tab: Update URL 'tab', tapi pertahankan filter tanggal yg ada
  const handleTabChange = (newTab) => {
    const currentParams = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...currentParams, tab: newTab });
  };

  const handleQuickFilterClick = (filter) => {
    // Pertahankan tab saat ini saat ganti filter
    setSearchParams({ filter, tab: activeTab });
    setDateFrom(''); setDateTo('');
  };

  const handleDateFilterApply = (e) => {
    e.preventDefault();
    if (dateFrom && dateTo) {
        // Pertahankan tab saat ini
        setSearchParams({ dateFrom, dateTo, tab: activeTab });
    }
  };

  const handleResetFilters = () => {
    setDateFrom(''); setDateTo('');
    // Pertahankan tab saat ini
    setSearchParams({ filter: 'all', tab: activeTab });
  };

  // --- Helper Styles ---
  const activeFilter = searchParams.get('filter');
  const customDateActive = searchParams.get('dateFrom');

  const getFilterButtonClass = (filter) => {
    return activeFilter === filter && !customDateActive
      ? 'bg-blue-600 text-white'
      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200';
  };

  const getTabButtonClass = (tabName) => {
    return activeTab === tabName
      ? 'bg-blue-600 text-white shadow-md'
      : 'bg-gray-100 text-gray-600 hover:bg-gray-200';
  };

  const getReportTitle = () => {
    if (customDateActive) return `Periode ${dateFrom} s/d ${dateTo}`;
    if (activeFilter === 'today') return 'Hari Ini';
    if (activeFilter === 'week') return '7 Hari Terakhir';
    if (activeFilter === 'month') return '30 Hari Terakhir';
    return 'Semua Waktu';
  };

  if (loading) return <div className="text-center p-10">Memuat laporan...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Laporan Penjualan</h1>
      </div>

      {/* --- BAGIAN FILTER --- */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <button onClick={() => handleQuickFilterClick('all')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${getFilterButtonClass('all')}`}>Semua</button>
            <button onClick={() => handleQuickFilterClick('today')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${getFilterButtonClass('today')}`}>Hari Ini</button>
            <button onClick={() => handleQuickFilterClick('week')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${getFilterButtonClass('week')}`}>7 Hari</button>
            <button onClick={() => handleQuickFilterClick('month')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${getFilterButtonClass('month')}`}>30 Hari</button>
          </div>

          <form onSubmit={handleDateFilterApply} className="flex gap-2 items-center">
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border rounded px-2 py-1 text-sm" />
            <span className="text-gray-400">-</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border rounded px-2 py-1 text-sm" />
            <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700" disabled={!dateFrom || !dateTo}>Filter</button>
            <button type="button" onClick={handleResetFilters} className="text-gray-500 hover:text-gray-700 text-sm px-2">Reset</button>
          </form>
        </div>
        <p className="text-sm text-gray-500 mt-2 font-medium">Menampilkan data: {getReportTitle()}</p>
      </div>

      {/* --- RINGKASAN --- */}
      {salesReport && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Total Pendapatan</p>
            <p className="text-3xl font-bold text-black-600 mt-1">
              Rp {(salesReport.totalRevenue || 0).toLocaleString('id-ID')}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Total Transaksi</p>
            <p className="text-3xl font-bold text-black-600 mt-1">
              {salesReport.totalTransactions || 0} <span className="text-base font-normal text-gray-400">transaksi</span>
            </p>
          </div>
        </div>
      )}

      {/* --- 3. TAB NAVIGASI (DIPERBARUI: Pakai handleTabChange) --- */}
      <div className="flex gap-4 border-b border-gray-200 pb-1">
        <button 
          onClick={() => handleTabChange('products')}
          className={`flex items-center gap-2 px-6 py-2 rounded-t-lg font-medium transition-all ${getTabButtonClass('products')}`}
        >
          <FiPackage /> Laporan Produk
        </button>
        <button 
          onClick={() => handleTabChange('transactions')}
          className={`flex items-center gap-2 px-6 py-2 rounded-t-lg font-medium transition-all ${getTabButtonClass('transactions')}`}
        >
          <FiFileText /> Laporan Penjualan
        </button>
      </div>

      {/* --- KONTEN TAB --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[300px]">
        
        {/* TAB 1: LAPORAN PRODUK */}
        {activeTab === 'products' && salesReport && (
          <div>
            <div className="p-4 bg-white-50 border-b border-gray-100">
              <h3 className="text-lg font-bold text-blue-800">Produk Terjual pada Periode Ini</h3>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Produk</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Terjual (Qty)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Pendapatan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divie-dgray-200">
                {salesReport.byProduct.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Tidak ada produk terjual di periode ini.</td></tr>
                ) : (
                  salesReport.byProduct.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.productName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.sku}</td>
                      <td className="px-6 py-4 text-sm text-right font-bold">{item.quantity}</td>
                      <td className="px-6 py-4 text-sm text-right text-black-600 font-medium">
                        Rp {item.revenue.toLocaleString('id-ID')}
                      </td>
                    </tr> 
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: LAPORAN TRANSAKSI */}
        {activeTab === 'transactions' && (
          <div>
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <h3 className="text-lg font-bold text-blue-800">Riwayat Transaksi Penjualan</h3>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kasir</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactionList.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Tidak ada transaksi penjualan di periode ini.</td></tr>
                ) : (
                  transactionList.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-blue-600">
                        <Link 
                          to={`/transactions/${tx.id}`}
                          state={{ from: location.pathname + location.search }}
                        >
                          {tx.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(tx.createdAt).toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{tx.user?.username || 'Admin'}</td> 
                      <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">
                        Rp {parseInt(tx.totalAmount).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link 
                          to={`/transactions/${tx.id}`} 
                          state={{ from: location.pathname + location.search }}
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <FiEye size={18} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- LAPORAN STOK (Dipisah di bawah) --- */}
      {activeTab === 'products' && salesReport && (
      <div className="bg-white shadow-md rounded-lg overflow-hidden mt-8 border border-gray-200">
        <div className="p-4 bg-grey-50 border-b border-red-100">
          <h2 className="text-lg font-bold text-blue-800">Status Stok Produk</h2>
        </div>
        <div className="max-h-64 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Produk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok Sisa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batas Reorder</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stockReport.map((item) => (
                <tr key={item.id} className={item.lowStock ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-800">{item.quantityInStock}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.reorderThreshold}</td>
                  <td className="px-6 py-4 text-sm">
                    {item.lowStock ? (
                      <span className="px-2 py-1 text-xs font-bold text-red-700 bg-red-200 rounded-full">Stok Menipis</span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-bold text-green-700 bg-green-200 rounded-full">Aman</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>)}
    </div>
  );
}

export default ReportsPage;