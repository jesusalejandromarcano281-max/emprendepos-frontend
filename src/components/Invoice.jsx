import React, { forwardRef } from 'react';

const Invoice = forwardRef(({ 
  sale, 
  businessName = 'Mi Emprendimiento', 
  businessRif = '', 
  businessAddress = '', 
  exchangeRate = 0 
}, ref) => {
  if (!sale) return null;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const subtotal = (sale.items || []).reduce((acc, item) => acc + Number(item.subtotal), 0);
  const descuento = Number(sale.descuento || 0);
  const total = Number(sale.total);

  return (
    <div ref={ref} className="bg-white p-8 max-w-2xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{businessName}</h1>
        {businessRif && <p className="text-xs text-gray-600 font-semibold mt-1">RIF: {businessRif}</p>}
        {businessAddress && <p className="text-xs text-gray-500 mt-0.5">{businessAddress}</p>}
      </div>

      {/* Invoice Info */}
      <div className="flex justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800">FACTURA</h2>
          <p className="text-sm text-gray-600">Nº: <span className="font-semibold">{String(sale.id).padStart(6, '0')}</span></p>
          <p className="text-sm text-gray-600">Fecha: {formatDate(sale.fecha)}</p>
          <p className="text-sm text-gray-600">Hora: {formatTime(sale.fecha)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-700">Cliente:</p>
          <p className="text-sm text-gray-600">{sale.cliente_nombre || 'Consumidor Final'}</p>
          <p className="text-sm font-semibold text-gray-700 mt-2">Atendido por:</p>
          <p className="text-sm text-gray-600">{sale.usuario_nombre || 'Admin'}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-6" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="text-left py-2 px-3 text-sm">Producto</th>
            <th className="text-center py-2 px-3 text-sm">Cant.</th>
            <th className="text-right py-2 px-3 text-sm">P. Unit.</th>
            <th className="text-right py-2 px-3 text-sm">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {(sale.items || []).map((item, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td className="py-2 px-3 text-sm">{item.producto_nombre}</td>
              <td className="py-2 px-3 text-sm text-center">{item.cantidad}</td>
              <td className="py-2 px-3 text-sm text-right">${Number(item.precio_unitario).toFixed(2)}</td>
              <td className="py-2 px-3 text-sm text-right">${Number(item.subtotal).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-64">
          <div className="flex justify-between py-1 text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          {descuento > 0 && (
            <div className="flex justify-between py-1 text-sm">
              <span className="text-gray-600">Descuento:</span>
              <span className="font-medium text-red-600">-${descuento.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-t-2 border-gray-800 mt-1">
            <span className="text-lg font-bold">TOTAL USD:</span>
            <span className="text-lg font-bold">${total.toFixed(2)}</span>
          </div>
          {exchangeRate > 0 && (
            <div className="flex justify-between py-1 border-t border-gray-200 mt-1">
              <span className="text-sm font-bold text-gray-700">TOTAL VES:</span>
              <span className="text-sm font-bold text-gray-700">Bs. {(total * exchangeRate).toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {sale.notas && (
        <div className="border-t border-gray-200 pt-3 mb-4">
          <p className="text-sm text-gray-600"><span className="font-semibold">Notas:</span> {sale.notas}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center border-t border-gray-300 pt-4 mt-6">
        <p className="text-sm text-gray-500">¡Gracias por su compra!</p>
        <p className="text-xs text-gray-400 mt-1">Este documento es un comprobante de venta</p>
      </div>
    </div>
  );
});

Invoice.displayName = 'Invoice';
export default Invoice;
