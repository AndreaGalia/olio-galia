'use client';

import { useState } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, date: Date, notes?: string) => Promise<void>;
  isSubmitting: boolean;
}

export default function PaymentModal({ isOpen, onClose, onSubmit, isSubmitting }: PaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError('');

    if (!amount || parseFloat(amount) <= 0) {
      setError('Inserisci un importo valido');
      return;
    }

    try {
      await onSubmit(parseFloat(amount) * 100, new Date(date), notes || undefined);
      // Reset form
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    } catch (err) {
      setError('Errore durante l\'aggiunta del pagamento');
    }
  };

  const handleClose = () => {
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-in">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Aggiungi Pagamento</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Importo (€) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive focus:border-transparent"
              placeholder="100.00"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive focus:border-transparent"
              rows={3}
              placeholder="Note opzionali sul pagamento..."
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            disabled={isSubmitting}
          >
            Annulla
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Aggiunta...' : 'Aggiungi'}
          </button>
        </div>
      </div>
    </div>
  );
}
