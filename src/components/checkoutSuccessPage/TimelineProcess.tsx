import { useT } from '@/hooks/useT';
import { TimelineProcessProps } from '@/types/checkoutSuccessTypes';

export default function TimelineProcess({ currentStep = 'confirmation' }: TimelineProcessProps) {
  const { t } = useT();

  return (
    <div className="max-w-4xl mx-auto mb-16">
      <h2 className="text-3xl font-serif text-olive text-center mb-12">{t.checkoutSuccess.timeline.title}</h2>
      
      <div className="relative">
        {/* Linea di connessione */}
        <div className="absolute left-1/2 transform -translate-x-0.5 w-1 h-full bg-gradient-to-b from-olive via-salvia to-nocciola opacity-30"></div>
        
        <div className="space-y-12">
          {/* Step 1 - Confirmazione */}
          <div className="relative flex items-center">
            <div className="flex-1 text-right pr-8">
              <h3 className="text-xl font-serif text-olive mb-2">{t.checkoutSuccess.timeline.steps.confirmation.title}</h3>
              <p className="text-nocciola">{t.checkoutSuccess.timeline.steps.confirmation.description}</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-olive to-salvia rounded-full flex items-center justify-center shadow-lg z-10">
              <svg className="w-8 h-8 text-beige" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 pl-8">
              <span className="text-sm bg-olive text-beige px-3 py-1 rounded-full">{t.checkoutSuccess.timeline.steps.confirmation.status}</span>
            </div>
          </div>

          {/* Step 2 - Preparazione */}
          <div className="relative flex items-center">
            <div className="flex-1 text-right pr-8">
              <span className="text-sm bg-salvia text-beige px-3 py-1 rounded-full">{t.checkoutSuccess.timeline.steps.preparation.status}</span>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-salvia to-nocciola rounded-full flex items-center justify-center shadow-lg z-10">
              <svg className="w-8 h-8 text-beige" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <div className="flex-1 pl-8">
              <h3 className="text-xl font-serif text-olive mb-2">{t.checkoutSuccess.timeline.steps.preparation.title}</h3>
              <p className="text-nocciola">{t.checkoutSuccess.timeline.steps.preparation.description}</p>
            </div>
          </div>

          {/* Step 3 - Spedizione */}
          <div className="relative flex items-center">
            <div className="flex-1 text-right pr-8">
              <h3 className="text-xl font-serif text-olive mb-2">{t.checkoutSuccess.timeline.steps.shipping.title}</h3>
              <p className="text-nocciola">{t.checkoutSuccess.timeline.steps.shipping.description}</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-nocciola to-sabbia rounded-full flex items-center justify-center shadow-lg z-10 opacity-60">
              <svg className="w-8 h-8 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="flex-1 pl-8">
              <span className="text-sm bg-nocciola/20 text-nocciola px-3 py-1 rounded-full">{t.checkoutSuccess.timeline.steps.shipping.status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}