import { useT } from '@/hooks/useT';
import { OrderSummaryDisplayProps } from '@/types/checkoutSuccessTypes';

export default function OrderSummaryDisplay({ orderDetails, loading }: OrderSummaryDisplayProps) {
  const { t } = useT();

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mb-16">
        <div className="bg-white border border-olive/10 p-8">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-olive/30 border-t-olive animate-spin mx-auto mb-4"></div>
            <p className="text-nocciola">{t.checkoutSuccess.loading.orderSummary}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!orderDetails) return null;

  return (
    <div className="max-w-3xl mx-auto mb-16">
      <div className="bg-white border border-olive/10 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif text-olive">{t.checkoutSuccess.orderSummary.title}</h2>
        </div>

        {/* Numero Ordine */}
        {orderDetails.paymentIntent && (
          <div className="bg-olive/5 border border-olive/10 p-4 mb-8">
            <div className="flex items-center justify-center gap-3">
              <span className="text-sm font-medium text-nocciola/80 uppercase tracking-wide">{t.checkoutSuccess.hero.orderNumber}</span>
              <span className="text-xl font-serif text-olive font-bold tracking-wider">
                #{orderDetails.paymentIntent.slice(-8).toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Informazioni Cliente */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-beige/50 border border-olive/10 p-6">
            <h3 className="font-serif text-lg text-olive mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {t.checkoutSuccess.orderSummary.customerData}
            </h3>
            <p className="text-nocciola mb-2">
              <span className="font-medium">{t.checkoutSuccess.orderSummary.name}</span> {orderDetails.customer?.name || 'N/D'}
            </p>
            <p className="text-nocciola">
              <span className="font-medium">{t.checkoutSuccess.orderSummary.email}</span> {orderDetails.customer?.email || 'N/D'}
            </p>
          </div>

          <div className="bg-beige/50 border border-olive/10 p-6">
            <h3 className="font-serif text-lg text-olive mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t.checkoutSuccess.orderSummary.shipping}
            </h3>
            <p className="text-nocciola mb-2">
              <span className="font-medium">{t.checkoutSuccess.orderSummary.address}</span> {orderDetails.shipping?.address || t.checkoutSuccess.orderSummary.asPerCheckout}
            </p>
          </div>
        </div>

        {/* Prodotti Ordinati */}
        <div className="mb-8">
          <h3 className="font-serif text-xl text-olive mb-6 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
            </svg>
            {t.checkoutSuccess.orderSummary.productsOrdered}
          </h3>
          
          <div className="space-y-4">
            {orderDetails.items?.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-beige/30 border border-nocciola/10">
                <div className="flex items-center gap-4">
                  {item.image && (
                    <div className="w-16 h-16 bg-olive/10 border border-olive/10 flex items-center justify-center overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-olive">{item.name}</h4>
                    <p className="text-sm text-nocciola">{t.checkoutSuccess.orderSummary.quantity} {item.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-olive">€{(item.price * item.quantity).toFixed(2)}</p>
                  <p className="text-sm text-nocciola">€{item.price.toFixed(2)} {t.checkoutSuccess.orderSummary.each}</p>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-nocciola">
                <p>{t.checkoutSuccess.orderSummary.productDetailsNotAvailable}</p>
              </div>
            )}
          </div>
        </div>

        {/* Totale */}
        <div className="border-t border-nocciola/20 pt-6">
          <div className="bg-olive/5 border border-olive/10 p-6">
            
            {/* Subtotale prodotti */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-nocciola">{t.checkoutSuccess.orderSummary.subtotal}</span>
              <span className="text-nocciola">
                €{orderDetails.pricing?.subtotal?.toFixed(2) || 
                   ((orderDetails.total || 0) - (orderDetails.pricing?.shippingCost || (orderDetails.total || 0) * 0.1)).toFixed(2)}
              </span>
            </div>
            
            {/* Costo spedizione reale da Stripe */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-nocciola">{t.checkoutSuccess.orderSummary.shippingCost}</span>
                {orderDetails.pricing?.shippingCost === 0 && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 border border-green-200 font-medium">
                    {t.checkoutSuccess.freeShipping}
                  </span>
                )}
              </div>
              <span className="text-nocciola">
                {orderDetails.pricing?.shippingCost !== undefined ? 
                  `€${orderDetails.pricing.shippingCost.toFixed(2)}` : 
                  `€${((orderDetails.total || 0) * 0.1).toFixed(2)}`
                }
              </span>
            </div>
            
            {/* Separatore prima del totale */}
            <div className="border-t border-olive/20 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-xl font-serif text-olive font-bold">{t.checkoutSuccess.orderSummary.total}</span>
                <span className="text-2xl font-serif text-olive font-bold">
                  €{(orderDetails.pricing?.total || orderDetails.total || 0).toFixed(2)}
                </span>
              </div>
              
              {/* Informazioni aggiuntive sul metodo di spedizione */}
              {orderDetails.shipping?.method && (
                <div className="mt-3 pt-3 border-t border-olive/10">
                  <p className="text-sm text-nocciola/80 text-center">
                    <span className="font-medium">{t.checkoutSuccess.shippingMethod}</span> {orderDetails.shipping.method}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}