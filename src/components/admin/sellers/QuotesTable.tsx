import { useRouter } from 'next/navigation';
import { QuoteDetail } from '@/types/sellerTypes';

interface QuotesTableProps {
  quotes: QuoteDetail[];
  formatCurrency: (cents: number) => string;
  formatDate: (date: Date | string) => string;
}

export default function QuotesTable({
  quotes,
  formatCurrency,
  formatDate
}: QuotesTableProps) {
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confermato: 'bg-green-100 text-green-800',
      completato: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (quotes.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">Nessun preventivo associato</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-beige">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">ID Ordine</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Cliente</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Totale</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Commissione</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Stato</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Data</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Azioni</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {quotes.map((quote: QuoteDetail) => (
            <tr key={quote._id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-900 font-mono">{quote.orderId}</td>
              <td className="px-4 py-3">
                <div className="text-sm text-gray-900">{quote.customerName}</div>
                <div className="text-xs text-gray-500">{quote.customerEmail}</div>
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {formatCurrency(quote.total)}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-olive">
                {formatCurrency(quote.commission)}
              </td>
              <td className="px-4 py-3">{getStatusBadge(quote.status)}</td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {formatDate(quote.createdAt)}
              </td>
              <td className="px-4 py-3 text-right text-sm">
                <button
                  onClick={() => router.push(`/admin/forms/${quote._id}`)}
                  className="text-olive hover:text-salvia cursor-pointer"
                >
                  Dettagli →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
