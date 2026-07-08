'use client';

import { useState, useEffect } from 'react';
import RelatedProductsSelector, { SelectableProduct } from '@/components/admin/RelatedProductsSelector';
import type { PromotionCampaign, PromotionDiscountType } from '@/types/promotionCampaign';

// Valori del form (date come stringhe YYYY-MM-DD per gli input type="date")
export interface CampaignFormValues {
  name: string;
  badgeIt: string;
  badgeEn: string;
  discountType: PromotionDiscountType;
  discountValue: string;
  productIds: string[];
  startDate: string;
  endDate: string;
  active: boolean;
}

interface PromotionCampaignFormProps {
  initialValues?: CampaignFormValues;
  submitLabel: string;
  submitting: boolean;
  error: string;
  onSubmit: (payload: Record<string, unknown>) => void;
}

const EMPTY_VALUES: CampaignFormValues = {
  name: '',
  badgeIt: '',
  badgeEn: '',
  discountType: 'percent',
  discountValue: '',
  productIds: [],
  startDate: '',
  endDate: '',
  active: true,
};

// Data ISO → stringa YYYY-MM-DD in timezone locale (per input type="date")
export function isoToDateInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Converte la campagna API nei valori del form (per la pagina edit)
export function campaignToFormValues(campaign: PromotionCampaign): CampaignFormValues {
  return {
    name: campaign.name,
    badgeIt: campaign.badgeLabel.it,
    badgeEn: campaign.badgeLabel.en,
    discountType: campaign.discountType,
    discountValue: String(campaign.discountValue),
    productIds: campaign.productIds,
    startDate: isoToDateInput(campaign.startDate),
    endDate: isoToDateInput(campaign.endDate),
    active: campaign.active,
  };
}

