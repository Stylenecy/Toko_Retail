import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiEye, FiFilter } from 'react-icons/fi'; // Hapus FiTrash2
import { Link, useSearchParams } from 'react-router-dom'; 

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // useSearchParams akan menjadi sumber kebenaran (source of truth)
  const [searchParams, setSearchParams] = useSearchParams();

  // State 'lokal' untuk input tanggal (sebelum Terapkan)
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');

  // useEffect sekarang hanya bergantung pada 'searchParams'
  useEffect(() => {
    fetchTransactions();
  }, [searchParams]);

  // fetchTransactions sekarang membaca langsung dari 'searchParams'
  const fetchTransactions = async () => {
    try {
      setLoading(true);

      // Ambil semua parameter dari URL (filter, dateFrom, dateTo, dll)
      const params = Object.fromEntries(searchParams.entries());

      // Kirim 'params' ke API
      const response = await api.get('/transactions', { params });
      
      setTransactions(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil transaksi:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI DELETE DIHAPUS ---
  
  // Fungsi untuk filter cepat (HANYA ALL DAN ADJUSTMENT)
  const handleQuickFilterClick = (filter) => {
    // Hanya izinkan 'all' atau 'adjustment'
    if (filter === 'all' || filter === 'adjustment') {
       setSearchParams({ filter });
    }
  };

  // Fungsi untuk filter tanggal kustom
  const handleDateFilterApply = (e) => {
    e.preventDefault();
    if (dateFrom && dateTo) {
      // Set 'dateFrom' dan 'dateTo', yang otomatis menghapus 'filter' cepat
      setSearchParams({ dateFrom, dateTo });
    }
  };

  // Fungsi untuk mereset SEMUA filter
  const handleResetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSearchParams({ filter: 'all' }); 
  };

  // Helper untuk styling tombol
  const activeFilter = searchParams.get('filter');
  const customDateActive = searchParams.get('dateFrom');

  const getButtonClass = (filter) => {
    return activeFilter === filter && !customDateActive
      ? 'bg-blue-600 text-white'
      : 'bg-white text-gray-700 hover:bg-gray-100';
  };

  if (loading) return <div className="text-center p-10">Memuat riwayat transaksi...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Riwayat Transaksi</h1>
        
        {/* Tombol Filter Cepat */}
        <div className="flex space-x-2 p-1 bg-gray-200 rounded-lg">
          <button
            onClick={() => handleQuickFilterClick('all')}
            className={`px-4 py-2 rounded-md font-medium ${getButtonClass('all')}`}
          >
            Semua
          </button>
          {/* HANYA TINGGALKAN TOMBOL PENYESUAIAN STOK */}
          <button
            onClick={() => handleQuickFilterClick('adjustment')}
            className={`px-4 py-2 rounded-md font-medium ${getButtonClass('adjustment')}`}
          >
            Penyesuaian Stok
          </button>
        </div>
      </div>

      {/* FORM FILTER TANGGAL KUSTOM */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <form onSubmit={handleDateFilterApply} className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700">Dari Tanggal</label>
            <input 
              type="date" id="dateFrom" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700">Sampai Tanggal</label>
            <input 
              type="date" id="dateTo" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
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
            Reset Filter
          </button>
        </form>
        {/* Tampilkan info jika filter kustom aktif */}
        {customDateActive && (
          <p className="text-sm text-blue-600 mt-2">
            Menampilkan hasil dari {dateFrom} sampai {dateTo}.
          </p>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              {/* KOLOM CATATAN */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catatan</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {!loading && transactions.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  Tidak ada transaksi untuk rentang waktu ini.
                </td>
              </tr>
            )}

            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800">
                  <Link to={`/transactions/${tx.id}`}>{tx.invoiceNumber}</Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{tx.transactionType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Rp {tx.totalAmount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(tx.createdAt).toLocaleString('id-ID')}</td>
                
                {/* TAMPILKAN CATATAN */}
                <td className="px-6 py-4 text-sm text-gray-700 max-w-xs overflow-hidden text-ellipsis" title={tx.notes}>
                    {tx.notes || '-'}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                  <Link to={`/transactions/${tx.id}`} className="text-gray-600 hover:text-blue-900">
                    <FiEye size={18} /> Lihat
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionsPage;