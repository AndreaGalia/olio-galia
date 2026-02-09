"use client";

import { forwardRef } from 'react';

interface WizardStepProps {
  stepNumber: number;
  title: string;
  summary?: string;
  isActive: boolean;
  isCompleted: boolean;
  isLocked: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

const WizardStep = forwardRef<HTMLDivElement, WizardStepProps>(({
  stepNumber,
  title,
  summary,
  isActive,
  isCompleted,
  isLocked,
  children,
  onClick
}, ref) => {
  // Determina le classi CSS in base allo stato
  const containerClasses = `
    border transition-all duration-300
    ${isActive ? 'bg-olive/5 border-olive border-2' : ''}
    ${isCompleted && !isActive ? 'bg-beige border-olive/20' : ''}
    ${isLocked ? 'bg-white border-olive/10 opacity-50' : ''}
    ${!isActive && !isLocked ? 'bg-white border-olive/10' : ''}
  `.trim();

  const headerClasses = `
    p-4 flex items-center justify-between
    ${isCompleted && !isActive && !isLocked ? 'cursor-pointer hover:bg-olive/5 transition-colors' : ''}
  `.trim();

  return (
    <div ref={ref} className={`${containerClasses} scroll-mt-24`}>
      {/* Header - sempre visibile */}
      <div
        className={headerClasses}
        onClick={isCompleted && !isActive && !isLocked ? onClick : undefined}
      >
        <div className="flex items-center gap-3">
          {/* Icon stato */}
          <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${
            isActive ? 'bg-olive' :
            isCompleted ? 'bg-olive' :
            'bg-nocciola/30'
          }`}>
            {isCompleted ? (
              // Checkmark
              <svg className="w-5 h-5 text-beige" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : isActive ? (
              // Dot attivo
              <div className="w-3 h-3 bg-beige"></div>
            ) : (
              // Lock
              <svg className="w-4 h-4 text-nocciola" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
          </div>

          {/* Titolo e summary */}
          <div>
            <h3 className="font-serif text-olive font-bold text-sm sm:text-base uppercase tracking-wider">
              {stepNumber}. {title}
            </h3>
            {/* Summary - mostra solo quando compressa e completata */}
            {isCompleted && !isActive && summary && (
              <p className="text-nocciola text-xs sm:text-sm mt-1">{summary}</p>
            )}
          </div>
        </div>

        {/* Freccia indicatore espansione */}
        {isCompleted && !isActive && (
          <svg
            className="w-5 h-5 text-olive transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>

      {/* Content - mostra solo se attivo */}
      {isActive && (
        <div className="px-4 pb-4 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
});

WizardStep.displayName = 'WizardStep';

export default WizardStep;
