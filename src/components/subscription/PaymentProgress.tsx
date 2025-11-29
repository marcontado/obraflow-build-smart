import { Check, Loader2 } from "lucide-react";

interface Step {
  label: string;
  description: string;
}

interface PaymentProgressProps {
  currentStep: number;
  steps: Step[];
}

export function PaymentProgress({ currentStep, steps }: PaymentProgressProps) {
  return (
    <div className="w-full max-w-3xl mx-auto py-8">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isUpcoming = index > currentStep;

            return (
              <div key={index} className="flex flex-col items-center w-32">
                {/* Circle */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                    ${isCompleted ? "bg-primary text-primary-foreground" : ""}
                    ${isCurrent ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : ""}
                    ${isUpcoming ? "bg-muted text-muted-foreground" : ""}
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>

                {/* Label */}
                <div className="text-center">
                  <p
                    className={`
                      text-sm font-medium mb-1 transition-colors
                      ${isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"}
                    `}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
