import { CustomerWithOrders } from '@/types/customerTypes';
import { formatDate, getCustomerSourceLabel } from '@/utils/formatters';

interface CustomerInfoProps {
  customer: CustomerWithOrders;
  isEditing: boolean;
  formData: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  onFormChange: (field: string, value: string) => void;
}

export default function CustomerInfo({
  customer,
  isEditing,
  formData,
  onFormChange,
}: CustomerInfoProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Informazioni Cliente</h2>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => onFormChange('firstName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cognome</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => onFormChange('lastName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => onFormChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive focus:border-transparent"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="text-sm font-medium">{customer.email}</p>
          </div>
          {customer.phone && (
            <div>
              <p className="text-xs text-gray-500">Telefono</p>
              <p className="text-sm font-medium">{customer.phone}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500">Registrato il</p>
            <p className="text-sm font-medium">{formatDate(customer.metadata.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Fonte</p>
            <p className="text-sm font-medium">
              {getCustomerSourceLabel(customer.metadata.source)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
