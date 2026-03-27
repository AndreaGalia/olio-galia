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

const inputClass = "w-full p-3 border border-black/15 bg-transparent text-sm text-black placeholder-black/30 focus:border-black/40 focus:outline-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

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
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          name="firstName"
          placeholder={t.torinoCheckout.modal.form.firstName}
          value={formData.firstName}
          onChange={handleChange}
          disabled={isLoading}
          required
          className={inputClass}
        />
        <input
          type="text"
          name="lastName"
          placeholder={t.torinoCheckout.modal.form.lastName}
          value={formData.lastName}
          onChange={handleChange}
          disabled={isLoading}
          required
          className={inputClass}
        />
      </div>

      <input
        type="text"
        name="address"
        placeholder={t.torinoCheckout.modal.form.address}
        value={formData.address}
        onChange={handleChange}
        disabled={isLoading}
        required
        className={inputClass}
      />

      <input
        type="email"
        name="email"
        placeholder={t.torinoCheckout.modal.form.email}
        value={formData.email}
        onChange={handleChange}
        disabled={isLoading}
        required
        className={inputClass}
      />

      <input
        type="tel"
        name="phone"
        placeholder={t.torinoCheckout.modal.form.phone}
        value={formData.phone}
        onChange={handleChange}
        disabled={isLoading}
        required
        className={inputClass}
      />

      <input
        type="text"
        name="province"
        value={formData.province}
        disabled
        className="w-full p-3 border border-black/10 bg-black/[0.02] text-sm text-black/30 cursor-not-allowed"
      />

      <div className="flex gap-3 pt-4 border-t border-black/10">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 py-4 border border-black/15 text-black text-[11px] tracking-[0.25em] uppercase transition-all duration-300 cursor-pointer hover:border-black/30 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t.torinoCheckout.modal.form.buttons.cancel}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-4 bg-sabbia text-black text-[11px] tracking-[0.25em] uppercase transition-all duration-300 cursor-pointer hover:bg-olive hover:text-beige disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading
            ? t.torinoCheckout.modal.form.buttons.submitting
            : t.torinoCheckout.modal.form.buttons.submit}
        </button>
      </div>
    </form>
  );
}
