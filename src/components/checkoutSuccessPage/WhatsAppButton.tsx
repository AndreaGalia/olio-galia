import { useT } from '@/hooks/useT';
import { WhatsAppButtonProps } from '@/types/checkoutSuccessTypes';

export default function WhatsAppButton({ orderDetails, sessionId }: WhatsAppButtonProps) {
  const { t, translate } = useT();

  const sendWhatsAppMessage = () => {
    const orderNumber = sessionId.slice(-8).toUpperCase();
    const date = new Date().toLocaleDateString('it-IT');
    const customerName = orderDetails.customer?.name || 'N/D';
    const email = orderDetails.customer?.email || 'N/D';
    const total = orderDetails.total?.toFixed(2) || '0.00';

    let message = t.checkoutSuccess.whatsappMessage.greeting;
    message += t.checkoutSuccess.whatsappMessage.intro;
    message += translate('checkoutSuccess.whatsappMessage.orderNumber', { orderNumber });
    message += translate('checkoutSuccess.whatsappMessage.orderDate', { date });
    message += translate('checkoutSuccess.whatsappMessage.customerName', { name: customerName });
    message += translate('checkoutSuccess.whatsappMessage.customerEmail', { email });
    message += t.checkoutSuccess.whatsappMessage.productsTitle;

    orderDetails.items?.forEach((item) => {
      message += translate('checkoutSuccess.whatsappMessage.productLine', { name: item.name, quantity: item.quantity });
    });

    message += translate('checkoutSuccess.whatsappMessage.totalPaid', { total });
    message += t.checkoutSuccess.whatsappMessage.question;
    message += t.checkoutSuccess.whatsappMessage.thanks;
    message += t.checkoutSuccess.whatsappMessage.regards;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={sendWhatsAppMessage}
      className="w-full py-4 font-serif termina-11 tracking-[3.4px] uppercase border border-olive bg-olive text-beige hover:bg-sabbia hover:text-olive transition-all duration-200 cursor-pointer"
    >
      {t.checkoutSuccess.hero.whatsapp}
    </button>
  );
}
