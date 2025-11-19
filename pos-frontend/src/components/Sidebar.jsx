import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FiGrid, FiBox, FiUsers, FiCreditCard, FiPackage,
  FiBarChart2, FiLogOut, FiShoppingCart, FiList
} from 'react-icons/fi';

// Fungsi untuk mendapatkan data user dari localStorage
const getUser = () => {
  const userString = localStorage.getItem('user');
  if (userString) {
    try {
      return JSON.parse(userString);
    } catch (e) {
      console.error("Gagal parse user data", e);
      return null;
    }
  }
  return null;
};

function Sidebar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); 
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center p-3 my-1 rounded-lg transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  const isAdmin = user?.role === 'admin'; 
  const isStaff = user?.role === 'staff'; 

  return (
    // Div utama: Menjamin Sidebar penuh dan tidak akan mengecil
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen flex-shrink-0">
      
      <div className="p-5 text-2xl font-bold text-white border-b border-gray-700">
        Toko Retail
      </div>
      
      {/* Area Menu: Mengambil ruang sisa dan mengizinkan scroll */}
      <nav className="flex-grow p-3 overflow-y-auto"> 
        
        {/* Dashboard: HANYA TAMPIL JIKA BUKAN STAFF */}
        {!isStaff && (
          <NavLink to="/" end className={navLinkClass}>
            <FiGrid className="mr-3" /> Dashboard
          </NavLink>
        )}

        {/* POS (Kasir): SELALU DITAMPILKAN */}
        <NavLink to="/pos" className={navLinkClass}>
          <FiShoppingCart className="mr-3" /> POS (Kasir)
        </NavLink>
        
        <p className="text-xs text-gray-500 uppercase mt-4 mb-1 px-3">Manajemen</p>
        
        {/* Transaksi: SELALU DITAMPILKAN */}
        <NavLink to="/transactions" className={navLinkClass}>
          <FiCreditCard className="mr-3" /> Transaksi
        </NavLink>
        
        {/* PRODUK, SUPPLIER, LAPORAN: HANYA UNTUK ADMIN */}
        {!isStaff && (
          <>
            <NavLink to="/products" className={navLinkClass}>
              <FiBox className="mr-3" /> Produk
            </NavLink>
            <NavLink to="/categories" className={navLinkClass}>
              <FiList className="mr-3" /> Kategori
            </NavLink>
            <NavLink to="/suppliers" className={navLinkClass}>
              <FiPackage className="mr-3" /> Supplier
            </NavLink>
            <NavLink to="/reports" className={navLinkClass}>
              <FiBarChart2 className="mr-3" /> Laporan
            </NavLink>
          </>
        )}
        
        {/* ADMINISTRASI: HANYA UNTUK ADMIN */}
        {isAdmin && (
          <>
            <p className="text-xs text-gray-500 uppercase mt-4 mb-1 px-3">Administrasi</p>
            <NavLink to="/users" className={navLinkClass}>
              <FiUsers className="mr-3" /> Manajemen User
            </NavLink>
          </>
        )}
      </nav>
      
      {/* Bagian Bawah/Footer: Tetap di bawah dan tidak ikut di-scroll */}
      <div className="p-3 border-t border-gray-700"> 
        
        <div className="text-gray-400 text-sm px-3 mb-2">
          <span className="block mb-1">Login sebagai:</span> 
          <span className="font-bold text-lg text-white capitalize">{user?.username}</span>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center p-3 w-full rounded-lg text-white bg-red-700 hover:bg-red-800 transition-colors"
        >
          <FiLogOut className="mr-3" /> Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;