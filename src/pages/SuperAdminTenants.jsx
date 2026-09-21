import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiBriefcase, FiDollarSign, FiUsers, FiShoppingBag, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import api from '../api/axios';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const SuperAdminTenants = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await api.get('/saas/superadmin/tenants');
      setTenants(res.data);
    } catch (error) {
      toast.error('Error al cargar la lista de comercios clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const toggleStatus = async (tenant) => {
    const newStatus = tenant.status === 'activo' ? 'suspendido' : 'activo';
    if (window.confirm(`¿Estás seguro de cambiar el estado de "${tenant.name}" a "${newStatus}"?`)) {
      try {
        await api.put(`/saas/superadmin/tenants/${tenant.id}/status`, { status: newStatus });
        toast.success(`Estado actualizado a ${newStatus}`);
        fetchTenants();
      } catch (error) {
        toast.error('Error al actualizar estado');
      }
    }
  };

  const changePlan = async (tenant, newPlan) => {
    try {
      await api.put(`/saas/superadmin/tenants/${tenant.id}/status`, { plan: newPlan });
      toast.success(`Plan actualizado a ${newPlan}`);
      fetchTenants();
    } catch (error) {
      toast.error('Error al cambiar plan');
    }
  };

  const totalComercios = tenants.length;
  const comerciosActivos = tenants.filter(t => t.status === 'activo').length;
  const totalFacturadoPlataforma = tenants.reduce((acc, t) => acc + Number(t.total_facturado || 0), 0);

  const columns = [
    { key: 'id', label: '#' },
    { 
      key: 'name', 
      label: 'Negocio', 
      render: (row) => (
        <div>
          <div className="font-bold text-gray-900">{row.name}</div>
          <div className="text-xs text-gray-500">RIF: {row.rif || 'N/A'} | Slug: {row.slug}</div>
        </div>
      )
    },
    { 
      key: 'plan', 
      label: 'Plan',
      render: (row) => (
        <select 
          value={row.plan} 
          onChange={(e) => changePlan(row, e.target.value)}
          className="text-xs border rounded p-1 font-semibold bg-gray-50"
        >
          <option value="basico">Básico</option>
          <option value="pro">PRO</option>
          <option value="enterprise">Enterprise</option>
        </select>
      )
    },
    { 
      key: 'status', 
      label: 'Estado',
      render: (row) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${row.status === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {row.status.toUpperCase()}
        </span>
      )
    },
    { key: 'total_usuarios', label: 'Usuarios' },
    { key: 'total_ventas', label: 'Ventas' },
    { key: 'total_facturado', label: 'Volumen Facturado', render: (row) => `$${Number(row.total_facturado || 0).toFixed(2)}` },
    {
      key: 'acciones',
      label: 'Acción',
      render: (row) => (
        <Button 
          variant={row.status === 'activo' ? 'secondary' : 'primary'} 
          size="sm"
          onClick={() => toggleStatus(row)}
        >
          {row.status === 'activo' ? <span className="text-red-600 flex items-center"><FiXCircle className="mr-1" /> Suspender</span> : <span className="flex items-center"><FiCheckCircle className="mr-1" /> Activar</span>}
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión Global de Comercios (SaaS SuperAdmin)</h1>
          <p className="text-sm text-gray-500">Panel Maestro para controlar las suscripciones y clientes de EmprendePOS</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Total Comercios Registrados" value={totalComercios} icon={<FiBriefcase className="w-6 h-6" />} color="bg-indigo-600" />
        <Card title="Comercios Activos" value={comerciosActivos} icon={<FiCheckCircle className="w-6 h-6" />} color="bg-emerald-600" />
        <Card title="Volumen Total Facturado" value={`$${totalFacturadoPlataforma.toFixed(2)}`} icon={<FiDollarSign className="w-6 h-6" />} color="bg-blue-600" />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        {loading ? (
          <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <Table columns={columns} data={tenants} />
        )}
      </div>
    </div>
  );
};

export default SuperAdminTenants;
