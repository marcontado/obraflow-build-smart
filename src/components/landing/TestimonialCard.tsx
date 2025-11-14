import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TestimonialCardProps {
  name: string;
  role: string;
  company: string;
  testimonial: string;
  initials: string;
}

export function TestimonialCard({ name, role, company, testimonial, initials }: TestimonialCardProps) {
  return (
    <div className="group relative flex flex-col p-8 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2">
      {/* Glass morphism background */}
      <div className="absolute inset-0 bg-white/60 dark:bg-card/60 backdrop-blur-glass border border-white/20 dark:border-border/30 rounded-2xl shadow-glass" />
      
      {/* Subtle glow on hover */}
      <div className="absolute -inset-1 bg-gradient-to-br from-arch-gold/20 to-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex gap-1 mb-6">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-arch-gold text-arch-gold" />
          ))}
        </div>
        <p className="text-base text-card-foreground mb-6 leading-relaxed italic font-medium">
          "{testimonial}"
        </p>
        <div className="flex items-center gap-4 mt-auto pt-6 border-t border-border/20">
          <Avatar className="w-14 h-14 border-2 border-primary/20">
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-heading font-semibold text-base text-card-foreground">{name}</div>
            <div className="text-sm text-muted-foreground">
              {role}, {company}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
