'use client';

import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type,
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-400',
      text: 'text-green-800',
      icon: '✓',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-400',
      text: 'text-red-800',
      icon: '✕',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-400',
      text: 'text-amber-800',
      icon: '⚠',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-400',
      text: 'text-blue-800',
      icon: 'ℹ',
    },
  };

  const style = styles[type];

  return (
    <div
      className={`${style.bg} border-l-4 ${style.border} p-4 rounded-lg shadow-lg mb-3 animate-slide-in-right`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 w-6 h-6 rounded-full ${style.bg} ${style.text} flex items-center justify-center font-bold`}
        >
          {style.icon}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${style.text}`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${style.text} hover:opacity-70 transition-opacity`}
          aria-label="Chiudi"
        >
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
