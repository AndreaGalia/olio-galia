"use client";

import { useT } from '@/hooks/useT';

export default function SubSuccessTimeline() {
  const { t } = useT();
  const sub = t.subscription;

  const steps = [
    { title: sub?.step1Title, description: sub?.step1, status: sub?.stepCompleted, done: true },
    { title: sub?.step2Title, description: sub?.step2, status: sub?.stepInProgress, done: true },
    { title: sub?.step3Title, description: sub?.step3, status: sub?.stepPending, done: false },
  ];

  return (
    <section className="pb-8">
      <div className="px-6 sm:px-12 lg:px-16 xl:px-24 max-w-4xl mx-auto">
        <div className="border-t border-olive/20 pt-8">
          <p className="text-[11px] tracking-[0.2em] uppercase text-black/40 mb-6">
            {sub?.nextSteps}
          </p>

          <div>
            {steps.map((step, index) => (
              <div key={index} className="border-t border-olive/20 py-5 flex items-start justify-between gap-6">
                <div className="flex-1">
                  <p className={`text-[11px] tracking-[0.2em] uppercase mb-1.5 ${step.done ? 'text-olive' : 'text-black/30'}`}>
                    0{index + 1}
                  </p>
                  <p className={`text-sm leading-relaxed ${step.done ? 'text-black/80' : 'text-black/40'}`}>
                    {step.title}
                  </p>
                  <p className={`text-xs leading-relaxed mt-1 ${step.done ? 'text-black/50' : 'text-black/30'}`}>
                    {step.description}
                  </p>
                </div>
                <span className={`text-[10px] tracking-[0.15em] uppercase px-2 py-1 border flex-shrink-0 mt-1 ${
                  step.done
                    ? 'border-olive/30 text-olive'
                    : 'border-black/10 text-black/30'
                }`}>
                  {step.status}
                </span>
              </div>
            ))}
            <div className="border-t border-olive/20" />
          </div>
        </div>
      </div>
    </section>
  );
}
