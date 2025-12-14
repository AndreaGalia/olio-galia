"use client";

import { useState } from "react";

interface PreventivoFormData {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  cap: string;
  province: string;
  email: string;
  phone: string;
  notes?: string;
  cart?: { id: string; quantity: number }[];
}

interface PreventivoFormProps {
  onSubmit: (data: PreventivoFormData) => void;
  cart: { id: string; quantity: number }[];
  isLoading?: boolean;
  onCancel: () => void;
}

export default function PreventivoForm({ onSubmit, cart, isLoading = false, onCancel }: PreventivoFormProps) {
  const [formData, setFormData] = useState<PreventivoFormData>({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    cap: "",
    province: "",
    email: "",
    phone: "",
    notes: "",
    cart: cart,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nome e Cognome */}
      <div className="grid grid-cols-2 gap-4">
        <div className="group">
          <input
            type="text"
            name="firstName"
            placeholder="Nome *"
            value={formData.firstName}
            onChange={handleChange}
            disabled={isLoading}
            required
            className="p-3 border-2 border-nocciola/30 w-full bg-white/80 focus:border-olive focus:bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-olive/20 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div className="group">
          <input
            type="text"
            name="lastName"
            placeholder="Cognome *"
            value={formData.lastName}
            onChange={handleChange}
            disabled={isLoading}
            required
            className="p-3 border-2 border-nocciola/30 w-full bg-white/80 focus:border-olive focus:bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-olive/20 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Indirizzo */}
      <input
        type="text"
        name="address"
        placeholder="Indirizzo (Via, n. civico) *"
        value={formData.address}
        onChange={handleChange}
        disabled={isLoading}
        required
        className="p-3 border-2 border-nocciola/30 w-full bg-white/80 focus:border-olive focus:bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-olive/20 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
      />

      {/* Città, CAP, Provincia */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1">
          <input
            type="text"
            name="city"
            placeholder="Città *"
            value={formData.city}
            onChange={handleChange}
            disabled={isLoading}
            required
            className="p-3 border-2 border-nocciola/30 w-full bg-white/80 focus:border-olive focus:bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-olive/20 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div className="sm:col-span-1">
          <input
            type="text"
            name="cap"
            placeholder="CAP *"
            value={formData.cap}
            onChange={handleChange}
            disabled={isLoading}
            required
            maxLength={5}
            pattern="[0-9]{5}"
            className="p-3 border-2 border-nocciola/30 w-full bg-white/80 focus:border-olive focus:bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-olive/20 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div className="sm:col-span-1">
          <input
            type="text"
            name="province"
            placeholder="Provincia *"
            value={formData.province}
            onChange={handleChange}
            disabled={isLoading}
            required
            maxLength={2}
            className="p-3 border-2 border-nocciola/30 w-full bg-white/80 focus:border-olive focus:bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-olive/20 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            style={{ textTransform: 'uppercase' }}
          />
        </div>
      </div>

      {/* Email */}
      <input
        type="email"
        name="email"
        placeholder="Email *"
        value={formData.email}
        onChange={handleChange}
        disabled={isLoading}
        required
        className="p-3 border-2 border-nocciola/30 w-full bg-white/80 focus:border-olive focus:bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-olive/20 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
      />

      {/* Telefono */}
      <input
        type="tel"
        name="phone"
        placeholder="Telefono *"
        value={formData.phone}
        onChange={handleChange}
        disabled={isLoading}
        required
        className="p-3 border-2 border-nocciola/30 w-full bg-white/80 focus:border-olive focus:bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-olive/20 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
      />

      {/* Note/Richieste speciali */}
      <div>
        <textarea
          name="notes"
          placeholder="Note o richieste speciali (opzionale)"
          value={formData.notes}
          onChange={handleChange}
          disabled={isLoading}
          rows={3}
          className="p-3 border-2 border-nocciola/30 w-full bg-white/80 focus:border-olive focus:bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-olive/20 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Es: preferenze di consegna, richieste particolari, ecc.
        </p>
      </div>

      {/* Bottoni */}
      <div className="flex justify-end gap-4 pt-6 border-t border-nocciola/30">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-3 sm:px-6 py-2 sm:py-3 bg-white border-2 border-nocciola/30 text-gray-700 font-medium hover:bg-nocciola/10 hover:border-nocciola/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap cursor-pointer uppercase tracking-wider"
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-3 sm:px-8 py-2 sm:py-3 bg-olive text-beige font-semibold transition-all duration-200 flex items-center gap-1 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap cursor-pointer border border-olive/20 uppercase tracking-wider"
        >
          {isLoading ? (
            <>
              <svg className="w-3 h-3 sm:w-4 sm:h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="truncate">Invio in corso...</span>
            </>
          ) : (
            <>
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="truncate">Invia Richiesta</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
