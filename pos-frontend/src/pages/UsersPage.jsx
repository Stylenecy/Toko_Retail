import React, { useState, useEffect } from 'react'; // 1. Impor useEffect
import api from '../services/api';
import Modal from '../components/Modal'; // Pastikan nama file Modal.jsx sudah benar
import { FiPlus, FiTrash2 } from 'react-icons/fi'; // (Opsional: Ikon Hapus)

function UsersPage() {
  // --- STATE BARU UNTUK MENAMPILKAN DATA ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  // ------------------------------------------

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'staff'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // --- FUNGSI BARU UNTUK MENGAMBIL DATA ---
  useEffect(() => {
    fetchUsers();
  }, []); // Jalankan sekali saat halaman dimuat

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/users'); // Panggil API baru
      setUsers(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil data user:", error);
      setError("Gagal memuat daftar user. Anda mungkin bukan admin.");
    } finally {
      setLoading(false);
    }
  };
  // ------------------------------------------

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setFormData({ username: '', password: '', role: 'staff' });
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (formData.password.length < 6) {
      setError("Password minimal harus 6 karakter.");
      return;
    }

    try {
      await api.post('/auth/register', formData);
      setSuccess(`User '${formData.username}' berhasil dibuat.`);
      fetchUsers(); // Muat ulang daftar user setelah berhasil
      closeModal();
    } catch (error) {
      console.error("Gagal mendaftarkan user:", error);
      setError("Gagal mendaftarkan user: " + (error.response?.data?.message || error.message));
    }
  };

  // --- (OPSIONAL: Fungsi Hapus) ---
  // const handleDelete = (userId) => {
  //   alert("Fungsi Hapus: Anda perlu membuat API DELETE /api/users/" + userId);
  // }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen User</h1>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 flex items-center"
        >
          <FiPlus className="mr-2" /> Tambah User Baru
        </button>
      </div>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          {success}
        </div>
      )}

      {/* --- BAGIAN TAMPILAN TABEL BARU --- */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {loading ? (
          <p className="p-6 text-center">Memuat daftar user...</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Bergabung</th>
                {/* <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th> */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(user.createdAt).toLocaleDateString('id-ID')}</td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">
                      <FiTrash2 size={18} />
                    </button>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* --- AKHIR BAGIAN TABEL --- */}


      {/* Modal untuk Form Tambah User (Kode ini tetap sama) */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={'Tambah User Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" required placeholder="Minimal 6 karakter" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && (
            <p className="text-sm text-center text-red-600">{error}</p>
          )}
          <div className="flex justify-end pt-4 border-t mt-6">
            <button type="button" onClick={closeModal} className="mr-3 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Batal</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default UsersPage;