export default function PromotionCampaignForm({
  initialValues,
  submitLabel,
  submitting,
  error,
  onSubmit,
}: PromotionCampaignFormProps) {
  const [values, setValues] = useState<CampaignFormValues>(initialValues ?? EMPTY_VALUES);
  const [availableProducts, setAvailableProducts] = useState<SelectableProduct[]>([]);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/admin/products');
        if (!response.ok) return;
        const data = await response.json();
        setAvailableProducts(
          (data as Array<{ id: string; translations?: { it?: { name?: string } }; images?: string[] }>).map(p => ({
            id: p.id,
            name: p.translations?.it?.name || p.id,
            image: p.images?.[0],
          }))
        );
      } catch {}
    };
    fetchProducts();
  }, []);

  const set = <K extends keyof CampaignFormValues>(key: K, value: CampaignFormValues[K]) =>
    setValues(prev => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    setLocalError('');

    if (!values.name.trim()) { setLocalError('Inserisci il nome della campagna'); return; }
    if (!values.badgeIt.trim() || !values.badgeEn.trim()) { setLocalError('Inserisci il testo del badge in italiano e in inglese'); return; }
    const discountValue = Number(values.discountValue);
    if (!Number.isFinite(discountValue) || discountValue <= 0) { setLocalError('Inserisci un valore di sconto maggiore di zero'); return; }
    if (values.discountType === 'percent' && discountValue >= 100) { setLocalError('Lo sconto percentuale deve essere inferiore al 100%'); return; }
    if (values.productIds.length === 0) { setLocalError('Seleziona almeno un prodotto'); return; }
    if (!values.startDate || !values.endDate) { setLocalError('Inserisci le date di inizio e fine'); return; }
    if (values.endDate < values.startDate) { setLocalError('La data di fine deve essere successiva alla data di inizio'); return; }

    onSubmit({
      name: values.name.trim(),
      badgeLabel: { it: values.badgeIt.trim(), en: values.badgeEn.trim() },
      discountType: values.discountType,
      discountValue,
      productIds: values.productIds,
      // Inizio a mezzanotte locale, fine inclusiva a fine giornata locale
      startDate: new Date(`${values.startDate}T00:00:00`).toISOString(),
      endDate: new Date(`${values.endDate}T23:59:59`).toISOString(),
      active: values.active,
    });
  };

  const badgePreview = values.badgeIt.trim() ||
    (values.discountType === 'percent'
      ? (values.discountValue ? `-${values.discountValue}%` : '-X%')
      : (values.discountValue ? `-€${Number(values.discountValue).toFixed(2)}` : '-€X'));

  return (
    <div className="space-y-6">

      {/* ── Dettagli campagna ── */}
      <div className="bg-white rounded-xl border border-olive/20 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">Dettagli campagna</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Nome campagna <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={values.name}
              onChange={e => set('name', e.target.value)}
              placeholder="es. Saldi Estate 2026"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive/30 focus:border-olive"
            />
            <p className="mt-1 text-xs text-gray-400">Etichetta interna, non visibile ai clienti.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Tipo di sconto <span className="text-red-400">*</span>
            </label>
            <select
              value={values.discountType}
              onChange={e => set('discountType', e.target.value as PromotionDiscountType)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive/30 focus:border-olive bg-white"
            >
              <option value="percent">Percentuale (%)</option>
              <option value="fixed">Importo fisso (€)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Valore sconto <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="0"
              step={values.discountType === 'percent' ? '1' : '0.01'}
              value={values.discountValue}
              onChange={e => set('discountValue', e.target.value)}
              placeholder={values.discountType === 'percent' ? 'es. 15' : 'es. 5.00'}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive/30 focus:border-olive"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Data inizio <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={values.startDate}
              onChange={e => set('startDate', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive/30 focus:border-olive"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Data fine (inclusa) <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={values.endDate}
              onChange={e => set('endDate', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive/30 focus:border-olive"
            />
          </div>
        </div>

        <label className="mt-5 flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={values.active}
            onChange={e => set('active', e.target.checked)}
            className="w-4 h-4 text-olive border-gray-300 rounded focus:ring-olive/30 cursor-pointer"
          />
          <span className="text-sm text-gray-700">
            Campagna attiva
            <span className="text-gray-400"> — se disattivata resta salvata ma non produce alcuno sconto, a prescindere dalle date</span>
          </span>
        </label>
      </div>

      {/* ── Badge visibile sul sito ── */}
      <div className="bg-white rounded-xl border border-olive/20 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Badge sul sito</h2>
        <p className="text-sm text-gray-500 mb-5">
          Testo mostrato sulla card prodotto e nella pagina prodotto (es. &quot;-15%&quot;, &quot;SALDI ESTATE&quot;).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Badge italiano <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={values.badgeIt}
              onChange={e => set('badgeIt', e.target.value)}
              placeholder="es. -15%"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive/30 focus:border-olive"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Badge inglese <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={values.badgeEn}
              onChange={e => set('badgeEn', e.target.value)}
              placeholder="es. -15%"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive/30 focus:border-olive"
            />
          </div>
        </div>

        {/* Anteprima badge con lo stile reale del sito */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs text-gray-400 uppercase tracking-wider">Anteprima:</span>
          <span className="bg-olive text-beige font-serif termina-11 tracking-[3.4px] uppercase px-3 py-1.5">
            {badgePreview}
          </span>
        </div>
      </div>

      {/* ── Prodotti in campagna ── */}
      <div className="bg-white rounded-xl border border-olive/20 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Prodotti in campagna</h2>
        <p className="text-sm text-gray-500 mb-5">
          Lo sconto si applica al prodotto intero, comprese tutte le sue varianti.
          I prezzi degli abbonamenti non vengono toccati.
        </p>
        <RelatedProductsSelector
          allProducts={availableProducts}
          selectedIds={values.productIds}
          onChange={ids => set('productIds', ids)}
          selectedLabel="Prodotti selezionati ({count})"
          addLabel="Aggiungi prodotti alla campagna"
        />
      </div>

      {/* ── Salvataggio ── */}
      <div className="bg-white rounded-xl border border-olive/20 p-6">
        {(localError || error) && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
            {localError || error}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full sm:w-auto px-8 py-3 bg-olive text-white font-medium rounded-lg hover:bg-olive/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-sm"
        >
          {submitting ? 'Salvataggio...' : submitLabel}
        </button>
      </div>
    </div>
  );
}
