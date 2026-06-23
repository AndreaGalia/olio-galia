'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';

interface Customer {
  email: string;
  customerName: string;
  totalOrders: number;
  lastOrderAt: string;
}

interface StripeVerification {
  name: string;
  discountType: 'percent' | 'fixed';
  value: number;
  currency: string;
  expiresAt: string | null;
}

interface Recipient {
  email: string;
  customerName?: string;
}

interface HistoryItem {
  _id: string;
  couponCode: string;
  discountDescription: string;
  sentAt: string;
  sentBy: string;
  totalSent: number;
  totalFailed: number;
  locale: string;
}

export default function DiscountCodesPage() {
  const router = useRouter();

  // Form
  const [couponCode, setCouponCode] = useState('');
  const [discountDescription, setDiscountDescription] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [locale, setLocale] = useState<'it' | 'en'>('it');

  // Stripe verify
  const [verifying, setVerifying] = useState(false);
  const [verification, setVerification] = useState<StripeVerification | null>(null);
  const [verifyError, setVerifyError] = useState('');

  // Customers tab
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customerSearch, setCustomerSearch] = useState('');

  // Manual email tab
  const [manualEmail, setManualEmail] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualError, setManualError] = useState('');

  // Unified recipients
  const [recipients, setRecipients] = useState<Recipient[]>([]);

  // Active tab
  const [activeTab, setActiveTab] = useState<'customers' | 'manual'>('customers');

  // Send
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ id: string; totalSent: number; totalFailed: number } | null>(null);
  const [sendError, setSendError] = useState('');

  // History
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const loadCustomers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders/customers');
      if (!res.ok) return;
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (err) {
      console.error('Error loading customers:', err);
    } finally {
      setCustomersLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/discount-codes?limit=20');
      if (!res.ok) return;
      const data = await res.json();
      setHistory(data.sends || []);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
    loadHistory();
  }, [loadCustomers, loadHistory]);

  // --- Stripe verify ---
  const handleVerify = async () => {
    if (!couponCode.trim()) return;
    setVerifying(true);
    setVerification(null);
    setVerifyError('');

    try {
      const res = await fetch('/api/admin/discount-codes/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        setVerifyError(data.error || 'Errore verifica');
      } else {
        setVerification(data);
        if (!discountDescription) {
          setDiscountDescription(
            data.discountType === 'percent'
              ? `${data.value}% di sconto`
              : `€${data.value.toFixed(2)} di sconto`
          );
        }
        if (!expiryDate && data.expiresAt) {
          setExpiryDate(new Date(data.expiresAt).toISOString().split('T')[0]);
        }
      }
    } catch {
      setVerifyError('Errore di rete. Riprova.');
    } finally {
      setVerifying(false);
    }
  };

  // --- Recipients helpers ---
  const isRecipient = (email: string) =>
    recipients.some(r => r.email.toLowerCase() === email.toLowerCase());

  const toggleCustomer = (customer: Customer) => {
    if (isRecipient(customer.email)) {
      setRecipients(prev => prev.filter(r => r.email.toLowerCase() !== customer.email.toLowerCase()));
    } else {
      setRecipients(prev => [...prev, { email: customer.email, customerName: customer.customerName || undefined }]);
    }
  };

  const filteredCustomers = customers.filter(c =>
    !customerSearch ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.customerName || '').toLowerCase().includes(customerSearch.toLowerCase())
  );

  const selectAllVisible = () => {
    const toAdd = filteredCustomers
      .filter(c => !isRecipient(c.email))
      .map(c => ({ email: c.email, customerName: c.customerName || undefined }));
    setRecipients(prev => [...prev, ...toAdd]);
  };

  const deselectAllVisible = () => {
    const visibleEmails = new Set(filteredCustomers.map(c => c.email.toLowerCase()));
    setRecipients(prev => prev.filter(r => !visibleEmails.has(r.email.toLowerCase())));
  };

  const addManualEmail = () => {
    setManualError('');
    const email = manualEmail.trim().toLowerCase();
    if (!email) { setManualError('Inserisci un\'email'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setManualError('Email non valida'); return; }
    if (isRecipient(email)) { setManualError('Email già presente nella lista'); return; }
    setRecipients(prev => [...prev, { email, customerName: manualName.trim() || undefined }]);
    setManualEmail('');
    setManualName('');
  };

  const removeRecipient = (email: string) => {
    setRecipients(prev => prev.filter(r => r.email.toLowerCase() !== email.toLowerCase()));
  };

  // --- Send ---
  const handleSend = async () => {
    setSending(true);
    setSendResult(null);
    setSendError('');

    try {
      const res = await fetch('/api/admin/discount-codes/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponCode: couponCode.trim().toUpperCase(),
          discountDescription: discountDescription.trim(),
          expiryDate: expiryDate
            ? new Date(expiryDate).toLocaleDateString('it-IT')
            : undefined,
          customMessage: customMessage.trim(),
          recipients,
          locale,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setSendError(data.error || 'Errore durante l\'invio');
      } else {
        setSendResult({ id: data.id, totalSent: data.totalSent, totalFailed: data.totalFailed });
        setCouponCode('');
        setDiscountDescription('');
        setExpiryDate('');
        setCustomMessage('');
        setVerification(null);
        setVerifyError('');
        setRecipients([]);
        await loadHistory();
      }
    } catch {
      setSendError('Errore di rete. Riprova.');
    } finally {
      setSending(false);
    }
  };

  const canSend =
    couponCode.trim() &&
    discountDescription.trim() &&
    customMessage.trim() &&
    recipients.length > 0 &&
    verification &&
    !sending;

  const selectedVisible = filteredCustomers.filter(c => isRecipient(c.email)).length;

  return (
    <AdminLayout
      title="Codici Sconto"
      subtitle="Invia codici coupon Stripe ai clienti via email"
    >
      <div className="space-y-6">

        {/* ── Sezione 1: Dettagli coupon ── */}
        <div className="bg-white rounded-xl border border-olive/20 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Dettagli coupon</h2>

          {/* Codice + verifica */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Codice coupon Stripe
              </label>
              <input
                type="text"
                value={couponCode}
                onChange={e => { setCouponCode(e.target.value.toUpperCase()); setVerification(null); setVerifyError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleVerify()}
                placeholder="es. ESTATE10"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-olive/30 focus:border-olive"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleVerify}
                disabled={!couponCode.trim() || verifying}
                className="px-5 py-2.5 bg-olive text-white text-sm font-medium rounded-lg hover:bg-olive/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
              >
                {verifying ? 'Verifica...' : 'Verifica su Stripe'}
              </button>
            </div>
          </div>

          {/* Feedback verifica */}
          {verifyError && (
            <div className="mb-4 px-4 py-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {verifyError}
            </div>
          )}
          {verification && (
            <div className="mb-4 px-4 py-3 bg-green-50 border border-green-100 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div className="text-sm text-green-800">
                <strong>{verification.name}</strong> —{' '}
                {verification.discountType === 'percent'
                  ? `${verification.value}% di sconto`
                  : `€${verification.value.toFixed(2)} di sconto`}
                {verification.expiresAt && (
                  <span className="ml-2 text-green-600">
                    · Scade il {new Date(verification.expiresAt).toLocaleDateString('it-IT')}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Descrizione sconto */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Descrizione sconto <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={discountDescription}
                onChange={e => setDiscountDescription(e.target.value)}
                placeholder="es. 10% su tutti i prodotti"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive/30 focus:border-olive"
              />
            </div>

            {/* Data scadenza */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Scadenza (opzionale)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive/30 focus:border-olive"
              />
            </div>

            {/* Lingua */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Lingua email
              </label>
              <select
                value={locale}
                onChange={e => setLocale(e.target.value as 'it' | 'en')}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive/30 focus:border-olive bg-white"
              >
                <option value="it">Italiano</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          {/* Messaggio personalizzato */}
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Messaggio personalizzato <span className="text-red-400">*</span>
            </label>
            <textarea
              value={customMessage}
              onChange={e => setCustomMessage(e.target.value)}
              rows={3}
              placeholder="es. Come ringraziamento per il tuo acquisto, ti offriamo uno sconto esclusivo sul prossimo ordine."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive/30 focus:border-olive resize-none"
            />
          </div>
        </div>

        {/* ── Sezione 2: Destinatari ── */}
        <div className="bg-white rounded-xl border border-olive/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-olive/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Destinatari</h2>
            {recipients.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-olive/10 text-olive rounded-full">
                {recipients.length} selezionati
              </span>
            )}
          </div>

          {/* Tab */}
          <div className="flex border-b border-olive/10">
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-6 py-3 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'customers'
                  ? 'text-olive border-b-2 border-olive'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Clienti da ordini
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-6 py-3 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'manual'
                  ? 'text-olive border-b-2 border-olive'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Aggiungi email manuale
            </button>
          </div>

          {/* Tab: Clienti da ordini */}
          {activeTab === 'customers' && (
            <div>
              {/* Search + actions */}
              <div className="px-6 py-3 flex flex-col sm:flex-row gap-3 border-b border-olive/5">
                <input
                  type="text"
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                  placeholder="Cerca per nome o email..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive/30 focus:border-olive"
                />
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={selectAllVisible}
                    className="px-3 py-2 text-xs font-medium text-olive border border-olive/30 rounded-lg hover:bg-olive/5 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Seleziona tutti ({filteredCustomers.length - selectedVisible})
                  </button>
                  <button
                    onClick={deselectAllVisible}
                    className="px-3 py-2 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Deseleziona ({selectedVisible})
                  </button>
                </div>
              </div>

              {customersLoading ? (
                <div className="py-10 text-center text-sm text-gray-400">Caricamento clienti...</div>
              ) : filteredCustomers.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-400">
                  {customerSearch ? 'Nessun cliente trovato per questa ricerca.' : 'Nessun cliente con ordini trovato.'}
                </div>
              ) : (
                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b border-olive/10 text-left">
                        <th className="px-6 py-3 w-10"></th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Ordini</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ultimo ordine</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-olive/5">
                      {filteredCustomers.map(customer => (
                        <tr
                          key={customer.email}
                          onClick={() => toggleCustomer(customer)}
                          className={`hover:bg-olive/5 transition-colors cursor-pointer ${
                            isRecipient(customer.email) ? 'bg-olive/5' : ''
                          }`}
                        >
                          <td className="px-6 py-3">
                            <input
                              type="checkbox"
                              checked={isRecipient(customer.email)}
                              onChange={() => toggleCustomer(customer)}
                              onClick={e => e.stopPropagation()}
                              className="w-4 h-4 text-olive border-gray-300 rounded focus:ring-olive/30 cursor-pointer"
                            />
                          </td>
                          <td className="px-6 py-3 font-medium text-gray-900">
                            {customer.customerName || '—'}
                          </td>
                          <td className="px-6 py-3 text-gray-600">{customer.email}</td>
                          <td className="px-6 py-3 text-center text-gray-500">{customer.totalOrders}</td>
                          <td className="px-6 py-3 text-gray-500">
                            {customer.lastOrderAt
                              ? new Date(customer.lastOrderAt).toLocaleDateString('it-IT')
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab: Email manuale */}
          {activeTab === 'manual' && (
            <div className="px-6 py-5">
              <p className="text-sm text-gray-500 mb-4">
                Aggiungi qualsiasi indirizzo email, anche senza ordini precedenti.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="email"
                    value={manualEmail}
                    onChange={e => { setManualEmail(e.target.value); setManualError(''); }}
                    onKeyDown={e => e.key === 'Enter' && addManualEmail()}
                    placeholder="indirizzo@email.com"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive/30 focus:border-olive"
                  />
                </div>
                <div className="sm:w-48">
                  <input
                    type="text"
                    value={manualName}
                    onChange={e => setManualName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addManualEmail()}
                    placeholder="Nome (opzionale)"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive/30 focus:border-olive"
                  />
                </div>
                <button
                  onClick={addManualEmail}
                  className="px-5 py-2.5 bg-olive text-white text-sm font-medium rounded-lg hover:bg-olive/90 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Aggiungi
                </button>
              </div>
              {manualError && (
                <p className="mt-2 text-xs text-red-600">{manualError}</p>
              )}
            </div>
          )}

          {/* Lista destinatari selezionati */}
          {recipients.length > 0 && (
            <div className="border-t border-olive/10 px-6 py-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Destinatari selezionati ({recipients.length})
              </h3>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                {recipients.map(r => (
                  <span
                    key={r.email}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-olive/10 text-olive text-xs font-medium rounded-full"
                  >
                    {r.customerName ? `${r.customerName} <${r.email}>` : r.email}
                    <button
                      onClick={() => removeRecipient(r.email)}
                      className="text-olive/60 hover:text-olive transition-colors cursor-pointer"
                      aria-label={`Rimuovi ${r.email}`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Sezione 3: Invio ── */}
        <div className="bg-white rounded-xl border border-olive/20 p-6">
          {/* Riepilogo validazione */}
          {!verification && (
            <p className="text-sm text-amber-600 mb-4">
              Verifica prima il codice coupon su Stripe per sbloccare l&apos;invio.
            </p>
          )}
          {recipients.length === 0 && (
            <p className="text-sm text-amber-600 mb-4">
              Seleziona almeno un destinatario.
            </p>
          )}

          {sendResult && (
            <div className="mb-4 px-4 py-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-800">
              <strong>Invio completato!</strong> Email inviate: {sendResult.totalSent}
              {sendResult.totalFailed > 0 && ` — Fallite: ${sendResult.totalFailed}`}
              {' '}·{' '}
              <button
                onClick={() => router.push(`/admin/discount-codes/${sendResult.id}`)}
                className="underline hover:no-underline cursor-pointer"
              >
                Vedi dettaglio
              </button>
            </div>
          )}

          {sendError && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
              {sendError}
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={!canSend}
            className="w-full sm:w-auto px-8 py-3 bg-olive text-white font-medium rounded-lg hover:bg-olive/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-sm"
          >
            {sending
              ? `Invio in corso... (${recipients.length} destinatari)`
              : `Invia a ${recipients.length} destinatar${recipients.length === 1 ? 'io' : 'i'}`}
          </button>
        </div>

        {/* ── Sezione 4: Storico invii ── */}
        <div className="bg-white rounded-xl border border-olive/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-olive/10">
            <h2 className="text-lg font-semibold text-gray-900">Storico invii</h2>
          </div>

          {historyLoading ? (
            <div className="py-10 text-center text-sm text-gray-400">Caricamento storico...</div>
          ) : history.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">Nessun invio effettuato.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-olive/10 text-left">
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Codice</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Descrizione</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Inviati</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Falliti</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-olive/5">
                  {history.map(item => (
                    <tr key={item._id} className="hover:bg-olive/5 transition-colors">
                      <td className="px-6 py-3 font-mono font-medium text-gray-900">{item.couponCode}</td>
                      <td className="px-6 py-3 text-gray-600">{item.discountDescription}</td>
                      <td className="px-6 py-3 text-gray-500">
                        {new Date(item.sentAt).toLocaleDateString('it-IT', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          {item.totalSent}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        {item.totalFailed > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            {item.totalFailed}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => router.push(`/admin/discount-codes/${item._id}`)}
                          className="text-olive text-xs font-medium hover:underline cursor-pointer"
                        >
                          Dettaglio
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
