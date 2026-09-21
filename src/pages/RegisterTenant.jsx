import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiBriefcase, FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiFileText, FiCheck } from 'react-icons/fi';
import api from '../api/axios';
import Button from '../components/ui/Button';
import { AuthContext } from '../context/AuthContext';

const RegisterTenant = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    business_name: '',
    rif: '',
    address: '',
    phone: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
    plan: 'Básico'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/saas/register-tenant', formData);
      toast.success(`¡Bienvenido a EmprendePOS! El negocio "${res.data.tenant.name}" ha sido creado.`);
      localStorage.setItem('token', res.data.token);
      window.location.href = '/pagos';
    } catch (error) {
      const msg = error.response?.data?.error || 'Error al registrar el negocio';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-xl shadow-lg mb-3">
          <FiBriefcase className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-white">EmprendePOS Cloud</h2>
        <p className="mt-2 text-sm text-slate-400">
          Registra tu negocio y comienza a gestionar ventas e inventario hoy mismo
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl sm:px-10 border border-slate-100">
          
          {step === 1 ? (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900">Selecciona tu Plan</h3>
                <p className="text-gray-500 mt-2">Tienes 7 días de prueba gratis. Puedes cambiar o cancelar en cualquier momento.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${formData.plan === 'Básico' ? 'border-brand-500 bg-brand-50 shadow-md ring-2 ring-brand-200' : 'border-gray-200 bg-white hover:border-brand-300'}`} onClick={() => setFormData({...formData, plan: 'Básico'})}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">🟢 Básico</h3>
                  </div>
                  <p className="mt-4 text-3xl font-extrabold text-gray-900">$10<span className="text-base font-medium text-gray-500">/mes</span></p>
                  <ul className="mt-6 space-y-4 text-sm text-gray-500">
                    <li className="flex items-center"><FiCheck className="text-green-500 mr-2" /> 1 Usuario</li>
                    <li className="flex items-center"><FiCheck className="text-green-500 mr-2" /> 50 Productos</li>
                    <li className="flex items-center"><FiCheck className="text-green-500 mr-2" /> Gestión de ventas</li>
                    <li className="flex items-center"><FiCheck className="text-green-500 mr-2" /> Gestión de gastos</li>
                  </ul>
                </div>

                <div className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${formData.plan === 'Pro' ? 'border-brand-500 bg-brand-50 shadow-md ring-2 ring-brand-200' : 'border-gray-200 bg-white hover:border-brand-300'}`} onClick={() => setFormData({...formData, plan: 'Pro'})}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">🔵 Pro</h3>
                    <span className="px-2 py-1 text-xs font-semibold text-white bg-indigo-600 rounded-full">RECOMENDADO</span>
                  </div>
                  <p className="mt-4 text-3xl font-extrabold text-gray-900">$15<span className="text-base font-medium text-gray-500">/mes</span></p>
                  <ul className="mt-6 space-y-4 text-sm text-gray-500">
                    <li className="flex items-center"><FiCheck className="text-green-500 mr-2" /> 3 Usuarios</li>
                    <li className="flex items-center"><FiCheck className="text-green-500 mr-2" /> 300 Productos</li>
                    <li className="flex items-center"><FiCheck className="text-green-500 mr-2" /> Reportes PDF</li>
                    <li className="flex items-center"><FiCheck className="text-green-500 mr-2" /> Multi-moneda USD/VES</li>
                    <li className="flex items-center"><FiCheck className="text-green-500 mr-2" /> Todo lo del Básico</li>
                  </ul>
                </div>

                <div className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${formData.plan === 'Enterprise' ? 'border-brand-500 bg-brand-50 shadow-md ring-2 ring-brand-200' : 'border-gray-200 bg-white hover:border-brand-300'}`} onClick={() => setFormData({...formData, plan: 'Enterprise'})}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">🟡 Enterprise</h3>
                  </div>
                  <p className="mt-4 text-3xl font-extrabold text-gray-900">$25<span className="text-base font-medium text-gray-500">/mes</span></p>
                  <ul className="mt-6 space-y-4 text-sm text-gray-500">
                    <li className="flex items-center"><FiCheck className="text-green-500 mr-2" /> Usuarios ilimitados</li>
                    <li className="flex items-center"><FiCheck className="text-green-500 mr-2" /> Productos ilimitados</li>
                    <li className="flex items-center"><FiCheck className="text-green-500 mr-2" /> Todo lo del Pro</li>
                    <li className="flex items-center"><FiCheck className="text-green-500 mr-2" /> Soporte prioritario</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <Button onClick={() => setStep(2)} className="px-8 py-3 text-lg">Continuar con {formData.plan}</Button>
              </div>
              <div className="mt-4 text-center text-sm text-gray-600 border-t pt-4">
                ¿Ya tienes un negocio registrado?{' '}
                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Iniciar Sesión
                </Link>
              </div>
            </div>
          ) : (
            <div className="max-w-lg mx-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">
                    1. Datos de tu Comercio
                  </h3>
                  <button type="button" onClick={() => setStep(1)} className="text-sm text-brand-600 hover:text-brand-800">
                    Cambiar Plan ({formData.plan})
                  </button>
                </div>

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
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default RegisterTenant;
