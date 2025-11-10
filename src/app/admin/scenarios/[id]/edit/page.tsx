'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import StepIndicator from '@/components/scenario/StepIndicator';
import CostItemInput from '@/components/scenario/CostItemInput';
import ProductCostInput from '@/components/scenario/ProductCostInput';
import SalesEstimateInput from '@/components/scenario/SalesEstimateInput';
import PricingInput from '@/components/scenario/PricingInput';
import RevenueCard from '@/components/scenario/RevenueCard';
import Toast, { ToastType } from '@/components/ui/Toast';
import AdminLayout from '@/components/admin/AdminLayout';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import { calculateScenario } from '@/lib/scenario/calculations';
import type {
  CostItem,
  ProductCost,
  SalesEstimate,
  ProductPricing,
  ScenarioDocument,
  UpdateScenarioData,
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

export default function EditScenarioPage() {
  const router = useRouter();
  const params = useParams();
  const scenarioId = params.id as string;

  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchScenario();
  }, [scenarioId]);

  const fetchScenario = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/scenarios/${scenarioId}`);
      const data = await res.json();

      if (data.success && data.scenario) {
        const scenario: ScenarioDocument = data.scenario;
        setName(scenario.name);
        setDescription(scenario.description || '');
        setVariousCosts(scenario.variousCosts);
        setProductCosts(scenario.productCosts);
        setSalesEstimates(scenario.salesEstimates);
        setProductPricing(scenario.productPricing);
      } else {
        showToast('Scenario non trovato', 'error');
        setTimeout(() => router.push('/admin/scenarios'), 1500);
      }
    } catch (err) {
      console.error('Error fetching scenario:', err);
      showToast('Errore nel caricamento', 'error');
      setTimeout(() => router.push('/admin/scenarios'), 1500);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return name.trim() !== '';
      case 2:
        return true;
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

      const updateData: UpdateScenarioData = {
        name: name.trim(),
        description: description.trim() || undefined,
        variousCosts,
        productCosts,
        salesEstimates,
        productPricing,
      };

      const res = await fetch(`/api/admin/scenarios/${scenarioId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const result = await res.json();

      if (result.success) {
        showToast('Scenario aggiornato con successo!', 'success');
        setTimeout(() => router.push('/admin/scenarios'), 1500);
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

  if (loading) {
    return <LoadingSpinner message="Caricamento scenario..." />;
  }

  return (
    <AdminLayout
      title="Modifica Scenario"
      subtitle="Aggiorna i dati dello scenario"
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
                Modifica nome e descrizione dello scenario
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
                Modifica i costi generali dello scenario
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
                Modifica i costi dei prodotti
              </p>
            </div>
            <ProductCostInput
              productCosts={productCosts}
              onChange={setProductCosts}
              showToast={showToast}
            />
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
                Modifica le stime di vendita per prodotto
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
                Modifica i prezzi di vendita
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
                Riepilogo Modifiche
              </h2>
              <p className="text-gray-600">
                Verifica le modifiche e salva
              </p>
            </div>
            <RevenueCard calculations={calculations} scenarioName={name} />
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
              {saving ? 'Salvataggio...' : '💾 Salva Modifiche'}
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
