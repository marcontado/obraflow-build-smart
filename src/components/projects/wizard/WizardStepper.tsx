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
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200",
                    isCompleted && "bg-primary text-primary-foreground",
                    isActive && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    !isCompleted && !isActive && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : step.id}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      "text-xs font-medium transition-colors",
                      isActive && "text-foreground",
                      !isActive && "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </p>
                  {isActive && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 max-w-[120px]">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
              
              {!isLast && (
                <div className="flex-1 mx-2 h-[2px] bg-border relative top-[-20px]">
                  <div
                    className={cn(
                      "h-full transition-all duration-300",
                      isCompleted ? "bg-primary" : "bg-transparent"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
