import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiCheck, FiX, FiEye, FiClock, FiDollarSign } from 'react-icons/fi';
import api from '../api/axios';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const SuperAdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedImage, setSelectedImage] = useState('');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments/pending');
      setPayments(res.data);
    } catch (error) {
      toast.error('Error al cargar pagos pendientes');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm('¿Estás seguro de aprobar este pago?')) {
      try {
        await api.put(`/payments/${id}/approve`);
        toast.success('Pago aprobado exitosamente');
        fetchPayments();
      } catch (error) {
        toast.error('Error al aprobar el pago');
      }
    }
  };

  const handleRejectClick = (id) => {
    setRejectingId(id);
    setNotes('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      toast.error('Debe proporcionar un motivo para el rechazo');
      return;
    }
    
    try {
      await api.put(`/payments/${rejectingId}/reject`, { notes });
      toast.success('Pago rechazado');
      setRejectModalOpen(false);
      fetchPayments();
    } catch (error) {
      toast.error('Error al rechazar el pago');
    }
  };

  const openImage = (url) => {
    setSelectedImage(url);
    setImageModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Pagos Pendientes</h1>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No hay pagos pendientes por revisar.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Negocio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan / Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método / Referencia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comprobante</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.tenant_name || 'Desconocido'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="font-bold">{payment.plan}</div>
                      <div>${payment.amount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{payment.method}</div>
                      <div className="text-xs text-gray-400">Ref: {payment.reference}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button onClick={() => openImage(payment.proof_image)} className="text-brand-600 hover:text-brand-900 flex items-center">
                        <FiEye className="mr-1" /> Ver
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => handleApprove(payment.id)} className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded flex items-center">
                          <FiCheck className="mr-1" /> Aprobar
                        </button>
                        <button onClick={() => handleRejectClick(payment.id)} className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded flex items-center">
                          <FiX className="mr-1" /> Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={imageModalOpen} onClose={() => setImageModalOpen(false)} title="Comprobante de Pago">
        <div className="p-4 flex justify-center">
          <img src={selectedImage} alt="Comprobante" className="max-w-full max-h-[70vh] object-contain" />
        </div>
      </Modal>

      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Rechazar Pago">
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Motivo del rechazo</label>
            <textarea required value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2 border" rows="3" placeholder="Ej: Referencia no coincide, monto incorrecto..." />
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setRejectModalOpen(false)}>Cancelar</Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">Rechazar Pago</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SuperAdminPayments;
