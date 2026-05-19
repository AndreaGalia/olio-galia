'use client';

import { useT } from '@/hooks/useT';
import type { OrderInfo } from './types';

interface Props {
  orderInfo: OrderInfo;
  productCount: number;
}

export default function FeedbackOrderInfo({ orderInfo, productCount }: Props) {
  const { translate } = useT();

  return (
    <div className="border border-olive/20 p-6 mb-10 bg-beige">
      <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-4">
        {translate(`feedback.form.orderInfo.${orderInfo.orderType}`)} #{orderInfo.orderNumber.slice(-8).toUpperCase()}
      </p>
      <div className="border-t border-olive/20 pt-4 space-y-2">
        <p className="garamond-13">
          <span className="font-serif termina-8 tracking-wider uppercase text-black mr-2">
            {translate('feedback.form.orderInfo.customer')}
          </span>
          {orderInfo.customerName}
        </p>
        <p className="garamond-13">
          <span className="font-serif termina-8 tracking-wider uppercase text-black mr-2">
            {translate('feedback.form.orderInfo.productsToReview')}
          </span>
          {productCount}
        </p>
      </div>
    </div>
  );
}
