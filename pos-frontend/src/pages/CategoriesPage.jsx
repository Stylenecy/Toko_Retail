import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil kategori:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setModalType('create');
    setFormData({ name: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setModalType('edit');
    setCurrentCategory(category);
    setFormData({ name: category.name, description: category.description });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'create') {
        await api.post('/categories', formData);
      } else {
        await api.put(`/categories/${currentCategory.id}`, formData);
      }
      fetchCategories();
      setIsModalOpen(false);
    } catch (error) {
      alert("Gagal menyimpan: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin hapus kategori ini?")) {
      try {
        await api.delete(`/categories/${id}`);
        fetchCategories();
      } catch (error) {
        console.error("Gagal hapus:", error);
      }
    }
  };

 if (loading) return <div className="p-10 text-center">Memuat kategori...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen Kategori</h1>
        <button onClick={openCreateModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
          <FiPlus className="mr-2" /> Tambah Kategori
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Kategori</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Produk</th> 
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td className="px-6 py-4 font-medium text-gray-900">{cat.name}</td>
                <td className="px-6 py-4 text-gray-700">{cat.description}</td>
<td className="px-6 py-4 font-bold text-lg">
        {cat.productCount > 0 ? (
          <Link 
            to={`/products?categoryId=${cat.id}`} 
            className="text-blue-600 hover:underline cursor-pointer"
            title={`Lihat ${cat.productCount} produk`}
          >
            {cat.productCount}
          </Link>
        ) : (
          <span className="text-gray-500">{cat.productCount || 0}</span>
        )}
      </td>
      {/* -------------------------------------------------- */}
      
      <td className="px-6 py-4 text-right flex justify-end space-x-2">
        <button onClick={() => openEditModal(cat)} className="text-blue-600 hover:text-blue-900"><FiEdit size={18} /></button>
        <button onClick={() => handleDelete(cat.id)} 
                disabled={cat.productCount > 0} 
                title={cat.productCount > 0 ? "Hapus semua produk di kategori ini terlebih dahulu" : "Hapus Kategori"}
                className={`hover:text-red-900 ${cat.productCount > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-red-600'}`}>
          <FiTrash2 size={18} />
        </button>
      </td>
    </tr>
  ))}
</tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalType === 'create' ? 'Tambah Kategori' : 'Edit Kategori'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Kategori</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
          </div>
          <div className="flex justify-end pt-4 border-t mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="mr-3 px-4 py-2 bg-gray-200 rounded-md">Batal</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CategoriesPage;