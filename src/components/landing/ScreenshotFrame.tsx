import { cn } from "@/lib/utils";

interface ScreenshotFrameProps {
  image: string;
  alt: string;
  className?: string;
  variant?: "browser" | "app" | "float";
}

export const ScreenshotFrame = ({ image, alt, className, variant = "browser" }: ScreenshotFrameProps) => {
  return (
    <div className={cn(
      "relative w-full rounded-xl overflow-hidden",
      "shadow-2xl shadow-primary/20",
      "transform transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl",
      className
    )}>
      {/* Browser/App Bar */}
      {variant === "browser" && (
        <div className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 px-4 py-3 flex items-center gap-2 border-b border-border/50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 mx-4 h-6 bg-background/50 rounded-md" />
        </div>
      )}
      
      {/* Screenshot */}
      <div className="relative bg-gradient-to-br from-background to-muted">
        <img 
          src={image} 
          alt={alt}
          className="w-full h-auto object-contain"
          loading="lazy"
        />
        
        {/* Floating effect overlay */}
        {variant === "float" && (
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent pointer-events-none" />
        )}
      </div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-border/50 pointer-events-none" />
    </div>
  );
};
