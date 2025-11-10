'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StepIndicator from '@/components/scenario/StepIndicator';
import CostItemInput from '@/components/scenario/CostItemInput';
import ProductCostInput from '@/components/scenario/ProductCostInput';
import SalesEstimateInput from '@/components/scenario/SalesEstimateInput';
import PricingInput from '@/components/scenario/PricingInput';
import RevenueCard from '@/components/scenario/RevenueCard';
import Toast, { ToastType } from '@/components/ui/Toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { calculateScenario } from '@/lib/scenario/calculations';
import type {
  CostItem,
  ProductCost,
  SalesEstimate,
  ProductPricing,
  CreateScenarioData,
} from '@/types/scenario';

interface ToastData {
  message: string;
  type: ToastType;
}

const STEPS = [
  {
    number: 1,
    title: 'Info Scenario',
    description: 'Nome e descrizione',
  },
  {
    number: 2,
    title: 'Costi Vari',
    description: 'Dominio, hosting, pubblicità',
  },
  {
    number: 3,
    title: 'Costi Prodotti',
    description: 'Costi di acquisto/produzione',
  },
  {
    number: 4,
    title: 'Stime Vendita',
    description: 'Quantità previste',
  },
  {
    number: 5,
    title: 'Prezzi Vendita',
    description: 'Prezzi al pubblico',
  },
  {
    number: 6,
    title: 'Riepilogo',
    description: 'Verifica e salva',
  },
];

export default function NewScenarioPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  // Form data
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [variousCosts, setVariousCosts] = useState<CostItem[]>([]);
  const [productCosts, setProductCosts] = useState<ProductCost[]>([]);
  const [salesEstimates, setSalesEstimates] = useState<SalesEstimate[]>([]);
  const [productPricing, setProductPricing] = useState<ProductPricing[]>([]);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return name.trim() !== '';
      case 2:
        return true; // Costi vari opzionali
      case 3:
        return productCosts.length > 0;
      case 4:
        return salesEstimates.length === productCosts.length;
      case 5:
        return productPricing.length === productCosts.length;
      case 6:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < 6) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSave = async () => {
    if (!canProceed()) return;

    try {
      setSaving(true);

      const data: CreateScenarioData = {
        name: name.trim(),
        description: description.trim() || undefined,
        variousCosts,
        productCosts,
        salesEstimates,
        productPricing,
      };

      const res = await fetch('/api/admin/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        showToast('Scenario creato con successo!', 'success');
        // Redirect after a short delay to show the toast
        setTimeout(() => {
          router.push('/admin/scenarios');
        }, 1500);
      } else {
        showToast(result.error || 'Errore durante il salvataggio', 'error');
      }
    } catch (err) {
      console.error('Error saving scenario:', err);
      showToast('Errore di connessione', 'error');
    } finally {
      setSaving(false);
    }
  };

  const calculations = calculateScenario(
    variousCosts,
    productCosts,
    salesEstimates,
    productPricing
  );

  const headerActions = (
    <Link
      href="/admin/scenarios"
      className="px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer"
    >
      ← Torna agli scenari
    </Link>
  );

  return (
    <AdminLayout
      title="Nuovo Scenario di Fatturato"
      subtitle="Segui i passaggi per creare un nuovo scenario"
      headerActions={headerActions}
    >
      <div className="max-w-5xl mx-auto">

      {/* Step Indicator */}
      <div className="mb-8">
        <StepIndicator currentStep={currentStep} steps={STEPS} />
      </div>

      {/* Step Content */}
      <div className="admin-card p-6 mb-6">
        {/* Step 1: Info Base */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[--olive] mb-2">
                Informazioni Scenario
              </h2>
              <p className="text-gray-600">
                Iniziamo con un nome e una breve descrizione dello scenario
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Nome Scenario *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="admin-input"
                placeholder="es. Piano Q1 2025"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Descrizione (opzionale)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="admin-input"
                rows={3}
                placeholder="Aggiungi dettagli sullo scenario..."
              />
            </div>
          </div>
        )}

        {/* Step 2: Costi Vari */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[--olive] mb-2">
                Costi Vari
              </h2>
              <p className="text-gray-600">
                Aggiungi costi generali come dominio, hosting, pubblicità,
                packaging, ecc.
              </p>
            </div>
            <CostItemInput
              costs={variousCosts}
              onChange={setVariousCosts}
              showToast={showToast}
            />
          </div>
        )}

        {/* Step 3: Costi Prodotti */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[--olive] mb-2">
                Costi Prodotti
              </h2>
              <p className="text-gray-600">
                Seleziona i prodotti e inserisci il costo unitario e la quantità
                disponibile
              </p>
            </div>
            <ProductCostInput
              productCosts={productCosts}
              onChange={setProductCosts}
              showToast={showToast}
            />
            {productCosts.length === 0 && (
              <div className="admin-card p-4 bg-amber-50 border border-amber-200">
                <p className="text-amber-800">
                  ⚠️ Devi aggiungere almeno un prodotto per continuare
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Stime Vendita */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[--olive] mb-2">
                Stime di Vendita
              </h2>
              <p className="text-gray-600">
                Per ogni prodotto, indica quante unità prevedi di vendere
              </p>
            </div>
            <SalesEstimateInput
              salesEstimates={salesEstimates}
              productCosts={productCosts}
              onChange={setSalesEstimates}
            />
          </div>
        )}

        {/* Step 5: Prezzi Vendita */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[--olive] mb-2">
                Prezzi di Vendita
              </h2>
              <p className="text-gray-600">
                Imposta i prezzi di vendita per ogni prodotto
              </p>
            </div>
            <PricingInput
              productPricing={productPricing}
              productCosts={productCosts}
              salesEstimates={salesEstimates}
              onChange={setProductPricing}
            />
          </div>
        )}

        {/* Step 6: Riepilogo */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[--olive] mb-2">
                Riepilogo Scenario
              </h2>
              <p className="text-gray-600">
                Verifica i dati e salva lo scenario
              </p>
            </div>
            <RevenueCard calculations={calculations} scenarioName={name} />

            {/* Dettagli Scenario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t">
              <div className="admin-card p-4 bg-gray-50">
                <h4 className="font-bold text-[--olive] mb-2">Costi Vari</h4>
                <p className="text-2xl font-bold text-gray-800">
                  {variousCosts.length}
                </p>
                <p className="text-sm text-gray-600">voci di costo</p>
              </div>
              <div className="admin-card p-4 bg-gray-50">
                <h4 className="font-bold text-[--olive] mb-2">Prodotti</h4>
                <p className="text-2xl font-bold text-gray-800">
                  {productCosts.length}
                </p>
                <p className="text-sm text-gray-600">prodotti configurati</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <button
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="admin-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Indietro
        </button>

        <div className="flex gap-3 flex-1 sm:flex-initial justify-end">
          {currentStep < 6 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="admin-button-primary flex-1 sm:flex-initial disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Avanti →
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving || !canProceed()}
              className="admin-button-primary flex-1 sm:flex-initial disabled:opacity-50"
            >
              {saving ? 'Salvataggio...' : '💾 Salva Scenario'}
            </button>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}
      </div>
    </AdminLayout>
  );
}
