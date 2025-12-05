'use client';

import { useState } from 'react';
import { DEFAULT_TEMPLATES, TEMPLATE_PLACEHOLDERS } from '@/types/whatsapp';

interface WhatsAppTemplateEditorProps {
  templates: {
    orderConfirmation: string;
    shippingUpdate: string;
    deliveryConfirmation: string;
    reviewRequest: string;
  };
  onChange: (templates: any) => void;
  disabled?: boolean;
}

export default function WhatsAppTemplateEditor({
  templates,
  onChange,
  disabled = false
}: WhatsAppTemplateEditorProps) {
  const [activeTab, setActiveTab] = useState<keyof typeof templates>('orderConfirmation');

  const templateInfo = {
    orderConfirmation: {
      label: 'Conferma Ordine',
      description: 'Messaggio inviato dopo pagamento completato',
      icon: '🎉'
    },
    shippingUpdate: {
      label: 'Aggiornamento Spedizione',
      description: 'Notifica quando ordine viene spedito',
      icon: '📦'
    },
    deliveryConfirmation: {
      label: 'Conferma Consegna',
      description: 'Messaggio quando ordine arriva a destinazione',
      icon: '✅'
    },
    reviewRequest: {
      label: 'Richiesta Recensione',
      description: 'Chiedi recensione dopo consegna',
      icon: '⭐'
    }
  };

  const handleTemplateChange = (key: keyof typeof templates, value: string) => {
    onChange({
      ...templates,
      [key]: value
    });
  };

  const handleReset = (key: keyof typeof templates) => {
    if (confirm('Vuoi ripristinare il template predefinito? Le modifiche andranno perse.')) {
      handleTemplateChange(key, DEFAULT_TEMPLATES[key]);
    }
  };

  const currentPlaceholders = TEMPLATE_PLACEHOLDERS[activeTab];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="border-b border-olive/20">
        <div className="flex flex-wrap gap-2 -mb-px">
          {(Object.keys(templateInfo) as Array<keyof typeof templateInfo>).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === key
                  ? 'border-olive text-olive'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{templateInfo[key].icon}</span>
              {templateInfo[key].label}
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {templateInfo[activeTab].icon} {templateInfo[activeTab].label}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {templateInfo[activeTab].description}
            </p>
          </div>
          <button
            onClick={() => handleReset(activeTab)}
            disabled={disabled}
            className="px-3 py-1 text-sm text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ripristina Default
          </button>
        </div>

        {/* Placeholder Info */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            📝 Placeholder Disponibili:
          </h4>
          <div className="flex flex-wrap gap-2">
            {currentPlaceholders.map((placeholder) => (
              <code
                key={placeholder}
                className="px-2 py-1 bg-white border border-blue-300 rounded text-xs text-blue-700 font-mono"
              >
                {placeholder}
              </code>
            ))}
          </div>
          <p className="text-xs text-blue-700 mt-2">
            Questi placeholder verranno sostituiti automaticamente con i dati reali del cliente
          </p>
        </div>

        {/* Template Textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contenuto Template
          </label>
          <textarea
            value={templates[activeTab]}
            onChange={(e) => handleTemplateChange(activeTab, e.target.value)}
            disabled={disabled}
            rows={15}
            className="w-full px-4 py-3 border border-olive/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive/50 font-mono text-sm disabled:opacity-50 disabled:bg-gray-50"
            placeholder="Scrivi il template del messaggio qui..."
          />
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>{templates[activeTab].length} caratteri</span>
            <span>Usa *testo* per grassetto, _testo_ per corsivo</span>
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-sm font-medium text-green-900 mb-3 flex items-center">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Anteprima (con dati esempio)
          </h4>
          <div className="p-3 bg-white rounded-lg border border-green-300 whitespace-pre-wrap text-sm font-sans">
            {templates[activeTab]
              .replace(/{customerName}/g, 'Mario Rossi')
              .replace(/{orderId}/g, 'AB123456')
              .replace(/{total}/g, '€45,00')
              .replace(/{items}/g, '• Olio EVO 500ml x2\n• Olio Piccante 250ml x1')
              .replace(/{carrier}/g, 'GLS')
              .replace(/{trackingNumber}/g, '1234567890')
              .replace(/{feedbackUrl}/g, 'https://oliogalia.com/feedback/abc123')}
          </div>
        </div>
      </div>
    </div>
  );
}
