import React, { useContext, useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiHome, FiPackage, FiUsers, FiShoppingCart, FiDollarSign, FiSettings, FiBriefcase, FiLogOut, FiMenu, FiGlobe, FiCreditCard, FiTruck, FiList, FiUser } from 'react-icons/fi';
import api from '../api/axios';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [businessName, setBusinessName] = useState('Mi Emprendimiento');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.business_name) {
          setBusinessName(res.data.business_name);
        }
      } catch (error) {
        // Fallback to default
      }
    };
    fetchSettings();
  }, []);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <FiHome className="mr-3" /> },
    { to: '/productos', label: 'Productos', icon: <FiPackage className="mr-3" /> },
    { to: '/clientes', label: 'Clientes', icon: <FiUsers className="mr-3" /> },
    { to: '/ventas', label: 'Ventas', icon: <FiShoppingCart className="mr-3" /> },
    { to: '/gastos', label: 'Gastos e Ingresos', icon: <FiDollarSign className="mr-3" /> },
    { to: '/proveedores', label: 'Proveedores', icon: <FiTruck className="mr-3" /> },
    { to: '/comparador', label: 'Comparar Precios', icon: <FiList className="mr-3" /> },
    { to: '/pagos', label: 'Mi Suscripción', icon: <FiCreditCard className="mr-3" /> },
  ];

  if (user && user.role === 'admin') {
    navLinks.push({ to: '/configuracion', label: 'Configuración', icon: <FiSettings className="mr-3" /> });
    navLinks.push({ to: '/usuarios', label: 'Usuarios', icon: <FiUsers className="mr-3" /> });
  }

  if (user && user.is_superadmin) {
    navLinks.push({ to: '/superadmin/comercios', label: 'Gestión SaaS Comercios', icon: <FiGlobe className="mr-3 text-emerald-400" /> });
    navLinks.push({ to: '/superadmin/pagos', label: 'Pagos Pendientes', icon: <FiCreditCard className="mr-3 text-yellow-400" /> });
  }

  const navClass = ({ isActive }) =>
    `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
      isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
    }`;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-800 transform transition-transform duration-300 lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex flex-col justify-center h-20 bg-slate-900 px-4 text-white border-b border-slate-700">
            <div className="flex items-center">
              <FiBriefcase className="w-5 h-5 mr-2 text-indigo-400 flex-shrink-0" />
              <span className="text-base font-bold truncate">{businessName}</span>
            </div>
            <span className="text-xs text-indigo-300 mt-1 pl-7 font-medium">EmprendePOS v1.0</span>
          </div>
          
          <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={navClass} onClick={() => setSidebarOpen(false)}>
                {link.icon}
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="p-4 border-t border-slate-700 space-y-2">
            <NavLink
              to="/perfil"
              className={({ isActive }) => `flex items-center w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
              onClick={() => setSidebarOpen(false)}
            >
              <FiUser className="mr-3" />
              Mi Perfil
            </NavLink>
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-slate-300 rounded-md hover:bg-slate-700 hover:text-white transition-colors"
            >
              <FiLogOut className="mr-3" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 focus:outline-none lg:hidden"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800 text-lg hidden sm:inline">EmprendePOS</span>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold hidden sm:inline">CLOUD</span>
            </div>
            <div className="flex items-center">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-2">{user?.name}</span>
                <span className="px-2 py-1 text-xs font-semibold leading-none text-indigo-800 bg-indigo-100 rounded-full">
                  {user?.is_superadmin ? 'SuperAdmin SaaS' : user?.role === 'admin' ? 'Administrador' : 'Empleado'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
