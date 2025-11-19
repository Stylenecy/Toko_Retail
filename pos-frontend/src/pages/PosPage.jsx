// src/pages/PosPage.jsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal'; // 1. IMPOR MODAL

function PosPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');

  // 2. STATE BARU UNTUK MODAL KUANTITAS
  const [isQtyModalOpen, setIsQtyModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [inputQuantity, setInputQuantity] = useState(1);
  // ---

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) { console.error("Gagal parse user data") }
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      // Perbaikan dari error sebelumnya: ambil dari data.data
      setProducts(response.data.data); 
    } catch (err) {
      setError('Gagal mengambil data produk.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 3. LOGIKA BARU: addToCart sekarang menerima kuantitas
  const addToCart = (product, quantityToAdd) => {
    if (quantityToAdd <= 0) return;

    // Cek 1: Kuantitas yang diminta melebihi stok total
    if (quantityToAdd > product.quantityInStock) {
      alert(`Stok tidak mencukupi! Sisa stok: ${product.quantityInStock}`);
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantityToAdd;
      
      // Cek 2: Kuantitas baru (keranjang + input) melebihi stok total
      if (newQuantity > product.quantityInStock) {
        alert(`Stok tidak mencukupi! Sisa stok: ${product.quantityInStock}. Di keranjang sudah ada: ${existingItem.quantity}`);
        return;
      }
      
      // Update kuantitas item yang ada
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: newQuantity } : item
      ));
    } else {
      // Tambah item baru ke keranjang
      setCart([...cart, { ...product, quantity: quantityToAdd }]);
    }
  };

  const removeFromCart = (productId) => {
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem.quantity === 1) {
      setCart(cart.filter(item => item.id !== productId));
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      ));
    }
  };

  const handleCheckout = async () => {
    // ... (Fungsi ini tidak perlu diubah)
    if (!user) {
      alert("Sesi Anda berakhir. Silakan login ulang.");
      return;
    }
    const transactionData = {
      transactionType: 'sale',
      userId: user.id, 
      notes: 'Transaksi POS',
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice)
      }))
    };

    try {
      await api.post('/transactions', transactionData);
      alert('Transaksi Berhasil!');
      setCart([]); 
      fetchProducts(); 
    } catch (err) {
      console.error(err.response);
      alert('Transaksi Gagal! ' + (err.response?.data?.message || "Stok tidak mencukupi"));
    }
  };
  
  // 4. FUNGSI BARU: Untuk membuka/menutup modal
  const openQtyModal = (product) => {
    // Cek stok dulu sebelum buka modal
    if (product.quantityInStock <= 0) {
      alert("Stok produk habis!");
      return;
    }
    setSelectedProduct(product);
    setInputQuantity(1); // Reset kuantitas ke 1
    setIsQtyModalOpen(true);
  };

  const closeQtyModal = () => {
    setIsQtyModalOpen(false);
    setSelectedProduct(null);
  };

  const handleConfirmAddToCart = () => {
    // Panggil fungsi addToCart dengan kuantitas dari input
    addToCart(selectedProduct, inputQuantity);
    closeQtyModal();
  };
  // ---

  
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );
  
  if (error) return <p className="p-8 text-red-600">{error}</p>;

  const cartTotal = cart.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      
      {/* Bagian Kiri: Daftar Produk */}
      <div className="w-3/5 overflow-y-auto p-6">
        <input 
          type="text"
          placeholder="Cari produk (nama atau SKU)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg"
        />
        {loading ? <p>Memuat produk...</p> : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
                // 5. UBAH ONCLICK: Sekarang memanggil openQtyModal
                onClick={() => openQtyModal(product)}
              >
                <h4 className="font-semibold text-gray-800">{product.name}</h4>
                <p className="text-sm text-gray-600">Rp {product.unitPrice}</p>
                <p className={`text-sm ${product.quantityInStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Stok: {product.quantityInStock}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bagian Kanan: Keranjang (Kode ini tidak berubah) */}
      <div className="w-2/5 p-6 bg-gray-50 border-l flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Keranjang</h2>
        <div className="flex-grow overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-gray-500">Keranjang masih kosong</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center mb-3 p-3 bg-white rounded shadow-sm">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    {item.quantity} x Rp {item.unitPrice}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold mr-4">
                    Rp {(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center"
                  >
                    -
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-bold text-gray-800">Total</span>
            <span className="text-2xl font-bold text-gray-900">
              Rp {cartTotal.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <button 
            onClick={handleCheckout} 
            disabled={cart.length === 0 || !user}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            BAYAR SEKARANG
          </button>
        </div>
      </div>
      
      {/* 6. TAMBAHKAN MODAL INPUT KUANTITAS */}
      <Modal 
        isOpen={isQtyModalOpen} 
        onClose={closeQtyModal} 
        title="Masukkan Kuantitas"
      >
        {selectedProduct && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{selectedProduct.name}</h3>
            <p className="text-sm text-gray-600">Stok tersisa: {selectedProduct.quantityInStock}</p>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Jumlah
              </label>
              <input 
                type="number" 
                id="quantity"
                value={inputQuantity}
                onChange={(e) => setInputQuantity(parseInt(e.target.value) || 1)}
                onFocus={(e) => e.target.select()} // Otomatis pilih teks saat di-klik
                min="1"
                max={selectedProduct.quantityInStock} // Set batas atas
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                autoFocus // Otomatis fokus ke input ini
              />
            </div>
            <div className="flex justify-end pt-4 border-t mt-6">
              <button 
                type="button" 
                onClick={closeQtyModal} 
                className="mr-3 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Batal
              </button>
              <button 
                type="button" 
                onClick={handleConfirmAddToCart} 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Tambah ke Keranjang
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}

export default PosPage;