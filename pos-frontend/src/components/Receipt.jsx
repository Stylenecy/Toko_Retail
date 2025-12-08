import React from 'react';

// Menggunakan forwardRef agar bisa diakses oleh fungsi print
export const Receipt = React.forwardRef(({ transaction }, ref) => {
  if (!transaction) return null;

  return (
    <div ref={ref} className="p-4 bg-white text-black font-mono text-sm w-[800mm] mx-auto">
      {/* Header Nota */}
      <div className="text-center mb-4 border-b border-black pb-2">
        <h2 className="text-xl font-bold">TOKO RETAIL</h2>
        <p>Jl. Dr. Wahidin UKDW, Jakarta</p>
        <p>Telp: 021-3456-7890</p>
      </div>    

      {/* Info Transaksi */}
      <div className="mb-4 text-xs">
        <div className="flex justify-between">
          <span>No:</span>
          <span>{transaction.invoiceNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Tgl:</span>
          <span>{new Date(transaction.createdAt).toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between">
          <span>Kasir:</span>
          {/* Menggunakan optional chaining untuk keamanan */}
          <span>{transaction.User?.username || 'Admin'}</span>  
        </div>
      </div>

      {/* Daftar Item */}
      <div className="border-b border-black pb-2 mb-2">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left">
              <th className="pb-1">Item</th>
              <th className="pb-1 text-right">Qty</th>
              <th className="pb-1 text-right">Harga</th>
              <th className="pb-1 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {transaction.items?.map((item, index) => (
              <tr key={index}>
                <td className="py-1 pr-1">
                  {item.product?.name || item.Product?.name || 'Item'}
                </td>
                <td className="py-1 text-right">{item.quantity}</td>
                <td className="py-1 text-right">
                  {parseInt(item.unitPrice).toLocaleString('id-ID')}
                </td>
                <td className="py-1 text-right">
                  {parseInt(item.lineTotal).toLocaleString('id-ID')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div className="flex justify-between font-bold text-lg mb-4">
        <span>TOTAL</span>
        <span>Rp {parseInt(transaction.totalAmount).toLocaleString('id-ID')}</span>
      </div>

      {/* Footer */}
      <div className="text-center text-xs mt-4 border-t border-black pt-2">
        <p>Terima Kasih atas kunjungan Anda!</p>
        <p>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.</p>
      </div>
    </div>
  );
});