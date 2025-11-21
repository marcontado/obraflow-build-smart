import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
}

interface Requirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: Requirement[] = [
  {
    label: "Mínimo 8 caracteres",
    test: (pwd) => pwd.length >= 8,
  },
  {
    label: "Letra maiúscula (A-Z)",
    test: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    label: "Letra minúscula (a-z)",
    test: (pwd) => /[a-z]/.test(pwd),
  },
  {
    label: "Número (0-9)",
    test: (pwd) => /[0-9]/.test(pwd),
  },
  {
    label: "Caractere especial (!@#$...)",
    test: (pwd) => /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pwd),
  },
];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  return (
    <div className="mt-3 space-y-2 rounded-md border border-border bg-muted/30 p-3">
      <p className="text-xs font-medium text-muted-foreground">
        Requisitos da senha:
      </p>
      <ul className="space-y-1.5">
        {requirements.map((requirement, index) => {
          const isValid = requirement.test(password);
          return (
            <li
              key={index}
              className={cn(
                "flex items-center gap-2 text-xs transition-colors",
                isValid ? "text-green-600" : "text-muted-foreground"
              )}
            >
              {isValid ? (
                <Check className="h-3.5 w-3.5 flex-shrink-0" />
              ) : (
                <X className="h-3.5 w-3.5 flex-shrink-0" />
              )}
              <span>{requirement.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
