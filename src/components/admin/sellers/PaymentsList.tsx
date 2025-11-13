import { Payment } from '@/types/sellerTypes';

interface PaymentsListProps {
  payments: Payment[];
  onDelete: (paymentId: string) => void;
  formatCurrency: (cents: number) => string;
  formatDate: (date: Date | string) => string;
}

export default function PaymentsList({
  payments,
  onDelete,
  formatCurrency,
  formatDate
}: PaymentsListProps) {
  if (payments.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">Nessun pagamento registrato</p>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((payment: Payment) => (
        <div
          key={payment._id?.toString()}
          className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(payment.amount)}
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(payment.date)}
              </div>
            </div>
            {payment.notes && (
              <div className="text-sm text-gray-600 mt-1">{payment.notes}</div>
            )}
          </div>
          <button
            onClick={() => onDelete(payment._id!.toString())}
            className="text-red-600 hover:text-red-800 cursor-pointer px-3 py-1"
          >
            Elimina
          </button>
        </div>
      ))}
    </div>
  );
}
