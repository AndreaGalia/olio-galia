'use client';

interface Step {
  number: number;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  currentStep: number;
  steps: Step[];
}

export default function StepIndicator({
  currentStep,
  steps,
}: StepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Desktop view - horizontal */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between relative">
          {/* Progress bar background */}
          <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 -z-10" />
          {/* Progress bar fill */}
          <div
            className="absolute top-5 left-0 h-1 bg-[--salvia] -z-10 transition-all duration-500"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />

          {steps.map((step) => {
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;
            const isUpcoming = step.number > currentStep;

            return (
              <div
                key={step.number}
                className="flex flex-col items-center flex-1"
              >
                {/* Circle */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    font-bold text-sm transition-all duration-300
                    ${
                      isCompleted
                        ? 'bg-[--salvia] text-white'
                        : isCurrent
                        ? 'bg-[--olive] text-white shadow-lg scale-110'
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {isCompleted ? '✓' : step.number}
                </div>
                {/* Label */}
                <div className="mt-2 text-center max-w-[150px]">
                  <p
                    className={`text-sm font-medium ${
                      isCurrent ? 'text-[--olive]' : 'text-gray-600'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 hidden lg:block">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile view - vertical */}
      <div className="md:hidden space-y-4">
        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isUpcoming = step.number > currentStep;

          return (
            <div key={step.number} className="flex items-start gap-4">
              {/* Circle and line */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    font-bold text-sm transition-all duration-300
                    ${
                      isCompleted
                        ? 'bg-[--salvia] text-white'
                        : isCurrent
                        ? 'bg-[--olive] text-white shadow-lg'
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {isCompleted ? '✓' : step.number}
                </div>
                {/* Vertical line */}
                {step.number < steps.length && (
                  <div
                    className={`w-0.5 h-12 mt-2 ${
                      isCompleted ? 'bg-[--salvia]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
              {/* Content */}
              <div className="flex-1 pt-1">
                <p
                  className={`font-medium ${
                    isCurrent ? 'text-[--olive]' : 'text-gray-600'
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-sm text-gray-500 mt-1">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
