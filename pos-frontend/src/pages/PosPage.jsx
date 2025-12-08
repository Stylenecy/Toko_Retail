import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
// 1. IMPOR PRINT LIBRARY & COMPONENT
import { useReactToPrint } from 'react-to-print';
import { Receipt } from '../components/Receipt'; 
import { FiCheckCircle, FiPrinter, FiRefreshCw } from 'react-icons/fi';

function PosPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');

  // State untuk Modal Kuantitas (Input Jumlah)
  const [isQtyModalOpen, setIsQtyModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [inputQuantity, setInputQuantity] = useState(1);

  // 2. STATE UNTUK MODAL SUKSES & NOTA
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const componentRef = useRef(); // Referensi ke komponen nota

  // 3. FUNGSI PRINT
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

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
      setProducts(response.data.data); 
    } catch (err) {
      setError('Gagal mengambil data produk.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product, quantityToAdd) => {
    if (quantityToAdd <= 0) return;
    if (quantityToAdd > product.quantityInStock) {
      alert(`Stok tidak mencukupi! Sisa stok: ${product.quantityInStock}`);
      return;
    }
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantityToAdd;
      if (newQuantity > product.quantityInStock) {
        alert(`Stok tidak mencukupi!`);
        return;
      }
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: newQuantity } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: quantityToAdd }]);
    }
  };

  const removeFromCart = (productId) => {
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem.quantity > 1) {
        setCart(cart.map(item => 
            item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        ));
    } else {
        setCart(cart.filter(item => item.id !== productId));
    }
  };

  const handleCheckout = async () => {
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
      // Kirim transaksi ke backend
      const response = await api.post('/transactions', transactionData);
      
      // 4. SUKSES: SIMPAN DATA TRANSAKSI & BUKA MODAL
      // Kita perlu menggabungkan data response dengan detail produk untuk nota
      // karena response create mungkin tidak menyertakan nama produk lengkap di nested items seketika
      // Jadi kita manual inject nama produk dari cart ke response untuk tampilan nota
      const transactionResult = response.data.data;
      
      // Perkaya data item dengan nama produk dari cart (untuk ditampilkan di nota)
      transactionResult.items = transactionResult.items.map(apiItem => {
          const cartItem = cart.find(c => c.id === apiItem.productId);
          return {
              ...apiItem,
              product: { name: cartItem ? cartItem.name : 'Item' }
          };
      });
      // Tambahkan info user juga
      transactionResult.User = { username: user.username };

      setLastTransaction(transactionResult);
      setIsSuccessModalOpen(true);
      
      setCart([]); // Kosongkan keranjang
      fetchProducts(); // Update stok di tampilan
    } catch (err) {
      console.error(err);
      alert('Transaksi Gagal! ' + (err.response?.data?.message || "Terjadi kesalahan"));
    }
  };

  const handleNewTransaction = () => {
      setIsSuccessModalOpen(false);
      setLastTransaction(null);
  };
  
  const openQtyModal = (product) => {
    if (product.quantityInStock <= 0) {
      alert("Stok produk habis!");
      return;
    }
    setSelectedProduct(product);
    setInputQuantity(1); 
    setIsQtyModalOpen(true);
  };

  const closeQtyModal = () => {
    setIsQtyModalOpen(false);
    setSelectedProduct(null);
  };

  const handleConfirmAddToCart = () => {
    addToCart(selectedProduct, inputQuantity);
    closeQtyModal();
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );
  
  if (error) return <p className="p-8 text-red-600">{error}</p>;

  const cartTotal = cart.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      
      {/* KIRI: DAFTAR PRODUK */}
      <div className="w-3/5 overflow-y-auto p-6 bg-gray-50">
        <input 
          type="text"
          placeholder="Cari produk (nama atau SKU)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {loading ? <p>Memuat produk...</p> : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                className="bg-white p-4 rounded-lg shadow-sm border hover:border-blue-500 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between h-40"
                onClick={() => openQtyModal(product)}
              >
                <div>
                    <h4 className="font-bold text-gray-800 line-clamp-2">{product.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{product.sku}</p>
                </div>
                <div>
                    <p className="text-blue-600 font-semibold">Rp {parseFloat(product.unitPrice).toLocaleString('id-ID')}</p>
                    <p className={`text-xs mt-1 ${product.quantityInStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Stok: {product.quantityInStock}
                    </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* KANAN: KERANJANG */}
      <div className="w-2/5 p-6 bg-white border-l flex flex-col shadow-lg z-10">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
             Keranjang
        </h2>
        
        <div className="flex-grow overflow-y-auto space-y-3 pr-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-lg">
                <p>Keranjang masih kosong</p>
                <p className="text-sm">Pilih produk di sebelah kiri</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.quantity} x Rp {item.unitPrice.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-700">
                    Rp {(item.unitPrice * item.quantity).toLocaleString('id-ID')}
                  </span>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                  >
                    -
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t pt-6 mt-4">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xl font-bold text-gray-600">Total Tagihan</span>
            <span className="text-3xl font-bold text-blue-600">
              Rp {cartTotal.toLocaleString('id-ID')}
            </span>
          </div>
          <button 
            onClick={handleCheckout} 
            disabled={cart.length === 0 || !user}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg transition-transform active:scale-95"
          >
            BAYAR SEKARANG
          </button>
        </div>
      </div>
      
      {/* Modal Input Kuantitas */}
      <Modal isOpen={isQtyModalOpen} onClose={closeQtyModal} title="Masukkan Jumlah">
        {selectedProduct && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 mb-4">
                Produk: <span className="font-bold">{selectedProduct.name}</span> <br/>
                Sisa Stok: <span className="font-bold">{selectedProduct.quantityInStock}</span>
            </div>
            <div>
              <input 
                type="number" 
                value={inputQuantity}
                onChange={(e) => setInputQuantity(parseInt(e.target.value))}
                onFocus={(e) => e.target.select()} 
                min="1"
                max={selectedProduct.quantityInStock}
                className="w-full p-4 text-3xl text-center border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none font-bold"
                autoFocus 
              />
            </div>
            <div className="flex justify-end pt-4 gap-2">
              <button type="button" onClick={closeQtyModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
              <button type="button" onClick={handleConfirmAddToCart} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold">Simpan</button>
            </div>
          </div>
        )}
      </Modal>

      {/* 5. MODAL SUKSES TRANSAKSI (NOTA) - DIPERBAIKI */}
      {isSuccessModalOpen && lastTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          {/* Container Modal */}
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[99vh]">
            
            {/* Header Modal (Fixed) */}
            <div className="bg-green-600 text-white text-center rounded-t-xl flex-shrink-0">
                <FiCheckCircle className="w-16 h-16 mx-auto mb-1 opacity-90" />
                <h2 className="text-2xl font-bold">Transaksi Berhasil!</h2>
                <p className="opacity-90">Total: Rp {parseInt(lastTransaction.totalAmount).toLocaleString('id-ID')}</p>
            </div>

            {/* Body: Preview Nota (Scrollable) */}
            <div className="p-6 bg-gray-50 overflow-y-auto flex-grow flex justify-center">
                 <Receipt ref={componentRef} transaction={lastTransaction} />
            </div>

            {/* Footer: Tombol Aksi (Fixed at Bottom) */}
            <div className="p-6 border-t bg-white rounded-b-xl flex-shrink-0">
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={handlePrint}
                        className="flex items-center justify-center gap-2 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-bold transition-colors"
                    >
                        <FiPrinter /> Cetak Nota
                    </button>
                    <button 
                        onClick={handleNewTransaction}
                        className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-colors"
                    >
                        <FiRefreshCw /> Transaksi Baru
                    </button>
                </div>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}

export default PosPage;