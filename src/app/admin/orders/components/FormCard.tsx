import React from 'react';
import { AdminFormSummary } from '@/hooks/useAdminForms';

interface FormCardProps {
  form: AdminFormSummary;
  onCardClick: (formId: string) => void;
}

const FormCard: React.FC<FormCardProps> = ({ form, onCardClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      case 'processing': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'In attesa';
      case 'completed': return 'Completato';
      case 'cancelled': return 'Annullato';
      case 'processing': return 'In elaborazione';
      default: return status;
    }
  };

  return (
    <div 
      className="bg-white border border-olive/10 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onCardClick(form.id)}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-olive text-lg">
            {form.orderId}
          </h3>
          <p className="text-xs text-nocciola">#{form.id.slice(-8)}</p>
        </div>
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(form.status)}`}>
          {getStatusText(form.status)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-sm text-nocciola">Cliente:</span>
          <span className="text-sm font-medium text-gray-900">{form.customerName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-nocciola">Email:</span>
          <span className="text-sm text-gray-900">{form.customerEmail}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-nocciola">Telefono:</span>
          <span className="text-sm text-gray-900">{form.phone}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-nocciola">Provincia:</span>
          <span className="text-sm text-gray-900">{form.province}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-nocciola">Prodotti:</span>
          <span className="text-sm text-gray-900">{form.itemCount}</span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-olive/10">
        <div className="text-sm text-nocciola">
          {new Date(form.created).toLocaleDateString('it-IT')} - {' '}
          {new Date(form.created).toLocaleTimeString('it-IT', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCardClick(form.id);
          }}
          className="text-olive hover:text-salvia font-medium text-sm cursor-pointer"
        >
          Dettagli →
        </button>
      </div>
    </div>
  );
};

export default FormCard;