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
import { parseCartItemId } from '@/utils/variantHelpers';

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
        {/* Lista prodotti — primo item senza border-t, lo gestisce CartItem */}
        <div className="mb-6">
          {cart.map((cartItem) => {
            const { productId } = parseCartItemId(cartItem.id);
            const product = products.find((p: Product) => p.id === productId);
            if (!product) return null;

            return (
              <CartItem
                key={cartItem.id}
                cartItem={cartItem}
                product={product}
              />
            );
          })}
        </div>

        {/* Subtotale */}
        <div className="border-t border-black/10 pt-4 space-y-2">
          <div className="flex justify-between text-sm text-black/70">
            <span>{t.cartPage.summary.subtotal?.replace('{count}', totalItems.toString()).replace('{itemLabel}', itemLabel) || `Subtotale (${totalItems} ${itemLabel})`}</span>
            <span>€{total.toFixed(2)}</span>
          </div>

          {savings > 0 && (
            <div className="flex justify-between text-olive text-sm">
              <span>{t.cartPage.summary.totalSavings}</span>
              <span>-€{savings.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Bottone Continua */}
        <button
          onClick={() => setCurrentStep(2)}
          className="w-full mt-6 py-4 bg-sabbia text-black text-[11px] tracking-[0.25em] uppercase transition-all duration-300 cursor-pointer hover:bg-olive hover:text-beige disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t.cartPage.wizard?.continue || "CONTINUA"}
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
            <div className="mb-6 border-b border-black/10 pb-6">
              <div className="mb-4">
                <h4 className="text-[11px] tracking-[0.2em] uppercase text-black/60 mb-2">
                  {t.cartPage.wizard?.torinoTitle || "SEI DI TORINO?"}
                </h4>
                <p className="text-xs text-black/40">
                  {t.cartPage.wizard?.torinoDescription || "Usa il checkout veloce per ritiro o consegna a Torino"}
                </p>
              </div>
              <CheckoutTorinoButton minimal={true} />
            </div>

            {/* Separatore OPPURE */}
            <div className="relative mb-6">
              <div className="border-t border-black/10"></div>
              <div className="flex justify-center -mt-2.5">
                <span className="bg-sabbia-chiaro px-3 text-[11px] tracking-widest uppercase text-black/30">
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
          <div className="border-t border-black/10 pt-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-xs text-black/60">
                {t.cartPage.summary.shipping}
              </span>
              <span className={`text-sm font-light ${shippingCost.isFree ? 'text-olive' : 'text-black'}`}>
                {shippingCost.isFree ? t.cartPage.summary.free : `€${shippingCost.costEur.toFixed(2)}`}
              </span>
            </div>
          </div>
        )}

        {/* Bottone Continua - abilitato solo se zona selezionata */}
        <button
          onClick={() => selectedShippingZone && setCurrentStep(3)}
          disabled={!selectedShippingZone}
          className="w-full mt-4 py-4 bg-sabbia text-black text-[11px] tracking-[0.25em] uppercase transition-all duration-300 cursor-pointer hover:bg-olive hover:text-beige disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t.cartPage.wizard?.continue || "CONTINUA"}
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
          <div className="flex justify-between text-sm text-black/70">
            <span>{t.cartPage.summary.subtotal?.replace('{count}', totalItems.toString()).replace('{itemLabel}', itemLabel) || `Prodotti (${totalItems})`}</span>
            <span>€{total.toFixed(2)}</span>
          </div>

          {selectedShippingZone && (
            <div className="flex justify-between text-sm text-black/70">
              <span>{t.cartPage.summary.shipping}</span>
              <span className={shippingCost.isFree ? "text-olive" : ""}>
                {shippingCost.isFree ? t.cartPage.summary.free : `€${shippingCost.costEur.toFixed(2)}`}
              </span>
            </div>
          )}

          <div className="border-t border-black/10 pt-3 flex justify-between text-black font-medium text-base">
            <span>{t.cartPage.summary.total}</span>
            <span>€{finalTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Checkbox fattura */}
        <div className="border-t border-black/10 pt-4 mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={needsInvoice}
              onChange={(e) => setNeedsInvoice(e.target.checked)}
              className="mt-1 border-black/20 text-olive focus:ring-olive focus:ring-offset-0"
            />
            <div>
              <span className="text-black/70 text-xs block tracking-wide">
                {t.cartPage.invoice.title}
              </span>
              <span className="text-black/40 text-xs">
                {t.cartPage.invoice.description}
              </span>
            </div>
          </label>
        </div>

        {/* Bottone Checkout */}
        <button
          onClick={handleCheckout}
          disabled={checkoutLoading}
          className="w-full py-4 bg-sabbia text-black text-[11px] tracking-[0.25em] uppercase transition-all duration-300 cursor-pointer hover:bg-olive hover:text-beige disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {checkoutLoading ? (
            <span>{t.cartPage.summary.processing}</span>
          ) : (
            <span>{t.cartPage.summary.checkout}</span>
          )}
        </button>

        {needsInvoice && (
          <p className="mt-4 text-xs text-black/40">
            {t.cartPage.invoice.checkoutNote}
          </p>
        )}
      </WizardStep>
    </div>
  );
}
