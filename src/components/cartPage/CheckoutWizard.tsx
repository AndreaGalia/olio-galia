"use client";

import { useState, useEffect, useRef } from 'react';
import { useT } from '@/hooks/useT';
import { useLocale } from '@/contexts/LocaleContext';
import { useShippingCost } from '@/hooks/useShippingCost';
import { useSettings } from '@/hooks/useSettings';
import { Product } from '@/types/products';
import { CartItem as CartItemType } from '@/types/cart';
import { ShippingZone } from '@/types/shipping';
import WizardStep from './WizardStep';
import CartItem from './CartItem';
import ShippingSelectionFlow from './ShippingSelectionFlow';
import CheckoutTorinoButton from './CheckoutTorinoButton';

interface CheckoutWizardProps {
  cart: CartItemType[];
  products: Product[];
  total: number;
  savings: number;
  totalItems: number;
  itemLabel: string;
  selectedShippingZone: ShippingZone | null;
  setSelectedShippingZone: (zone: ShippingZone | null) => void;
  totalGrams: number;
  hasAllWeights: boolean;
  needsInvoice: boolean;
  setNeedsInvoice: (value: boolean) => void;
  checkoutLoading: boolean;
  handleCheckout: () => void;
}

export default function CheckoutWizard({
  cart,
  products,
  total,
  savings,
  totalItems,
  itemLabel,
  selectedShippingZone,
  setSelectedShippingZone,
  totalGrams,
  hasAllWeights,
  needsInvoice,
  setNeedsInvoice,
  checkoutLoading,
  handleCheckout
}: CheckoutWizardProps) {
  const { t } = useT();
  const { locale } = useLocale();
  const { settings } = useSettings();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Ref per le card
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  // Auto-scroll alla card attiva quando cambia step
  useEffect(() => {
    const scrollToStep = () => {
      let targetRef = null;

      if (currentStep === 1) targetRef = step1Ref;
      else if (currentStep === 2) targetRef = step2Ref;
      else if (currentStep === 3) targetRef = step3Ref;

      if (targetRef?.current) {
        // Delay di 100ms per permettere alle animazioni CSS di iniziare
        setTimeout(() => {
          targetRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      }
    };

    scrollToStep();
  }, [currentStep]);

  // Calcola costo spedizione
  const shippingCost = useShippingCost(
    selectedShippingZone,
    totalGrams,
    total,
    hasAllWeights,
    locale
  );

  // Totale finale
  const finalTotal = selectedShippingZone ? total + shippingCost.costEur : total;

  // Determina quali step sono completati
  const isStep1Completed = currentStep > 1;
  const isStep2Completed = currentStep > 2 && selectedShippingZone !== null;

  // Summary per card compresse
  const step1Summary = `${totalItems} ${itemLabel} • €${total.toFixed(2)}`;
  const step2Summary = selectedShippingZone
    ? `${t.cartPage.shippingSelection.zones[selectedShippingZone].name} • ${shippingCost.isFree ? t.cartPage.summary.free : `€${shippingCost.costEur.toFixed(2)}`}`
    : '';

  return (
    <div className="space-y-4">
      {/* STEP 1: Riepilogo Carrello */}
      <WizardStep
        ref={step1Ref}
        stepNumber={1}
        title={t.cartPage.wizard?.step1Title || "RIEPILOGO CARRELLO"}
        summary={step1Summary}
        isActive={currentStep === 1}
        isCompleted={isStep1Completed}
        isLocked={false}
        onClick={() => setCurrentStep(1)}
      >
        {/* Lista prodotti */}
        <div className="space-y-3 mb-6">
          {cart.map((cartItem) => {
            const product = products.find((p: Product) => p.id === cartItem.id);
            if (!product) return null;

            return (
              <CartItem
                key={product.stripeProductId || product.id}
                cartItem={cartItem}
                product={product}
              />
            );
          })}
        </div>

        {/* Subtotale */}
        <div className="border-t border-olive/20 pt-4 space-y-2">
          <div className="flex justify-between text-nocciola">
            <span>{t.cartPage.summary.subtotal?.replace('{count}', totalItems.toString()).replace('{itemLabel}', itemLabel) || `Subtotale (${totalItems} ${itemLabel})`}</span>
            <span className="font-bold">€{total.toFixed(2)}</span>
          </div>

          {savings > 0 && (
            <div className="flex justify-between text-green-600 font-medium text-sm">
              <span>{t.cartPage.summary.totalSavings}</span>
              <span>-€{savings.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Bottone Continua */}
        <button
          onClick={() => setCurrentStep(2)}
          className="w-full mt-6 bg-olive text-beige py-3 px-4 font-medium uppercase tracking-wider hover:bg-olive/90 transition-colors flex items-center justify-center gap-2 border border-olive/20 cursor-pointer"
        >
          <span>{t.cartPage.wizard?.continue || "CONTINUA"}</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </WizardStep>

      {/* STEP 2: Selezione Spedizione */}
      <WizardStep
        ref={step2Ref}
        stepNumber={2}
        title={t.cartPage.wizard?.step2Title || "SELEZIONA SPEDIZIONE"}
        summary={step2Summary}
        isActive={currentStep === 2}
        isCompleted={isStep2Completed}
        isLocked={currentStep < 2}
        onClick={() => setCurrentStep(2)}
      >
        {/* Checkout Torino - mostra solo se abilitato */}
        {settings.torino_checkout_enabled && (
          <>
            <div className="mb-6 p-4 sm:p-6 bg-white border border-olive/10 transition-all duration-300">
              <div className="mb-4">
                <h4 className="text-olive font-bold text-sm sm:text-base uppercase tracking-wider mb-2">
                  {t.cartPage.wizard?.torinoTitle || "SEI DI TORINO?"}
                </h4>
                <p className="text-nocciola text-xs sm:text-sm">
                  {t.cartPage.wizard?.torinoDescription || "Usa il checkout veloce per ritiro o consegna a Torino"}
                </p>
              </div>
              <CheckoutTorinoButton minimal={true} />
            </div>

            {/* Separatore */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-olive/20"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-nocciola tracking-wider">
                  {t.cartPage.wizard?.or || "OPPURE"}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Selezione zona spedizione standard */}
        <div className="mb-6">
          <ShippingSelectionFlow
            value={selectedShippingZone}
            onChange={setSelectedShippingZone}
          />
        </div>

        {/* Preview costo spedizione */}
        {selectedShippingZone && (
          <div className="mb-6 bg-beige/50 border border-olive/20 p-4">
            <div className="flex justify-between items-center">
              <span className="text-nocciola text-sm">
                {t.cartPage.summary.shipping}
              </span>
              <span className={`font-bold text-lg ${shippingCost.isFree ? 'text-green-600' : 'text-olive'}`}>
                {shippingCost.isFree ? t.cartPage.summary.free : `€${shippingCost.costEur.toFixed(2)}`}
              </span>
            </div>
          </div>
        )}

        {/* Bottone Continua - abilitato solo se zona selezionata */}
        <button
          onClick={() => selectedShippingZone && setCurrentStep(3)}
          disabled={!selectedShippingZone}
          className="w-full mt-4 bg-olive text-beige py-3 px-4 font-medium uppercase tracking-wider hover:bg-olive/90 transition-colors flex items-center justify-center gap-2 border border-olive/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{t.cartPage.wizard?.continue || "CONTINUA"}</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </WizardStep>

      {/* STEP 3: Conferma e Checkout */}
      <WizardStep
        ref={step3Ref}
        stepNumber={3}
        title={t.cartPage.wizard?.step3Title || "CONFERMA ORDINE"}
        summary=""
        isActive={currentStep === 3}
        isCompleted={false}
        isLocked={currentStep < 3}
      >
        {/* Riepilogo compatto */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-nocciola text-sm">
            <span>{t.cartPage.summary.subtotal?.replace('{count}', totalItems.toString()).replace('{itemLabel}', itemLabel) || `Prodotti (${totalItems})`}</span>
            <span>€{total.toFixed(2)}</span>
          </div>

          {selectedShippingZone && (
            <div className="flex justify-between text-nocciola text-sm">
              <span>{t.cartPage.summary.shipping}</span>
              <span className={shippingCost.isFree ? "text-green-600 font-medium" : ""}>
                {shippingCost.isFree ? t.cartPage.summary.free : `€${shippingCost.costEur.toFixed(2)}`}
              </span>
            </div>
          )}

          <div className="border-t-2 border-olive pt-3 flex justify-between text-olive font-bold text-xl">
            <span>{t.cartPage.summary.total}</span>
            <span>€{finalTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Checkbox fattura */}
        <div className="mb-6 p-4 bg-olive/5 border border-olive/10">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={needsInvoice}
              onChange={(e) => setNeedsInvoice(e.target.checked)}
              className="mt-1 border-olive/30 text-olive focus:ring-olive focus:ring-offset-0"
            />
            <div>
              <span className="text-olive font-medium text-sm block">
                {t.cartPage.invoice.title}
              </span>
              <span className="text-nocciola text-xs">
                {t.cartPage.invoice.description}
              </span>
            </div>
          </label>
        </div>

        {/* Bottone Checkout */}
        <button
          onClick={handleCheckout}
          disabled={checkoutLoading}
          className="w-full bg-olive text-beige py-4 px-4 font-bold text-lg uppercase tracking-wider hover:bg-olive/90 transition-colors flex items-center justify-center gap-2 border border-olive/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {checkoutLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{t.cartPage.summary.processing}</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>{t.cartPage.summary.checkout}</span>
            </>
          )}
        </button>

        {needsInvoice && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100">
            <p className="text-blue-800 text-xs">
              {t.cartPage.invoice.checkoutNote}
            </p>
          </div>
        )}
      </WizardStep>
    </div>
  );
}
