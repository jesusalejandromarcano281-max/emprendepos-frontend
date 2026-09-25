import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiTrendingDown } from 'react-icons/fi';
import api from '../api/axios';

const PriceComparison = () => {
  const [comparisons, setComparisons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComparisons = async () => {
      try {
        const res = await api.get('/suppliers/compare');
        // Expected data format:
        // [
        //   {
        //     product_id: 1,
        //     product_name: "Producto A",
        //     internal_cost: 10.50,
        //     quotes: [
        //       { supplier_name: "Proveedor 1", price: 12.00 },
        //       { supplier_name: "Proveedor 2", price: 9.50 }
        //     ]
        //   }
        // ]
        setComparisons(res.data);
      } catch (error) {
        toast.error('Error al cargar comparativa de precios');
      } finally {
        setLoading(false);
      }
    };
    fetchComparisons();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FiTrendingDown className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Comparador de Precios</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {comparisons.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay datos de cotizaciones para comparar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Costo Interno Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cotizaciones (Proveedor - Precio)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comparisons.map((item, idx) => {
                  // Find minimum quote price
                  let minPrice = Infinity;
                  if (item.quotes && item.quotes.length > 0) {
                    minPrice = Math.min(...item.quotes.map(q => Number(q.price)));
                  }

                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.product_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${Number(item.internal_cost || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {(!item.quotes || item.quotes.length === 0) ? (
                          <span className="text-gray-400 italic">Sin cotizaciones</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {item.quotes.map((quote, qIdx) => {
                              const isLowest = Number(quote.price) === minPrice;
                              return (
                                <span 
                                  key={qIdx} 
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                    ${isLowest ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}
                                >
                                  {quote.supplier_name}: ${Number(quote.price).toFixed(2)}
                                  {isLowest && <FiTrendingDown className="ml-1 w-3 h-3 text-green-600" />}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceComparison;
