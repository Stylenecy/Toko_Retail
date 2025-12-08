import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, // Impor Filler untuk area di bawah garis
} from 'chart.js';
import api from '../../services/api';

// Daftarkan semua komponen Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler // Daftarkan Filler
);

function SalesChart() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesSummary = async () => {
      try {
        const response = await api.get('/reports/sales-summary');
        setChartData(response.data.data);
      } catch (error) {
        console.error("Gagal mengambil data grafik:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSalesSummary();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Sembunyikan legenda
      },
      title: {
        display: true,
        text: 'Tren Penjualan (7 Hari Terakhir)',
        font: { size: 18 }
      },
    },
    scales: {
      y: {
        ticks: {
          // Format Rupiah di sumbu Y
          callback: function(value) {
            return 'Rp ' + value.toLocaleString('id-ID');
          }
        }
      }
    }
  };

  if (loading) return <div className="bg-white p-6 rounded-lg shadow-md h-96 flex justify-center items-center">Memuat data grafik...</div>;
  if (!chartData) return <div className="bg-white p-6 rounded-lg shadow-md h-96">Gagal memuat data.</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Line options={options} data={chartData} />
    </div>
  );
}

export default SalesChart;