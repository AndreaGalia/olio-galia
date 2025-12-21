"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShippingConfigDocument,
  WeightTier,
  ItalyShippingConfig,
  WeightBasedShippingCost,
  UpdateShippingConfigRequest,
} from '@/types/shippingConfig';
import { ShippingZone } from '@/types/shipping';

/**
 * Pagina Admin: Configurazione Spedizioni
 *
 * Permette di modificare:
 * - Fasce peso globali (weight tiers)
 * - Configurazione Italia (soglia gratis, costo standard)
 * - Costi spedizione per ogni combinazione zona+fascia peso
 *
 * Protetto: richiede autenticazione admin (TODO: implementare middleware)
 */
export default function ShippingConfigPage() {
  const router = useRouter();

  // State per configurazione
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // State per form
  const [weightTiers, setWeightTiers] = useState<WeightTier[]>([]);
  const [italyConfig, setItalyConfig] = useState<ItalyShippingConfig>({
    freeThreshold: 150.0,
    standardCost: 590,
    stripeRateId: '',
    freeStripeRateId: '',
  });
  const [weightBasedCosts, setWeightBasedCosts] = useState<WeightBasedShippingCost[]>([]);

  // Carica configurazione esistente
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/shipping-config');
      const data = await response.json();

      if (data.success && data.config) {
        setWeightTiers(data.config.weightTiers);
        setItalyConfig(data.config.italyConfig);
        setWeightBasedCosts(data.config.weightBasedCosts);
      } else {
        setError('Nessuna configurazione trovata. Verrà creata al primo salvataggio.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore caricamento configurazione');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const body: UpdateShippingConfigRequest = {
        weightTiers,
        italyConfig,
        weightBasedCosts,
      };

      const response = await fetch('/api/admin/shipping-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Configurazione salvata con successo!');
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setError(data.error || 'Errore salvataggio configurazione');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore salvataggio');
    } finally {
      setSaving(false);
    }
  };

  // Handler: Aggiungi nuova fascia peso
  const handleAddWeightTier = () => {
    const lastTier = weightTiers[weightTiers.length - 1];
    const newMinGrams = lastTier ? lastTier.maxGrams + 1 : 0;

    setWeightTiers([
      ...weightTiers,
      {
        minGrams: newMinGrams,
        maxGrams: newMinGrams + 1000,
        label: { it: 'Nuova fascia', en: 'New tier' },
      },
    ]);

    // Aggiungi entries vuote per ogni zona
    const newTierIndex = weightTiers.length;
    const zones: ShippingZone[] = ['europa', 'america', 'mondo'];
    const newEntries: WeightBasedShippingCost[] = zones.map((zone) => ({
      zone,
      tier: newTierIndex,
      stripeRateId: '',
      displayPrice: 0,
    }));

    setWeightBasedCosts([...weightBasedCosts, ...newEntries]);
  };

  // Handler: Rimuovi fascia peso
  const handleRemoveWeightTier = (index: number) => {
    if (weightTiers.length <= 1) {
      alert('Devi avere almeno una fascia peso');
      return;
    }

    // Rimuovi fascia
    const newTiers = weightTiers.filter((_, i) => i !== index);
    setWeightTiers(newTiers);

    // Rimuovi tutti i costi associati a questa fascia
    const newCosts = weightBasedCosts.filter((cost) => cost.tier !== index);

    // Ricalcola indici tier per fasce successive
    const reindexedCosts = newCosts.map((cost) => ({
      ...cost,
      tier: cost.tier > index ? cost.tier - 1 : cost.tier,
    }));

    setWeightBasedCosts(reindexedCosts);
  };

  // Handler: Modifica fascia peso
  const handleUpdateWeightTier = (index: number, field: keyof WeightTier, value: any) => {
    const newTiers = [...weightTiers];
    if (field === 'label') {
      newTiers[index].label = value;
    } else {
      (newTiers[index] as any)[field] = value;
    }
    setWeightTiers(newTiers);
  };

  // Handler: Modifica costo spedizione per zona+tier
  const handleUpdateCost = (
    zone: ShippingZone,
    tier: number,
    field: keyof WeightBasedShippingCost,
    value: any
  ) => {
    const newCosts = weightBasedCosts.map((cost) => {
      if (cost.zone === zone && cost.tier === tier) {
        return { ...cost, [field]: value };
      }
      return cost;
    });
    setWeightBasedCosts(newCosts);
  };

  // Helper: Ottieni costo per zona+tier
  const getCostForZoneAndTier = (zone: ShippingZone, tier: number): WeightBasedShippingCost | undefined => {
    return weightBasedCosts.find((cost) => cost.zone === zone && cost.tier === tier);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sabbia to-beige flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive mx-auto mb-4"></div>
          <p className="text-olive">Caricamento configurazione...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sabbia to-beige">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="text-olive hover:text-olive/70 mb-4 flex items-center gap-2"
          >
            ← Torna all'Admin Panel
          </button>
          <h1 className="text-3xl font-serif text-olive mb-2">Configurazione Spedizioni</h1>
          <p className="text-nocciola text-sm">
            Gestisci fasce peso, costi spedizione e configurazione Italia
          </p>
        </div>

        {/* Messaggi di successo/errore */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border-2 border-green-500 p-4 animate-fadeIn">
            <p className="text-green-700 font-medium">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-500 p-4">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Sezione 1: Configurazione Italia */}
        <div className="bg-beige/50 border border-olive/20 p-6 mb-8">
          <h2 className="text-xl font-serif text-olive mb-4">🇮🇹 Configurazione Italia</h2>
          <p className="text-sm text-nocciola mb-6">
            Spedizione gratuita sopra soglia, costo fisso sotto soglia (peso NON influisce)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-olive mb-2">
                Soglia Spedizione Gratis (EUR)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={italyConfig.freeThreshold}
                onChange={(e) =>
                  setItalyConfig({ ...italyConfig, freeThreshold: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-olive/30 rounded-lg"
                placeholder="150.00"
              />
              <p className="text-xs text-nocciola mt-1">Carrello ≥ questa soglia → spedizione gratis</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-olive mb-2">
                Costo Standard (centesimi)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={italyConfig.standardCost}
                onChange={(e) =>
                  setItalyConfig({ ...italyConfig, standardCost: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-olive/30 rounded-lg"
                placeholder="590"
              />
              <p className="text-xs text-nocciola mt-1">
                590 centesimi = €5.90 (carrello sotto soglia)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-olive mb-2">
                Stripe Rate ID Standard
              </label>
              <input
                type="text"
                value={italyConfig.stripeRateId}
                onChange={(e) => setItalyConfig({ ...italyConfig, stripeRateId: e.target.value })}
                className="w-full px-3 py-2 border border-olive/30 rounded-lg font-mono text-sm"
                placeholder="shr_xxxxxxxxxxxxx"
              />
              <p className="text-xs text-nocciola mt-1">Stripe Rate per spedizione sotto soglia</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-olive mb-2">
                Stripe Rate ID Gratis
              </label>
              <input
                type="text"
                value={italyConfig.freeStripeRateId}
                onChange={(e) => setItalyConfig({ ...italyConfig, freeStripeRateId: e.target.value })}
                className="w-full px-3 py-2 border border-olive/30 rounded-lg font-mono text-sm"
                placeholder="shr_xxxxxxxxxxxxx"
              />
              <p className="text-xs text-nocciola mt-1">Stripe Rate per spedizione sopra soglia</p>
            </div>
          </div>
        </div>

        {/* Sezione 2: Fasce Peso */}
        <div className="bg-beige/50 border border-olive/20 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-serif text-olive">⚖️ Fasce Peso</h2>
              <p className="text-sm text-nocciola mt-1">
                Applicate a Europa, America, Mondo (NON Italia)
              </p>
            </div>
            <button
              onClick={handleAddWeightTier}
              className="bg-olive text-beige px-4 py-2 hover:bg-olive/80 transition-colors text-sm"
            >
              + Aggiungi Fascia
            </button>
          </div>

          <div className="space-y-4">
            {weightTiers.map((tier, index) => (
              <div key={index} className="bg-white border border-olive/20 p-4">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-medium text-olive">Fascia {index + 1}</span>
                  {weightTiers.length > 1 && (
                    <button
                      onClick={() => handleRemoveWeightTier(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Rimuovi
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-nocciola mb-1">Min (grammi)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={tier.minGrams}
                      onChange={(e) =>
                        handleUpdateWeightTier(index, 'minGrams', parseInt(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border border-olive/30 rounded text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-nocciola mb-1">Max (grammi)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={tier.maxGrams === Infinity ? '' : tier.maxGrams}
                      onChange={(e) => {
                        const val = e.target.value === '' ? Infinity : parseInt(e.target.value) || 0;
                        handleUpdateWeightTier(index, 'maxGrams', val);
                      }}
                      className="w-full px-3 py-2 border border-olive/30 rounded text-sm"
                      placeholder="Infinity"
                    />
                    <p className="text-xs text-nocciola mt-1">Vuoto = Infinity</p>
                  </div>

                  <div>
                    <label className="block text-xs text-nocciola mb-1">Label IT</label>
                    <input
                      type="text"
                      value={tier.label.it}
                      onChange={(e) =>
                        handleUpdateWeightTier(index, 'label', { ...tier.label, it: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-olive/30 rounded text-sm"
                      placeholder="0-1 kg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-nocciola mb-1">Label EN</label>
                    <input
                      type="text"
                      value={tier.label.en}
                      onChange={(e) =>
                        handleUpdateWeightTier(index, 'label', { ...tier.label, en: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-olive/30 rounded text-sm"
                      placeholder="0-1 kg"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sezione 3: Costi Spedizione per Zona */}
        <div className="bg-beige/50 border border-olive/20 p-6 mb-8">
          <h2 className="text-xl font-serif text-olive mb-4">💶 Costi Spedizione per Zona</h2>
          <p className="text-sm text-nocciola mb-6">
            Configura Stripe Rate ID e prezzo display per ogni combinazione zona + fascia peso
          </p>

          {(['europa', 'america', 'mondo'] as ShippingZone[]).map((zone) => (
            <div key={zone} className="mb-6 last:mb-0">
              <h3 className="font-medium text-olive mb-3 capitalize">
                {zone === 'europa' ? '🇪🇺 Europa' : zone === 'america' ? '🌎 America' : '🌍 Mondo'}
              </h3>

              <div className="space-y-3">
                {weightTiers.map((tier, tierIndex) => {
                  const cost = getCostForZoneAndTier(zone, tierIndex);
                  return (
                    <div
                      key={tierIndex}
                      className="bg-white border border-olive/20 p-4 grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      <div>
                        <label className="block text-xs text-nocciola mb-1">
                          Fascia: {tier.label.it}
                        </label>
                        <p className="text-xs text-olive/60">
                          {tier.minGrams}g - {tier.maxGrams === Infinity ? '∞' : `${tier.maxGrams}g`}
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs text-nocciola mb-1">Stripe Rate ID</label>
                        <input
                          type="text"
                          value={cost?.stripeRateId || ''}
                          onChange={(e) =>
                            handleUpdateCost(zone, tierIndex, 'stripeRateId', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-olive/30 rounded text-sm font-mono"
                          placeholder="shr_xxxxxxxxxxxxx"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-nocciola mb-1">
                          Prezzo Display (centesimi)
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={cost?.displayPrice || 0}
                          onChange={(e) =>
                            handleUpdateCost(zone, tierIndex, 'displayPrice', parseInt(e.target.value) || 0)
                          }
                          className="w-full px-3 py-2 border border-olive/30 rounded text-sm"
                          placeholder="890"
                        />
                        <p className="text-xs text-nocciola mt-1">
                          = €{((cost?.displayPrice || 0) / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottoni azione */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-olive text-beige px-8 py-3 hover:bg-olive/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? 'Salvataggio...' : 'Salva Configurazione'}
          </button>

          <button
            onClick={() => router.push('/admin')}
            className="bg-nocciola/20 text-olive px-8 py-3 hover:bg-nocciola/30 transition-colors"
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
}
