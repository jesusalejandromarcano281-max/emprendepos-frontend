import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Clients from './pages/Clients';
import Sales from './pages/Sales';
import NewSale from './pages/NewSale';
import Expenses from './pages/Expenses';
import Users from './pages/Users';
import Settings from './pages/Settings';
import RegisterTenant from './pages/RegisterTenant';
import SuperAdminTenants from './pages/SuperAdminTenants';

function App() {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro-negocio" element={<RegisterTenant />} />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/productos" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/clientes" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
          <Route path="/ventas" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
          <Route path="/ventas/nueva" element={<ProtectedRoute><NewSale /></ProtectedRoute>} />
          <Route path="/gastos" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
          <Route path="/configuracion" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/usuarios" element={<ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>} />
          <Route path="/superadmin/comercios" element={<ProtectedRoute><SuperAdminTenants /></ProtectedRoute>} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
