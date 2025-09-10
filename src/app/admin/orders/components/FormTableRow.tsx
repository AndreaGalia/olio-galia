import React from 'react';
import { AdminFormSummary } from '@/hooks/useAdminForms';

interface FormTableRowProps {
  form: AdminFormSummary;
  onRowClick: (formId: string) => void;
}

const FormTableRow: React.FC<FormTableRowProps> = ({ form, onRowClick }) => {
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
    <tr 
      className="border-b border-olive/5 hover:bg-olive/5 cursor-pointer transition-colors"
      onClick={() => onRowClick(form.id)}
    >
      <td className="py-4 px-6">
        <div className="font-medium text-olive">
          {form.orderId}
        </div>
        <div className="text-xs text-nocciola">
          #{form.id.slice(-8)}
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="font-medium text-gray-900">{form.customerName}</div>
      </td>
      <td className="py-4 px-6">
        <div className="text-sm text-gray-900">{form.customerEmail}</div>
      </td>
      <td className="py-4 px-6">
        <div className="text-sm text-gray-900">{form.phone}</div>
      </td>
      <td className="py-4 px-6">
        <div className="text-sm text-gray-900">{form.province}</div>
      </td>
      <td className="py-4 px-6">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(form.status)}`}>
          {getStatusText(form.status)}
        </span>
      </td>
      <td className="py-4 px-6">
        <div className="text-sm text-gray-900">
          {new Date(form.created).toLocaleDateString('it-IT')}
        </div>
        <div className="text-xs text-nocciola">
          {new Date(form.created).toLocaleTimeString('it-IT', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </td>
      <td className="py-4 px-6">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRowClick(form.id);
          }}
          className="text-olive hover:text-salvia font-medium text-sm"
        >
          Dettagli
        </button>
      </td>
    </tr>
  );
};

export default FormTableRow;