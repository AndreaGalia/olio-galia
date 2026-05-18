'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { useOrderPolling } from '@/hooks/useOrderPolling';
import { useInvoiceStatus } from '@/hooks/useInvoiceStatus';
import { useReceiptStatus } from '@/hooks/useReceiptStatus';
import { useCartCleanup } from '@/hooks/useCartCleanup';
import { useT } from '@/hooks/useT';

import WhatsAppButton from '@/components/checkoutSuccessPage/WhatsAppButton';
import ReceiptButton from '@/components/checkoutSuccessPage/ReceiptButton';
import ExpiredAccessMessage from '@/components/checkoutSuccessPage/ExpiredAccessMessage';

const STEP_KEYS = ['confirmation', 'preparation', 'shipping'] as const;
const CURRENT_STEP = 'confirmation';

export default function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { t } = useT();

  const { order, loading, expired } = useOrderPolling(sessionId);
  const invoiceStatus = useInvoiceStatus(sessionId);
  const receiptStatus = useReceiptStatus(sessionId);

  useCartCleanup(sessionId);

  if (expired) return <ExpiredAccessMessage />;

  const currentIndex = STEP_KEYS.indexOf(CURRENT_STEP);
  const progressPct = Math.round(((currentIndex + 1) / STEP_KEYS.length) * 100);

  return (
    <div className="min-h-screen bg-sabbia-chiaro">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="border-b border-olive/20 pt-14 pb-8 lg:pt-20 lg:pb-10">
        <div className="px-6 sm:px-12 lg:px-16 xl:px-24 max-w-[var(--container-wide)] mx-auto">
          <div className="lg:flex lg:items-end lg:justify-between lg:gap-12">
            <div>
              <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-3">
                {t.checkoutSuccess.hero.subtitle}
              </p>
              <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: '1.1', letterSpacing: '0.15em' }}>
                {t.checkoutSuccess.hero.title}
              </h1>
              <p className="mt-4 garamond-13 max-w-lg">
                {t.checkoutSuccess.hero.description}
              </p>
            </div>
            {order?.paymentIntent && (
              <div className="mt-6 lg:mt-0 flex-shrink-0 lg:text-right">
                <p className="font-serif termina-8 tracking-[0.2em] uppercase text-black mb-1">
                  {t.checkoutSuccess.hero.orderNumber}
                </p>
                <p style={{ fontFamily: '"termina", sans-serif', fontSize: 'clamp(1rem, 1.8vw, 1.4rem)', letterSpacing: '0.1em' }}>
                  #{order.paymentIntent.slice(-8).toUpperCase()}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="px-6 sm:px-12 lg:px-16 xl:px-24 max-w-[var(--container-wide)] mx-auto pt-10 pb-16 lg:pt-14 lg:pb-20 space-y-0">

        {/* ── BLOCCO 1: azioni ── */}
        {order?.paymentIntent && (
          <div className="pb-10 border-b border-olive/20 flex gap-3">
            <div className="flex-1">
              <WhatsAppButton orderDetails={order} sessionId={order.paymentIntent} />
            </div>
            {receiptStatus.hasReceipt && (
              <div className="flex-1">
                <ReceiptButton receiptStatus={receiptStatus} invoiceStatus={invoiceStatus} />
              </div>
            )}
          </div>
        )}

        {/* ── BLOCCO 2: prodotti | cliente+spedizione ── */}
        {(loading || order) && (
          <div className="pt-10 pb-10 border-b border-olive/20 lg:grid lg:grid-cols-[3fr_2fr] lg:gap-12 xl:gap-16">

            {/* Prodotti + Totali */}
            <div>
              {loading ? (
                <div className="animate-pulse space-y-5">
                  <div className="h-3 bg-olive/10 w-32" />
                  <div className="h-14 bg-olive/10 w-full" />
                </div>
              ) : order ? (
                <>
                  <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black">
                    {t.checkoutSuccess.orderSummary.productsOrdered}
                  </p>
                  <div>
                    {order.items?.map((item, index) => (
                      <div key={index} className="border-t border-olive/20 py-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          {item.image && (
                            <div className="w-14 h-14 border border-olive/20 overflow-hidden flex-shrink-0">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div>
                            <p className="garamond-13">{item.name}</p>
                            <p className="font-serif termina-8 tracking-[0.1em] uppercase text-black mt-1">
                              {t.checkoutSuccess.orderSummary.quantity} {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="garamond-13">€{(item.price * item.quantity).toFixed(2)}</p>
                          <p className="font-serif termina-8 text-black mt-1">
                            €{item.price.toFixed(2)} / {t.checkoutSuccess.orderSummary.each}
                          </p>
                        </div>
                      </div>
                    )) || (
                      <p className="garamond-13 py-4 border-t border-olive/20">
                        {t.checkoutSuccess.orderSummary.productDetailsNotAvailable}
                      </p>
                    )}
                  </div>
                  <div className="border-t border-olive/20 pt-4 space-y-2">
                    <div className="flex justify-between garamond-13">
                      <span>{t.checkoutSuccess.orderSummary.subtotal}</span>
                      <span>
                        €{order.pricing?.subtotal?.toFixed(2) ??
                          ((order.total || 0) - (order.pricing?.shippingCost ?? (order.total || 0) * 0.1)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between garamond-13">
                      <span className="flex items-center gap-2">
                        {t.checkoutSuccess.orderSummary.shippingCost}
                        {order.pricing?.shippingCost === 0 && (
                          <span className="font-serif termina-8 tracking-[0.1em] uppercase text-olive border border-olive/30 px-1.5 py-0.5">
                            {t.checkoutSuccess.freeShipping}
                          </span>
                        )}
                      </span>
                      <span>
                        {order.pricing?.shippingCost !== undefined
                          ? `€${order.pricing.shippingCost.toFixed(2)}`
                          : `€${((order.total || 0) * 0.1).toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline border-t border-olive/20 pt-3">
                      <span className="font-serif termina-11 tracking-[0.2em] uppercase text-black">
                        {t.checkoutSuccess.orderSummary.total}
                      </span>
                      <span style={{ fontFamily: '"termina", sans-serif', fontSize: 'clamp(1rem, 1.8vw, 1.3rem)', letterSpacing: '0.05em' }}>
                        €{(order.pricing?.total ?? order.total ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* Cliente + Spedizione */}
            {order && (
              <div className="mt-8 lg:mt-0 grid grid-cols-2 gap-5 lg:block lg:space-y-6">
                <div>
                  <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-2.5">
                    {t.checkoutSuccess.orderSummary.customerData}
                  </p>
                  <div className="space-y-1 garamond-13">
                    <p>{order.customer?.name || '—'}</p>
                    <p>{order.customer?.email || '—'}</p>
                  </div>
                </div>
                <div>
                  <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-2.5">
                    {t.checkoutSuccess.orderSummary.shipping}
                  </p>
                  <div className="space-y-1 garamond-13">
                    <p>{order.shipping?.address || t.checkoutSuccess.orderSummary.asPerCheckout}</p>
                    {order.shipping?.method && <p>{order.shipping.method}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── BLOCCO 3: timeline ── */}
        <div className="pt-10 pb-10 border-b border-olive/20">
          <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-5">
            {t.checkoutSuccess.timeline.title}
          </p>

          {/* Barra di progresso */}
          <div className="relative h-[2px] bg-olive/15 mb-7">
            <div
              className="absolute left-0 top-0 h-full bg-olive transition-all duration-700 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Step */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
            {STEP_KEYS.map((key, index) => {
              const step = t.checkoutSuccess.timeline.steps[key];
              const isDone = index <= currentIndex;
              const isActive = index === currentIndex;
              return (
                <div key={key}>
                  <p
                    className={`mb-2 leading-none ${isDone ? 'text-olive' : 'text-black/20'}`}
                    style={{ fontFamily: '"termina", sans-serif', fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', letterSpacing: '0.05em' }}
                  >
                    0{index + 1}
                  </p>
                  <p className={`font-serif termina-11 tracking-[0.15em] uppercase mb-1 ${isDone ? 'text-black' : 'text-black/25'}`}>
                    {step.title}
                  </p>
                  <p className={`garamond-13 ${isDone ? 'text-black' : 'text-black/25'}`}>
                    {step.description}
                  </p>
                  {isActive && (
                    <p className="font-serif termina-8 tracking-[0.15em] uppercase text-olive mt-2">
                      {step.status}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── BLOCCO 4: CTA ── */}
        <div className="pt-10 lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div className="mb-5 lg:mb-0">
            <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-1.5">
              {t.checkoutSuccess.cta.title}
            </p>
            <p className="garamond-13 max-w-sm">
              {t.checkoutSuccess.cta.description}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              href="/products"
              className="w-full sm:w-auto sm:px-8 py-4 font-serif termina-11 tracking-[3.4px] uppercase border border-olive bg-olive text-beige hover:bg-sabbia hover:text-olive transition-all duration-200 cursor-pointer text-center whitespace-nowrap block"
            >
              {t.checkoutSuccess.cta.discoverProducts}
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto sm:px-8 py-4 font-serif termina-11 tracking-[3.4px] uppercase border border-olive bg-sabbia text-olive hover:bg-olive hover:text-beige transition-all duration-200 cursor-pointer text-center whitespace-nowrap block"
            >
              {t.checkoutSuccess.cta.backToHome}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
