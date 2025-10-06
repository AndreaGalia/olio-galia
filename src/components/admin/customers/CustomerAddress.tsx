import { CustomerWithOrders } from '@/types/customerTypes';

interface CustomerAddressProps {
  customer: CustomerWithOrders;
  isEditing: boolean;
  formData: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    province: string;
  };
  onFormChange: (field: string, value: string) => void;
}

export default function CustomerAddress({
  customer,
  isEditing,
  formData,
  onFormChange,
}: CustomerAddressProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Indirizzo</h2>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Via</label>
            <input
              type="text"
              value={formData.street}
              onChange={(e) => onFormChange('street', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CAP</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => onFormChange('postalCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Città</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => onFormChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
            <input
              type="text"
              value={formData.province}
              onChange={(e) => onFormChange('province', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paese</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => onFormChange('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive focus:border-transparent"
            />
          </div>
        </div>
      ) : (
        <>
          {customer.address ? (
            <div className="space-y-1 text-sm">
              <p>{customer.address.street}</p>
              <p>{customer.address.postalCode} {customer.address.city}</p>
              {customer.address.province && <p>{customer.address.province}</p>}
              <p>{customer.address.country}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Nessun indirizzo disponibile</p>
          )}
        </>
      )}
    </div>
  );
}
