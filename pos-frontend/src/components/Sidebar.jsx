import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom'; // 1. Import useLocation
import { 
  FiGrid, FiBox, FiUsers, FiCreditCard, FiPackage,
  FiBarChart2, FiLogOut, FiShoppingCart, FiList, FiTruck
} from 'react-icons/fi';

const getUser = () => {
  const userString = localStorage.getItem('user');
  if (userString) {
    try {
      return JSON.parse(userString);
    } catch (e) {
      return null;
    }
  }
  return null;
};

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation(); // 2. Gunakan location untuk cek state
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); 
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin'; 
  const isStaff = user?.role === 'staff'; 

  // 3. Logika Deteksi: Apakah kita sedang melihat detail transaksi DARI laporan?
  const isViewingTransactionFromReport = 
    location.pathname.startsWith('/transactions/') && 
    location.state?.from?.includes('/reports');

  // 4. Fungsi Class Generator yang Lebih Pintar
  const getNavLinkClass = (path) => {
    return ({ isActive }) => {
      let active = isActive;

      // OVERRIDE: Jika sedang lihat detail dari laporan...
      if (isViewingTransactionFromReport) {
        if (path === '/transactions') active = false; // Matikan menu Transaksi
        if (path === '/reports') active = true;       // Nyalakan menu Laporan
      }

      return `flex items-center p-3 my-1 rounded-lg transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`;
    };
  };

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen flex-shrink-0">
      
      <div className="p-5 text-2xl font-bold text-white border-b border-gray-700">
        Toko Retail
      </div>
      
      <nav className="flex-grow p-3 overflow-y-auto"> 
        
        {!isStaff && (
          // 5. Ubah cara pemanggilan className di setiap NavLink
          <NavLink to="/" end className={getNavLinkClass('/')}>
            <FiGrid className="mr-3" /> Dashboard
          </NavLink>
        )}

        <NavLink to="/pos" className={getNavLinkClass('/pos')}>
          <FiShoppingCart className="mr-3" /> POS (Kasir)
        </NavLink>
        
        <p className="text-xs text-gray-500 uppercase mt-4 mb-1 px-3">Manajemen</p>
        
        <NavLink to="/transactions" className={getNavLinkClass('/transactions')}>
          <FiCreditCard className="mr-3" /> Transaksi
        </NavLink>
        
        {!isStaff && (
          <>
            <NavLink to="/products" className={getNavLinkClass('/products')}>
              <FiBox className="mr-3" /> Produk
            </NavLink>
            <NavLink to="/categories" className={getNavLinkClass('/categories')}>
              <FiList className="mr-3" /> Kategori
            </NavLink>
            <NavLink to="/suppliers" className={getNavLinkClass('/suppliers')}>
              <FiPackage className="mr-3" /> Supplier
            </NavLink>
            <NavLink to="/restock" className={getNavLinkClass('/restock')}>
              <FiTruck className="mr-3" /> Restock Barang
            </NavLink>
            <NavLink to="/reports" className={getNavLinkClass('/reports')}>
              <FiBarChart2 className="mr-3" /> Laporan
            </NavLink>
          </>
        )}
        
        {isAdmin && (
          <>
            <p className="text-xs text-gray-500 uppercase mt-4 mb-1 px-3">Administrasi</p>
            <NavLink to="/users" className={getNavLinkClass('/users')}>
              <FiUsers className="mr-3" /> Manajemen User
            </NavLink>
          </>
        )}
      </nav>
      
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