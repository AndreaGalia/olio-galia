'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import HTMLEditor from '@/components/admin/HTMLEditor';
import VariantTabs from '@/components/admin/VariantTabs';
import VariantFormFields from '@/components/admin/VariantFormFields';
import type { VariantData } from '@/components/admin/VariantFormFields';
import { ProductTranslations } from '@/types/products';

interface ProductFormData {
  category: string;
  price: string;
  originalPrice?: string;
  size: string;
  weight: number; // Peso in grammi (usato per calcolo spedizione)
  color: string;
  images: string[];
  nutritionalInfo: Record<string, string>;
  customBadge?: string; // Badge personalizzato (es: "Campagna Olearia 2024")
  translations: {
    it: ProductTranslations;
    en: ProductTranslations;
  };
  slug: {
    it: string;
    en: string;
  };
  // Campi Stripe opzionali
  isStripeProduct: boolean;
  stripeProductId?: string;
  stripePriceId?: string;
  // Visibilità Homepage
  featured: boolean;
  // Subscription
  isSubscribable: boolean;
  stripeRecurringPriceIds?: Record<string, Record<string, string>>;
  subscriptionPrices?: Record<string, Record<string, Record<string, string>>>;
}

interface Category {
  id: string;
  name: string;
}

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [activeQtyTab, setActiveQtyTab] = useState<number>(1);
  const [hasVariants, setHasVariants] = useState(false);
  const [activeVariantTab, setActiveVariantTab] = useState(0);
  const [variantLabelIt, setVariantLabelIt] = useState('');
  const [variantLabelEn, setVariantLabelEn] = useState('');
  const [variants, setVariants] = useState<VariantData[]>([]);

  const createEmptyVariant = (): VariantData => ({
    variantId: '',
    translations: {
      it: { name: '', description: '' },
      en: { name: '', description: '' },
    },
    stripeProductId: '',
    stripePriceId: '',
    price: '',
    originalPrice: undefined,
    inStock: false,
    stockQuantity: 0,
    images: [''],
    color: undefined,
  });

  const [formData, setFormData] = useState<ProductFormData>({
    category: '',
    price: '',
    originalPrice: '',
    size: '',
    weight: 0, // Default: 0 grammi
    color: '',
    images: [''],
    nutritionalInfo: {},
    customBadge: '', // Badge personalizzato opzionale
    translations: {
      it: {
        name: '',
        description: '',
        longDescription: '',
        details: '',
        categoryDisplay: '',
        badge: '',
        features: [''],
        bestFor: '',
        origin: '',
        harvest: '',
        processing: '',
        awards: [''],
        seoKeywords: [''],
        tags: [''],
        metaTitle: '',
        metaDescription: '',
        focusKeyphrase: ''
      },
      en: {
        name: '',
        description: '',
        longDescription: '',
        details: '',
        categoryDisplay: '',
        badge: '',
        features: [''],
        bestFor: '',
        origin: '',
        harvest: '',
        processing: '',
        awards: [''],
        seoKeywords: [''],
        tags: [''],
        metaTitle: '',
        metaDescription: '',
        focusKeyphrase: ''
      }
    },
    slug: {
      it: '',
      en: ''
    },
    // Default: non è un prodotto Stripe (creazione manuale)
    isStripeProduct: false,
    stripeProductId: '',
    stripePriceId: '',
    // Default: non in evidenza
    featured: false,
    // Subscription
    isSubscribable: false,
    stripeRecurringPriceIds: {
      italia: { month: '', bimonth: '', quarter: '', semester: '' },
      europa: { month: '', bimonth: '', quarter: '', semester: '' },
      america: { month: '', bimonth: '', quarter: '', semester: '' },
      mondo: { month: '', bimonth: '', quarter: '', semester: '' },
    },
    subscriptionPrices: {
      '1': {
        italia: { month: '', bimonth: '', quarter: '', semester: '' },
        europa: { month: '', bimonth: '', quarter: '', semester: '' },
        america: { month: '', bimonth: '', quarter: '', semester: '' },
        mondo: { month: '', bimonth: '', quarter: '', semester: '' },
      },
    }
  });

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
        
        setError('Errore nel caricamento delle categorie');
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Aggiorna automaticamente categoryDisplay quando cambia la categoria
  useEffect(() => {
    if (formData.category && categories.length > 0) {
      const selectedCategory = categories.find(cat => cat.id === formData.category);
      if (selectedCategory) {
        setFormData(prev => ({
          ...prev,
          translations: {
            it: {
              ...prev.translations.it,
              categoryDisplay: selectedCategory.name
            },
            en: {
              ...prev.translations.en,
              categoryDisplay: selectedCategory.name
            }
          }
        }));
      }
    }
  }, [formData.category, categories]);

  const updateTranslation = (lang: 'it' | 'en', field: keyof ProductTranslations, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: {
          ...prev.translations[lang],
          [field]: value
        }
      }
    }));
  };

  const updateArrayField = (lang: 'it' | 'en', field: keyof ProductTranslations, index: number, value: string) => {
    setFormData(prev => {
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
    setFormData(prev => {
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
    setFormData(prev => {
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

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validazione base
      if (!formData.translations.it.name || !formData.translations.en.name || !formData.category || !formData.price) {
        throw new Error('Nome (IT/EN), categoria e prezzo sono obbligatori');
      }

      // Validazione varianti
      if (hasVariants) {
        if (variants.length === 0) {
          throw new Error('Aggiungi almeno una variante');
        }
        for (let i = 0; i < variants.length; i++) {
          const v = variants[i];
          if (!v.translations.it.name || !v.translations.en.name) {
            throw new Error(`Variante ${i + 1}: nome IT e EN sono obbligatori`);
          }
          if (!v.stripeProductId || !v.stripeProductId.startsWith('prod_')) {
            throw new Error(`Variante "${v.translations.it.name}": Stripe Product ID non valido (deve iniziare con "prod_")`);
          }
          if (!v.stripePriceId || !v.stripePriceId.startsWith('price_')) {
            throw new Error(`Variante "${v.translations.it.name}": Stripe Price ID non valido (deve iniziare con "price_")`);
          }
          if (!v.price || parseFloat(v.price) <= 0) {
            throw new Error(`Variante "${v.translations.it.name}": prezzo non valido`);
          }
          if (v.images.filter(img => img.trim()).length === 0) {
            throw new Error(`Variante "${v.translations.it.name}": aggiungi almeno un'immagine`);
          }
        }
      }

      // Validazione Stripe se selezionato (solo per prodotti senza varianti)
      if (formData.isStripeProduct && !hasVariants) {
        if (!formData.stripeProductId || !formData.stripePriceId) {
          throw new Error('Se il prodotto è configurato con Stripe, devi inserire Stripe Product ID e Stripe Price ID');
        }
        if (!formData.stripeProductId.startsWith('prod_')) {
          throw new Error('Stripe Product ID deve iniziare con "prod_"');
        }
        if (!formData.stripePriceId.startsWith('price_')) {
          throw new Error('Stripe Price ID deve iniziare con "price_"');
        }
      }

      // Genera slug automaticamente se non specificati
      const finalData = {
        ...formData,
        slug: {
          it: formData.slug.it || generateSlug(formData.translations.it.name),
          en: formData.slug.en || generateSlug(formData.translations.en.name)
        },
        // Filtra array vuoti
        translations: {
          it: {
            ...formData.translations.it,
            features: formData.translations.it.features.filter(f => f.trim()),
            awards: formData.translations.it.awards.filter(a => a.trim()),
            seoKeywords: formData.translations.it.seoKeywords.filter(k => k.trim()),
            tags: formData.translations.it.tags.filter(t => t.trim())
          },
          en: {
            ...formData.translations.en,
            features: formData.translations.en.features.filter(f => f.trim()),
            awards: formData.translations.en.awards.filter(a => a.trim()),
            seoKeywords: formData.translations.en.seoKeywords.filter(k => k.trim()),
            tags: formData.translations.en.tags.filter(t => t.trim())
          }
        },
        images: formData.images.filter(img => img.trim()),
        // Varianti
        ...(hasVariants ? {
          hasVariants: true,
          variantLabel: { it: variantLabelIt, en: variantLabelEn },
          variants: variants.map(v => ({
            ...v,
            images: v.images.filter(img => img.trim()),
          })),
        } : {}),
        // Subscription
        isSubscribable: formData.isSubscribable,
        stripeRecurringPriceIds: formData.isSubscribable ? formData.stripeRecurringPriceIds : undefined,
        subscriptionPrices: formData.isSubscribable ? formData.subscriptionPrices : undefined,
        // Includi i campi Stripe solo se configurati
        ...(formData.isStripeProduct ? {
          stripeProductId: formData.stripeProductId,
          stripePriceId: formData.stripePriceId,
          // Imposta l'ID principale del prodotto con lo Stripe Product ID
          id: formData.stripeProductId 
        } : {})
      };

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nella creazione del prodotto');
      }

      const result = await response.json();
      
      router.push('/admin/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout
      title="Crea Nuovo Prodotto"
      subtitle="Aggiungi un nuovo prodotto al catalogo"
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
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Informazioni Base */}
          <section>
            <h3 className="text-lg font-semibold text-olive mb-4">Informazioni Base</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                  required
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Prezzo (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                  placeholder="19.99"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prezzo Originale (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                  className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                  placeholder="24.99"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dimensione</label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                  className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                  placeholder="500ml"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Badge Personalizzato
                  <span className="text-xs text-gray-500 ml-2 font-normal">(opzionale)</span>
                </label>
                <input
                  type="text"
                  value={formData.customBadge}
                  onChange={(e) => setFormData(prev => ({ ...prev, customBadge: e.target.value }))}
                  className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                  placeholder="Es: Campagna Olearia 2024, NOVITÀ, LIMITED"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Verrà mostrato come badge nell'angolo destro dell'immagine prodotto
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso (grammi) *
                  <span className="text-xs text-gray-500 ml-2 font-normal">
                    (usato per calcolo spedizione)
                  </span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                  placeholder="500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Esempio: Bottiglia 500ml olio = 500g. Confezione regalo 2 bottiglie = 1000g.
                </p>

                {/* Conversione automatica kg → grammi */}
                {formData.weight > 0 && (
                  <p className="text-xs text-olive mt-1">
                    = {(formData.weight / 1000).toFixed(2)} kg
                  </p>
                )}

                {/* Pulsanti rapidi per pesi comuni */}
                <div className="mt-3">
                  <p className="text-xs text-gray-600 mb-2">Pesi comuni:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: '250ml (250g)', grams: 250 },
                      { label: '500ml (500g)', grams: 500 },
                      { label: '750ml (750g)', grams: 750 },
                      { label: '1L (1000g)', grams: 1000 },
                      { label: 'Confezione 2x500ml', grams: 1000 },
                      { label: 'Confezione 3x500ml', grams: 1500 },
                    ].map((preset) => (
                      <button
                        key={preset.grams}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, weight: preset.grams }))}
                        className="px-3 py-1.5 text-xs rounded border bg-white text-olive border-olive/30 hover:bg-olive/5 transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Colore</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                  placeholder="Verde"
                />
              </div>
            </div>
          </section>

          {/* Visibilità Homepage */}
          <section>
            <h3 className="text-lg font-semibold text-olive mb-4">Visibilità Homepage</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="mt-1 h-4 w-4 text-olive focus:ring-olive border-olive/30 rounded"
                />
                <div className="flex-1">
                  <label htmlFor="featured" className="font-medium text-gray-900 cursor-pointer">
                    ⭐ Mostra in Homepage
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    Seleziona questa opzione per mostrare il prodotto nella homepage (max 3 prodotti in evidenza).
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Configurazione Stripe */}
          <section>
            <h3 className="text-lg font-semibold text-olive mb-4">Configurazione Stripe</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="isStripeProduct"
                  checked={formData.isStripeProduct}
                  onChange={(e) => setFormData(prev => ({ ...prev, isStripeProduct: e.target.checked }))}
                  className="mt-1 h-4 w-4 text-olive focus:ring-olive border-olive/30 rounded"
                />
                <div className="flex-1">
                  <label htmlFor="isStripeProduct" className="font-medium text-gray-900 cursor-pointer">
                    ✓ Questo è un prodotto Stripe
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    Seleziona questa opzione se hai già creato il prodotto su Stripe e vuoi collegarlo manualmente inserendo gli ID.
                    Se non selezionato, il prodotto sarà vendibile solo tramite Checkout Torino.
                  </p>
                </div>
              </div>
            </div>

            {/* Campi ID Stripe - visibili solo se checkbox è selezionata */}
            {formData.isStripeProduct && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stripe Product ID *
                  </label>
                  <input
                    type="text"
                    value={formData.stripeProductId}
                    onChange={(e) => setFormData(prev => ({ ...prev, stripeProductId: e.target.value }))}
                    className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive font-mono text-sm"
                    placeholder="prod_xxxxxxxxxxxxx"
                    required={formData.isStripeProduct}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Inserisci l'ID del prodotto dalla dashboard Stripe (inizia con "prod_")
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stripe Price ID *
                  </label>
                  <input
                    type="text"
                    value={formData.stripePriceId}
                    onChange={(e) => setFormData(prev => ({ ...prev, stripePriceId: e.target.value }))}
                    className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive font-mono text-sm"
                    placeholder="price_xxxxxxxxxxxxx"
                    required={formData.isStripeProduct}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Inserisci l'ID del prezzo dalla dashboard Stripe (inizia con "price_")
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Varianti Prodotto */}
          <section>
            <h3 className="text-lg font-semibold text-olive mb-4">Varianti Prodotto</h3>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="hasVariants"
                  checked={hasVariants}
                  onChange={(e) => {
                    setHasVariants(e.target.checked);
                    if (e.target.checked && variants.length === 0) {
                      setVariants([createEmptyVariant()]);
                    }
                  }}
                  className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-purple-300 rounded"
                />
                <div className="flex-1">
                  <label htmlFor="hasVariants" className="font-medium text-gray-900 cursor-pointer">
                    Questo prodotto ha varianti
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    Attiva per prodotti con varianti (es: fragranze, formati). Ogni variante ha il proprio Stripe ID, prezzo, stock e immagini.
                  </p>
                </div>
              </div>
            </div>

            {hasVariants && (
              <div className="space-y-4">
                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    <strong>Nota:</strong> Quando le varianti sono attive, i campi Stripe Product ID, Stripe Price ID, prezzo e stock
                    del prodotto base vengono ignorati. Ogni variante ha i propri valori.
                  </p>
                </div>

                {/* Label variante */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Etichetta Variante (IT)
                      <span className="text-xs text-nocciola ml-2">(es: Fragranza, Formato)</span>
                    </label>
                    <input
                      type="text"
                      value={variantLabelIt}
                      onChange={(e) => setVariantLabelIt(e.target.value)}
                      className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                      placeholder="Fragranza"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Variant Label (EN)
                      <span className="text-xs text-nocciola ml-2">(e.g: Fragrance, Format)</span>
                    </label>
                    <input
                      type="text"
                      value={variantLabelEn}
                      onChange={(e) => setVariantLabelEn(e.target.value)}
                      className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                      placeholder="Fragrance"
                    />
                  </div>
                </div>

                {/* Tabs + Form */}
                <VariantTabs
                  variants={variants}
                  activeIndex={activeVariantTab}
                  onSelectTab={setActiveVariantTab}
                  onRemoveVariant={(index) => {
                    const newVariants = variants.filter((_, i) => i !== index);
                    setVariants(newVariants);
                    if (activeVariantTab >= newVariants.length) {
                      setActiveVariantTab(Math.max(0, newVariants.length - 1));
                    }
                  }}
                  onAddVariant={() => {
                    setVariants([...variants, createEmptyVariant()]);
                    setActiveVariantTab(variants.length);
                  }}
                />

                {variants[activeVariantTab] && (
                  <VariantFormFields
                    variant={variants[activeVariantTab]}
                    onChange={(updated) => {
                      const newVariants = [...variants];
                      newVariants[activeVariantTab] = updated;
                      setVariants(newVariants);
                    }}
                  />
                )}
              </div>
            )}
          </section>

          {/* Configurazione Abbonamento */}
          <section>
            <h3 className="text-lg font-semibold text-olive mb-4">Configurazione Abbonamento</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="isSubscribable"
                  checked={formData.isSubscribable}
                  onChange={(e) => setFormData(prev => ({ ...prev, isSubscribable: e.target.checked }))}
                  className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-green-300 rounded"
                />
                <div className="flex-1">
                  <label htmlFor="isSubscribable" className="font-medium text-gray-900 cursor-pointer">
                    Abilita Abbonamento
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    Attiva per permettere ai clienti di abbonarsi a questo prodotto. Devi configurare i Price ID ricorrenti su Stripe.
                  </p>
                </div>
              </div>
            </div>

            {formData.isSubscribable && (() => {
              const qtyTabs: number[] = formData.subscriptionPrices
                ? Object.keys(formData.subscriptionPrices).map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b)
                : [];
              if (qtyTabs.length === 0) qtyTabs.push(1);
              const nextQty = qtyTabs.length > 0 ? Math.max(...qtyTabs) + 1 : 1;

              return (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Inserisci i Price ID ricorrenti di Stripe per ogni combinazione quantità/zona/intervallo.
                    Il prezzo deve includere la spedizione. Lascia vuoto le combinazioni non disponibili.
                  </p>

                  {/* Tab Quantità dinamici */}
                  <div className="flex items-center border-b border-green-200">
                    {qtyTabs.map(qty => (
                      <div key={qty} className="relative flex items-center">
                        <button
                          type="button"
                          onClick={() => setActiveQtyTab(qty)}
                          className={`px-4 py-2 text-sm font-medium transition-colors ${
                            activeQtyTab === qty
                              ? 'border-b-2 border-green-600 text-green-700 bg-green-50'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {qty} {qty === 1 ? 'Bottiglia' : 'Bottiglie'}
                        </button>
                        {qtyTabs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => {
                                const newPrices = { ...prev.subscriptionPrices };
                                delete newPrices[String(qty)];
                                return { ...prev, subscriptionPrices: newPrices };
                              });
                              if (activeQtyTab === qty) {
                                setActiveQtyTab(qtyTabs.find(q => q !== qty) || 1);
                              }
                            }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                            title={`Rimuovi ${qty} ${qty === 1 ? 'bottiglia' : 'bottiglie'}`}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          subscriptionPrices: {
                            ...prev.subscriptionPrices,
                            [String(nextQty)]: {
                              italia: { month: '', bimonth: '', quarter: '', semester: '' },
                              europa: { month: '', bimonth: '', quarter: '', semester: '' },
                              america: { month: '', bimonth: '', quarter: '', semester: '' },
                              mondo: { month: '', bimonth: '', quarter: '', semester: '' },
                            }
                          }
                        }));
                        setActiveQtyTab(nextQty);
                      }}
                      className="ml-2 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50 border border-green-300 rounded transition-colors"
                      title="Aggiungi quantità"
                    >
                      + Aggiungi
                    </button>
                  </div>

                  {/* Griglia per la quantità selezionata */}
                  {qtyTabs.includes(activeQtyTab) && (['italia', 'europa', 'america', 'mondo'] as const).map(zone => (
                    <div key={zone} className="border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-olive mb-3 capitalize">{zone}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {(['month', 'bimonth', 'quarter', 'semester'] as const).map(interval => (
                          <div key={interval}>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              {interval === 'month' ? 'Mensile' : interval === 'bimonth' ? 'Bimestrale' : interval === 'quarter' ? 'Trimestrale' : 'Semestrale'}
                            </label>
                            <input
                              type="text"
                              value={formData.subscriptionPrices?.[String(activeQtyTab)]?.[zone]?.[interval] || ''}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                subscriptionPrices: {
                                  ...prev.subscriptionPrices,
                                  [String(activeQtyTab)]: {
                                    ...prev.subscriptionPrices?.[String(activeQtyTab)],
                                    [zone]: {
                                      ...prev.subscriptionPrices?.[String(activeQtyTab)]?.[zone],
                                      [interval]: e.target.value
                                    }
                                  }
                                }
                              }))}
                              className="w-full px-2 py-1.5 border border-olive/30 rounded text-xs font-mono focus:ring-2 focus:ring-green-200 focus:border-green-500"
                              placeholder="price_xxx"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </section>

          {/* Immagini */}
          <section>
            <h3 className="text-lg font-semibold text-olive mb-4">Immagini</h3>
            {formData.images.map((image, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={image}
                  onChange={(e) => {
                    const newImages = [...formData.images];
                    newImages[index] = e.target.value;
                    setFormData(prev => ({ ...prev, images: newImages }));
                  }}
                  className="flex-1 px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                  placeholder="URL immagine o percorso"
                />
                {formData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = formData.images.filter((_, i) => i !== index);
                      setFormData(prev => ({ ...prev, images: newImages }));
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
              onClick={() => setFormData(prev => ({ ...prev, images: [...prev.images, ''] }))}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                <input
                  type="text"
                  value={formData.translations.it.name}
                  onChange={(e) => updateTranslation('it', 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrizione Breve</label>
                <textarea
                  value={formData.translations.it.description}
                  onChange={(e) => updateTranslation('it', 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrizione Lunga</label>
                <textarea
                  value={formData.translations.it.longDescription}
                  onChange={(e) => updateTranslation('it', 'longDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                  rows={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dettagli</label>
                <textarea
                  value={formData.translations.it.details}
                  onChange={(e) => updateTranslation('it', 'details', e.target.value)}
                  className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                  rows={4}
                  placeholder="Dettagli aggiuntivi sul prodotto"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria Visualizzata *
                    <span className="text-xs text-nocciola ml-2">(auto-popolata)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.translations.it.categoryDisplay}
                    onChange={(e) => updateTranslation('it', 'categoryDisplay', e.target.value)}
                    className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                    placeholder="Es: Olio Extra Vergine"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Badge</label>
                  <input
                    type="text"
                    value={formData.translations.it.badge}
                    onChange={(e) => updateTranslation('it', 'badge', e.target.value)}
                    className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                    placeholder="Es: Biologico, DOP"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Caratteristiche</label>
                {formData.translations.it.features.map((feature, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateArrayField('it', 'features', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                      placeholder="Caratteristica del prodotto"
                    />
                    {formData.translations.it.features.length > 1 && (
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

              {/* Campi SEO Italiano */}
              <div className="pt-4 border-t border-olive/10">
                <h4 className="text-md font-semibold text-olive mb-3">📈 Ottimizzazione SEO</h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Title (Titolo SEO)
                      <span className="text-xs text-nocciola ml-2">(max 60 caratteri consigliati)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.translations.it.metaTitle || ''}
                      onChange={(e) => updateTranslation('it', 'metaTitle', e.target.value)}
                      className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                      placeholder="Titolo ottimizzato per i motori di ricerca"
                      maxLength={70}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.translations.it.metaTitle?.length || 0}/60 caratteri
                      {(formData.translations.it.metaTitle?.length || 0) > 60 &&
                        <span className="text-orange-600 ml-2">⚠️ Troppo lungo</span>}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                      <span className="text-xs text-nocciola ml-2">(max 160 caratteri consigliati)</span>
                    </label>
                    <textarea
                      value={formData.translations.it.metaDescription || ''}
                      onChange={(e) => updateTranslation('it', 'metaDescription', e.target.value)}
                      className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                      placeholder="Descrizione che apparirà nei risultati di ricerca Google"
                      rows={3}
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.translations.it.metaDescription?.length || 0}/160 caratteri
                      {(formData.translations.it.metaDescription?.length || 0) > 160 &&
                        <span className="text-orange-600 ml-2">⚠️ Troppo lungo</span>}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parola Chiave Principale (Focus Keyphrase)
                    </label>
                    <input
                      type="text"
                      value={formData.translations.it.focusKeyphrase || ''}
                      onChange={(e) => updateTranslation('it', 'focusKeyphrase', e.target.value)}
                      className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                      placeholder="es: olio extravergine biologico"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      La parola chiave principale su cui vuoi posizionarti
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parole Chiave Secondarie (SEO Keywords)
                    </label>
                    {formData.translations.it.seoKeywords.map((keyword, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={keyword}
                          onChange={(e) => updateArrayField('it', 'seoKeywords', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                          placeholder="Parola chiave secondaria"
                        />
                        {formData.translations.it.seoKeywords.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayField('it', 'seoKeywords', index)}
                            className="px-3 py-2 text-red-600 hover:text-red-800"
                          >
                            Rimuovi
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayField('it', 'seoKeywords')}
                      className="px-3 py-2 text-olive hover:text-salvia text-sm"
                    >
                      + Aggiungi Parola Chiave
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Traduzioni Inglese */}
          <section>
            <h3 className="text-lg font-semibold text-olive mb-4">Traduzioni Inglese</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                <input
                  type="text"
                  value={formData.translations.en.name}
                  onChange={(e) => updateTranslation('en', 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrizione Breve</label>
                <textarea
                  value={formData.translations.en.description}
                  onChange={(e) => updateTranslation('en', 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrizione Lunga</label>
                <textarea
                  value={formData.translations.en.longDescription}
                  onChange={(e) => updateTranslation('en', 'longDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                  rows={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Details</label>
                <textarea
                  value={formData.translations.en.details}
                  onChange={(e) => updateTranslation('en', 'details', e.target.value)}
                  className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                  rows={4}
                  placeholder="Additional product details"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Display *
                    <span className="text-xs text-nocciola ml-2">(auto-populated)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.translations.en.categoryDisplay}
                    onChange={(e) => updateTranslation('en', 'categoryDisplay', e.target.value)}
                    className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                    placeholder="e.g: Extra Virgin Olive Oil"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Badge</label>
                  <input
                    type="text"
                    value={formData.translations.en.badge}
                    onChange={(e) => updateTranslation('en', 'badge', e.target.value)}
                    className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                    placeholder="e.g: Organic, DOP"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Caratteristiche</label>
                {formData.translations.en.features.map((feature, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateArrayField('en', 'features', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                      placeholder="Product feature"
                    />
                    {formData.translations.en.features.length > 1 && (
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

              {/* SEO Fields English */}
              <div className="pt-4 border-t border-olive/10">
                <h4 className="text-md font-semibold text-olive mb-3">📈 SEO Optimization</h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Title (SEO Title)
                      <span className="text-xs text-nocciola ml-2">(max 60 characters recommended)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.translations.en.metaTitle || ''}
                      onChange={(e) => updateTranslation('en', 'metaTitle', e.target.value)}
                      className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                      placeholder="SEO optimized title"
                      maxLength={70}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.translations.en.metaTitle?.length || 0}/60 characters
                      {(formData.translations.en.metaTitle?.length || 0) > 60 &&
                        <span className="text-orange-600 ml-2">⚠️ Too long</span>}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                      <span className="text-xs text-nocciola ml-2">(max 160 characters recommended)</span>
                    </label>
                    <textarea
                      value={formData.translations.en.metaDescription || ''}
                      onChange={(e) => updateTranslation('en', 'metaDescription', e.target.value)}
                      className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                      placeholder="Description that will appear in Google search results"
                      rows={3}
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.translations.en.metaDescription?.length || 0}/160 characters
                      {(formData.translations.en.metaDescription?.length || 0) > 160 &&
                        <span className="text-orange-600 ml-2">⚠️ Too long</span>}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Focus Keyphrase
                    </label>
                    <input
                      type="text"
                      value={formData.translations.en.focusKeyphrase || ''}
                      onChange={(e) => updateTranslation('en', 'focusKeyphrase', e.target.value)}
                      className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                      placeholder="e.g: organic extra virgin olive oil"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Main keyword you want to rank for
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Keywords (SEO Keywords)
                    </label>
                    {formData.translations.en.seoKeywords.map((keyword, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={keyword}
                          onChange={(e) => updateArrayField('en', 'seoKeywords', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                          placeholder="Secondary keyword"
                        />
                        {formData.translations.en.seoKeywords.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayField('en', 'seoKeywords', index)}
                            className="px-3 py-2 text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayField('en', 'seoKeywords')}
                      className="px-3 py-2 text-olive hover:text-salvia text-sm"
                    >
                      + Add Keyword
                    </button>
                  </div>
                </div>
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
              value={formData.translations.it.customHTML || ''}
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
              value={formData.translations.en.customHTML || ''}
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
              {Object.entries(formData.nutritionalInfo).map(([key, value], index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => {
                      const newNutritionalInfo = { ...formData.nutritionalInfo };
                      delete newNutritionalInfo[key];
                      newNutritionalInfo[e.target.value] = value;
                      setFormData(prev => ({ ...prev, nutritionalInfo: newNutritionalInfo }));
                    }}
                    className="flex-1 px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                    placeholder="es. Energia"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        nutritionalInfo: {
                          ...prev.nutritionalInfo,
                          [key]: e.target.value
                        }
                      }));
                    }}
                    className="flex-1 px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                    placeholder="es. 3404 kJ / 828 kcal"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newNutritionalInfo = { ...formData.nutritionalInfo };
                      delete newNutritionalInfo[key];
                      setFormData(prev => ({ ...prev, nutritionalInfo: newNutritionalInfo }));
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
                  const newKey = `nutriente_${Object.keys(formData.nutritionalInfo).length + 1}`;
                  setFormData(prev => ({
                    ...prev,
                    nutritionalInfo: {
                      ...prev.nutritionalInfo,
                      [newKey]: ''
                    }
                  }));
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
                        if (!formData.nutritionalInfo[nutrient.key]) {
                          setFormData(prev => ({
                            ...prev,
                            nutritionalInfo: {
                              ...prev.nutritionalInfo,
                              [nutrient.key]: nutrient.value
                            }
                          }));
                        }
                      }}
                      disabled={!!formData.nutritionalInfo[nutrient.key]}
                      className={`px-2 py-1 text-xs rounded border ${
                        formData.nutritionalInfo[nutrient.key]
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

          {/* Slug */}
          <section>
            <h3 className="text-lg font-semibold text-olive mb-4">URL Slug (opzionale)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug Italiano</label>
                <input
                  type="text"
                  value={formData.slug.it}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: { ...prev.slug, it: e.target.value } }))}
                  className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                  placeholder="olio-extra-vergine-biologico"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug Inglese</label>
                <input
                  type="text"
                  value={formData.slug.en}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: { ...prev.slug, en: e.target.value } }))}
                  className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                  placeholder="organic-extra-virgin-olive-oil"
                />
              </div>
            </div>
          </section>

          {/* Pulsanti */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-olive/10">
            <button
              type="button"
              onClick={() => router.push('/admin/products')}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              <span>{loading ? 'Creazione...' : 'Crea Prodotto'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}