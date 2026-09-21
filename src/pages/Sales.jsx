import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { FiPlus, FiEye, FiPrinter, FiDownload } from 'react-icons/fi';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Invoice from '../components/Invoice';

const Sales = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ desde: '', hasta: '' });
  
  const [selectedSale, setSelectedSale] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const invoiceRef = useRef();

  const [exchangeRate, setExchangeRate] = useState(0);
  const [settings, setSettings] = useState({
    business_name: 'Mi Emprendimiento',
    business_rif: '',
    business_address: '',
    exchange_rate: '40.00'
  });

  const fetchData = async () => {
    try {
      let url = '/sales';
      if (dateRange.desde && dateRange.hasta) {
        url += `?desde=${dateRange.desde}&hasta=${dateRange.hasta}`;
      }
      const [salesRes, settingsRes] = await Promise.all([
        api.get(url),
        api.get('/settings')
      ]);
      setSales(salesRes.data);
      if (settingsRes.data) {
        setSettings(settingsRes.data);
        if (settingsRes.data.exchange_rate) {
          setExchangeRate(Number(settingsRes.data.exchange_rate));
        }
      }
    } catch (error) {
      toast.error('Error al cargar datos');
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  // Auto-open invoice if redirected from NewSale
  useEffect(() => {
    const facturaId = searchParams.get('factura');
    if (facturaId) {
      const openInvoice = async () => {
        try {
          const res = await api.get(`/sales/${facturaId}`);
          setSelectedSale(res.data);
          setShowInvoice(true);
        } catch (error) {
          toast.error('Error al cargar la factura');
        }
      };
      openInvoice();
      setSearchParams({});
    }
  }, [searchParams]);

  const viewDetails = async (sale) => {
    try {
      const res = await api.get(`/sales/${sale.id}`);
      setSelectedSale(res.data);
      setIsModalOpen(true);
    } catch (error) {
      toast.error('Error al cargar detalles de la venta');
    }
  };

  const viewInvoice = async (sale) => {
    try {
      const res = await api.get(`/sales/${sale.id}`);
      setSelectedSale(res.data);
      setShowInvoice(true);
    } catch (error) {
      toast.error('Error al cargar la factura');
    }
  };

  const printInvoice = () => {
    if (!selectedSale) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Factura #${String(selectedSale.id).padStart(6, '0')}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background-color: #1f2937; color: white; padding: 8px 12px; text-align: left; font-size: 13px; }
          th:nth-child(2) { text-align: center; }
          th:nth-child(3), th:nth-child(4) { text-align: right; }
          td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
          td:nth-child(2) { text-align: center; }
          td:nth-child(3), td:nth-child(4) { text-align: right; }
          .header { text-align: center; border-bottom: 2px solid #1f2937; padding-bottom: 15px; margin-bottom: 20px; }
          .header h1 { font-size: 22px; color: #111; }
          .header p { font-size: 12px; color: #666; margin-top: 4px; }
          .info { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .info-left h2 { font-size: 16px; font-weight: bold; color: #333; }
          .info-left p, .info-right p { font-size: 12px; color: #555; margin: 2px 0; }
          .info-right { text-align: right; }
          .info-right .label { font-size: 12px; font-weight: bold; color: #444; }
          .totals { display: flex; justify-content: flex-end; margin-bottom: 20px; }
          .totals-box { width: 250px; }
          .totals-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
          .totals-row.total { border-top: 2px solid #1f2937; margin-top: 4px; padding-top: 8px; font-size: 16px; font-weight: bold; }
          .notes { border-top: 1px solid #ddd; padding-top: 10px; margin-bottom: 15px; font-size: 12px; color: #555; }
          .notes strong { color: #333; }
          .footer { text-align: center; border-top: 1px solid #ccc; padding-top: 15px; margin-top: 20px; }
          .footer p { font-size: 12px; color: #888; }
          .footer .thanks { font-size: 13px; color: #555; }
          .text-red { color: #dc2626; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${settings.business_name || 'Mi Emprendimiento'}</h1>
          ${settings.business_rif ? `<p><strong>RIF:</strong> ${settings.business_rif}</p>` : ''}
          ${settings.business_address ? `<p>${settings.business_address}</p>` : ''}
        </div>
        <div class="info">
          <div class="info-left">
            <h2>FACTURA</h2>
            <p>Nº: ${String(selectedSale.id).padStart(6, '0')}</p>
            <p>Fecha: ${new Date(selectedSale.fecha).toLocaleDateString('es-ES')}</p>
            <p>Hora: ${new Date(selectedSale.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div class="info-right">
            <p class="label">Cliente:</p>
            <p>${selectedSale.cliente_nombre || 'Consumidor Final'}</p>
            <p class="label" style="margin-top:8px">Atendido por:</p>
            <p>${selectedSale.usuario_nombre || 'Admin'}</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cant.</th>
              <th>P. Unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${(selectedSale.items || []).map(item => `
              <tr>
                <td>${item.producto_nombre}</td>
                <td>${item.cantidad}</td>
                <td>$${Number(item.precio_unitario).toFixed(2)}</td>
                <td>$${Number(item.subtotal).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="totals">
          <div class="totals-box">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>$${(selectedSale.items || []).reduce((a, i) => a + Number(i.subtotal), 0).toFixed(2)}</span>
            </div>
            ${Number(selectedSale.descuento) > 0 ? `
              <div class="totals-row">
                <span>Descuento:</span>
                <span class="text-red">-$${Number(selectedSale.descuento).toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="totals-row total">
              <span>TOTAL USD:</span>
              <span>$${Number(selectedSale.total).toFixed(2)}</span>
            </div>
            ${exchangeRate > 0 ? `
              <div class="totals-row" style="border-top: 1px solid #e5e7eb; margin-top: 4px; padding-top: 4px; font-weight: bold;">
                <span>TOTAL VES:</span>
                <span>Bs. ${(Number(selectedSale.total) * exchangeRate).toFixed(2)}</span>
              </div>
            ` : ''}
          </div>
        </div>
        ${selectedSale.notas ? `<div class="notes"><strong>Notas:</strong> ${selectedSale.notas}</div>` : ''}
        <div class="footer">
          <p class="thanks">¡Gracias por su compra!</p>
          <p>Este documento es un comprobante de venta</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  const exportReportPDF = () => {
    if (!dateRange.desde || !dateRange.hasta) {
      toast.error('Selecciona un rango de fechas (Desde y Hasta) para exportar el reporte');
      return;
    }

    const d1 = new Date(dateRange.desde);
    const d2 = new Date(dateRange.hasta);
    const diffTime = d2 - d1;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (diffDays < 1) {
      toast.error('La fecha "Hasta" debe ser posterior o igual a "Desde"');
      return;
    }

    if (diffDays > 31) {
      toast.error(`El rango no puede superar 31 días. Rango seleccionado: ${diffDays} días.`);
      return;
    }

    const totalUSD = sales.reduce((acc, s) => acc + Number(s.total), 0);
    const totalVES = totalUSD * (exchangeRate || 1);

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte de Ventas PDF</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 25px; color: #1f2937; }
          .header { text-align: center; border-bottom: 2px solid #1f2937; padding-bottom: 12px; margin-bottom: 20px; }
          .header h1 { font-size: 22px; color: #111; margin-bottom: 4px; }
          .header p { font-size: 12px; color: #555; margin: 2px 0; }
          .title-box { background: #f3f4f6; padding: 12px; border-radius: 6px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .title-box h2 { font-size: 16px; color: #111827; }
          .title-box p { font-size: 12px; color: #4b5563; }
          .summary { display: flex; gap: 15px; margin-bottom: 20px; }
          .summary-card { flex: 1; border: 1px solid #e5e7eb; padding: 12px; border-radius: 6px; background: #fafafa; text-align: center; }
          .summary-card .label { font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: bold; }
          .summary-card .val { font-size: 18px; font-weight: bold; color: #111827; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background-color: #1f2937; color: white; padding: 8px 10px; text-align: left; font-size: 12px; }
          td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
          .text-right { text-align: right; }
          .footer { text-align: center; border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 30px; font-size: 11px; color: #9ca3af; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${settings.business_name || 'Mi Emprendimiento'}</h1>
          ${settings.business_rif ? `<p><strong>RIF:</strong> ${settings.business_rif}</p>` : ''}
          ${settings.business_address ? `<p>${settings.business_address}</p>` : ''}
        </div>

        <div class="title-box">
          <div>
            <h2>REPORTE DE VENTAS</h2>
            <p>Período: <strong>${dateRange.desde}</strong> al <strong>${dateRange.hasta}</strong> (${diffDays} días)</p>
          </div>
          <p>Generado: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}</p>
        </div>

        <div class="summary">
          <div class="summary-card">
            <div class="label">Total Ventas</div>
            <div class="val">${sales.length}</div>
          </div>
          <div class="summary-card">
            <div class="label">Total USD</div>
            <div class="val" style="color:#2563eb;">$${totalUSD.toFixed(2)}</div>
          </div>
          ${exchangeRate > 0 ? `
            <div class="summary-card">
              <div class="label">Total VES (Bs.)</div>
              <div class="val" style="color:#059669;">Bs. ${totalVES.toFixed(2)}</div>
            </div>
          ` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th># Venta</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Vendedor</th>
              <th class="text-right">Total USD</th>
              ${exchangeRate > 0 ? `<th class="text-right">Total VES</th>` : ''}
            </tr>
          </thead>
          <tbody>
            ${sales.length > 0 ? sales.map(s => `
              <tr>
                <td>#${String(s.id).padStart(6, '0')}</td>
                <td>${new Date(s.fecha).toLocaleDateString('es-ES')}</td>
                <td>${s.cliente_nombre || 'Consumidor Final'}</td>
                <td>${s.usuario_nombre || 'Admin'}</td>
                <td class="text-right"><strong>$${Number(s.total).toFixed(2)}</strong></td>
                ${exchangeRate > 0 ? `<td class="text-right">Bs. ${(Number(s.total) * exchangeRate).toFixed(2)}</td>` : ''}
              </tr>
            `).join('') : `<tr><td colspan="6" style="text-align:center;">No hay ventas registradas en este período</td></tr>`}
          </tbody>
        </table>

        <div class="footer">
          <p>Reporte generado automáticamente por el Sistema Administrativo</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  const columns = [
    { key: 'id', label: '#' },
    { key: 'fecha', label: 'Fecha', render: (row) => new Date(row.fecha).toLocaleDateString('es-ES') },
    { key: 'cliente', label: 'Cliente', render: (row) => row.cliente_nombre || 'Consumidor Final' },
    { key: 'usuario', label: 'Vendedor', render: (row) => row.usuario_nombre },
    { key: 'total', label: 'Total', render: (row) => `$${Number(row.total).toFixed(2)}` },
    { 
      key: 'acciones', 
      label: 'Acciones',
      render: (row) => (
        <div className="flex items-center space-x-3">
          <button onClick={() => viewDetails(row)} className="text-indigo-600 hover:text-indigo-900 inline-flex items-center text-sm">
            <FiEye className="mr-1" /> Ver
          </button>
          <button onClick={() => viewInvoice(row)} className="text-green-600 hover:text-green-900 inline-flex items-center text-sm">
            <FiPrinter className="mr-1" /> Factura
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
        <Link to="/ventas/nueva">
          <Button><FiPlus className="mr-2" /> Nueva Venta</Button>
        </Link>
      </div>

      <div className="flex flex-wrap bg-white p-4 rounded-lg shadow-sm gap-4 items-end justify-between">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input type="date" value={dateRange.desde} onChange={e => setDateRange({...dateRange, desde: e.target.value})} className="border border-gray-300 rounded-md p-2 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input type="date" value={dateRange.hasta} onChange={e => setDateRange({...dateRange, hasta: e.target.value})} className="border border-gray-300 rounded-md p-2 sm:text-sm" />
          </div>
          <Button variant="secondary" onClick={() => setDateRange({desde: '', hasta: ''})}>Limpiar</Button>
        </div>

        <div>
          <Button onClick={exportReportPDF} variant="secondary" className="border-indigo-500 text-indigo-600 hover:bg-indigo-50">
            <FiDownload className="mr-2" /> Exportar Reporte PDF (Máx 31 días)
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <Table columns={columns} data={sales} />
      )}

      {/* Detail Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Detalle de Venta #${selectedSale?.id}`}>
        {selectedSale && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded">
              <div><span className="font-semibold text-gray-600">Fecha:</span> {new Date(selectedSale.fecha).toLocaleString('es-ES')}</div>
              <div><span className="font-semibold text-gray-600">Cliente:</span> {selectedSale.cliente_nombre || 'Consumidor Final'}</div>
              <div><span className="font-semibold text-gray-600">Vendedor:</span> {selectedSale.usuario_nombre}</div>
              {selectedSale.notas && <div className="col-span-2"><span className="font-semibold text-gray-600">Notas:</span> {selectedSale.notas}</div>}
            </div>
            
            <h4 className="font-medium">Productos</h4>
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Producto</th>
                    <th className="px-4 py-2 text-right">Cant.</th>
                    <th className="px-4 py-2 text-right">P. Unit</th>
                    <th className="px-4 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedSale.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2">{item.producto_nombre}</td>
                      <td className="px-4 py-2 text-right">{item.cantidad}</td>
                      <td className="px-4 py-2 text-right">${Number(item.precio_unitario).toFixed(2)}</td>
                      <td className="px-4 py-2 text-right">${Number(item.subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-end pt-4 space-y-1">
              {Number(selectedSale.descuento) > 0 && (
                <div className="text-sm text-gray-500">Descuento: ${Number(selectedSale.descuento).toFixed(2)}</div>
              )}
              <div className="text-xl font-bold">Total: ${Number(selectedSale.total).toFixed(2)}</div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => { setIsModalOpen(false); setShowInvoice(true); }} variant="secondary">
                <FiPrinter className="mr-2" /> Ver Factura
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Invoice Modal */}
      <Modal isOpen={showInvoice} onClose={() => setShowInvoice(false)} title="Factura">
        {selectedSale && (
          <div>
            <div ref={invoiceRef}>
              <Invoice 
                sale={selectedSale} 
                businessName={settings.business_name}
                businessRif={settings.business_rif}
                businessAddress={settings.business_address}
                exchangeRate={exchangeRate} 
              />
            </div>
            <div className="flex justify-center gap-4 pt-4 border-t mt-4">
              <Button onClick={printInvoice}>
                <FiPrinter className="mr-2" /> Imprimir / Guardar PDF
              </Button>
              <Button variant="secondary" onClick={() => setShowInvoice(false)}>Cerrar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Sales;
