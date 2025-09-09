"use client";

import { useState } from "react";
import { useT } from "@/hooks/useT";

interface TorinoFormData {
  firstName: string;
  lastName: string;
  address: string;
  email: string;
  phone: string;
  province: string;
  cart?: { id: string; quantity: number }[];
}

interface TorinoFormProps {
  onSubmit: (data: TorinoFormData) => void;
  cart: { id: string; quantity: number }[];
  isLoading?: boolean;
  onCancel: () => void;
}

export default function TorinoForm({ onSubmit, cart, isLoading = false, onCancel }: TorinoFormProps) {
  const { t } = useT();
  
  const [formData, setFormData] = useState<TorinoFormData>({
    firstName: "",
    lastName: "",
    address: "",
    email: "",
    phone: "",
    province: t.torinoCheckout.modal.form.province,
    cart: cart,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="group">
          <input
            type="text"
            name="firstName"
            placeholder={t.torinoCheckout.modal.form.firstName}
            value={formData.firstName}
            onChange={handleChange}
            disabled={isLoading}
            required
            className="p-3 border-2 border-nocciola/30 rounded-xl w-full bg-white/80 focus:border-olive focus:bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-olive/20 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div className="group">
          <input
            type="text"
            name="lastName"
            placeholder={t.torinoCheckout.modal.form.lastName}
            value={formData.lastName}
            onChange={handleChange}
            disabled={isLoading}
            required
            className="p-3 border-2 border-nocciola/30 rounded-xl w-full bg-white/80 focus:border-olive focus:bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-olive/20 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <input
        type="text"
        name="address"
        placeholder={t.torinoCheckout.modal.form.address}
        value={formData.address}
        onChange={handleChange}
        disabled={isLoading}
        required
        className="p-3 border-2 border-nocciola/30 rounded-xl w-full bg-white/80 focus:border-olive focus:bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-olive/20 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
      />

      <input
        type="email"
        name="email"
        placeholder={t.torinoCheckout.modal.form.email}
        value={formData.email}
        onChange={handleChange}
        disabled={isLoading}
        required
        className="p-3 border-2 border-nocciola/30 rounded-xl w-full bg-white/80 focus:border-olive focus:bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-olive/20 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
      />

      <input
        type="tel"
        name="phone"
        placeholder={t.torinoCheckout.modal.form.phone}
        value={formData.phone}
        onChange={handleChange}
        disabled={isLoading}
        required
        className="p-3 border-2 border-nocciola/30 rounded-xl w-full bg-white/80 focus:border-olive focus:bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-olive/20 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
      />

      <div className="relative">
        <input
          type="text"
          name="province"
          value={formData.province}
          disabled
          className="p-3 border-2 border-nocciola/20 rounded-xl w-full bg-nocciola/10 text-gray-600 cursor-not-allowed"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-nocciola/30">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-white border-2 border-nocciola/30 text-gray-700 font-medium hover:bg-nocciola/10 hover:border-nocciola/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t.torinoCheckout.modal.form.buttons.cancel}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 sm:px-8 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-olive to-salvia text-beige font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
              {t.torinoCheckout.modal.form.buttons.submitting}
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
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
              {t.torinoCheckout.modal.form.buttons.submit}
            </>
          )}
        </button>
      </div>
    </form>
  );
}