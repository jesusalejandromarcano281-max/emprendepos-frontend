import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiTrash2 } from 'react-icons/fi';
import api from '../api/axios';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const NewSale = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [clientId, setClientId] = useState('');
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, productsRes, settingsRes] = await Promise.all([
          api.get('/clients'),
          api.get('/products'),
          api.get('/settings')
        ]);
        setClients(clientsRes.data);
        setProducts(productsRes.data.filter(p => p.stock > 0));
        if (settingsRes.data.exchange_rate) {
          setExchangeRate(Number(settingsRes.data.exchange_rate));
        }
      } catch (error) {
        toast.error('Error al cargar datos necesarios');
      }
    };
    fetchData();
  }, []);

  const handleAddItem = () => {
    if (!selectedProduct) return;
    const prod = products.find(p => p.id === Number(selectedProduct));
    if (!prod) return;

    if (quantity <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    const currentQty = items.find(i => i.product_id === prod.id)?.cantidad || 0;
    if (currentQty + Number(quantity) > prod.stock) {
      toast.error(`Stock insuficiente. Stock disponible: ${prod.stock}`);
      return;
    }

    const existingItemIndex = items.findIndex(i => i.product_id === prod.id);
    const newItems = [...items];

    if (existingItemIndex >= 0) {
      newItems[existingItemIndex].cantidad += Number(quantity);
      newItems[existingItemIndex].subtotal = newItems[existingItemIndex].cantidad * newItems[existingItemIndex].precio_unitario;
    } else {
      newItems.push({
        product_id: prod.id,
        nombre: prod.nombre,
        cantidad: Number(quantity),
        precio_unitario: prod.precio,
        subtotal: Number(quantity) * prod.precio
      });
    }

    setItems(newItems);
    setSelectedProduct('');
    setQuantity(1);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
  const total = Math.max(0, subtotal - Number(discount || 0));

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error('Agrega al menos un producto');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        client_id: clientId ? Number(clientId) : null,
        items: items.map(i => ({ product_id: i.product_id, cantidad: i.cantidad })),
        descuento: Number(discount || 0),
        notas: notes || ''
      };

      console.log('Enviando venta:', payload);
      const res = await api.post('/sales', payload);
      toast.success('Venta registrada exitosamente');
      
      // Preguntar si desea imprimir factura
      const saleId = res.data.id;
      if (window.confirm('¿Deseas ver e imprimir la factura?')) {
        navigate(`/ventas?factura=${saleId}`);
      } else {
        navigate('/ventas');
      }
    } catch (error) {
      console.error('Error completo:', error);
      const msg = error.response?.data?.error || error.response?.data?.details || error.message || 'Error al registrar la venta';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ nombre: '', email: '', telefono: '', direccion: '' });

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/clients', newClient);
      setClients([...clients, res.data]);
      setClientId(res.data.id);
      setIsClientModalOpen(false);
      setNewClient({ nombre: '', email: '', telefono: '', direccion: '' });
      toast.success('Cliente creado exitosamente');
    } catch (error) {
      toast.error('Error al crear el cliente');
    }
  };

  const selectedProdObj = products.find(p => p.id === Number(selectedProduct));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Registrar Nueva Venta</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente (Opcional)</label>
          <div className="flex gap-2">
            <select value={clientId} onChange={e => setClientId(e.target.value)} className="flex-1 border border-gray-300 rounded-md p-2">
              <option value="">-- Consumidor Final --</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            <Button type="button" onClick={() => setIsClientModalOpen(true)} variant="secondary">
              Nuevo Cliente
            </Button>
          </div>
        </div>

        <div className="border-t border-b border-gray-200 py-6 space-y-4">
          <h2 className="text-lg font-medium">Agregar Productos</h2>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
              <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="w-full border border-gray-300 rounded-md p-2">
                <option value="">Seleccione un producto</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.nombre} - ${p.precio} (Stock: {p.stock})</option>)}
              </select>
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
              <input type="number" min="1" max={selectedProdObj?.stock || 1} value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <Button onClick={handleAddItem} variant="secondary">Agregar</Button>
          </div>

          {items.length > 0 && (
            <div className="mt-4 border border-gray-200 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">P. Unitario</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{item.nombre}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">${Number(item.precio_unitario).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{item.cantidad}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">${Number(item.subtotal).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button onClick={() => removeItem(idx)} className="text-red-600 hover:text-red-900"><FiTrash2 /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas / Observaciones</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows="3" className="w-full border border-gray-300 rounded-md p-2"></textarea>
            </div>
          </div>
          
          <div className="w-full md:w-64 space-y-3 bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Descuento ($):</span>
              <input type="number" min="0" value={discount} onChange={e => setDiscount(e.target.value)} className="w-24 border border-gray-300 rounded p-1 text-right" />
            </div>
            <div className="border-t border-gray-300 pt-3 flex flex-col items-end">
              <div className="flex justify-between w-full items-center mb-1">
                <span className="text-lg font-bold text-gray-900">TOTAL USD:</span>
                <span className="text-2xl font-bold text-indigo-600">${total.toFixed(2)}</span>
              </div>
              {exchangeRate > 0 && (
                <div className="flex justify-between w-full items-center text-gray-500">
                  <span className="text-sm">TOTAL VES (Tasa: {exchangeRate.toFixed(2)}):</span>
                  <span className="text-lg font-bold">Bs. {(total * exchangeRate).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="secondary" onClick={() => navigate('/ventas')} className="mr-3">Cancelar</Button>
          <Button onClick={handleSubmit} size="lg" className="px-8" disabled={submitting}>
            {submitting ? 'Registrando...' : 'Registrar Venta'}
          </Button>
        </div>
      </div>

      <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title="Nuevo Cliente">
        <form onSubmit={handleCreateClient} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input type="text" required value={newClient.nombre} onChange={e => setNewClient({...newClient, nombre: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input type="text" value={newClient.telefono} onChange={e => setNewClient({...newClient, telefono: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Dirección</label>
            <input type="text" value={newClient.direccion} onChange={e => setNewClient({...newClient, direccion: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => setIsClientModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Guardar Cliente</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default NewSale;
