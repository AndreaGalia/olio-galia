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

interface OrderCardProps {
  order: Order;
  onCardClick: (orderId: string) => void;
}

export default function OrderCard({ order, onCardClick }: OrderCardProps) {
  return (
    <div 
      className="p-6 border-b border-olive/5 last:border-b-0 cursor-pointer hover:bg-olive/5 transition-colors"
      onClick={() => onCardClick(order.id)}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-olive">{order.customerName}</p>
          <p className="text-sm text-nocciola">{order.customerEmail}</p>
        </div>
        <div className="flex flex-col gap-1">
          <StatusBadge status={order.paymentStatus} type="payment" />
          <StatusBadge status={order.shippingStatus} type="shipping" />
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-3">
        <span className="text-olive font-semibold">€{order.total.toFixed(2)}</span>
        <span className="text-sm text-nocciola">
          {new Date(order.created).toLocaleDateString('it-IT')}
        </span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm font-mono text-nocciola">
          #{order.paymentIntent?.slice(-8) || 'N/D'}
        </span>
        <div className="text-olive flex items-center text-sm">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Dettagli
        </div>
      </div>
    </div>
  );
}