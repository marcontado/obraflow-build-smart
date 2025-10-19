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
    <div className="flex flex-col p-6 rounded-lg bg-card border border-border">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-accent text-accent" />
        ))}
      </div>
      <p className="text-sm text-card-foreground mb-4 italic">"{testimonial}"</p>
      <div className="flex items-center gap-3 mt-auto">
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold text-sm text-card-foreground">{name}</div>
          <div className="text-xs text-muted-foreground">
            {role}, {company}
          </div>
        </div>
      </div>
    </div>
  );
}
