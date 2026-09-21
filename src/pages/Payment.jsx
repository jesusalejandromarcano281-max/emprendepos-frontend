import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiCreditCard, FiSmartphone, FiUpload, FiCopy, FiCheck, FiClock, FiX, FiStar } from 'react-icons/fi';
import api from '../api/axios';
import Button from '../components/ui/Button';

const Payment = () => {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    method: 'Pago Móvil',
    plan: 'Básico',
    reference: '',
    amount: '',
    proof_image: ''
  });

  const [preview, setPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [planRes, paymentsRes] = await Promise.all([
        api.get('/plan-info').catch(() => ({ data: { name: 'Prueba', status: 'active', days_left: 7 } })),
        api.get('/payments/my').catch(() => ({ data: [] }))
      ]);
      
      setCurrentPlan(planRes.data);
      setPayments(paymentsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
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
        setFormData({ ...formData, proof_image: reader.result });
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.proof_image) {
      toast.error('Debe adjuntar un comprobante de pago');
      return;
    }
    
    setSubmitting(true);
    try {
      await api.post('/payments', {
        amount: formData.amount,
        currency: 'USD',
        method: formData.method,
        reference: formData.reference,
        proof_image: formData.proof_image,
        plan: formData.plan
      });
      toast.success('Pago reportado exitosamente. En revisión.');
      setFormData({ ...formData, reference: '', amount: '', proof_image: '' });
      setPreview('');
      fetchData();
    } catch (error) {
      toast.error('Error al reportar el pago');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mi Suscripción</h1>
      </div>

      {currentPlan && (
        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiStar className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-indigo-800">
                Plan Actual: {currentPlan.name}
              </h3>
              <div className="mt-2 text-sm text-indigo-700">
                <p>Estado: {currentPlan.status === 'active' ? 'Activo' : 'Inactivo'}</p>
                {currentPlan.days_left !== undefined && <p>Días restantes: {currentPlan.days_left}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 bg-white rounded-lg border-2 cursor-pointer transition-all ${formData.plan === 'Básico' ? 'border-brand-500 shadow-md ring-2 ring-brand-200' : 'border-gray-200 hover:border-brand-300'}`} onClick={() => setFormData({...formData, plan: 'Básico', amount: '10'})}>
          <h3 className="text-lg font-bold text-gray-900">Básico</h3>
          <p className="mt-4 text-3xl font-extrabold text-gray-900">$10<span className="text-base font-medium text-gray-500">/mes</span></p>
          <ul className="mt-6 space-y-4 text-sm text-gray-500">
            <li className="flex items-center"><FiCheck className="text-green-500 mr-2" /> 1 Usuario</li>
            <li className="flex items-center"><FiCheck className="text-green-500 mr-2" /> 50 Productos</li>
          </ul>
        </div>
        
        <div className={`p-6 bg-white rounded-lg border-2 cursor-pointer transition-all ${formData.plan === 'Pro' ? 'border-brand-500 shadow-md ring-2 ring-brand-200' : 'border-gray-200 hover:border-brand-300'}`} onClick={() => setFormData({...formData, plan: 'Pro', amount: '15'})}>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Pro</h3>
            <span className="px-2 py-1 text-xs font-semibold text-brand-700 bg-brand-100 rounded-full">Recomendado</span>
          </div>
          <p className="mt-4 text-3xl font-extrabold text-gray-900">$15<span className="text-base font-medium text-gray-500">/mes</span></p>
          <ul className="mt-6 space-y-4 text-sm text-gray-500">
            <li className="flex items-center"><FiCheck className="text-green-500 mr-2" /> 3 Usuarios</li>
            <li className="flex items-center"><FiCheck className="text-green-500 mr-2" /> 300 Productos</li>
          </ul>
        </div>
        
        <div className={`p-6 bg-white rounded-lg border-2 cursor-pointer transition-all ${formData.plan === 'Enterprise' ? 'border-brand-500 shadow-md ring-2 ring-brand-200' : 'border-gray-200 hover:border-brand-300'}`} onClick={() => setFormData({...formData, plan: 'Enterprise', amount: '25'})}>
          <h3 className="text-lg font-bold text-gray-900">Enterprise</h3>
          <p className="mt-4 text-3xl font-extrabold text-gray-900">$25<span className="text-base font-medium text-gray-500">/mes</span></p>
          <ul className="mt-6 space-y-4 text-sm text-gray-500">
            <li className="flex items-center"><FiCheck className="text-green-500 mr-2" /> Usuarios ilimitados</li>
            <li className="flex items-center"><FiCheck className="text-green-500 mr-2" /> Productos ilimitados</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Métodos de Pago</h2>
          
          <div className="space-y-4">
            <div className={`p-4 border rounded-lg cursor-pointer ${formData.method === 'Pago Móvil' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white'}`} onClick={() => setFormData({...formData, method: 'Pago Móvil'})}>
              <div className="flex items-center mb-3">
                <FiSmartphone className="text-brand-600 mr-2 text-xl" />
                <h3 className="font-bold text-gray-900">Pago Móvil</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between items-center">
                  <span>Cédula: V-28039554</span>
                  <button onClick={(e) => { e.stopPropagation(); handleCopy('28039554'); }} className="text-brand-600 hover:text-brand-800"><FiCopy /></button>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tel: 04123232392</span>
                  <button onClick={(e) => { e.stopPropagation(); handleCopy('04123232392'); }} className="text-brand-600 hover:text-brand-800"><FiCopy /></button>
                </div>
                <div className="flex justify-between items-center">
                  <span>Banco: Mercantil (0105)</span>
                </div>
              </div>
            </div>

            <div className={`p-4 border rounded-lg cursor-pointer ${formData.method === 'Binance Pay' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white'}`} onClick={() => setFormData({...formData, method: 'Binance Pay'})}>
              <div className="flex items-center mb-3">
                <FiCreditCard className="text-yellow-600 mr-2 text-xl" />
                <h3 className="font-bold text-gray-900">Binance Pay</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between items-center">
                  <span>Pay ID: 193628341</span>
                  <button onClick={(e) => { e.stopPropagation(); handleCopy('193628341'); }} className="text-brand-600 hover:text-brand-800"><FiCopy /></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Reportar Pago</h2>
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Monto Pagado ({formData.method === 'Pago Móvil' ? 'Bs' : 'USD'})</label>
              <input type="number" step="0.01" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm" placeholder="Ej: 15.00" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Número de Referencia</label>
              <input type="text" required value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm" placeholder="Últimos 6 dígitos" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Comprobante de Pago</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative">
                <div className="space-y-1 text-center">
                  {preview ? (
                    <img src={preview} alt="Preview" className="mx-auto h-32 object-contain" />
                  ) : (
                    <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-brand-600 hover:text-brand-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-500">
                      <span>{preview ? 'Cambiar imagen' : 'Subir archivo'}</span>
                      <input type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 2MB</p>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full justify-center" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Enviar Comprobante'}
            </Button>
          </form>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Historial de Pagos</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {payments.length === 0 ? (
            <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
              No hay pagos reportados
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {payments.map((payment) => (
                <li key={payment.id} className="px-4 py-4 flex items-center justify-between sm:px-6">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{payment.plan} - ${payment.amount}</span>
                    <span className="text-sm text-gray-500">{payment.method} (Ref: {payment.reference})</span>
                    <span className="text-xs text-gray-400">{new Date(payment.created_at).toLocaleDateString()}</span>
                  </div>
                  <div>
                    {payment.status === 'pendiente' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><FiClock className="mr-1" /> Pendiente</span>}
                    {payment.status === 'aprobado' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><FiCheck className="mr-1" /> Aprobado</span>}
                    {payment.status === 'rechazado' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><FiX className="mr-1" /> Rechazado</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;
