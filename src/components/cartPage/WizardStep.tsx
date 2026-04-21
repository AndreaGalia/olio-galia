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
  const containerClasses = `
    border transition-all duration-300
    ${isActive ? 'border-olive/20 bg-sabbia-chiaro' : ''}
    ${isCompleted && !isActive ? 'border-olive/20' : ''}
    ${isLocked ? 'border-olive/20 opacity-40' : ''}
    ${!isActive && !isCompleted && !isLocked ? 'border-olive/20' : ''}
  `.trim();

  const headerClasses = `
    p-4 flex items-center justify-between
    ${isCompleted && !isActive && !isLocked ? 'cursor-pointer hover:bg-black/[0.02] transition-colors' : ''}
  `.trim();

  return (
    <div ref={ref} className={`${containerClasses} scroll-mt-24`}>
      {/* Header - sempre visibile */}
      <div
        className={headerClasses}
        onClick={isCompleted && !isActive && !isLocked ? onClick : undefined}
      >
        <div className="flex items-center gap-3">
          {/* Step indicator */}
          <div className={`w-6 h-6 flex items-center justify-center flex-shrink-0 border text-xs ${
            isActive
              ? 'bg-olive text-beige border-olive'
              : isCompleted
              ? 'bg-olive text-beige border-olive'
              : 'border-olive/20 text-black'
          }`}>
            {isCompleted && !isActive ? (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="text-[10px] tracking-widest">{stepNumber}</span>
            )}
          </div>

          {/* Titolo e summary */}
          <div>
            <h3 className="font-serif termina-11 tracking-[0.2em] uppercase text-black">
              {title}
            </h3>
            {/* Summary - mostra solo quando compressa e completata */}
            {isCompleted && !isActive && summary && (
              <p className="garamond-13 mt-0.5">{summary}</p>
            )}
          </div>
        </div>

        {/* Freccia indicatore espansione */}
        {isCompleted && !isActive && (
          <svg
            className="w-4 h-4 text-black/30 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
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
