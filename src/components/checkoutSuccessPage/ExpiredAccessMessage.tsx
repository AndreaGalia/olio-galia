'use client';

import Link from 'next/link';
import { useT } from '@/hooks/useT';
import { ShieldAlert, Mail, Home, ShoppingBag } from 'lucide-react';

export default function ExpiredAccessMessage() {
  const { t } = useT();

  return (
    <div className="min-h-screen bg-homepage-bg flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full">
        {/* Card principale */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-olive/10">
          {/* Icona */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-10 h-10 text-amber-600" />
            </div>
          </div>

          {/* Titolo */}
          <h1 className="text-3xl md:text-4xl font-bold text-center text-olive mb-4">
            {t.checkoutSuccess.expired.title}
          </h1>

          {/* Messaggio principale */}
          <p className="text-lg text-nocciola text-center mb-6">
            {t.checkoutSuccess.expired.message}
          </p>

          {/* Info email con icona */}
          <div className="bg-olive/5 border border-olive/10 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Mail className="w-6 h-6 text-olive mt-1" />
              </div>
              <div>
                <p className="text-olive font-medium mb-2">
                  {t.checkoutSuccess.expired.emailInfo}
                </p>
                <p className="text-sm text-nocciola">
                  {t.checkoutSuccess.expired.security}
                </p>
              </div>
            </div>
          </div>

          {/* Pulsanti azione */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-olive text-white rounded-lg hover:bg-olive/90 transition-colors duration-200 font-medium"
            >
              <Home className="w-5 h-5" />
              {t.checkoutSuccess.expired.backToHome}
            </Link>

            <Link
              href="/products"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-olive border-2 border-olive rounded-lg hover:bg-olive/5 transition-colors duration-200 font-medium"
            >
              <ShoppingBag className="w-5 h-5" />
              {t.checkoutSuccess.expired.exploreProducts}
            </Link>
          </div>
        </div>

        {/* Info aggiuntiva sotto la card */}
        <div className="text-center mt-6 text-sm text-nocciola">
          <p>
            {t.checkoutSuccess.expired.footer}
          </p>
        </div>
      </div>
    </div>
  );
}
