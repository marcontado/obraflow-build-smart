import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="group flex flex-col items-center text-center p-8 rounded-xl bg-card border border-border/50 shadow-md hover:shadow-elegant hover:border-primary/30 transition-all duration-500 hover:-translate-y-1">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-8 h-8 text-primary group-hover:text-accent transition-colors duration-300" />
      </div>
      <h3 className="text-xl font-heading font-semibold mb-3 text-card-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
