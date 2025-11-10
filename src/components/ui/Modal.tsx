'use client';

import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Conferma',
  cancelText = 'Annulla',
  type = 'info',
  loading = false,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      icon: '🗑️',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      confirmBg: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: '⚠️',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      confirmBg: 'bg-amber-600 hover:bg-amber-700',
    },
    info: {
      icon: 'ℹ️',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      confirmBg: 'bg-olive hover:bg-salvia',
    },
  };

  const style = typeStyles[type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex items-center justify-center pt-6">
          <div
            className={`w-16 h-16 rounded-full ${style.iconBg} flex items-center justify-center`}
          >
            <span className="text-3xl">{style.icon}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-3 ${style.confirmBg} text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? 'Elaborazione...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
