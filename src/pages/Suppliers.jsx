import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiPlus, FiSearch, FiTruck, FiDollarSign } from 'react-icons/fi';
import api from '../api/axios';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '', telefono: '', email: '', politicas_venta: ''
  });

  const [isPricesModalOpen, setIsPricesModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [products, setProducts] = useState([]);
  const [supplierPrices, setSupplierPrices] = useState([]);
  const [priceForm, setPriceForm] = useState({
    product_id: '', precio_cotizado: ''
  });

  // States para creación rápida de producto
  const [isQuickProductModalOpen, setIsQuickProductModalOpen] = useState(false);
  const [quickProductForm, setQuickProductForm] = useState({
    nombre: '', precio: 0
  });

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data);
    } catch (error) {
      toast.error('Error al cargar proveedores');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredSuppliers = suppliers.filter(s => 
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (supplier = null) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        nombre: supplier.name || '',
        telefono: supplier.phone || '',
        email: supplier.email || '',
        politicas_venta: supplier.sales_policies || ''
      });
    } else {
      setEditingSupplier(null);
      setFormData({ nombre: '', telefono: '', email: '', politicas_venta: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nombre: formData.nombre,
        telefono: formData.telefono,
        email: formData.email,
        politicas_venta: formData.politicas_venta
      };
      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier.id}`, payload);
        toast.success('Proveedor actualizado');
      } else {
        await api.post('/suppliers', payload);
        toast.success('Proveedor creado');
      }
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (error) {
      toast.error('Error al guardar el proveedor');
    }
  };

  const handleDelete = async (supplier) => {
    if (window.confirm(`¿Estás seguro de eliminar el proveedor ${supplier.name}?`)) {
      try {
        await api.delete(`/suppliers/${supplier.id}`);
        toast.success('Proveedor eliminado');
        fetchSuppliers();
      } catch (error) {
        toast.error('Error al eliminar proveedor');
      }
    }
  };

  const openPricesModal = async (supplier) => {
    setSelectedSupplier(supplier);
    setPriceForm({ product_id: '', precio_cotizado: '' });
    await fetchSupplierPrices(supplier.id);
    setIsPricesModalOpen(true);
  };

  const fetchSupplierPrices = async (supplierId) => {
    try {
      const res = await api.get(`/suppliers/${supplierId}/prices`);
      setSupplierPrices(res.data);
    } catch (error) {
      toast.error('Error al cargar precios del proveedor');
      setSupplierPrices([]);
    }
  };

  const handlePriceSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/suppliers/${selectedSupplier.id}/prices`, {
        product_id: priceForm.product_id,
        precio_cotizado: priceForm.precio_cotizado
      });
      toast.success('Precio cotizado guardado');
      setPriceForm({ product_id: '', precio_cotizado: '' });
      fetchSupplierPrices(selectedSupplier.id);
    } catch (error) {
      toast.error('Error al guardar precio cotizado');
    }
  };

  const handleQuickProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/products', {
        nombre: quickProductForm.nombre,
        precio: 0
      });
      toast.success('Producto creado exitosamente');
      await fetchProducts(); // Recargar lista de productos
      setPriceForm({ ...priceForm, product_id: res.data.id }); // Seleccionarlo automáticamente
      setIsQuickProductModalOpen(false);
      setQuickProductForm({ nombre: '', precio: 0 });
    } catch (error) {
      toast.error('Error al crear el producto rápido');
    }
  };

  const columns = [
    {
      key: 'icon',
      label: '',
      render: () => (
        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
          <FiTruck className="h-5 w-5 text-indigo-600" />
        </div>
      )
    },
    { key: 'name', label: 'Nombre' },
    { key: 'phone', label: 'Teléfono' },
    { key: 'email', label: 'Email' },
    { key: 'sales_policies', label: 'Políticas' },
    {
      key: 'actions',
      label: 'Cotizaciones',
      render: (row) => (
        <Button variant="secondary" onClick={() => openPricesModal(row)} className="text-xs py-1 px-2">
          <FiDollarSign className="mr-1" /> Precios
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
        <Button onClick={() => openModal()}><FiPlus className="mr-2" /> Nuevo Proveedor</Button>
      </div>

      <div className="flex bg-white p-4 rounded-lg shadow-sm">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white sm:text-sm focus:ring-brand-500 focus:border-brand-500"
            placeholder="Buscar proveedores..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <Table 
          columns={columns} 
          data={filteredSuppliers} 
          onEdit={openModal} 
          onDelete={handleDelete} 
        />
      )}

      {/* Modal for Supplier Form */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input type="text" required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-brand-500 focus:border-brand-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input type="text" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-brand-500 focus:border-brand-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-brand-500 focus:border-brand-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Políticas de Venta</label>
            <textarea value={formData.politicas_venta} onChange={e => setFormData({...formData, politicas_venta: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-brand-500 focus:border-brand-500 sm:text-sm" rows="3"></textarea>
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal for Supplier Prices */}
      <Modal isOpen={isPricesModalOpen} onClose={() => setIsPricesModalOpen(false)} title={`Precios Cotizados - ${selectedSupplier?.name}`}>
        <div className="space-y-6">
          <form onSubmit={handlePriceSubmit} className="flex gap-4 items-end bg-gray-50 p-4 rounded-md">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
              <div className="flex gap-2">
                <select required value={priceForm.product_id} onChange={e => setPriceForm({...priceForm, product_id: e.target.value})} className="block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-brand-500 focus:border-brand-500 sm:text-sm">
                  <option value="">Seleccione un producto</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre || p.name}</option>
                  ))}
                </select>
                <Button type="button" variant="secondary" onClick={() => setIsQuickProductModalOpen(true)} className="px-3" title="Crear nuevo producto rápido">
                  <FiPlus />
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
              <input type="number" step="0.01" required value={priceForm.precio_cotizado} onChange={e => setPriceForm({...priceForm, precio_cotizado: e.target.value})} className="block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-brand-500 focus:border-brand-500 sm:text-sm" placeholder="0.00" />
            </div>
            <Button type="submit">Agregar</Button>
          </form>

          <div className="max-h-64 overflow-y-auto">
            {supplierPrices.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay precios cotizados para este proveedor.</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Producto</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Precio Cotizado</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {supplierPrices.map(sp => (
                    <tr key={sp.id}>
                      <td className="px-4 py-2">{sp.product_name || 'Producto'}</td>
                      <td className="px-4 py-2">${Number(sp.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      {/* Modal for Quick Product Creation */}
      <Modal isOpen={isQuickProductModalOpen} onClose={() => setIsQuickProductModalOpen(false)} title="Crear Producto Rápido">
        <form onSubmit={handleQuickProductSubmit} className="space-y-4">
          <p className="text-sm text-gray-500 mb-4">
            Añade el nombre del producto a tu inventario. Luego en la pantalla anterior podrás asignarle el precio de costo (cotización) que te da este proveedor.
            El precio de venta al público quedará en $0.00 hasta que lo actualices en la sección "Productos".
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre del Producto</label>
            <input type="text" required value={quickProductForm.nombre} onChange={e => setQuickProductForm({...quickProductForm, nombre: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-brand-500 focus:border-brand-500 sm:text-sm" placeholder="Ej: Harina Pan 1Kg" />
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsQuickProductModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Crear Producto</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Suppliers;
