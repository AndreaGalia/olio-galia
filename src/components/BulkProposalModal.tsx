"use client";
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
    const whatsappMessage = `*RICHIESTA PREVENTIVO OLIO GALIA*

 *Prodotto:* ${productName}
 *Quantità richiesta:* ${quantity} pezzi

 *Dati Cliente:*
• Nome: ${customerName}
• Email: ${email}${phone ? `\n• Telefono: ${phone}` : ''}

${message ? `*Messaggio:*\n${message}\n` : ''}
*Data richiesta:* ${new Date().toLocaleDateString('it-IT')}

Grazie per l'interesse nei nostri prodotti!`;

    const whatsappNumber = '393661368797';
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    
    window.open(whatsappURL , '_blank');
    onClose();
  };

  const handleEmailSubmit = () => {
    const subject = `Richiesta Preventivo - ${productName}`;
    const body = `Buongiorno,

vorrei richiedere un preventivo per il seguente prodotto:

PRODOTTO: ${productName}
QUANTITÀ: ${quantity} pezzi

DATI CLIENTE:
Nome: ${customerName}
Email: ${email}${phone ? `\nTelefono: ${phone}` : ''}

${message ? `MESSAGGIO AGGIUNTIVO:\n${message}\n` : ''}
Data richiesta: ${new Date().toLocaleDateString('it-IT')}

Cordiali saluti,
${customerName}`;

    const emailURL = `mailto:info@oliogalia.it?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md md:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl md:text-2xl font-serif text-olive">Richiedi Preventivo</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-nocciola hover:text-olive transition-colors text-lg md:text-xl cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm md:text-base text-nocciola">
            Richiedi un preventivo personalizzato per <span className="font-medium">{productName}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-sm md:text-base font-medium text-olive mb-3">
                Quantità richiesta *
              </label>
              <div className="flex items-center border border-olive/20 rounded-lg overflow-hidden w-full sm:max-w-xs">
                <button 
                  type="button"
                  onClick={() => setQuantity(Math.max(5, quantity - 1))}
                  className="flex-shrink-0 px-3 sm:px-4 py-3 hover:bg-olive/10 transition-colors text-lg font-medium min-w-[44px] flex items-center justify-center"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(5, parseInt(e.target.value) || 5))}
                  className="flex-1 px-2 sm:px-4 py-3 text-center border-none focus:outline-none text-lg min-w-0"
                  min="5"
                />
                <button 
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex-shrink-0 px-3 sm:px-4 py-3 hover:bg-olive/10 transition-colors text-lg font-medium min-w-[44px] flex items-center justify-center"
                >
                  +
                </button>
              </div>
              <p className="text-xs md:text-sm text-nocciola/60 mt-2">Quantità minima: 5 pezzi</p>
            </div>

            <div>
              <label className="block text-sm md:text-base font-medium text-olive mb-3">
                Nome e Cognome *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 md:py-4 border border-olive/20 rounded-lg focus:outline-none focus:border-olive text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm md:text-base font-medium text-olive mb-3">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 md:py-4 border border-olive/20 rounded-lg focus:outline-none focus:border-olive text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm md:text-base font-medium text-olive mb-3">
                Telefono
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 md:py-4 border border-olive/20 rounded-lg focus:outline-none focus:border-olive text-base"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm md:text-base font-medium text-olive mb-3">
                Messaggio aggiuntivo
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 md:py-4 border border-olive/20 rounded-lg focus:outline-none focus:border-olive h-24 md:h-32 resize-none text-base"
                placeholder="Inserisci eventuali richieste specifiche..."
              />
            </div>
          </div>

          {/* Selezione metodo di invio */}
          <div>
            <label className="block text-sm md:text-base font-medium text-olive mb-4">
              Come preferisci inviare la richiesta?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center gap-3 p-4 md:p-5 border border-olive/20 rounded-lg cursor-pointer hover:bg-olive/5 transition-colors">
                <input
                  type="radio"
                  name="method"
                  value="whatsapp"
                  checked={submissionMethod === 'whatsapp'}
                  onChange={(e) => setSubmissionMethod(e.target.value as 'whatsapp')}
                  className="text-green-600 w-4 h-4"
                />
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 md:w-7 md:h-7 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  <div>
                    <span className="font-medium text-base md:text-lg">WhatsApp</span>
                    <p className="text-xs md:text-sm text-nocciola">Risposta immediata</p>
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 md:p-5 border border-olive/20 rounded-lg cursor-pointer hover:bg-olive/5 transition-colors">
                <input
                  type="radio"
                  name="method"
                  value="email"
                  checked={submissionMethod === 'email'}
                  onChange={(e) => setSubmissionMethod(e.target.value as 'email')}
                  className="text-olive w-4 h-4"
                />
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 md:w-7 md:h-7 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <span className="font-medium text-base md:text-lg">Email</span>
                    <p className="text-xs md:text-sm text-nocciola">Apre il tuo client email</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 md:py-4 border-2 border-olive/20 text-nocciola rounded-lg hover:bg-olive/10 transition-colors text-base md:text-lg cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              className={`flex-1 px-6 py-3 md:py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 text-base md:text-lg cursor-pointer ${
                submissionMethod === 'whatsapp' 
                  ? 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:shadow-lg' 
                  : 'bg-gradient-to-r from-olive to-salvia text-white hover:shadow-lg'
              }`}
            >
              {submissionMethod === 'whatsapp' && (
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              )}
              {submissionMethod === 'email' && (
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
              {submissionMethod === 'whatsapp' ? 'Apri WhatsApp' : 'Apri Email'}
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

  return (
    <>
      <div className="bg-olive/10 rounded-xl p-4 border border-olive/20">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-olive mb-1">Acquisto in quantità?</h4>
            <p className="text-sm text-nocciola">Richiedi un preventivo personalizzato</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-olive text-beige rounded-lg hover:bg-olive/90 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Preventivo
          </button>
        </div>
      </div>

      <BulkProposalModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productName={productName}
      />
    </>
  );
}