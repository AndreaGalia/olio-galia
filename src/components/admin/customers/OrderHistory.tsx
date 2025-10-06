import { useRouter } from 'next/navigation';
import { CustomerWithOrders } from '@/types/customerTypes';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/utils/formatters';

interface OrderHistoryProps {
  customer: CustomerWithOrders;
}

export default function OrderHistory({ customer }: OrderHistoryProps) {
  const router = useRouter();

  const handleOrderClick = (orderId: string, type?: 'order' | 'quote') => {
    if (type === 'quote') {
      router.push(`/admin/forms/${orderId}`);
    } else {
      router.push(`/admin/orders/${orderId}`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Storico Ordini ({customer.orderDetails?.length || 0})
      </h2>

      {customer.orderDetails && customer.orderDetails.length > 0 ? (
        <div className="space-y-4">
          {customer.orderDetails.map((order) => (
            <div
              key={order.orderId}
              onClick={() => handleOrderClick(order.orderId, order.type)}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">
                      {order.type === 'quote' ? 'Preventivo' : 'Ordine'} #{order.orderId.slice(-8).toUpperCase()}
                    </p>
                    {order.type === 'quote' && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-800">
                        Preventivo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{formatDate(order.date)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-olive">{formatCurrency(order.total)}</p>
                  <p className="text-xs text-gray-500">
                    {order.items} {order.items === 1 ? 'articolo' : 'articoli'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
                <span className="text-xs text-olive hover:underline cursor-pointer">
                  Dettagli →
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p className="text-gray-500">Nessun ordine effettuato</p>
        </div>
      )}
    </div>
  );
}
