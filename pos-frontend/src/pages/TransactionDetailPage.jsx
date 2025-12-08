import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom'; // 1. Tambah useLocation
import api from '../services/api';
import { FiArrowLeft, FiArrowUp, FiArrowDown } from 'react-icons/fi'; 

function TransactionDetailPage() {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams(); 
  
  // 2. Logika Navigasi Kembali
  const location = useLocation();
  // Jika ada state 'from' (dari Laporan), gunakan itu. Jika tidak, default ke '/transactions'
  const backPath = location.state?.from || '/transactions'; 

  useEffect(() => {
    const fetchTransactionDetail = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/transactions/${id}`);
        setTransaction(response.data.data); 
      } catch (error) {
        console.error("Gagal mengambil detail transaksi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactionDetail();
  }, [id]);

  // Helper untuk menentukan warna dan ikon perubahan stok
  const getStockChangeIndicator = (type) => {
      if (type === 'sale' || type === 'stock_out') {
          return <FiArrowDown className="text-red-600 mr-2" />;
      }
      if (type === 'stock_in' || type === 'return') {
          return <FiArrowUp className="text-green-600 mr-2" />;
      }
      return null;
  };
  
  // Helper untuk mendapatkan nama user yang melakukan transaksi
  const getCreator = () => {
      return transaction.user?.username || transaction.creator?.username || 'N/A';
  }

  if (loading) return <div className="text-center p-10">Memuat detail transaksi...</div>;
  if (!transaction) return <div className="text-center p-10 text-red-600">Transaksi tidak ditemukan.</div>;

  return (
    <div>
      {/* 3. Link Kembali Dinamis */}
      <Link 
        to={backPath} 
        className="flex items-center text-blue-600 hover:underline mb-6"
      >
        <FiArrowLeft className="mr-2" /> 
        {location.state?.from ? 'Kembali' : 'Kembali ke Riwayat Transaksi'}
      </Link>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Detail Transaksi
        </h1>
        <div className="grid grid-cols-3 gap-4 text-gray-700">
          <div>
            <p className="text-sm font-medium text-gray-500">Invoice</p>
            <p className="font-semibold">{transaction.invoiceNumber}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Tanggal</p>
            <p className="font-semibold">{new Date(transaction.createdAt).toLocaleString('id-ID')}</p>
          </div>
          <div className="flex items-center">
            {getStockChangeIndicator(transaction.transactionType)}
            <p className="font-semibold capitalize">{transaction.transactionType}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Kasir</p>  
            <p className="font-semibold">{getCreator()}</p> 
          </div>
          <div className="col-span-2">
            <p className="text-sm font-medium text-gray-500">Catatan</p>
            <p className="font-semibold text-gray-900">{transaction.notes || '-'}</p> 
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <h2 className="text-2xl font-semibold p-6">Item Transaksi</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga Satuan</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Baris</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Menggunakan transaction.items sesuai perbaikan sebelumnya */}
            {transaction.items && transaction.items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {item.product?.name || item.Product?.name || 'Produk Dihapus'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 flex items-center">
                  {getStockChangeIndicator(transaction.transactionType)}
                  {item.quantity}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">Rp {item.unitPrice}</td>
                <td className="px-6 py-4 text-sm text-gray-700 text-right font-medium">Rp {item.lineTotal}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan="3" className="px-6 py-4 text-right text-sm font-bold text-gray-900 uppercase">
                Total Keseluruhan
              </td>
              <td className="px-6 py-4 text-right text-lg font-bold text-gray-900">
                Rp {transaction.totalAmount}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default TransactionDetailPage;