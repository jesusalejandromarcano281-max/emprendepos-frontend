import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import Button from '../components/ui/Button';

const Settings = () => {
  const [formData, setFormData] = useState({
    exchange_rate: '',
    business_name: '',
    business_rif: '',
    business_address: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        setFormData({
          exchange_rate: res.data.exchange_rate || '40.00',
          business_name: res.data.business_name || 'Mi Emprendimiento',
          business_rif: res.data.business_rif || '',
          business_address: res.data.business_address || ''
        });
      } catch (error) {
        toast.error('Error al cargar configuración');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.post('/settings', formData);
      toast.success('Configuración guardada exitosamente');
    } catch (error) {
      toast.error('Error al guardar configuración');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>

      {loading ? (
        <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <h2 className="text-lg font-medium border-b pb-2 mb-4 text-gray-800">Datos del Emprendimiento (para Facturación)</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Comercial del Negocio</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.business_name} 
                    onChange={e => setFormData({...formData, business_name: e.target.value})} 
                    className="block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
                    placeholder="Ej. Tienda Novedades C.A."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RIF / Documento Fiscal</label>
                  <input 
                    type="text" 
                    value={formData.business_rif} 
                    onChange={e => setFormData({...formData, business_rif: e.target.value})} 
                    className="block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
                    placeholder="Ej. J-12345678-9"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Fiscal / Local</label>
                  <input 
                    type="text" 
                    value={formData.business_address} 
                    onChange={e => setFormData({...formData, business_address: e.target.value})} 
                    className="block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
                    placeholder="Ej. Av. Principal, C.C. Central, Nivel 1, Local 12"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium border-b pb-2 mb-4 text-gray-800">Multimoneda</h2>
              <div className="max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tasa de Cambio del Día (VES por 1 USD)</label>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2 font-bold">Bs.</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    value={formData.exchange_rate} 
                    onChange={e => setFormData({...formData, exchange_rate: e.target.value})} 
                    className="block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
                    placeholder="Ej. 40.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Esta tasa se usará para calcular el equivalente en Bolívares (VES) en el punto de venta y las facturas.</p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button type="submit">Guardar Configuración</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Settings;
