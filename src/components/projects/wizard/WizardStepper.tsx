import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface WizardStepperProps {
  steps: Step[];
  currentStep: number;
}

export function WizardStepper({ steps, currentStep }: WizardStepperProps) {
  return (
    <div className="w-full py-6 px-2">
      {/* Mobile: Compact horizontal view with progress bar */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
              {currentStep}
            </div>
            <div>
              <p className="text-sm font-semibold">
                {steps.find(s => s.id === currentStep)?.title}
              </p>
              <p className="text-xs text-muted-foreground">
                Etapa {currentStep} de {steps.length}
              </p>
            </div>
          </div>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Tablet and Desktop: Full stepper with icons and labels */}
      <div className="hidden md:block">
        <div className="flex items-start justify-between relative">
          {/* Background line */}
          <div className="absolute top-5 left-0 right-0 h-[2px] bg-border -z-10" />
          <div
            className="absolute top-5 left-0 h-[2px] bg-primary transition-all duration-500 ease-in-out -z-10"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const isUpcoming = currentStep < step.id;

            return (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col items-center transition-all duration-200",
                  index === 0 ? "items-start" : index === steps.length - 1 ? "items-end" : "items-center"
                )}
                style={{ flex: 1 }}
              >
                {/* Circle with number or check */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200 relative z-10 bg-background",
                    isCompleted && "bg-primary text-primary-foreground shadow-md",
                    isActive && "bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-lg scale-110",
                    isUpcoming && "bg-muted text-muted-foreground border-2 border-border"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" strokeWidth={3} />
                  ) : (
                    step.id
                  )}
                </div>

                {/* Title and description */}
                <div
                  className={cn(
                    "mt-3 text-center max-w-[140px] transition-all duration-200",
                    index === 0 && "text-left",
                    index === steps.length - 1 && "text-right"
                  )}
                >
                  <p
                    className={cn(
                      "text-xs font-semibold transition-colors leading-tight",
                      isActive && "text-foreground",
                      !isActive && "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </p>
                  {isActive && (
                    <p className="text-[10px] text-muted-foreground mt-1 leading-tight animate-in fade-in slide-in-from-top-1 duration-200">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
