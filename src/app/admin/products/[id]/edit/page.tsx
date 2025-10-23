'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import HTMLEditor from '@/components/admin/HTMLEditor';
import { ProductDocument, ProductTranslations } from '@/types/products';

interface Category {
  id: string;
  name: string;
}

interface ProductWithStripe extends ProductDocument {
  stripeData?: {
    name: string;
    price: number;
    available_quantity: number;
    active: boolean;
  };
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductWithStripe | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Carica prodotto
  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/products/${productId}`);
        if (!response.ok) {
          throw new Error('Prodotto non trovato');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore nel caricamento');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Carica le categorie da MongoDB
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await fetch('/api/categories?locale=it');
        if (!response.ok) {
          throw new Error('Errore nel caricamento delle categorie');
        }
        const data = await response.json();
        setCategories(data.categories);
      } catch (err) {
        
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const updateTranslation = (lang: 'it' | 'en', field: keyof ProductTranslations, value: string | string[]) => {
    if (!product) return;

    setProduct(prev => prev ? {
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: {
          ...prev.translations[lang],
          [field]: value
        }
      }
    } : null);
  };

  const updateArrayField = (lang: 'it' | 'en', field: keyof ProductTranslations, index: number, value: string) => {
    if (!product) return;

    setProduct(prev => {
      if (!prev) return null;
      const currentArray = prev.translations[lang][field] as string[];
      const newArray = [...currentArray];
      newArray[index] = value;
      return {
        ...prev,
        translations: {
          ...prev.translations,
          [lang]: {
            ...prev.translations[lang],
            [field]: newArray
          }
        }
      };
    });
  };

  const addArrayField = (lang: 'it' | 'en', field: keyof ProductTranslations) => {
    if (!product) return;

    setProduct(prev => {
      if (!prev) return null;
      const currentArray = prev.translations[lang][field] as string[];
      return {
        ...prev,
        translations: {
          ...prev.translations,
          [lang]: {
            ...prev.translations[lang],
            [field]: [...currentArray, '']
          }
        }
      };
    });
  };

  const removeArrayField = (lang: 'it' | 'en', field: keyof ProductTranslations, index: number) => {
    if (!product) return;

    setProduct(prev => {
      if (!prev) return null;
      const currentArray = prev.translations[lang][field] as string[];
      const newArray = currentArray.filter((_, i) => i !== index);
      return {
        ...prev,
        translations: {
          ...prev.translations,
          [lang]: {
            ...prev.translations[lang],
            [field]: newArray.length > 0 ? newArray : ['']
          }
        }
      };
    });
  };

  const handleUpdateStock = async (newQuantity: number) => {
    if (!product) return;

    try {
      const response = await fetch('/api/admin/products/update-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.stripeProductId,
          quantity: newQuantity
        })
      });

      if (!response.ok) {
        throw new Error('Errore nell\'aggiornamento dello stock');
      }

      // Aggiorna il prodotto locale
      setProduct(prev => prev ? {
        ...prev,
        stockQuantity: newQuantity,
        inStock: newQuantity > 0,
        stripeData: prev.stripeData ? {
          ...prev.stripeData,
          available_quantity: newQuantity
        } : undefined
      } : null);

    } catch (err) {
      alert(err instanceof Error ? err.message : 'Errore nell\'aggiornamento');
    }
  };

  const handleSave = async () => {
    if (!product) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: product.category,
          price: product.price,
          originalPrice: product.originalPrice,
          size: product.size,
          color: product.color,
          images: product.images.filter(img => img && img.trim() !== ''),
          nutritionalInfo: product.nutritionalInfo,
          translations: {
            it: {
              ...product.translations.it,
              features: product.translations.it.features.filter(f => f.trim()),
              awards: product.translations.it.awards.filter(a => a.trim()),
              seoKeywords: product.translations.it.seoKeywords.filter(k => k.trim()),
              tags: product.translations.it.tags.filter(t => t.trim())
            },
            en: {
              ...product.translations.en,
              features: product.translations.en.features.filter(f => f.trim()),
              awards: product.translations.en.awards.filter(a => a.trim()),
              seoKeywords: product.translations.en.seoKeywords.filter(k => k.trim()),
              tags: product.translations.en.tags.filter(t => t.trim())
            }
          },
          slug: product.slug
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nel salvataggio');
      }

      router.push('/admin/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Caricamento..." subtitle="">
        <LoadingSpinner message="Caricamento prodotto..." />
      </AdminLayout>
    );
  }

  if (error && !product) {
    return (
      <AdminLayout title="Errore" subtitle="">
        <div className="p-8 text-center">
          <div className="text-red-600 text-lg">{error}</div>
          <button
            onClick={() => router.push('/admin/products')}
            className="mt-4 px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors"
          >
            Torna alla Lista
          </button>
        </div>
      </AdminLayout>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <AdminLayout
      title={`Modifica: ${product.translations.it.name}`}
      subtitle="Modifica le informazioni del prodotto"
      headerActions={
        <button
          onClick={() => router.push('/admin/products')}
          className="px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors"
        >
          Torna alla Lista
        </button>
      }
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 overflow-hidden">
        <div className="p-6 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Quick Stock Update */}
          <section className="bg-olive/5 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-olive mb-3">Gestione Stock Rapida</h3>
            <div className="flex items-center space-x-4">
              <div>
                <span className="text-sm text-gray-600">Stock attuale:</span>
                <span className={`ml-2 font-bold ${
                  (product.stripeData?.available_quantity || 0) > 10 ? 'text-green-600' :
                  (product.stripeData?.available_quantity || 0) > 0 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {product.stripeData?.available_quantity || 0}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  defaultValue={product.stripeData?.available_quantity || 0}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value) || 0;
                    if (e.target.value !== '' && newValue !== (product.stripeData?.available_quantity || 0)) {
                      const timeoutId = setTimeout(() => {
                        handleUpdateStock(newValue);
                      }, 1000);
                      return () => clearTimeout(timeoutId);
                    }
                  }}
                  className="w-20 px-2 py-1 border border-olive/30 rounded text-center"
                />
                <span className="text-sm text-gray-500">unità</span>
              </div>
            </div>
          </section>

          {/* Informazioni Base */}
          <section>
            <h3 className="text-lg font-semibold text-olive mb-4">Informazioni Base</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                <select
                  value={product.category}
                  onChange={(e) => setProduct(prev => prev ? { ...prev, category: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                  disabled={categoriesLoading}
                >
                  <option value="">
                    {categoriesLoading ? 'Caricamento categorie...' : 'Seleziona categoria...'}
                  </option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {categoriesLoading && (
                  <p className="mt-1 text-xs text-nocciola">Caricamento categorie da MongoDB...</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prezzo (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={product.price}
                  onChange={(e) => setProduct(prev => prev ? { ...prev, price: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dimensione</label>
                <input
                  type="text"
                  value={product.size}
                  onChange={(e) => setProduct(prev => prev ? { ...prev, size: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Colore</label>
                <input
                  type="text"
                  value={product.color}
                  onChange={(e) => setProduct(prev => prev ? { ...prev, color: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                />
              </div>
            </div>
          </section>

          {/* Immagini */}
          <section>
            <h3 className="text-lg font-semibold text-olive mb-4">Immagini</h3>
            {product.images.map((image, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={image}
                  onChange={(e) => {
                    const newImages = [...product.images];
                    newImages[index] = e.target.value;
                    setProduct(prev => prev ? { ...prev, images: newImages } : null);
                  }}
                  className="flex-1 px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                  placeholder="https://esempio.com/immagine.jpg"
                />
                {product.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = product.images.filter((_, i) => i !== index);
                      setProduct(prev => prev ? { ...prev, images: newImages.length > 0 ? newImages : [''] } : null);
                    }}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    Rimuovi
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setProduct(prev => prev ? { ...prev, images: [...prev.images, ''] } : null)}
              className="px-3 py-2 text-olive hover:text-salvia text-sm"
            >
              + Aggiungi Immagine
            </button>
          </section>

          {/* Traduzioni Italiano */}
          <section>
            <h3 className="text-lg font-semibold text-olive mb-4">Traduzioni Italiano</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                <input
                  type="text"
                  value={product.translations.it.name}
                  onChange={(e) => updateTranslation('it', 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrizione Breve</label>
                <textarea
                  value={product.translations.it.description}
                  onChange={(e) => updateTranslation('it', 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria Visualizzata *</label>
                  <input
                    type="text"
                    value={product.translations.it.categoryDisplay}
                    onChange={(e) => updateTranslation('it', 'categoryDisplay', e.target.value)}
                    className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                    placeholder="Es: Olio Extra Vergine"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Badge</label>
                  <input
                    type="text"
                    value={product.translations.it.badge}
                    onChange={(e) => updateTranslation('it', 'badge', e.target.value)}
                    className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                    placeholder="Es: Biologico, DOP"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Caratteristiche</label>
                {product.translations.it.features.map((feature, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateArrayField('it', 'features', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                    />
                    {product.translations.it.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField('it', 'features', index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        Rimuovi
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('it', 'features')}
                  className="px-3 py-2 text-olive hover:text-salvia text-sm"
                >
                  + Aggiungi Caratteristica
                </button>
              </div>
            </div>
          </section>

          {/* Traduzioni Inglese */}
          <section>
            <h3 className="text-lg font-semibold text-olive mb-4">Traduzioni Inglese</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                <input
                  type="text"
                  value={product.translations.en.name}
                  onChange={(e) => updateTranslation('en', 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrizione Breve</label>
                <textarea
                  value={product.translations.en.description}
                  onChange={(e) => updateTranslation('en', 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category Display *</label>
                  <input
                    type="text"
                    value={product.translations.en.categoryDisplay}
                    onChange={(e) => updateTranslation('en', 'categoryDisplay', e.target.value)}
                    className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                    placeholder="e.g: Extra Virgin Olive Oil"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Badge</label>
                  <input
                    type="text"
                    value={product.translations.en.badge}
                    onChange={(e) => updateTranslation('en', 'badge', e.target.value)}
                    className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                    placeholder="e.g: Organic, DOP"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Caratteristiche</label>
                {product.translations.en.features.map((feature, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateArrayField('en', 'features', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                    />
                    {product.translations.en.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField('en', 'features', index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        Rimuovi
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('en', 'features')}
                  className="px-3 py-2 text-olive hover:text-salvia text-sm"
                >
                  + Add Feature
                </button>
              </div>
            </div>
          </section>

          {/* HTML Personalizzato Italiano */}
          <section>
            <h3 className="text-lg font-semibold text-olive mb-4">
              HTML Personalizzato (Italiano) - Opzionale
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700">
                <strong>⚠️ Nota:</strong> Se inserisci HTML personalizzato, questo sostituirà completamente
                il layout standard del prodotto. Lascia vuoto per usare il layout predefinito.
              </p>
            </div>
            <HTMLEditor
              value={product.translations.it.customHTML || ''}
              onChange={(value) => updateTranslation('it', 'customHTML', value)}
              label="Codice HTML Personalizzato (IT)"
              placeholder="Inserisci HTML personalizzato per la versione italiana..."
              height="500px"
            />
          </section>

          {/* HTML Personalizzato Inglese */}
          <section>
            <h3 className="text-lg font-semibold text-olive mb-4">
              Custom HTML (English) - Optional
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700">
                <strong>⚠️ Note:</strong> If you add custom HTML, it will completely replace
                the standard product layout. Leave empty to use the default layout.
              </p>
            </div>
            <HTMLEditor
              value={product.translations.en.customHTML || ''}
              onChange={(value) => updateTranslation('en', 'customHTML', value)}
              label="Custom HTML Code (EN)"
              placeholder="Insert custom HTML for the English version..."
              height="500px"
            />
          </section>

          {/* Informazioni Nutrizionali */}
          <section>
            <h3 className="text-lg font-semibold text-olive mb-4">Informazioni Nutrizionali (per 100g)</h3>
            <div className="space-y-3">
              {Object.entries(product.nutritionalInfo || {}).map(([key, value], index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => {
                      const newNutritionalInfo = { ...product.nutritionalInfo };
                      delete newNutritionalInfo[key];
                      newNutritionalInfo[e.target.value] = value;
                      setProduct(prev => prev ? { ...prev, nutritionalInfo: newNutritionalInfo } : null);
                    }}
                    className="flex-1 px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                    placeholder="es. Energia"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                      setProduct(prev => prev ? {
                        ...prev,
                        nutritionalInfo: {
                          ...prev.nutritionalInfo,
                          [key]: e.target.value
                        }
                      } : null);
                    }}
                    className="flex-1 px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                    placeholder="es. 3404 kJ / 828 kcal"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newNutritionalInfo = { ...product.nutritionalInfo };
                      delete newNutritionalInfo[key];
                      setProduct(prev => prev ? { ...prev, nutritionalInfo: newNutritionalInfo } : null);
                    }}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    Rimuovi
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  const newKey = `nutriente_${Object.keys(product.nutritionalInfo || {}).length + 1}`;
                  setProduct(prev => prev ? {
                    ...prev,
                    nutritionalInfo: {
                      ...prev.nutritionalInfo,
                      [newKey]: ''
                    }
                  } : null);
                }}
                className="px-3 py-2 text-olive hover:text-salvia text-sm"
              >
                + Aggiungi Informazione Nutrizionale
              </button>

              {/* Pulsanti rapidi per valori comuni */}
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Aggiungi rapidamente:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'Energia', value: 'kJ / kcal' },
                    { key: 'Grassi', value: 'g' },
                    { key: 'Grassi saturi', value: 'g' },
                    { key: 'Carboidrati', value: 'g' },
                    { key: 'Zuccheri', value: 'g' },
                    { key: 'Proteine', value: 'g' },
                    { key: 'Sale', value: 'g' },
                    { key: 'Fibre', value: 'g' },
                    { key: 'Vitamina E', value: 'mg' }
                  ].map((nutrient) => (
                    <button
                      key={nutrient.key}
                      type="button"
                      onClick={() => {
                        if (!product.nutritionalInfo?.[nutrient.key]) {
                          setProduct(prev => prev ? {
                            ...prev,
                            nutritionalInfo: {
                              ...prev.nutritionalInfo,
                              [nutrient.key]: nutrient.value
                            }
                          } : null);
                        }
                      }}
                      disabled={!!(product.nutritionalInfo?.[nutrient.key])}
                      className={`px-2 py-1 text-xs rounded border ${
                        product.nutritionalInfo?.[nutrient.key]
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'bg-white text-olive border-olive/30 hover:bg-olive/5'
                      }`}
                    >
                      {nutrient.key}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Pulsanti */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-olive/10">
            <button
              type="button"
              onClick={() => router.push('/admin/products')}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {saving && (
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              <span>{saving ? 'Salvataggio...' : 'Salva Modifiche'}</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}