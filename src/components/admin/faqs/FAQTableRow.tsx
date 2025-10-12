'use client';

import { FAQDocument } from '@/types/faq';

interface FAQTableRowProps {
  faq: FAQDocument;
  onEdit: (id: string) => void;
  onDelete: (faq: FAQDocument) => void;
  onToggleActive: (id: string) => void;
  labels: {
    active: string;
    inactive: string;
    editTooltip: string;
    deleteTooltip: string;
  };
}

export default function FAQTableRow({
  faq,
  onEdit,
  onDelete,
  onToggleActive,
  labels,
}: FAQTableRowProps) {
  const faqId = faq._id?.toString() || '';

  return (
    <tr className="hover:bg-olive/5 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        #{faq.order}
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        <div className="max-w-md">
          <p className="font-medium">{faq.translations.it.question}</p>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {faq.translations.it.answer}
          </p>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <span className="px-2 py-1 bg-olive/10 text-olive rounded-md text-xs">
          {faq.translations.it.category}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <button
          onClick={() => onToggleActive(faqId)}
          className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
            faq.metadata.isActive
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          {faq.metadata.isActive ? labels.active : labels.inactive}
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => onEdit(faqId)}
            className="text-olive hover:text-salvia transition-colors cursor-pointer"
            title={labels.editTooltip}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(faq)}
            className="text-red-600 hover:text-red-800 transition-colors cursor-pointer"
            title={labels.deleteTooltip}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}
