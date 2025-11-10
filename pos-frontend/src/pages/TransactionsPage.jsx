import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiTrash2, FiEye, FiFilter } from 'react-icons/fi';
// 1. Impor `Link` dan `useSearchParams`
import { Link, useSearchParams } from 'react-router-dom'; 

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. 'useSearchParams' akan menjadi sumber kebenaran (source of truth)
  const [searchParams, setSearchParams] = useSearchParams();

  // 3. State 'lokal' untuk input tanggal (sebelum Terapkan)
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');

  // 4. 'useEffect' sekarang hanya bergantung pada 'searchParams'
  useEffect(() => {
    fetchTransactions();
  }, [searchParams]); // Jalankan ulang setiap kali URL query berubah

  // 5. 'fetchTransactions' sekarang membaca langsung dari 'searchParams'
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

  const handleDelete = async (id) => {
    if (window.confirm("Yakin hapus transaksi ini? Stok akan dikembalikan.")) {
      try {
        await api.delete(`/transactions/${id}`);
        fetchTransactions(); // Muat ulang data (filter saat ini otomatis berlaku)
      } catch (error) {
        console.error("Gagal menghapus transaksi:", error);
      }
    }
  };
  
  // 6. Fungsi untuk filter cepat (Hari, Minggu, Bulan)
  const handleQuickFilterClick = (filter) => {
    setSearchParams({ filter }); // Ini akan menghapus 'dateFrom'/'dateTo'
  };

  // 7. Fungsi untuk filter tanggal kustom
  const handleDateFilterApply = (e) => {
    e.preventDefault();
    if (dateFrom && dateTo) {
      // Set 'dateFrom' dan 'dateTo', yang otomatis menghapus 'filter'
      setSearchParams({ dateFrom, dateTo });
    }
  };

  // 8. Fungsi untuk mereset SEMUA filter
  const handleResetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSearchParams({ filter: 'all' }); // Kembali ke "Semua"
  };

  // 9. Helper untuk styling tombol
  // Tombol filter cepat hanya aktif jika 'filter' ada dan 'dateFrom' tidak ada
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
          <button
            onClick={() => handleQuickFilterClick('today')}
            className={`px-4 py-2 rounded-md font-medium ${getButtonClass('today')}`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => handleQuickFilterClick('week')}
            className={`px-4 py-2 rounded-md font-medium ${getButtonClass('week')}`}
          >
            7 Hari
          </button>
          <button
            onClick={() => handleQuickFilterClick('month')}
            className={`px-4 py-2 rounded-md font-medium ${getButtonClass('month')}`}
          >
            30 Hari
          </button>
        </div>
      </div>

      {/* 10. FORM FILTER TANGGAL KUSTOM */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <form onSubmit={handleDateFilterApply} className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700">Dari Tanggal</label>
            <input 
              type="date" 
              id="dateFrom"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700">Sampai Tanggal</label>
            <input 
              type="date" 
              id="dateTo"
              value={dateTo}
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
      {/* AKHIR FORM FILTER */}


      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          {/* ... (isi thead tabel Anda SAMA PERSIS seperti sebelumnya) ... */}
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {!loading && transactions.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  Tidak ada transaksi untuk rentang waktu ini.
                </td>
              </tr>
            )}

            {/* ... (isi tbody tabel Anda SAMA PERSIS seperti sebelumnya) ... */}
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800">
                  <Link to={`/transactions/${tx.id}`}>{tx.invoiceNumber}</Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{tx.transactionType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Rp {tx.totalAmount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(tx.createdAt).toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                  <Link to={`/transactions/${tx.id}`} className="text-gray-600 hover:text-blue-900 mr-4">
                    <FiEye size={18} />
                  </Link>
                  <button onClick={() => handleDelete(tx.id)} className="text-red-600 hover:text-red-900">
                    <FiTrash2 size={18} />
                  </button>
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