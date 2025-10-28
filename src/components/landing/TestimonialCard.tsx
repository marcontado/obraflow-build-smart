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
    <div className="flex flex-col p-8 rounded-xl bg-card border border-border/50 shadow-md hover:shadow-elegant transition-all duration-500 hover:-translate-y-1">
      <div className="flex gap-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-accent text-accent" />
        ))}
      </div>
      <p className="text-base text-card-foreground mb-6 leading-relaxed italic">"{testimonial}"</p>
      <div className="flex items-center gap-4 mt-auto pt-4 border-t border-border/30">
        <Avatar className="w-12 h-12">
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-heading font-semibold text-sm text-card-foreground">{name}</div>
          <div className="text-xs text-muted-foreground">
            {role}, {company}
          </div>
        </div>
      </div>
    </div>
  );
}
