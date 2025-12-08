import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { FiPlus, FiEdit, FiTrash2, FiXCircle, FiClipboard } from 'react-icons/fi';
import { useSearchParams, Link } from 'react-router-dom'; 

function ProductsPage() {
  const [products, setProducts] = useState([]); 
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [currentProduct, setCurrentProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    sku: '', name: '', description: '', unitPrice: 0,
    quantityInStock: 0, reorderThreshold: 0, supplierId: '', categoryId: ''
  });

  const [isOpnameModalOpen, setIsOpnameModalOpen] = useState(false);
  const [opnameData, setOpnameData] = useState({ actualStock: 0, notes: '' });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');

// --- PERUBAHAN KRUSIAL 1: useEffect kini bergantung pada URL ---
useEffect(() => {
    fetchProducts();
    fetchSuppliers();
    fetchCategories();
}, [searchParams]); // <-- Jalankan ulang fetchProducts saat URL berubah

// --- PERUBAHAN KRUSIAL 2: Konversi categoryId di fetchProducts ---
const fetchProducts = async () => {
    try {
        setLoading(true);

        // 1. Ambil ID Kategori dari URL
        const categoryIdFilter = searchParams.get('categoryId'); 
        const params = {};
        
        // 2. Konversi dan kirim params (jika ID valid)
        if (categoryIdFilter) {
            const idAsInt = parseInt(categoryIdFilter, 10);
            if (!isNaN(idAsInt)) { // Hanya kirim jika berhasil dikonversi
                params.categoryId = idAsInt; // <-- KIRIM SEBAGAI INTEGER
            }
        }
        // -----------------------------------------------------------
        
        const response = await api.get('/products', { params }); // <-- Kirim params ke API
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
    } catch (error) { console.error("Gagal ambil supplier:", error); }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data); 
    } catch (error) { console.error("Gagal ambil kategori:", error); }
  };

  const openOpnameModal = (product) => { 
    setCurrentProduct(product); 
    setOpnameData({ actualStock: product.quantityInStock, notes: '' }); 
    setIsOpnameModalOpen(true); 
  };
  
  const closeOpnameModal = () => { 
    setIsOpnameModalOpen(false); 
    setCurrentProduct(null); 
  };
  
  const handleOpnameSubmit = async (e) => { 
    e.preventDefault(); 
    try { 
      await api.post(`/products/${currentProduct.id}/stock-opname`, opnameData); 
      alert('Stok berhasil diperbarui!'); 
      fetchProducts(); 
      closeOpnameModal(); 
    } catch(e){ 
      alert("Gagal update stok: " + (e.response?.data?.message || e.message)); 
    } 
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setModalType('create');
    setFormData({
      sku: '', name: '', description: '', unitPrice: 0,
      quantityInStock: 0, reorderThreshold: 0, 
      supplierId: suppliers[0]?.id || '', 
      categoryId: categories[0]?.id || ''
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
      supplierId: product.supplierId,
      categoryId: product.categoryId || ''
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
      supplierId: parseInt(formData.supplierId, 10),
      categoryId: parseInt(formData.categoryId, 10)
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
      alert("Gagal menyimpan: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (productId) => {
     if (window.confirm("Hapus produk?")) {
        try {
          await api.delete(`/products/${productId}`);
          fetchProducts();
        } catch (error) {
          console.error("Gagal hapus:", error);
        }
     }
  };

  const filteredProducts = products
    .filter(p => statusFilter === 'lowstock' ? p.quantityInStock <= p.reorderThreshold : true)
    .filter(p => {
      const q = searchQuery.toLowerCase();
      return !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    });

  if (loading) return <div className="text-center p-10">Memuat data...</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {statusFilter === 'lowstock' ? 'Produk Stok Hampir Habis' : 'Manajemen Produk'}
        </h1>
        {statusFilter !== 'lowstock' && (
          <button onClick={openCreateModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow hover:bg-blue-700">
            <FiPlus className="mr-2"/> Tambah Produk
          </button>
        )}
      </div>
      
      {/* Filter Status */}
      {(statusFilter === 'lowstock' || searchParams.get('categoryId')) && ( // <-- Perubahan di sini
        <div className="mb-4">
          <Link to="/products" className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center w-fit">
            <FiXCircle className="mr-2" /> Hapus Filter
          </Link>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-4">
        <input 
          type="text" 
          value={searchQuery} 
          onChange={e=>setSearchQuery(e.target.value)} 
          placeholder="Cari berdasarkan Nama atau SKU..." 
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tabel Produk */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batas Reorder</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product.id} className={product.quantityInStock <= product.reorderThreshold ? 'bg-red-50' : ''}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.sku}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{product.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                    {product.category ? product.category.name : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">Rp {parseFloat(product.unitPrice).toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-700">{product.quantityInStock}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{product.reorderThreshold}</td>
                <td className="px-6 py-4 text-right flex justify-end space-x-2">
                   <button onClick={() => openOpnameModal(product)} className="text-green-600 hover:text-green-800" title="Stok Opname"><FiClipboard size={18}/></button>
                   <button onClick={() => openEditModal(product)} className="text-blue-600 hover:text-blue-800" title="Edit"><FiEdit size={18}/></button>
                   <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800" title="Hapus"><FiTrash2 size={18}/></button>
                </td>
              </tr>
            ))}
             {!loading && filteredProducts.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  {searchQuery ? 'Produk tidak ditemukan.' : 'Tidak ada produk.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form (Tambah/Edit) */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={modalType === 'create' ? 'Tambah Produk' : 'Edit Produk'}>
        <form onSubmit={handleSubmit} className="space-y-1">
          <div>
            <label className="block text-sm font-medium text-gray-700">SKU</label>
            <input type="text" name="sku" value={formData.sku} onChange={handleInputChange}  className={`mt-1 w-full p-2 border rounded ${modalType === 'edit' ? 'bg-gray-200 cursor-not-allowed text-gray-600' : ''}`}required disabled={modalType === 'edit'} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Produk</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded"></textarea>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700">Harga</label>
                <input type="number" name="unitPrice" value={formData.unitPrice} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded" required />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Stok Awal</label>
                <input type="number" name="quantityInStock" value={formData.quantityInStock} onChange={handleInputChange}  className={`mt-1 w-full p-2 border rounded ${modalType === 'edit' ? 'bg-gray-200 cursor-not-allowed text-gray-600' : ''}`}required disabled={modalType === 'edit'} />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700">Batas Reorder</label>
                <input type="number" name="reorderThreshold" value={formData.reorderThreshold} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded" required />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Kategori</label>
                <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded" required>
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Supplier</label>
            <select name="supplierId" value={formData.supplierId} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded" required>
              <option value="">-- Pilih Supplier --</option>
              {suppliers.map(sup => (<option key={sup.id} value={sup.id}>{sup.name}</option>))}
            </select>
          </div>

          <div className="flex justify-end pt-4 border-t mt-6">
            <button type="button" onClick={closeModal} className="mr-3 px-4 py-2 bg-gray-200 rounded-md">Batal</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Simpan</button>
          </div>
        </form>
      </Modal>

      {/* Modal Stok Opname */}
      <Modal isOpen={isOpnameModalOpen} onClose={closeOpnameModal} title="Stok Opname">
         <form onSubmit={handleOpnameSubmit} className="space-y-4">
            <p>Sesuaikan stok untuk: <b>{currentProduct?.name}</b></p>
            <div>
                <label className="block text-sm font-medium text-gray-700">Stok Fisik (Aktual)</label>
                <input type="number" value={opnameData.actualStock} onChange={e=>setOpnameData({...opnameData, actualStock: e.target.value})} className="mt-1 w-full p-2 border rounded" required placeholder="Masukkan jumlah fisik" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Catatan</label>
                <textarea value={opnameData.notes} onChange={e=>setOpnameData({...opnameData, notes: e.target.value})} className="mt-1 w-full p-2 border rounded" placeholder="Alasan penyesuaian..." required></textarea>  
            </div>
            <div className="flex justify-end pt-4 border-t mt-6">
                <button type="button" onClick={closeOpnameModal} className="mr-3 px-4 py-2 bg-gray-200 rounded-md">Batal</button>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Update Stok</button>
            </div>
         </form>
      </Modal>
    </div>
  );
}

export default ProductsPage;