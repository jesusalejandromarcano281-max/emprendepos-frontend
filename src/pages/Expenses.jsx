import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';
import api from '../api/axios';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Card from '../components/ui/Card';

const Expenses = () => {
  const [activeTab, setActiveTab] = useState('gastos'); // gastos | ingresos
  const [items, setItems] = useState([]);
  const [balance, setBalance] = useState({ totalIngresos: 0, totalGastos: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ descripcion: '', monto: '', categoria: '', fecha: new Date().toISOString().split('T')[0] });

  const categoriesGastos = ['Servicios', 'Materiales', 'Transporte', 'Alquiler', 'Marketing', 'Otros'];
  const categoriesIngresos = ['Ventas', 'Servicios', 'Inversión', 'Otros'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'gastos' ? '/expenses/expenses' : '/expenses/incomes';
      const [itemsRes, balanceRes] = await Promise.all([
        api.get(endpoint).catch(() => ({ data: [] })),
        api.get('/expenses/balance').catch(() => ({ data: { totalIngresos: 0, totalGastos: 0, balance: 0 } }))
      ]);
      setItems(itemsRes.data);
      setBalance(balanceRes.data);
    } catch (error) {
      toast.error(`Error al cargar ${activeTab}`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const openModal = () => {
    setFormData({ 
      descripcion: '', 
      monto: '', 
      categoria: activeTab === 'gastos' ? categoriesGastos[0] : categoriesIngresos[0], 
      fecha: new Date().toISOString().split('T')[0] 
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = activeTab === 'gastos' ? '/expenses/expenses' : '/expenses/incomes';
      await api.post(endpoint, formData);
      toast.success(`${activeTab === 'gastos' ? 'Gasto' : 'Ingreso'} registrado`);
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Error al guardar');
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm('¿Eliminar este registro?')) {
      try {
        const endpoint = activeTab === 'gastos' ? `/expenses/expenses/${item.id}` : `/expenses/incomes/${item.id}`;
        await api.delete(endpoint);
        toast.success('Registro eliminado');
        fetchData();
      } catch (error) {
        toast.error('Error al eliminar');
      }
    }
  };

  const columns = [
    { key: 'fecha', label: 'Fecha', render: (row) => new Date(row.fecha).toLocaleDateString() },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'categoria', label: 'Categoría' },
    { 
      key: 'monto', 
      label: 'Monto', 
      render: (row) => (
        <span className={activeTab === 'gastos' ? 'text-red-600' : 'text-green-600'}>
          {activeTab === 'gastos' ? '-' : '+'}${Number(row.monto).toFixed(2)}
        </span>
      ) 
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Gestión de Finanzas</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Total Ingresos" value={`$${Number(balance.totalIngresos).toFixed(2)}`} color="bg-green-500" />
        <Card title="Total Gastos" value={`$${Number(balance.totalGastos).toFixed(2)}`} color="bg-red-500" />
        <Card title="Balance" value={`$${Number(balance.balance).toFixed(2)}`} color={balance.balance >= 0 ? "bg-emerald-500" : "bg-orange-500"} />
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('gastos')}
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${activeTab === 'gastos' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Gastos
            </button>
            <button
              onClick={() => setActiveTab('ingresos')}
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${activeTab === 'ingresos' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Ingresos Adicionales
            </button>
          </nav>
        </div>
        
        <div className="p-4">
          <div className="flex justify-end mb-4">
            <Button onClick={openModal}><FiPlus className="mr-2" /> Nuevo {activeTab === 'gastos' ? 'Gasto' : 'Ingreso'}</Button>
          </div>

          {loading ? (
            <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            <Table columns={columns} data={items} onDelete={handleDelete} />
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Nuevo ${activeTab === 'gastos' ? 'Gasto' : 'Ingreso'}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha</label>
            <input type="date" required value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <input type="text" required value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Monto ($)</label>
            <input type="number" step="0.01" required value={formData.monto} onChange={e => setFormData({...formData, monto: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Categoría</label>
            <select required value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 p-2 border">
              {(activeTab === 'gastos' ? categoriesGastos : categoriesIngresos).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
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

export default Expenses;
