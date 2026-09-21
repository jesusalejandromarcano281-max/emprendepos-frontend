import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiBriefcase, FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiFileText } from 'react-icons/fi';
import api from '../api/axios';
import Button from '../components/ui/Button';
import { AuthContext } from '../context/AuthContext';

const RegisterTenant = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    rif: '',
    address: '',
    phone: '',
    admin_name: '',
    admin_email: '',
    admin_password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/saas/register-tenant', formData);
      toast.success(`¡Bienvenido a EmprendePOS! El negocio "${res.data.tenant.name}" ha sido creado.`);
      localStorage.setItem('token', res.data.token);
      window.location.href = '/dashboard';
    } catch (error) {
      const msg = error.response?.data?.error || 'Error al registrar el negocio';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-xl shadow-lg mb-3">
          <FiBriefcase className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-white">EmprendePOS Cloud</h2>
        <p className="mt-2 text-sm text-slate-400">
          Registra tu negocio y comienza a gestionar ventas e inventario hoy mismo
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl sm:px-10 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">
              1. Datos de tu Comercio
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre del Negocio / Empresa *</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiBriefcase />
                </div>
                <input
                  type="text"
                  required
                  value={formData.business_name}
                  onChange={e => setFormData({ ...formData, business_name: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Ej. Comercializadora Los Andes C.A."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">RIF / Cédula Fiscal</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FiFileText />
                  </div>
                  <input
                    type="text"
                    value={formData.rif}
                    onChange={e => setFormData({ ...formData, rif: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="J-12345678-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono de Contacto</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FiPhone />
                  </div>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="0414-0000000"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Dirección del Local</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiMapPin />
                </div>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Av. Bolívar CC Plaza Local 5"
                />
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 pt-4 mb-4">
              2. Datos del Administrador
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tu Nombre Completo *</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiUser />
                </div>
                <input
                  type="text"
                  required
                  value={formData.admin_name}
                  onChange={e => setFormData({ ...formData, admin_name: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Juan Pérez"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Correo Electrónico *</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiMail />
                </div>
                <input
                  type="email"
                  required
                  value={formData.admin_email}
                  onChange={e => setFormData({ ...formData, admin_email: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="admin@minegocio.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña de Acceso *</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiLock />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.admin_password}
                  onChange={e => setFormData({ ...formData, admin_password: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full justify-center py-3 text-base" disabled={loading}>
                {loading ? 'Creando tu cuenta...' : 'Crear Cuenta y Comenzar'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 border-t pt-4">
            ¿Ya tienes un negocio registrado?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterTenant;
