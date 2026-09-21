import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiShoppingCart, FiTrendingUp, FiTrendingDown, FiPackage, FiAlertTriangle } from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axios';
import Card from '../components/ui/Card';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [salesChart, setSalesChart] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [summaryRes, salesChartRes, topProductsRes, recentSalesRes] = await Promise.all([
          api.get('/dashboard/summary').catch(() => ({ data: { totalVentas: 0, ingresos: 0, gastos: 0, gananciaNeta: 0, totalProductos: 0, stockBajo: 0 } })),
          api.get('/dashboard/sales-chart').catch(() => ({ data: [] })),
          api.get('/dashboard/top-products').catch(() => ({ data: [] })),
          api.get('/dashboard/recent-sales').catch(() => ({ data: [] }))
        ]);

        setSummary(summaryRes.data);
        setSalesChart(salesChartRes.data);
        setTopProducts(topProductsRes.data);
        setRecentSales(recentSalesRes.data);
      } catch (error) {
        console.error("Error loading dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const formatCurrency = (value) => `$${Number(value).toFixed(2)}`;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-lg"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-28 bg-gray-200 rounded-lg"></div>
          <div className="h-28 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-96 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Top Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Total Ventas" value={summary?.totalVentas || 0} icon={<FiShoppingCart className="w-6 h-6" />} color="bg-blue-500" />
        <Card title="Ingresos" value={formatCurrency(summary?.ingresos || 0)} icon={<FiTrendingUp className="w-6 h-6" />} color="bg-green-500" />
        <Card title="Gastos" value={formatCurrency(summary?.gastos || 0)} icon={<FiTrendingDown className="w-6 h-6" />} color="bg-red-500" />
        <Card title="Ganancia Neta" value={formatCurrency(summary?.gananciaNeta || 0)} icon={<FiDollarSign className="w-6 h-6" />} color={summary?.gananciaNeta >= 0 ? "bg-emerald-500" : "bg-orange-500"} />
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Total Productos" value={summary?.totalProductos || 0} icon={<FiPackage className="w-6 h-6" />} color="bg-indigo-500" />
        <Card title="Productos Stock Bajo" value={summary?.stockBajo || 0} icon={<FiAlertTriangle className="w-6 h-6" />} color="bg-yellow-500" />
      </div>

      {/* Sales Line Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Ventas de los últimos 30 días</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesChart}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="fecha" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
              <RechartsTooltip formatter={(value) => [`$${value}`, 'Ventas']} labelStyle={{ color: '#374151' }} />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Top 10 Productos Más Vendidos</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="nombre" type="category" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip formatter={(value) => [value, 'Cantidad Vendida']} />
                <Bar dataKey="cantidad" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Sales List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Últimas Ventas</h2>
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {recentSales.map((sale) => (
                <li key={sale.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">Venta #{sale.id} - {sale.cliente}</p>
                      <p className="text-sm text-gray-500 truncate">{new Date(sale.fecha).toLocaleDateString()}</p>
                    </div>
                    <div className="inline-flex items-center text-base font-semibold text-gray-900">
                      {formatCurrency(sale.total)}
                    </div>
                  </div>
                </li>
              ))}
              {recentSales.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No hay ventas recientes.</p>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
