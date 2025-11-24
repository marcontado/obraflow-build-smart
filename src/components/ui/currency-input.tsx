import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: string | number;
  onValueChange?: (value: string) => void;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onValueChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("");

    React.useEffect(() => {
      if (value !== undefined && value !== "") {
        const numValue = typeof value === "string" ? parseFloat(value) : value;
        if (!isNaN(numValue)) {
          setDisplayValue(formatCurrency(numValue));
        }
      } else {
        setDisplayValue("");
      }
    }, [value]);

    const formatCurrency = (value: number): string => {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    };

    const parseCurrency = (value: string): string => {
      const numbers = value.replace(/\D/g, "");
      if (!numbers) return "";
      const numberValue = parseInt(numbers) / 100;
      return numberValue.toString();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const rawValue = parseCurrency(inputValue);
      
      if (onValueChange) {
        onValueChange(rawValue);
      }

      if (rawValue) {
        setDisplayValue(formatCurrency(parseFloat(rawValue)));
      } else {
        setDisplayValue("");
      }
    };

    return (
      <Input
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleChange}
        className={cn(className)}
        placeholder="R$ 0,00"
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
