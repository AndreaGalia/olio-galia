'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface WaitingListEntry {
  _id: string;
  productId: string;
  email: string;
  locale: 'it' | 'en';
  createdAt: string;
  notifiedAt?: string;
}

interface WaitingListProduct {
  id: string;
  name: string;
  slug: string;
  entries: WaitingListEntry[];
}

export default function WaitingListPage() {
  const [products, setProducts] = useState<WaitingListProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifying, setNotifying] = useState<string | null>(null);
  const [message, setMessage] = useState<{ productId: string; text: string; type: 'success' | 'error' } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Recupera tutti i prodotti waiting list
      const prodRes = await fetch('/api/admin/products');
      if (!prodRes.ok) throw new Error('Errore prodotti');
      const allProducts = await prodRes.json();
      const waitingProducts = allProducts.filter((p: any) => p.isWaitingList);

      // 2. Per ogni prodotto, recupera gli iscritti
      const withEntries = await Promise.all(
        waitingProducts.map(async (p: any) => {
          const res = await fetch(`/api/admin/waiting-list/${p.id}`);
          const data = res.ok ? await res.json() : { entries: [] };
          return {
            id: p.id,
            name: p.translations?.it?.name || p.id,
            slug: p.slug?.it || p.id,
            entries: data.entries || [],
          };
        })
      );

      setProducts(withEntries);
    } catch (err) {
      console.error('Errore caricamento waiting list:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleNotify = async (productId: string) => {
    setNotifying(productId);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/waiting-list/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'notify' }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ productId, text: data.error || 'Errore durante l\'invio', type: 'error' });
        return;
      }

      if (data.sent === 0) {
        setMessage({ productId, text: 'Nessun iscritto da notificare (tutti già notificati).', type: 'success' });
      } else {
        setMessage({
          productId,
          text: `Email inviate: ${data.sent}${data.failed > 0 ? ` — Fallite: ${data.failed}` : ''}.`,
          type: 'success',
        });
      }

      // Ricarica i dati per aggiornare i log notifiche
      await fetchData();
    } catch {
      setMessage({ productId, text: 'Errore di rete. Riprova.', type: 'error' });
    } finally {
      setNotifying(null);
    }
  };

  const pendingCount = (entries: WaitingListEntry[]) =>
    entries.filter((e) => !e.notifiedAt).length;

  return (
    <AdminLayout
      title="Lista d'attesa"
      subtitle="Gestisci gli iscritti ai prodotti prossimamente"
    >
      {loading ? (
        <div className="text-center py-16 text-gray-500">Caricamento...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-2">Nessun prodotto in lista d&apos;attesa.</p>
          <p className="text-sm text-gray-400">
            Attiva il flag &quot;Lista d&apos;attesa&quot; su un prodotto per gestire gli iscritti da qui.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {products.map((product) => {
            const pending = pendingCount(product.entries);
            const productMessage = message?.productId === product.id ? message : null;

            return (
              <div key={product.id} className="bg-white rounded-xl border border-olive/20 overflow-hidden">
                {/* Header prodotto */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-olive/10 bg-olive/5">
                  <div>
                    <h2 className="font-semibold text-gray-900">{product.name}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {product.entries.length} iscritti totali — {pending} da notificare
                    </p>
                  </div>
                  <button
                    onClick={() => handleNotify(product.id)}
                    disabled={notifying === product.id || pending === 0}
                    className="px-5 py-2.5 bg-olive text-white text-sm font-medium rounded-lg hover:bg-olive/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {notifying === product.id ? 'Invio...' : `Notifica ${pending} iscritti`}
                  </button>
                </div>

                {/* Messaggio feedback */}
                {productMessage && (
                  <div className={`px-6 py-3 text-sm font-medium ${
                    productMessage.type === 'success'
                      ? 'bg-green-50 text-green-700 border-b border-green-100'
                      : 'bg-red-50 text-red-700 border-b border-red-100'
                  }`}>
                    {productMessage.text}
                  </div>
                )}

                {/* Tabella iscritti */}
                {product.entries.length === 0 ? (
                  <p className="px-6 py-8 text-sm text-gray-400 text-center">
                    Nessun iscritto ancora.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-olive/10 text-left">
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Lingua</th>
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Iscritto il</th>
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Notificato il</th>
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-olive/5">
                        {product.entries.map((entry) => (
                          <tr key={entry._id} className="hover:bg-olive/5 transition-colors">
                            <td className="px-6 py-3 font-medium text-gray-900">{entry.email}</td>
                            <td className="px-6 py-3 text-gray-500 uppercase">{entry.locale}</td>
                            <td className="px-6 py-3 text-gray-500">
                              {new Date(entry.createdAt).toLocaleDateString('it-IT', {
                                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                            </td>
                            <td className="px-6 py-3 text-gray-500">
                              {entry.notifiedAt
                                ? new Date(entry.notifiedAt).toLocaleDateString('it-IT', {
                                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                  })
                                : '—'}
                            </td>
                            <td className="px-6 py-3">
                              {entry.notifiedAt ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                  Notificato
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                                  In attesa
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
