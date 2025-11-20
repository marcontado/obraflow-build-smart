import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="group relative flex flex-col items-center text-center p-8 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2">
      {/* Glass morphism background */}
      <div className="absolute inset-0 bg-white/50 dark:bg-card/50 backdrop-blur-sm border border-white/20 dark:border-border/30 rounded-2xl" />
      
      {/* Glow on hover */}
      <div className="absolute -inset-1 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-glass">
          <Icon className="w-10 h-10 text-primary group-hover:text-accent transition-colors duration-300" />
        </div>
        <h3 className="text-xl font-heading font-semibold mb-3 text-card-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        
        {/* Architectural accent line */}
        <div className="mt-4 h-1 w-12 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </div>
  );
}
