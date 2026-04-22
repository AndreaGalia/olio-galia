"use client";
import { useT } from '@/hooks/useT';
import { useState } from 'react';
import React from 'react';

// Componente della modale
function BulkProposalModal({ isOpen, onClose, productName }: { 
  isOpen: boolean; 
  onClose: () => void; 
  productName: string;
}) {
  const [quantity, setQuantity] = useState(5);
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submissionMethod, setSubmissionMethod] = useState<'whatsapp' | 'email'>('whatsapp');
  const { t, translate } = useT();

  // Blocca/sblocca lo scroll del body quando la modale è aperta/chiusa
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup quando il componente viene smontato
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleWhatsAppSubmit = () => {
    const phoneText = phone ? `\n• ${t.bulkProposal.modal.form.phoneLabel}: ${phone}` : '';
    const messageText = message ? `${t.bulkProposal.modal.form.messageLabel}:\n${message}\n\n` : '';
    const date = new Date().toLocaleDateString('it-IT');
    
    const whatsappMessage = translate('bulkProposal.modal.whatsappMessage', {
      productName,
      quantity: quantity.toString(),
      customerName,
      email,
      phone: phoneText,
      message: messageText,
      date
    });

    const whatsappURL = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;
    
    window.open(whatsappURL , '_blank');
    onClose();
  };

  const handleEmailSubmit = () => {
    const subject = translate('bulkProposal.modal.emailSubject', { productName });
    
    const phoneText = phone ? `\n${t.bulkProposal.modal.form.phoneLabel}: ${phone}` : '';
    const messageText = message ? `${t.bulkProposal.modal.form.messageLabel.toUpperCase()}:\n${message}\n\n` : '';
    const date = new Date().toLocaleDateString('it-IT');
    
    const body = translate('bulkProposal.modal.emailBody', {
      productName,
      quantity: quantity.toString(),
      customerName,
      email,
      phone: phoneText,
      message: messageText,
      date
    });

    const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@oliogalia.it';
    const emailURL = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = emailURL;
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submissionMethod === 'whatsapp') {
      handleWhatsAppSubmit();
    } else {
      handleEmailSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-sabbia-chiaro border border-olive/20 p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-1">
              {t.bulkProposal.modal.title}
            </p>
            <p className="garamond-13">
              {translate('bulkProposal.modal.description', { productName })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-black hover:text-black/50 transition-colors cursor-pointer ml-4 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Quantity */}
          <div>
            <label className="block font-serif termina-11 tracking-[0.15em] uppercase text-black mb-2">
              {t.bulkProposal.modal.form.quantityLabel}
            </label>
            <div className="flex items-center border border-olive/20 w-fit">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(5, quantity - 1))}
                className="w-9 h-9 flex items-center justify-center hover:bg-black/5 transition-colors cursor-pointer"
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(5, parseInt(e.target.value) || 5))}
                className="w-14 h-9 text-center border-x border-olive/20 focus:outline-none garamond-13 bg-transparent"
                min="5"
              />
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 flex items-center justify-center hover:bg-black/5 transition-colors cursor-pointer"
              >
                +
              </button>
            </div>
            <p className="garamond-13 mt-1">{t.bulkProposal.modal.form.quantityMin}</p>
          </div>

          {/* Name + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-serif termina-11 tracking-[0.15em] uppercase text-black mb-2">
                {t.bulkProposal.modal.form.nameLabel}
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2.5 border border-olive/20 focus:outline-none focus:border-olive/40 garamond-13 bg-transparent"
                required
              />
            </div>
            <div>
              <label className="block font-serif termina-11 tracking-[0.15em] uppercase text-black mb-2">
                {t.bulkProposal.modal.form.emailLabel}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-olive/20 focus:outline-none focus:border-olive/40 garamond-13 bg-transparent"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block font-serif termina-11 tracking-[0.15em] uppercase text-black mb-2">
              {t.bulkProposal.modal.form.phoneLabel}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 border border-olive/20 focus:outline-none focus:border-olive/40 garamond-13 bg-transparent"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block font-serif termina-11 tracking-[0.15em] uppercase text-black mb-2">
              {t.bulkProposal.modal.form.messageLabel}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2.5 border border-olive/20 focus:outline-none focus:border-olive/40 h-24 resize-none garamond-13 bg-transparent"
              placeholder={t.bulkProposal.modal.form.messagePlaceholder}
            />
          </div>

          {/* Method */}
          <div>
            <label className="block font-serif termina-11 tracking-[0.15em] uppercase text-black mb-3">
              {t.bulkProposal.modal.form.methodLabel}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${
                submissionMethod === 'whatsapp' ? 'border-olive/40 bg-black/5' : 'border-olive/20 hover:border-olive/40'
              }`}>
                <input
                  type="radio"
                  name="method"
                  value="whatsapp"
                  checked={submissionMethod === 'whatsapp'}
                  onChange={(e) => setSubmissionMethod(e.target.value as 'whatsapp')}
                  className="w-3.5 h-3.5"
                />
                <span className="font-serif termina-8 tracking-wider uppercase text-black">{t.bulkProposal.modal.form.whatsappOption}</span>
              </label>

              <label className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${
                submissionMethod === 'email' ? 'border-olive/40 bg-black/5' : 'border-olive/20 hover:border-olive/40'
              }`}>
                <input
                  type="radio"
                  name="method"
                  value="email"
                  checked={submissionMethod === 'email'}
                  onChange={(e) => setSubmissionMethod(e.target.value as 'email')}
                  className="w-3.5 h-3.5"
                />
                <span className="font-serif termina-8 tracking-wider uppercase text-black">{t.bulkProposal.modal.form.emailOption}</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-olive/20 font-serif termina-11 tracking-[0.15em] uppercase text-black hover:border-olive/40 transition-colors cursor-pointer"
            >
              {t.bulkProposal.modal.form.cancelButton}
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-olive text-beige font-serif termina-11 tracking-[0.15em] uppercase hover:bg-salvia transition-colors cursor-pointer"
            >
              {submissionMethod === 'whatsapp'
                ? t.bulkProposal.modal.form.whatsappButton
                : t.bulkProposal.modal.form.emailButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Sostituisci la sezione "Condivisione social" con questo:
export function BulkProposalSection({ productName }: { productName: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useT();

  return (
    <>
      <div className="border-t border-olive/20 pt-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-serif termina-8 tracking-[0.15em] uppercase text-black">
            {t.bulkProposal.section.title}
          </p>
          <p className="garamond-13 mt-0.5 text-black">
            {t.bulkProposal.section.description}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="font-serif termina-8 tracking-[0.15em] uppercase text-black underline underline-offset-2 hover:text-black transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
        >
          {t.bulkProposal.section.button}
        </button>
      </div>

      <BulkProposalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productName={productName}
      />
    </>
  );
}