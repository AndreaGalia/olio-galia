import { CustomerWithOrders } from '@/types/customerTypes';
import { formatCurrency } from '@/utils/formatters';

interface CustomerStatsProps {
  customer: CustomerWithOrders;
}

export default function CustomerStats({ customer }: CustomerStatsProps) {
  const totalOrders = customer.orderDetails?.length || 0;
  const totalSpent = customer.orderDetails?.reduce((sum, order) => sum + order.total, 0) || 0;
  const averageOrderValue = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiche</h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Totale Ordini</span>
          <span className="text-lg font-bold text-olive">{totalOrders}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Totale Speso</span>
          <span className="text-lg font-bold text-olive">
            {formatCurrency(totalSpent)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Valore Medio Ordine</span>
          <span className="text-lg font-bold text-salvia">
            {formatCurrency(averageOrderValue)}
          </span>
        </div>
      </div>
    </div>
  );
}
