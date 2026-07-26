'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import {
  StarDistribution,
  GeneratedReview,
  CommentPoolType,
  generateReviewsForProduct,
  generateComment,
  totalFromDistribution,
  getPoolSize,
} from '@/lib/fakeReviews/generator';

interface ProductOption {
  id: string;
  name: string;
  slug: string;
  categories: string[];
}

interface ProductConfig {
  distribution: StarDistribution;
  poolType: CommentPoolType;
}

/** Auto-rileva il pool commenti dalla categoria del prodotto */
function detectPoolType(product: ProductOption): CommentPoolType {
  return product.categories.includes('beauty') ? 'beauty' : 'food';
}

const DEFAULT_DISTRIBUTION: StarDistribution = { 5: 10, 4: 4, 3: 1, 2: 0, 1: 0 };

const STARS = [5, 4, 3, 2, 1] as const;

export default function GenerateFeedbacksPage() {
  const router = useRouter();

  const [productsLoading, setProductsLoading] = useState(true);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [existingComments, setExistingComments] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Selezione prodotti
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Config globale
  const [globalDistribution, setGlobalDistribution] = useState<StarDistribution>({ ...DEFAULT_DISTRIBUTION });
  const [anonymousPercent, setAnonymousPercent] = useState(20);
  const [monthsBack, setMonthsBack] = useState(6);

  // Override per prodotto (inizializzati dalla config globale)
  const [perProduct, setPerProduct] = useState<Record<string, ProductConfig>>({});

  // Anteprima
  const [preview, setPreview] = useState<Record<string, GeneratedReview[]> | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Salvataggio
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);

  // Carica prodotti dal catalogo (stessa fonte di /products)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const response = await fetch('/api/admin/feedbacks/generate');
        const data = await response.json();
        if (data.success) {
          setProducts(data.products);
          setExistingComments(data.existingComments || []);
        } else {
          setError(data.error || 'Errore nel caricamento dei prodotti');
        }
      } catch {
        setError('Errore nel caricamento dei prodotti');
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const toggleProduct = useCallback((product: ProductOption) => {
    const id = product.id;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setPerProduct((prev) => {
      if (prev[id]) {
        const { [id]: _removed, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [id]: { distribution: { ...globalDistribution }, poolType: detectPoolType(product) },
      };
    });
    setPreview(null);
    setSaveResult(null);
  }, [globalDistribution]);

  const applyGlobalToAll = useCallback(() => {
    setPerProduct((prev) => {
      const next: Record<string, ProductConfig> = {};
      Object.entries(prev).forEach(([id, config]) => {
        next[id] = { distribution: { ...globalDistribution }, poolType: config.poolType };
      });
      return next;
    });
    setPreview(null);
  }, [globalDistribution]);

  const updateProductPool = useCallback((productId: string, poolType: CommentPoolType) => {
    setPerProduct((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], poolType },
    }));
    setPreview(null);
  }, []);

  const updateProductStar = useCallback((productId: string, star: 1 | 2 | 3 | 4 | 5, value: number) => {
    setPerProduct((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        distribution: { ...prev[productId].distribution, [star]: Math.max(0, value) },
      },
    }));
    setPreview(null);
  }, []);

  const selectedProducts = useMemo(
    () => products.filter((p) => selectedIds.has(p.id)),
    [products, selectedIds]
  );

  const totalToGenerate = useMemo(
    () =>
      selectedProducts.reduce(
        (sum, p) => sum + totalFromDistribution(perProduct[p.id]?.distribution || globalDistribution),
        0
      ),
    [selectedProducts, perProduct, globalDistribution]
  );

  // Avvisa se, per una fascia di stelle, le recensioni richieste superano i commenti
  // unici del pool (contando anche i prodotti che condividono lo stesso pool)
  const poolWarnings = useMemo(() => {
    const requested: Record<string, number> = {}; // chiave: `${poolType}-${star}`
    selectedProducts.forEach((product) => {
      const dist = perProduct[product.id]?.distribution || globalDistribution;
      const poolType = perProduct[product.id]?.poolType || detectPoolType(product);
      STARS.forEach((star) => {
        const key = `${poolType}-${star}`;
        requested[key] = (requested[key] || 0) + Math.max(0, dist[star] || 0);
      });
    });

    const warnings: string[] = [];
    Object.entries(requested).forEach(([key, count]) => {
      const [poolType, starStr] = key.split('-');
      const star = parseInt(starStr, 10);
      const poolSize = getPoolSize(star, poolType as CommentPoolType);
      if (count > poolSize) {
        const label = poolType === 'beauty' ? 'Beauty' : 'Olio EVO';
        warnings.push(
          `${star}★ ${label}: richieste ${count} recensioni ma il pool ha ${poolSize} commenti unici`
        );
      }
    });
    return warnings;
  }, [selectedProducts, perProduct, globalDistribution]);

  const handleGeneratePreview = useCallback(() => {
    const result: Record<string, GeneratedReview[]> = {};
    // Set condiviso tra tutti i prodotti del batch, pre-caricato con i commenti
    // già salvati nel DB: nessuna ripetizione tra prodotti né tra sessioni
    const usedComments = new Set(existingComments);
    selectedProducts.forEach((product) => {
      result[product.id] = generateReviewsForProduct(
        {
          productId: product.id,
          productName: product.name,
          distribution: perProduct[product.id]?.distribution || globalDistribution,
          anonymousPercent,
          monthsBack,
          poolType: perProduct[product.id]?.poolType || detectPoolType(product),
        },
        usedComments
      );
    });
    setPreview(result);
    setCollapsed(new Set());
    setSaveResult(null);
  }, [selectedProducts, perProduct, globalDistribution, anonymousPercent, monthsBack, existingComments]);

  const updateReview = useCallback(
    (productId: string, index: number, patch: Partial<GeneratedReview>) => {
      setPreview((prev) => {
        if (!prev) return prev;
        const list = [...prev[productId]];
        list[index] = { ...list[index], ...patch };
        return { ...prev, [productId]: list };
      });
    },
    []
  );

  const regenerateComment = useCallback(
    (productId: string, index: number) => {
      const poolType = perProduct[productId]?.poolType || 'food';
      setPreview((prev) => {
        if (!prev) return prev;
        const list = [...prev[productId]];
        const review = list[index];
        // Evita i commenti del DB e tutti quelli dell'intera anteprima (tutti i prodotti)
        const used = new Set(existingComments);
        Object.values(prev).forEach((reviews) => reviews.forEach((r) => used.add(r.comment)));
        list[index] = {
          ...review,
          comment: generateComment(review.rating, review.productName, poolType, used),
        };
        return { ...prev, [productId]: list };
      });
    },
    [perProduct, existingComments]
  );

  const removeReview = useCallback((productId: string, index: number) => {
    setPreview((prev) => {
      if (!prev) return prev;
      const list = prev[productId].filter((_, i) => i !== index);
      return { ...prev, [productId]: list };
    });
  }, []);

  const toggleCollapsed = useCallback((productId: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }, []);

  const previewTotal = useMemo(
    () => (preview ? Object.values(preview).reduce((sum, list) => sum + list.length, 0) : 0),
    [preview]
  );

  const handleSave = useCallback(async () => {
    if (!preview) return;
    const reviews = Object.values(preview).flat();
    if (reviews.length === 0) return;

    try {
      setSaving(true);
      setSaveResult(null);
      const response = await fetch('/api/admin/feedbacks/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews }),
      });
      const data = await response.json();

      if (data.success) {
        setSaveResult({ success: true, message: data.message });
        // Registra i commenti appena salvati: le prossime generazioni li escluderanno
        setExistingComments((prev) => [...prev, ...reviews.map((r) => r.comment)]);
        setPreview(null);
      } else {
        setSaveResult({ success: false, message: data.error || 'Errore nel salvataggio' });
      }
    } catch {
      setSaveResult({ success: false, message: 'Errore di rete nel salvataggio' });
    } finally {
      setSaving(false);
    }
  }, [preview]);

  const renderStars = useCallback(
    (rating: number, onChange?: (value: number) => void) => (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            className={`text-lg ${star <= rating ? 'text-olive' : 'text-gray-300'} ${
              onChange ? 'cursor-pointer hover:scale-110 transition-transform' : ''
            }`}
          >
            ★
          </button>
        ))}
      </div>
    ),
    []
  );

  const formatDate = useCallback(
    (iso: string) =>
      new Date(iso).toLocaleDateString('it-IT', { year: 'numeric', month: 'short', day: 'numeric' }),
    []
  );

  const headerActions = (
    <button
      onClick={() => router.push('/admin/feedbacks')}
      className="px-2 sm:px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer text-xs sm:text-base whitespace-nowrap"
    >
      Torna ai Feedback
    </button>
  );

  return (
    <AdminLayout
      title="Genera Recensioni"
      subtitle="Crea recensioni per i prodotti del catalogo"
      headerActions={headerActions}
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {saveResult && (
        <div
          className={`px-4 py-3 rounded-lg mb-6 border ${
            saveResult.success
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <p className="font-medium">{saveResult.message}</p>
          {saveResult.success && (
            <button
              onClick={() => router.push('/admin/feedbacks')}
              className="text-sm underline cursor-pointer mt-1"
            >
              Vai alla lista feedback
            </button>
          )}
        </div>
      )}

      {productsLoading && <LoadingSpinner />}

      {!productsLoading && !error && (
        <div className="space-y-6">
          {/* 1. Selezione prodotti */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">1. Seleziona i prodotti</h2>
            <p className="text-sm text-gray-500 mb-4">
              Prodotti attivi del catalogo (gli stessi visibili su /products)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {products.map((product) => (
                <label
                  key={product.id}
                  className={`flex items-center gap-3 px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                    selectedIds.has(product.id)
                      ? 'border-olive bg-olive/5'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(product.id)}
                    onChange={() => toggleProduct(product)}
                    className="accent-olive w-4 h-4"
                  />
                  <span className="text-sm text-gray-800">{product.name}</span>
                </label>
              ))}
            </div>
            {products.length === 0 && (
              <p className="text-sm text-gray-500">Nessun prodotto attivo trovato.</p>
            )}
          </div>

          {/* 2. Configurazione globale */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Configurazione globale</h2>
            <div className="flex flex-wrap items-end gap-4">
              {STARS.map((star) => (
                <div key={star}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{star}★</label>
                  <input
                    type="number"
                    min={0}
                    value={globalDistribution[star]}
                    onChange={(e) => {
                      setGlobalDistribution((prev) => ({
                        ...prev,
                        [star]: Math.max(0, parseInt(e.target.value, 10) || 0),
                      }));
                      setPreview(null);
                    }}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive focus:border-transparent"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">% Anonimi</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={anonymousPercent}
                  onChange={(e) => {
                    setAnonymousPercent(Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)));
                    setPreview(null);
                  }}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ultimi mesi</label>
                <input
                  type="number"
                  min={1}
                  max={36}
                  value={monthsBack}
                  onChange={(e) => {
                    setMonthsBack(Math.min(36, Math.max(1, parseInt(e.target.value, 10) || 1)));
                    setPreview(null);
                  }}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive focus:border-transparent"
                />
              </div>
              <button
                onClick={applyGlobalToAll}
                disabled={selectedProducts.length === 0}
                className="px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Applica a tutti
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Totale per prodotto: <strong>{totalFromDistribution(globalDistribution)}</strong> recensioni ·
              Le date verranno distribuite casualmente negli ultimi {monthsBack} mesi
            </p>
          </div>

          {/* 3. Override per prodotto */}
          {selectedProducts.length > 0 && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">3. Configurazione per prodotto</h2>
              <p className="text-sm text-gray-500 mb-4">
                Puoi modificare la distribuzione stelle per ogni singolo prodotto
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-600">
                      <th className="py-2 pr-4 font-medium">Prodotto</th>
                      <th className="py-2 px-2 font-medium text-center">Commenti</th>
                      {STARS.map((star) => (
                        <th key={star} className="py-2 px-2 font-medium text-center">{star}★</th>
                      ))}
                      <th className="py-2 pl-2 font-medium text-center">Totale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProducts.map((product) => {
                      const dist = perProduct[product.id]?.distribution || globalDistribution;
                      const poolType = perProduct[product.id]?.poolType || detectPoolType(product);
                      return (
                        <tr key={product.id} className="border-b border-gray-100">
                          <td className="py-2 pr-4 text-gray-800">{product.name}</td>
                          <td className="py-2 px-2 text-center">
                            <select
                              value={poolType}
                              onChange={(e) =>
                                updateProductPool(product.id, e.target.value as CommentPoolType)
                              }
                              className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-olive focus:border-transparent"
                            >
                              <option value="food">🫒 Olio EVO</option>
                              <option value="beauty">✨ Beauty</option>
                            </select>
                          </td>
                          {STARS.map((star) => (
                            <td key={star} className="py-2 px-2 text-center">
                              <input
                                type="number"
                                min={0}
                                value={dist[star]}
                                onChange={(e) =>
                                  updateProductStar(product.id, star, parseInt(e.target.value, 10) || 0)
                                }
                                className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-olive focus:border-transparent"
                              />
                            </td>
                          ))}
                          <td className="py-2 pl-2 text-center font-semibold text-olive">
                            {totalFromDistribution(dist)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {poolWarnings.length > 0 && (
                <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
                  <p className="font-medium mb-1">⚠️ Alcuni commenti potrebbero ripetersi:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {poolWarnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                  <p className="mt-1">
                    Riduci le quantità oppure modifica a mano i commenti duplicati nell'anteprima.
                  </p>
                </div>
              )}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Totale complessivo: <strong className="text-olive">{totalToGenerate}</strong> recensioni
                </p>
                <button
                  onClick={handleGeneratePreview}
                  disabled={totalToGenerate === 0}
                  className="px-6 py-2 bg-olive text-white rounded-lg hover:bg-olive/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Genera anteprima
                </button>
              </div>
            </div>
          )}

          {/* 4. Anteprima editabile */}
          {preview && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">4. Anteprima ({previewTotal} recensioni)</h2>
                  <p className="text-sm text-gray-500">
                    Modifica nomi e commenti, rigenera (🎲) o elimina le singole recensioni prima di salvare
                  </p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving || previewTotal === 0}
                  className="px-6 py-2 bg-olive text-white rounded-lg hover:bg-olive/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium whitespace-nowrap"
                >
                  {saving ? 'Salvataggio...' : `Salva ${previewTotal} recensioni`}
                </button>
              </div>

              <div className="space-y-4">
                {selectedProducts.map((product) => {
                  const reviews = preview[product.id] || [];
                  if (reviews.length === 0) return null;
                  const isCollapsed = collapsed.has(product.id);
                  return (
                    <div key={product.id} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleCollapsed(product.id)}
                        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900">
                          {product.name}{' '}
                          <span className="text-sm text-gray-500">({reviews.length} recensioni)</span>
                        </span>
                        <svg
                          className={`w-5 h-5 text-gray-500 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {!isCollapsed && (
                        <div className="border-t border-gray-100 divide-y divide-gray-100">
                          {reviews.map((review, index) => (
                            <div key={index} className="p-4">
                              <div className="flex flex-wrap items-center gap-3 mb-2">
                                {renderStars(review.rating, (value) =>
                                  updateReview(product.id, index, {
                                    rating: value,
                                    comment: generateComment(
                                      value,
                                      review.productName,
                                      perProduct[product.id]?.poolType || 'food'
                                    ),
                                  })
                                )}
                                <input
                                  type="text"
                                  value={review.customerName}
                                  onChange={(e) =>
                                    updateReview(product.id, index, { customerName: e.target.value })
                                  }
                                  className="px-2 py-1 border border-gray-300 rounded text-sm w-40 focus:ring-2 focus:ring-olive focus:border-transparent"
                                />
                                <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={review.isAnonymous}
                                    onChange={(e) =>
                                      updateReview(product.id, index, { isAnonymous: e.target.checked })
                                    }
                                    className="accent-olive"
                                  />
                                  Anonimo
                                </label>
                                <span className="text-xs text-gray-500 ml-auto">{formatDate(review.createdAt)}</span>
                                <button
                                  onClick={() => regenerateComment(product.id, index)}
                                  title="Rigenera commento"
                                  className="text-lg cursor-pointer hover:scale-110 transition-transform"
                                >
                                  🎲
                                </button>
                                <button
                                  onClick={() => removeReview(product.id, index)}
                                  title="Elimina recensione"
                                  className="text-red-500 hover:text-red-700 cursor-pointer"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                              <textarea
                                value={review.comment}
                                onChange={(e) =>
                                  updateReview(product.id, index, { comment: e.target.value })
                                }
                                maxLength={500}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-olive focus:border-transparent resize-y"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
