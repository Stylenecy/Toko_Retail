// src/pages/SuppliersPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/modal';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';

function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [currentSupplier, setCurrentSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/suppliers');
      setSuppliers(response.data.data); 
    } catch (error) {
      console.error("Gagal mengambil supplier:", error);
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
    setFormData({ name: '', contact: '', address: '' });
    setCurrentSupplier(null);
    setIsModalOpen(true);
  };

  const openEditModal = (supplier) => {
    setModalType('edit');
    setCurrentSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact: supplier.contact,
      address: supplier.address
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'create') {
        await api.post('/suppliers', formData);
      } else {
        await api.put(`/suppliers/${currentSupplier.id}`, formData);
      }
      fetchSuppliers();
      closeModal();
    } catch (error) {
      console.error("Gagal menyimpan supplier:", error);
      alert("Gagal menyimpan: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (supplierId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus supplier ini?")) {
      try {
        await api.delete(`/suppliers/${supplierId}`);
        fetchSuppliers();
      } catch (error) {
        console.error("Gagal menghapus supplier:", error);
      }
    }
  };

  if (loading) return <div className="text-center p-10">Memuat data supplier...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen Supplier</h1>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 flex items-center"
        >
          <FiPlus className="mr-2" /> Tambah Supplier
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kontak</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alamat</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {suppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{supplier.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{supplier.contact}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{supplier.address}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                  <button onClick={() => openEditModal(supplier)} className="text-blue-600 hover:text-blue-900 mr-4">
                    <FiEdit size={18} />
                  </button>
                  <button onClick={() => handleDelete(supplier.id)} className="text-red-600 hover:text-red-900">
                    <FiTrash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={modalType === 'create' ? 'Tambah Supplier Baru' : 'Edit Supplier'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Supplier</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Kontak (No. HP/Email)</label>
            <input type="text" name="contact" value={formData.contact} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Alamat</label>
            <textarea name="address" value={formData.address} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" required></textarea>
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

export default SuppliersPage;