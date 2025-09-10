import StatusBadge from './StatusBadge';

interface Order {
  id: string;
  paymentIntent: string | null;
  customerName: string;
  customerEmail: string;
  total: number;
  paymentStatus: string;
  shippingStatus: string;
  created: string;
}

interface OrderTableRowProps {
  order: Order;
  onRowClick: (orderId: string) => void;
}

export default function OrderTableRow({ order, onRowClick }: OrderTableRowProps) {
  return (
    <tr 
      className="border-b border-olive/5 hover:bg-olive/5 cursor-pointer transition-colors"
      onClick={() => onRowClick(order.id)}
    >
      <td className="py-4 px-6 text-sm font-mono text-nocciola">
        #{order.paymentIntent?.slice(-8) || 'N/D'}
      </td>
      <td className="py-4 px-6 text-olive font-medium">
        {order.customerName}
      </td>
      <td className="py-4 px-6 text-nocciola">
        {order.customerEmail}
      </td>
      <td className="py-4 px-6 text-olive font-semibold">
        €{order.total.toFixed(2)}
      </td>
      <td className="py-4 px-6">
        <StatusBadge status={order.paymentStatus} type="payment" />
      </td>
      <td className="py-4 px-6">
        <StatusBadge status={order.shippingStatus} type="shipping" />
      </td>
      <td className="py-4 px-6 text-nocciola text-sm">
        {new Date(order.created).toLocaleDateString('it-IT')}
      </td>
      <td className="py-4 px-6">
        <svg className="w-5 h-5 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </td>
    </tr>
  );
}