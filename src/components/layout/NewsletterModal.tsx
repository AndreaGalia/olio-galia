"use client";

import { useState } from "react";
import { useT } from "@/hooks/useT";

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewsletterModal({ isOpen, onClose }: NewsletterModalProps) {
  const { t } = useT();
  const [newsletterForm, setNewsletterForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmitNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newsletterForm),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Iscrizione completata con successo!' });
        setNewsletterForm({ email: '', firstName: '', lastName: '', phone: '' });
        // Chiudi modal dopo 3 secondi
        setTimeout(() => {
          onClose();
          setMessage(null);
        }, 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Errore durante l\'iscrizione' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Errore di connessione. Riprova più tardi.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewsletterForm({ email: '', firstName: '', lastName: '', phone: '' });
    setMessage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto border border-olive/20">
        {/* Header */}
        <div className="bg-olive p-4 sm:p-6 text-beige sticky top-0 z-10">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1">
              <h3 className="text-xl sm:text-2xl font-serif mb-1 sm:mb-2">
                {t.footer.newsletterModal.title}
              </h3>
              <p className="text-beige/80 text-xs sm:text-sm leading-relaxed">
                {t.footer.newsletterModal.description}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-beige hover:text-white transition-colors flex-shrink-0 touch-manipulation cursor-pointer"
              aria-label={t.footer.newsletterModal.close}
              type="button"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmitNewsletter} className="p-4 sm:p-6 space-y-4">
          {/* Message Banner */}
          {message && (
            <div
              className={`p-3 sm:p-4 text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              <p className="font-medium">{message.text}</p>
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-olive mb-2">
              {t.footer.newsletterModal.firstName} {t.footer.newsletterModal.required}
            </label>
            <input
              type="text"
              required
              value={newsletterForm.firstName}
              onChange={(e) => setNewsletterForm({ ...newsletterForm, firstName: e.target.value })}
              className="w-full px-4 py-3 sm:py-3.5 border border-gray-300 focus:border-olive focus:ring-2 focus:ring-olive/20 transition-colors text-olive text-base touch-manipulation"
              placeholder={t.footer.newsletterModal.firstNamePlaceholder}
            />
          </div>

          {/* Cognome */}
          <div>
            <label className="block text-sm font-medium text-olive mb-2">
              {t.footer.newsletterModal.lastName} {t.footer.newsletterModal.required}
            </label>
            <input
              type="text"
              required
              value={newsletterForm.lastName}
              onChange={(e) => setNewsletterForm({ ...newsletterForm, lastName: e.target.value })}
              className="w-full px-4 py-3 sm:py-3.5 border border-gray-300 focus:border-olive focus:ring-2 focus:ring-olive/20 transition-colors text-olive text-base touch-manipulation"
              placeholder={t.footer.newsletterModal.lastNamePlaceholder}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-olive mb-2">
              {t.footer.newsletterModal.email} {t.footer.newsletterModal.required}
            </label>
            <input
              type="email"
              required
              value={newsletterForm.email}
              onChange={(e) => setNewsletterForm({ ...newsletterForm, email: e.target.value })}
              className="w-full px-4 py-3 sm:py-3.5 border border-gray-300 focus:border-olive focus:ring-2 focus:ring-olive/20 transition-colors text-olive text-base touch-manipulation"
              placeholder={t.footer.newsletterModal.emailPlaceholder}
            />
          </div>

          {/* Telefono */}
          <div>
            <label className="block text-sm font-medium text-olive mb-2">
              {t.footer.newsletterModal.phone} <span className="text-gray-400 font-normal">{t.footer.newsletterModal.phoneOptional}</span>
            </label>
            <input
              type="tel"
              value={newsletterForm.phone}
              onChange={(e) => setNewsletterForm({ ...newsletterForm, phone: e.target.value })}
              className="w-full px-4 py-3 sm:py-3.5 border border-gray-300 focus:border-olive focus:ring-2 focus:ring-olive/20 transition-colors text-olive text-base touch-manipulation"
              placeholder={t.footer.newsletterModal.phonePlaceholder}
            />
          </div>

          {/* Privacy Notice */}
          <p className="text-xs text-gray-500 leading-relaxed">
            {t.footer.newsletterModal.privacy}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:flex-1 px-6 py-3.5 sm:py-3 border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors touch-manipulation text-base cursor-pointer disabled:cursor-not-allowed"
              disabled={loading}
            >
              {t.footer.newsletterModal.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 bg-olive text-beige px-6 py-3.5 sm:py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-base cursor-pointer border border-olive/20"
            >
              {loading ? t.footer.newsletterModal.sending : t.footer.newsletterModal.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
