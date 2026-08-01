'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import RelatedProductsSelector, { SelectableProduct } from '@/components/admin/RelatedProductsSelector';
import { Coordinates, GeocodeResult, POSCategoryAdmin } from '@/types/pointOfSale';

// Leaflet accede a `window` a import-time: va caricato solo lato client
const POSMapPicker = dynamic(() => import('./POSMapPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-72 w-full rounded-lg border border-olive/20 bg-beige flex items-center justify-center">
      <span className="text-sm text-nocciola">Caricamento mappa...</span>
    </div>
  ),
});

export interface PointOfSaleFormValues {
  name: string;
  categoryId: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  lat: string;
  lng: string;
  productIds: string[];
  notesIT: string;
  notesEN: string;
  displayOrder: string;
}

export const EMPTY_POS_FORM: PointOfSaleFormValues = {
  name: '',
  categoryId: '',
  street: '',
  city: '',
  province: '',
  postalCode: '',
  country: 'IT',
  lat: '',
  lng: '',
  productIds: [],
  notesIT: '',
  notesEN: '',
  displayOrder: '',
};

interface PointOfSaleFormProps {
  initialValues?: PointOfSaleFormValues;
  submitLabel: string;
  submitting: boolean;
  error?: string | null;
  onSubmit: (values: PointOfSaleFormValues) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full px-4 py-2.5 border border-olive/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive/30 focus:border-olive transition-colors';
const labelClass = 'block text-sm font-medium text-olive mb-1.5';
const cardClass = 'bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-olive/10 p-6';

export default function PointOfSaleForm({
  initialValues,
  submitLabel,
  submitting,
  error,
  onSubmit,
  onCancel,
}: PointOfSaleFormProps) {
  const [values, setValues] = useState<PointOfSaleFormValues>(initialValues ?? EMPTY_POS_FORM);
  const [categories, setCategories] = useState<POSCategoryAdmin[]>([]);
  const [products, setProducts] = useState<SelectableProduct[]>([]);
  const [localError, setLocalError] = useState('');

  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState('');
  const [geocodeResults, setGeocodeResults] = useState<GeocodeResult[]>([]);

  const set = <K extends keyof PointOfSaleFormValues>(key: K, value: PointOfSaleFormValues[K]) =>
    setValues(prev => ({ ...prev, [key]: value }));

  // Categorie attive per la select
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/points-of-sale/categories');
        if (!response.ok) return;
        const data = await response.json();
        if (data.success) {
          setCategories(
            (data.categories as POSCategoryAdmin[]).filter(category => category.metadata.isActive)
          );
        }
      } catch {
        // la select resta vuota: l'errore di salvataggio spiegherà il problema
      }
    };
    fetchCategories();
  }, []);

  // Catalogo prodotti per il selettore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/admin/products');
        if (!response.ok) return;
        const data = await response.json();
        setProducts(
          (data as Array<{ id: string; translations?: { it?: { name?: string } }; images?: string[] }>).map(p => ({
            id: p.id,
            name: p.translations?.it?.name || p.id,
            image: p.images?.[0],
          }))
        );
      } catch {
        // selettore vuoto, il resto della form resta usabile
      }
    };
    fetchProducts();
  }, []);

  const coordinates: Coordinates | null = useMemo(() => {
    const lat = parseFloat(values.lat);
    const lng = parseFloat(values.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    return { lat, lng };
  }, [values.lat, values.lng]);

  const handleGeocode = async () => {
    const parts = [values.street, values.postalCode, values.city, values.province, values.country]
      .map(part => part.trim())
      .filter(Boolean);

    if (parts.length === 0) {
      setGeocodeError('Compila almeno città e via prima di cercare');
      return;
    }

    setGeocoding(true);
    setGeocodeError('');
    setGeocodeResults([]);

    try {
      const response = await fetch(`/api/admin/geocode?q=${encodeURIComponent(parts.join(', '))}`);
      const data = await response.json();

      if (!response.ok) {
        setGeocodeError(data.error || 'Errore durante la ricerca');
        return;
      }

      const results = data.results as GeocodeResult[];

      if (results.length === 1) {
        applyGeocodeResult(results[0]);
      } else {
        // Più corrispondenze: la scelta la fa l'admin, non indoviniamo noi
        setGeocodeResults(results);
      }
    } catch {
      setGeocodeError('Errore di rete durante la ricerca. Inserisci le coordinate manualmente.');
    } finally {
      setGeocoding(false);
    }
  };

  const applyGeocodeResult = (result: GeocodeResult) => {
    setValues(prev => ({
      ...prev,
      lat: result.lat.toFixed(6),
      lng: result.lng.toFixed(6),
    }));
    setGeocodeResults([]);
    setGeocodeError('');
  };

  const handleMapChange = (next: Coordinates) => {
    setValues(prev => ({
      ...prev,
      lat: next.lat.toFixed(6),
      lng: next.lng.toFixed(6),
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError('');

    if (!values.name.trim()) {
      setLocalError('Inserisci il nome del punto vendita');
      return;
    }
    if (!values.categoryId) {
      setLocalError('Seleziona una categoria');
      return;
    }
    if (!values.city.trim()) {
      setLocalError('Inserisci la città');
      return;
    }
    if (!coordinates) {
      setLocalError(
        'Coordinate mancanti o non valide. Usa "Trova sulla mappa" oppure inserisci latitudine e longitudine a mano.'
      );
      return;
    }

    onSubmit(values);
  };

  const displayedError = localError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {displayedError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {displayedError}
        </div>
      )}

      {/* Dati principali */}
      <div className={cardClass}>
        <h2 className="text-lg font-serif text-olive mb-4">Dati principali</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nome insegna *</label>
            <input
              type="text"
              value={values.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Supermercato Conad"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Categoria *</label>
            <select
              value={values.categoryId}
              onChange={e => set('categoryId', e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="">Seleziona una categoria</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.translations.it.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="mt-1.5 text-xs text-amber-700">
                Nessuna categoria disponibile. Creane una prima di continuare.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Indirizzo e posizione */}
      <div className={cardClass}>
        <h2 className="text-lg font-serif text-olive mb-4">Indirizzo e posizione</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Via e numero civico</label>
            <input
              type="text"
              value={values.street}
              onChange={e => set('street', e.target.value)}
              placeholder="Via Etnea 120"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Città *</label>
            <input
              type="text"
              value={values.city}
              onChange={e => set('city', e.target.value)}
              placeholder="Catania"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Provincia</label>
              <input
                type="text"
                value={values.province}
                onChange={e => set('province', e.target.value.toUpperCase())}
                placeholder="CT"
                maxLength={4}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>CAP</label>
              <input
                type="text"
                value={values.postalCode}
                onChange={e => set('postalCode', e.target.value)}
                placeholder="95124"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Geocoding */}
        <div className="mt-5 pt-5 border-t border-olive/10">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleGeocode}
              disabled={geocoding}
              className="px-4 py-2.5 bg-olive text-white rounded-lg hover:bg-salvia transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center"
            >
              {geocoding ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Ricerca...
                </>
              ) : (
                'Trova sulla mappa'
              )}
            </button>
            <span className="text-xs text-nocciola">
              Cerca le coordinate dall&apos;indirizzo. Puoi comunque correggerle a mano.
            </span>
          </div>

          {geocodeError && (
            <p className="mt-3 text-sm text-red-600">{geocodeError}</p>
          )}

          {geocodeResults.length > 0 && (
            <div className="mt-3 border border-olive/20 rounded-lg divide-y divide-olive/10 overflow-hidden">
              <p className="px-4 py-2 text-xs text-nocciola bg-beige">
                Più risultati trovati — scegli quello corretto:
              </p>
              {geocodeResults.map((result, index) => (
                <button
                  key={`${result.lat}-${result.lng}-${index}`}
                  type="button"
                  onClick={() => applyGeocodeResult(result)}
                  className="w-full text-left px-4 py-3 text-sm text-olive hover:bg-beige transition-colors cursor-pointer"
                >
                  {result.displayName}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className={labelClass}>Latitudine *</label>
              <input
                type="text"
                inputMode="decimal"
                value={values.lat}
                onChange={e => set('lat', e.target.value)}
                placeholder="37.507877"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Longitudine *</label>
              <input
                type="text"
                inputMode="decimal"
                value={values.lng}
                onChange={e => set('lng', e.target.value)}
                placeholder="15.083030"
                className={inputClass}
              />
            </div>
          </div>

          {!coordinates && (values.lat || values.lng) && (
            <p className="mt-2 text-sm text-red-600">
              Coordinate non valide: latitudine tra -90 e 90, longitudine tra -180 e 180.
            </p>
          )}

          <div className="mt-4">
            <POSMapPicker coordinates={coordinates} onChange={handleMapChange} />
          </div>
        </div>
      </div>

      {/* Prodotti disponibili */}
      <div className={cardClass}>
        <h2 className="text-lg font-serif text-olive mb-4">Prodotti disponibili in questo punto vendita</h2>
        <RelatedProductsSelector
          allProducts={products}
          selectedIds={values.productIds}
          onChange={ids => set('productIds', ids)}
          selectedLabel="Prodotti selezionati ({count})"
          addLabel="Aggiungi prodotti disponibili qui"
        />
      </div>

      {/* Note e impostazioni */}
      <div className={cardClass}>
        <h2 className="text-lg font-serif text-olive mb-4">Note e impostazioni</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nota (IT)</label>
            <input
              type="text"
              value={values.notesIT}
              onChange={e => set('notesIT', e.target.value)}
              placeholder="Banco 12, lato ingresso"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Nota (EN)</label>
            <input
              type="text"
              value={values.notesEN}
              onChange={e => set('notesEN', e.target.value)}
              placeholder="Stall 12, near the entrance"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Ordine di visualizzazione</label>
            <input
              type="number"
              value={values.displayOrder}
              onChange={e => set('displayOrder', e.target.value)}
              placeholder="Lascia vuoto per aggiungere in fondo"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Azioni */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-6 py-3 border border-olive text-olive rounded-lg hover:bg-olive hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-olive text-white rounded-lg hover:bg-salvia transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {submitting ? (
            <span className="flex items-center">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Salvataggio...
            </span>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}
