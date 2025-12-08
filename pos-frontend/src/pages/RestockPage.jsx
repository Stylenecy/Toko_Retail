import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal'; 
import { FiPlus, FiShoppingCart, FiTrash2, FiCheckCircle } from 'react-icons/fi';
// Tidak perlu import Receipt atau useReactToPrint lagi

function RestockPage() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // STATE MODAL
  const [isQtyModalOpen, setIsQtyModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [inputQuantity, setInputQuantity] = useState(1);
  
  // STATE MODAL SUKSES (Tanpa Ref Printer)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));

    const fetchSuppliers = async () => {
      try {
        const response = await api.get('/suppliers');
        setSuppliers(response.data.data);
      } catch (error) { console.error("Gagal ambil supplier:", error); } 
      finally { setLoading(false); }
    };
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (selectedSupplier) {
      const fetchProductsBySupplier = async () => {
        try {
          const response = await api.get('/products', {
            params: { supplierId: selectedSupplier, limit: 100 } 
          });
          setProducts(response.data.data);
        } catch (error) { console.error("Gagal ambil produk:", error); }
      };
      fetchProductsBySupplier();
    } else {
      setProducts([]);
    }
  }, [selectedSupplier]);

  const addToCart = (product, quantityToAdd) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: existingItem.quantity + quantityToAdd } : item
      ));
    } else {
      // Harga 0 karena restock tidak hitung uang
      setCart([...cart, { ...product, quantity: quantityToAdd, unitPrice: 0 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty < 1) return;
    setCart(cart.map(item => 
      item.id === productId ? { ...item, quantity: newQty } : item
    ));
  };

  const handleRestock = async () => {
    if (cart.length === 0) return alert("Keranjang kosong!");
    if (!user) return alert("Sesi habis.");

    const supplierObj = suppliers.find(s => s.id === parseInt(selectedSupplier));
    const supplierName = supplierObj ? supplierObj.name : 'Unknown';

    const transactionData = {
      transactionType: 'stock_in',
      userId: user.id,
      notes: `Restock dari Supplier: ${supplierName}`,
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: 0 
      }))
    };

    try {
      const response = await api.post('/transactions', transactionData);
      setLastTransaction(response.data.data); // Simpan data sekadar untuk info invoice
      setIsSuccessModalOpen(true); // Buka modal sukses

      // Reset Form
      setCart([]);
      const res = await api.get('/products', { params: { supplierId: selectedSupplier, limit: 100 } });
      setProducts(res.data.data);
    } catch (error) {
      alert('Gagal: ' + (error.response?.data?.message || error.message));
    }
  };

  const openQtyModal = (product) => { setSelectedProduct(product); setInputQuantity(1); setIsQtyModalOpen(true); };
  const closeQtyModal = () => { setIsQtyModalOpen(false); setSelectedProduct(null); };
  const handleConfirmAddToCart = (e) => { e.preventDefault(); if (inputQuantity <= 0) return alert("Jumlah > 0"); addToCart(selectedProduct, inputQuantity); closeQtyModal(); };
  
  // Fungsi tutup modal sukses
  const handleCloseSuccess = () => { 
      setIsSuccessModalOpen(false); 
      setLastTransaction(null); 
      setSelectedSupplier(''); 
      setProducts([]); 
  };

  if (loading) return <div className="p-10 text-center">Memuat data...</div>;

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6">
      {/* KIRI: AREA PILIH BARANG */}
      <div className="w-2/3 flex flex-col">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Restock Barang (Stok Masuk)</h1>
        
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Supplier</label>
          <select className="w-full p-2 border rounded-md" value={selectedSupplier} onChange={(e) => { setSelectedSupplier(e.target.value); setCart([]); }}>
            <option value="">-- Pilih Supplier --</option>
            {suppliers.map(s => ( <option key={s.id} value={s.id}>{s.name}</option> ))}
          </select>
        </div>
        <div className="flex-grow overflow-y-auto">
          {selectedSupplier ? (
            <div className="grid grid-cols-3 gap-4">
              {products.map(product => (
                <div key={product.id} className="bg-white p-4 rounded-lg shadow border hover:border-blue-500 cursor-pointer group" onClick={() => openQtyModal(product)}>
                  <h3 className="font-bold text-gray-800 group-hover:text-blue-600">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{product.sku}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-1 rounded">Stok: {product.quantityInStock}</span>
                    <FiPlus className="text-blue-500" />
                  </div>
                </div>
              ))}
              {products.length === 0 && <p className="text-gray-500 col-span-3 text-center py-10">Tidak ada produk.</p>}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"><p className="text-gray-500">Pilih supplier di atas.</p></div>
          )}
        </div>
      </div>

      {/* KANAN: DAFTAR MASUK BARANG */}
      <div className="w-1/3 bg-white p-6 rounded-lg shadow-lg flex flex-col h-full">
        <h2 className="text-xl font-bold mb-4 flex items-center"><FiShoppingCart className="mr-2"/> Daftar Masuk</h2>
        
        <div className="flex-grow overflow-y-auto space-y-4">
          {cart.length === 0 ? (
            <p className="text-center text-gray-400 mt-10">Daftar kosong.</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="border-b pb-4">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{item.name}</span>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700"><FiTrash2/></button>
                </div>
                <div className="flex items-center justify-end">
                  <span className="text-sm text-gray-500 mr-3">Qty:</span>
                  <div className="flex items-center border rounded">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 hover:bg-gray-100 font-bold">-</button>
                    <input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)} className="w-12 text-center outline-none" />
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 hover:bg-gray-100 font-bold">+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-auto pt-6 border-t">
          <div className="flex justify-between text-lg font-bold mb-4">
            <span>Total Item:</span>
            <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} pcs</span>
          </div>
          <button onClick={handleRestock} disabled={cart.length === 0} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition-colors">
            KONFIRMASI RESTOCK
          </button>
        </div>
      </div>
      
      {/* Modal Input Kuantitas */}
      <Modal isOpen={isQtyModalOpen} onClose={closeQtyModal} title="Jumlah Barang Masuk">
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

      {/* MODAL INPUT KUANTITAS */}
      {/* <Modal isOpen={isQtyModalOpen} onClose={closeQtyModal} title="Jumlah Barang Masuk">
        {selectedProduct && (
          <form onSubmit={handleConfirmAddToCart} className="space-y-4">
            <div>
                <p className="text-gray-600 mb-2">Produk: <span className="font-bold">{selectedProduct.name}</span></p>
                <label className="block text-sm font-medium text-gray-700">Jumlah Masuk</label>
                <input type="number" value={inputQuantity} onChange={(e) => setInputQuantity(parseInt(e.target.value) || 0)} onFocus={(e) => e.target.select()} min="1" className="mt-1 w-full px-3 py-2 border rounded-md text-xl font-bold" autoFocus required />
            </div>
            <div className="flex justify-end pt-4 border-t mt-6 gap-2">
              <button type="button" onClick={closeQtyModal} className="px-4 py-2 bg-gray-200 rounded-md">Batal</button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md">Tambah</button>
            </div>
          </form>
        )}
      </Modal> */}

      {/* MODAL SUKSES (SEDERHANA - TANPA NOTA) */}
      {isSuccessModalOpen && lastTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
            
            <div className="bg-white p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Restock Berhasil!</h2>
                <p className="text-gray-500">Stok telah berhasil ditambahkan ke gudang.</p>
                <p className="text-sm text-gray-400 mt-4">No. Ref: {lastTransaction.invoiceNumber}</p>
            </div>

            <div className="p-6 border-t bg-gray-50">
                <button 
                    onClick={handleCloseSuccess}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-colors"
                >
                    Selesai
                </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default RestockPage;