'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';

interface Recipient {
  email: string;
  customerName?: string;
  success: boolean;
  error?: string;
}

interface SendDetail {
  _id: string;
  couponCode: string;
  discountDescription: string;
  expiryDate?: string;
  customMessage: string;
  locale: string;
  sentAt: string;
  sentBy: string;
  recipients: Recipient[];
  stripeVerified: boolean;
  totalSent: number;
  totalFailed: number;
}

export default function DiscountCodeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [send, setSend] = useState<SendDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/discount-codes/${id}`);
        if (!res.ok) { setError('Invio non trovato'); return; }
        const data = await res.json();
        setSend(data.send);
      } catch {
        setError('Errore nel caricamento');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const headerActions = (
    <button
      onClick={() => router.push('/admin/discount-codes')}
      className="px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer text-sm"
    >
      ← Torna agli invii
    </button>
  );

  return (
    <AdminLayout
      title="Dettaglio Invio"
      subtitle="Risultato dell'invio del codice sconto"
      headerActions={headerActions}
    >
      {loading ? (
        <div className="text-center py-16 text-gray-400">Caricamento...</div>
      ) : error ? (
        <div className="text-center py-16 text-red-500">{error}</div>
      ) : send ? (
        <div className="space-y-6">

          {/* Riepilogo */}
          <div className="bg-white rounded-xl border border-olive/20 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Riepilogo invio</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Codice coupon</p>
                <p className="font-mono font-semibold text-gray-900 text-lg">{send.couponCode}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Descrizione sconto</p>
                <p className="text-gray-900">{send.discountDescription}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Lingua</p>
                <p className="text-gray-900 uppercase">{send.locale}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Data invio</p>
                <p className="text-gray-900">
                  {new Date(send.sentAt).toLocaleDateString('it-IT', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Inviato da</p>
                <p className="text-gray-900">{send.sentBy}</p>
              </div>
              {send.expiryDate && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Scadenza</p>
                  <p className="text-gray-900">{send.expiryDate}</p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-4 mt-5 pt-5 border-t border-olive/10">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 text-sm font-semibold bg-green-100 text-green-800 rounded-full">
                  {send.totalSent} inviati
                </span>
              </div>
              {send.totalFailed > 0 && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 text-sm font-semibold bg-red-100 text-red-800 rounded-full">
                    {send.totalFailed} falliti
                  </span>
                </div>
              )}
              {send.stripeVerified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium bg-blue-50 text-blue-700 rounded-full">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Verificato su Stripe
                </span>
              )}
            </div>

            {/* Messaggio */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Messaggio inviato</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{send.customMessage}</p>
            </div>
          </div>

          {/* Lista destinatari */}
          <div className="bg-white rounded-xl border border-olive/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-olive/10">
              <h2 className="text-lg font-semibold text-gray-900">
                Destinatari ({send.recipients.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-olive/10 text-left">
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Esito</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Errore</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-olive/5">
                  {send.recipients.map((r, i) => (
                    <tr key={i} className="hover:bg-olive/5 transition-colors">
                      <td className="px-6 py-3 text-gray-900">{r.email}</td>
                      <td className="px-6 py-3 text-gray-500">{r.customerName || '—'}</td>
                      <td className="px-6 py-3">
                        {r.success ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Inviato
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            Fallito
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-xs text-red-600">{r.error || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}
