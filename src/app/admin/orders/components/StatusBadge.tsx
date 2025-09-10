interface StatusBadgeProps {
  status: string;
  type: 'payment' | 'shipping';
}

export default function StatusBadge({ status, type }: StatusBadgeProps) {
  if (type === 'payment') {
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        status === 'paid'
          ? 'bg-green-100 text-green-800'
          : 'bg-yellow-100 text-yellow-800'
      }`}>
        {status === 'paid' ? 'Pagato' : 'Non Pagato'}
      </span>
    );
  }

  const statusConfig = {
    pending: { label: 'In Attesa', color: 'bg-yellow-100 text-yellow-800' },
    shipping: { label: 'Spedizione', color: 'bg-blue-100 text-blue-800' },
    shipped: { label: 'Spedito', color: 'bg-green-100 text-green-800' },
    delivered: { label: 'Consegnato', color: 'bg-purple-100 text-purple-800' },
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || 
                 { label: 'Sconosciuto', color: 'bg-gray-100 text-gray-800' };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}