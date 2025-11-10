import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { FiPlus, FiEdit, FiTrash2, FiXCircle } from 'react-icons/fi';
import { useSearchParams, Link } from 'react-router-dom'; 

function ProductsPage() {
  const [products, setProducts] = useState([]); // Ini menyimpan SEMUA produk
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({
    sku: '', name: '', description: '', unitPrice: 0,
    quantityInStock: 0, reorderThreshold: 0, supplierId: ''
  });

  // --- 1. TAMBAHKAN STATE UNTUK MENYIMPAN QUERY PENCARIAN ---
  const [searchQuery, setSearchQuery] = useState('');

  // Baca parameter filter 'status=lowstock' dari URL (dari dashboard)
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data.data); 
    } catch (error) {
      console.error("Gagal mengambil produk:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data.data); 
    } catch (error) {
      console.error("Gagal mengambil supplier:", error);
    }
  };

  // ... (Semua fungsi modal dan form Anda tetap sama)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const openCreateModal = () => {
    setModalType('create');
    setFormData({
      sku: '', name: '', description: '', unitPrice: 0,
      quantityInStock: 0, reorderThreshold: 0, supplierId: suppliers[0]?.id || ''
    });
    setCurrentProduct(null);
    setIsModalOpen(true);
  };
  const openEditModal = (product) => {
    setModalType('edit');
    setCurrentProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      unitPrice: product.unitPrice,
      quantityInStock: product.quantityInStock,
      reorderThreshold: product.reorderThreshold || 0,
      supplierId: product.supplierId
    });
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      unitPrice: parseFloat(formData.unitPrice),
      quantityInStock: parseInt(formData.quantityInStock, 10),
      reorderThreshold: parseInt(formData.reorderThreshold, 10),
      supplierId: parseInt(formData.supplierId, 10)
    };
    try {
      if (modalType === 'create') {
        await api.post('/products', dataToSubmit);
      } else {
        await api.put(`/products/${currentProduct.id}`, dataToSubmit);
      }
      fetchProducts();
      closeModal();
    } catch (error) {
      console.error("Gagal menyimpan produk:", error);
      alert("Gagal menyimpan: " + (error.response?.data?.message || error.message));
    }
  };
  const handleDelete = async (productId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      try {
        await api.delete(`/products/${productId}`);
        fetchProducts();
      } catch (error) {
        console.error("Gagal menghapus produk:", error);
      }
    }
  };
  // ... (Akhir dari fungsi form)


  // --- 2. GABUNGKAN LOGIKA FILTER (STATUS + PENCARIAN) ---
  const filteredProducts = products
    .filter(product => {
      // Filter 1: Status (dari URL)
      if (statusFilter === 'lowstock') {
        return product.quantityInStock <= product.reorderThreshold;
      }
      return true; // Jika tidak ada filter status, tampilkan semua
    })
    .filter(product => {
      // Filter 2: Pencarian (dari State)
      const query = searchQuery.toLowerCase();
      if (!query) return true; // Jika tidak ada query, tampilkan semua
      
      return (
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query)
      );
    });


  if (loading) return <div className="text-center p-10">Memuat data produk...</div>;

  return (
    <div>
      {/* Header Halaman */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {statusFilter === 'lowstock' ? 'Produk Stok Hampir Habis' : 'Manajemen Produk'}
        </h1>
        
        {statusFilter !== 'lowstock' && (
          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 flex items-center"
          >
            <FiPlus className="mr-2" /> Tambah Produk
          </button>
        )}
      </div>

      {/* Tombol Hapus Filter (jika filter 'lowstock' aktif) */}
      {statusFilter === 'lowstock' && (
        <div className="mb-4">
          <Link 
            to="/products" 
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center w-fit"
          >
            <FiXCircle className="mr-2" /> Hapus Filter (Tampilkan Semua)
          </Link>
        </div>
      )}

      {/* --- 3. TAMBAHKAN INPUT SEARCH BAR DI SINI --- */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari berdasarkan Nama atau SKU..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tabel Data Produk */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batas Reorder</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Gunakan 'filteredProducts.map' */}
            {filteredProducts.map((product) => (
              <tr key={product.id} className={product.quantityInStock <= product.reorderThreshold ? 'bg-red-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.sku}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Rp {product.unitPrice}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">{product.quantityInStock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.reorderThreshold}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                  <button onClick={() => openEditModal(product)} className="text-blue-600 hover:text-blue-900 mr-4">
                    <FiEdit size={18} />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">
                    <FiTrash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {/* Tampilkan pesan jika tidak ada hasil pencarian */}
            {!loading && filteredProducts.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  {searchQuery ? 'Produk tidak ditemukan.' : 'Tidak ada produk.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal (Tidak perlu diubah) */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={modalType === 'create' ? 'Tambah Produk Baru' : 'Edit Produk'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">SKU</label>
            <input type="text" name="sku" value={formData.sku} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Produk</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Harga Satuan</label>
              <input type="number" name="unitPrice" value={formData.unitPrice} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" required step="0.01" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Jumlah Stok</label>
              <input type="number" name="quantityInStock" value={formData.quantityInStock} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Batas Reorder</label>
            <input type="number" name="reorderThreshold" value={formData.reorderThreshold} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Supplier</label>
            <select
              name="supplierId"
              value={formData.supplierId}
              onChange={handleInputChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">-- Pilih Supplier --</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end pt-4 border-t mt-6">
            <button type="button" onClick={closeModal} className="mr-3 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Batal</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ProductsPage;