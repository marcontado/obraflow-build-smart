import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({ value, onChange, readonly = false, size = "md" }: StarRatingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const getStarColor = (index: number) => {
    if (value >= index + 1) {
      // Estrela cheia
      return value >= 4 ? "fill-yellow-400 text-yellow-400" : "fill-yellow-300 text-yellow-300";
    } else if (value > index && value < index + 1) {
      // Meia estrela
      return "text-yellow-300";
    }
    return "text-muted-foreground/30";
  };

  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2, 3, 4].map((index) => (
        <button
          key={index}
          type="button"
          onClick={() => handleClick(index + 1)}
          disabled={readonly}
          className={cn(
            "transition-all duration-200",
            !readonly && "hover:scale-110 cursor-pointer",
            readonly && "cursor-default"
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              getStarColor(index),
              "transition-colors duration-200"
            )}
          />
        </button>
      ))}
      <span className="ml-2 text-sm font-medium text-foreground">
        {value.toFixed(1)}
      </span>
    </div>
  );
}
