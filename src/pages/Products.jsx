import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-hot-toast';
import { FiPlus, FiSearch, FiAlertCircle, FiPackage, FiUpload } from 'react-icons/fi';
import api from '../api/axios';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { AuthContext } from '../context/AuthContext';

const Products = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '', descripcion: '', precio: '', costo: '', stock: '', stock_minimo: '', categoria: 'General', imagen: ''
  });

  const categorias = ['General', 'Alimentos', 'Ropa', 'Electrónica', 'Servicios', 'Otros'];

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (error) {
      toast.error('Error al cargar productos');
      setProducts([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredProducts = products.filter(p => 
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = products.filter(p => p.stock <= p.stock_minimo).length;

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        ...product,
        imagen: product.imagen || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({ nombre: '', descripcion: '', precio: '', costo: '', stock: '', stock_minimo: '', categoria: 'General', imagen: '' });
    }
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imagen: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData);
        toast.success('Producto actualizado exitosamente');
      } else {
        await api.post('/products', formData);
        toast.success('Producto creado exitosamente');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      toast.error('Error al guardar el producto');
    }
  };

  const handleDelete = async (product) => {
    if (window.confirm(`¿Estás seguro de eliminar el producto ${product.nombre}?`)) {
      try {
        await api.delete(`/products/${product.id}`);
        toast.success('Producto eliminado');
        fetchProducts();
      } catch (error) {
        toast.error('Error al eliminar producto');
      }
    }
  };

  const columns = [
    {
      key: 'imagen',
      label: '',
      render: (row) => (
        <div className="flex-shrink-0 h-10 w-10">
          {row.imagen ? (
            <img className="h-10 w-10 rounded-full object-cover" src={row.imagen} alt="" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <FiPackage className="h-6 w-6 text-gray-500" />
            </div>
          )}
        </div>
      )
    },
    { key: 'nombre', label: 'Nombre' },
    { key: 'categoria', label: 'Categoría' },
    { key: 'costo', label: 'Costo', render: (row) => `$${Number(row.costo || 0).toFixed(2)}` },
    { key: 'precio', label: 'Precio', render: (row) => `$${Number(row.precio).toFixed(2)}` },
    { 
      key: 'margen', 
      label: 'Margen', 
      render: (row) => {
        const costo = Number(row.costo || 0);
        const precio = Number(row.precio);
        const ganancia = precio - costo;
        const porcentaje = costo > 0 ? ((ganancia / costo) * 100).toFixed(1) : 100;
        return (
          <span className="text-green-600 font-medium">
            ${ganancia.toFixed(2)} ({porcentaje}%)
          </span>
        );
      }
    },
    { 
      key: 'stock', 
      label: 'Stock',
      render: (row) => (
        <span className={row.stock <= row.stock_minimo ? 'text-red-600 font-bold' : ''}>
          {row.stock}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        {user?.role === 'admin' && (
          <Button onClick={() => openModal()}><FiPlus className="mr-2" /> Nuevo Producto</Button>
        )}
      </div>

      {lowStockCount > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 flex items-start">
          <FiAlertCircle className="text-yellow-400 mt-0.5 mr-3 w-5 h-5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Atención de Stock</h3>
            <p className="mt-1 text-sm text-yellow-700">
              Hay {lowStockCount} producto(s) con stock igual o inferior al mínimo configurado.
            </p>
          </div>
        </div>
      )}

      <div className="flex bg-white p-4 rounded-lg shadow-sm">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition duration-150 ease-in-out"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <Table 
          columns={columns} 
          data={filteredProducts} 
          onEdit={user?.role === 'admin' ? openModal : null} 
          onDelete={user?.role === 'admin' ? handleDelete : null} 
        />
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center justify-center space-y-4 pb-4 border-b">
            <div className="h-24 w-24 rounded-full border-2 border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
              {formData.imagen ? (
                <img src={formData.imagen} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <FiPackage className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div>
              <label className="cursor-pointer bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none flex items-center">
                <FiUpload className="mr-2" /> Cambiar Imagen
                <input type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
            <p className="text-xs text-gray-500">Max: 2MB</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input type="text" required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2 border" rows="3"></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Costo ($)</label>
              <input type="number" step="0.01" required value={formData.costo} onChange={e => setFormData({...formData, costo: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Precio Venta ($)</label>
              <input type="number" step="0.01" required value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Categoría</label>
              <select value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2 border">
                {categorias.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock Actual</label>
              <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock Mínimo</label>
              <input type="number" required value={formData.stock_minimo} onChange={e => setFormData({...formData, stock_minimo: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2 border" />
            </div>
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;
