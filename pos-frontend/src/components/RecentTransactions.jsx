import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { FiEye } from 'react-icons/fi';

function RecentTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Panggil API transaksi dengan limit 5
    const fetchRecent = async () => {
      try {
        const response = await api.get('/transactions', {
          params: { limit: 5, page: 1 } 
        });
        setTransactions(response.data.data);
      } catch (error) {
        console.error("Gagal mengambil transaksi terbaru:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  if (loading) return <div className="bg-white p-6 rounded-lg shadow-md h-96 flex justify-center items-center">Memuat aktivitas...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Aktivitas Terbaru</h2>
      <div className="space-y-4">
        {transactions.length === 0 ? <p>Belum ada transaksi.</p> : null}
        
        {transactions.map(tx => (
          <div key={tx.id} className="flex justify-between items-center border-b pb-2">
            <div>
              <p className="font-semibold text-gray-700">{tx.invoiceNumber}</p>
              <p className="text-sm text-gray-500">{new Date(tx.createdAt).toLocaleString('id-ID')}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-600">
                + Rp {tx.totalAmount.toLocaleString('id-ID')}
              </p>
              <Link to={`/transactions/${tx.id}`} className="text-xs text-blue-500 hover:underline flex items-center justify-end">
                Lihat Detail <FiEye className="ml-1" />
              </Link>
            </div>
          </div>
        ))}
        <Link to="/transactions" className="text-blue-600 hover:underline font-medium">
          Lihat Semua Transaksi →
        </Link>
      </div>
    </div>
  );
}

export default RecentTransactions;