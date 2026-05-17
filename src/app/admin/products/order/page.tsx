'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import NotificationBanner from '@/components/admin/NotificationBanner';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { ProductDocument } from '@/types/products';

interface ProductRow {
  id: string;
  name: string;
  image: string;
  featured: boolean;
}

export default function AdminProductsOrderPage() {
  useAdminAuth();
  const router = useRouter();
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/admin/products');
        if (!res.ok) throw new Error('Errore nel caricamento');
        const data: (ProductDocument & { displayOrder?: number })[] = await res.json();

        // Ordina: prima chi ha displayOrder (crescente), poi gli altri per data
        const sorted = [...data].sort((a, b) => {
          const aHas = a.displayOrder !== undefined && a.displayOrder !== null;
          const bHas = b.displayOrder !== undefined && b.displayOrder !== null;
          if (aHas && bHas) return (a.displayOrder as number) - (b.displayOrder as number);
          if (aHas) return -1;
          if (bHas) return 1;
          return new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime();
        });

        setRows(
          sorted.map(p => ({
            id: p.id,
            name: p.translations.it.name,
            image: p.images?.[0] || p.media?.[0]?.url || '',
            featured: p.metadata.featured,
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const move = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= rows.length) return;
    setRows(prev => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const order = rows.map((row, i) => ({ id: row.id, displayOrder: i + 1 }));
      const res = await fetch('/api/admin/products/order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Errore nel salvataggio');
      }
      setSuccess('Ordine salvato con successo');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setSaving(false);
    }
  };

  const headerActions = (
    <>
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-2 bg-salvia text-white rounded-lg hover:bg-olive transition-colors disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
      >
        {saving ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        )}
        <span>{saving ? 'Salvataggio…' : 'Salva ordine'}</span>
      </button>
      <button
        onClick={() => router.push('/admin/products')}
        className="px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer"
      >
        Torna ai prodotti
      </button>
    </>
  );

  return (
    <AdminLayout
      title="Ordine di visualizzazione"
      subtitle="Sposta i prodotti con le frecce per definire l'ordine in cui appaiono nel catalogo"
      headerActions={headerActions}
    >
      {success && (
        <NotificationBanner
          type="success"
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}
      {error && (
        <NotificationBanner
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="max-w-2xl">
          <div className="bg-white rounded-xl border border-olive/10 divide-y divide-olive/10 shadow-sm">
            {rows.map((row, index) => (
              <div key={row.id} className="flex items-center gap-4 px-4 py-3">
                {/* Numero posizione */}
                <span className="w-7 text-center text-sm font-semibold text-olive/40 shrink-0">
                  {index + 1}
                </span>

                {/* Immagine */}
                {row.image ? (
                  <img
                    src={row.image}
                    alt={row.name}
                    className="w-10 h-10 rounded-lg object-cover shrink-0 border border-olive/10"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-olive/5 shrink-0 flex items-center justify-center">
                    <svg className="w-5 h-5 text-olive/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                {/* Nome + badge homepage */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{row.name}</p>
                  {row.featured && (
                    <span className="text-xs text-amber-600 font-medium">⭐ Homepage</span>
                  )}
                </div>

                {/* Frecce */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => move(index, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-olive/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    aria-label="Sposta su"
                  >
                    <svg className="w-4 h-4 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => move(index, 'down')}
                    disabled={index === rows.length - 1}
                    className="p-1 rounded hover:bg-olive/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    aria-label="Sposta giù"
                  >
                    <svg className="w-4 h-4 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Le modifiche all'ordine non sono salvate automaticamente — clicca <strong>Salva ordine</strong> per confermare.
          </p>
        </div>
      )}
    </AdminLayout>
  );
}
