import { useT } from '@/hooks/useT';
import { OrderSummaryDisplayProps } from '@/types/checkoutSuccessTypes';

export default function OrderSummaryDisplay({ orderDetails, loading }: OrderSummaryDisplayProps) {
  const { t } = useT();

  return (
    <section className="pb-8">
      <div className="px-6 sm:px-12 lg:px-16 xl:px-24 max-w-4xl mx-auto">
        <div className="border-t border-olive/20 pt-8 space-y-8">

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-3 bg-olive/10 w-24" />
              <div className="h-4 bg-olive/10 w-48" />
              <div className="h-4 bg-olive/10 w-64" />
            </div>
          ) : orderDetails ? (
            <>
              {/* Numero ordine */}
              {orderDetails.paymentIntent && (
                <div>
                  <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-2">
                    {t.checkoutSuccess.hero.orderNumber}
                  </p>
                  <p style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', letterSpacing: '0.1em' }}>
                    #{orderDetails.paymentIntent.slice(-8).toUpperCase()}
                  </p>
                </div>
              )}

              {/* Dati cliente + spedizione */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-3">
                    {t.checkoutSuccess.orderSummary.customerData}
                  </p>
                  <div className="space-y-1.5 garamond-13">
                    <p>{orderDetails.customer?.name || 'N/D'}</p>
                    <p>{orderDetails.customer?.email || 'N/D'}</p>
                  </div>
                </div>

                <div>
                  <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-3">
                    {t.checkoutSuccess.orderSummary.shipping}
                  </p>
                  <div className="space-y-1.5 garamond-13">
                    <p>{orderDetails.shipping?.address || t.checkoutSuccess.orderSummary.asPerCheckout}</p>
                    {orderDetails.shipping?.method && (
                      <p>{orderDetails.shipping.method}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Prodotti */}
              <div>
                <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-4">
                  {t.checkoutSuccess.orderSummary.productsOrdered}
                </p>

                <div className="space-y-0">
                  {orderDetails.items?.map((item, index) => (
                    <div key={index} className="border-t border-olive/20 py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {item.image && (
                          <div className="w-14 h-14 border border-olive/20 overflow-hidden flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="garamond-13">{item.name}</p>
                          <p className="font-serif termina-11 tracking-[0.1em] uppercase text-black mt-0.5">
                            {t.checkoutSuccess.orderSummary.quantity} {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="garamond-13">€{(item.price * item.quantity).toFixed(2)}</p>
                        <p className="font-serif termina-11 text-black mt-0.5">€{item.price.toFixed(2)} {t.checkoutSuccess.orderSummary.each}</p>
                      </div>
                    </div>
                  )) || (
                    <p className="garamond-13 text-black py-4 border-t border-olive/20">
                      {t.checkoutSuccess.orderSummary.productDetailsNotAvailable}
                    </p>
                  )}
                  <div className="border-t border-olive/20" />
                </div>
              </div>

              {/* Totale */}
              <div className="space-y-2">
                <div className="flex justify-between garamond-13 text-black">
                  <span>{t.checkoutSuccess.orderSummary.subtotal}</span>
                  <span>
                    €{orderDetails.pricing?.subtotal?.toFixed(2) ||
                      ((orderDetails.total || 0) - (orderDetails.pricing?.shippingCost || (orderDetails.total || 0) * 0.1)).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between garamond-13 text-black">
                  <span className="flex items-center gap-2">
                    {t.checkoutSuccess.orderSummary.shippingCost}
                    {orderDetails.pricing?.shippingCost === 0 && (
                      <span className="font-serif termina-8 tracking-[0.1em] uppercase text-olive border border-olive/30 px-1.5 py-0.5">
                        {t.checkoutSuccess.freeShipping}
                      </span>
                    )}
                  </span>
                  <span>
                    {orderDetails.pricing?.shippingCost !== undefined
                      ? `€${orderDetails.pricing.shippingCost.toFixed(2)}`
                      : `€${((orderDetails.total || 0) * 0.1).toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between items-baseline border-t border-olive/20 pt-3 mt-3">
                  <span className="font-serif termina-11 tracking-[0.2em] uppercase text-black">
                    {t.checkoutSuccess.orderSummary.total}
                  </span>
                  <span style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', letterSpacing: '0.05em' }}>
                    €{(orderDetails.pricing?.total || orderDetails.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          ) : null}

        </div>
      </div>
    </section>
  );
}
