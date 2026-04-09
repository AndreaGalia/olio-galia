import { useT } from '@/hooks/useT';
import { TimelineProcessProps } from '@/types/checkoutSuccessTypes';

const STEP_KEYS = ['confirmation', 'preparation', 'shipping'] as const;

export default function TimelineProcess({ currentStep = 'confirmation' }: TimelineProcessProps) {
  const { t } = useT();
  const currentIndex = STEP_KEYS.indexOf(currentStep as typeof STEP_KEYS[number]);

  return (
    <section className="pb-8">
      <div className="px-6 sm:px-12 lg:px-16 xl:px-24 max-w-4xl mx-auto">
        <div className="border-t border-olive/20 pt-8">
          <p className="text-[11px] tracking-[0.2em] uppercase text-black/40 mb-6">
            {t.checkoutSuccess.timeline.title}
          </p>

          <div>
            {STEP_KEYS.map((key, index) => {
              const step = t.checkoutSuccess.timeline.steps[key];
              const isDone = index <= currentIndex;

              return (
                <div key={key} className="border-t border-olive/20 py-5 flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <p className={`text-[11px] tracking-[0.2em] uppercase mb-1.5 ${isDone ? 'text-olive' : 'text-black/30'}`}>
                      0{index + 1}
                    </p>
                    <p className={`text-sm leading-relaxed ${isDone ? 'text-black/80' : 'text-black/40'}`}>
                      {step.title}
                    </p>
                    <p className={`text-xs leading-relaxed mt-1 ${isDone ? 'text-black/50' : 'text-black/30'}`}>
                      {step.description}
                    </p>
                  </div>
                  <span className={`text-[10px] tracking-[0.15em] uppercase px-2 py-1 border flex-shrink-0 mt-1 ${
                    isDone
                      ? 'border-olive/30 text-olive'
                      : 'border-black/10 text-black/30'
                  }`}>
                    {step.status}
                  </span>
                </div>
              );
            })}
            <div className="border-t border-olive/20" />
          </div>
        </div>
      </div>
    </section>
  );
}
