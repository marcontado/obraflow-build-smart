import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, Mail } from "lucide-react";
import { StarRating } from "./StarRating";
import type { Database } from "@/integrations/supabase/types";

type Partner = Database["public"]["Tables"]["partners"]["Row"];

interface PartnerCardProps {
  partner: Partner;
  onViewDetails: (partner: Partner) => void;
}

const TAG_COLORS = [
  "bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] border-[hsl(var(--accent))]/20",
  "bg-[hsl(var(--chart-2))]/10 text-[hsl(var(--chart-2))] border-[hsl(var(--chart-2))]/20",
  "bg-[hsl(var(--chart-3))]/10 text-[hsl(var(--chart-3))] border-[hsl(var(--chart-3))]/20",
];

export function PartnerCard({ partner, onViewDetails }: PartnerCardProps) {
  const displayTags = partner.tags?.slice(0, 3) || [];
  const remainingTags = (partner.tags?.length || 0) - 3;

  return (
    <div className="group flex gap-4 items-start p-5 bg-card rounded-xl shadow-sm border border-border hover:shadow-elegant hover:-translate-y-1 transition-all duration-300">
      <div className="flex-shrink-0">
        {partner.logo_url ? (
          <img
            src={partner.logo_url}
            alt={partner.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-accent/20"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-accent/10 border-2 border-accent/20 flex items-center justify-center text-accent font-heading font-bold text-xl">
            {partner.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="font-heading font-bold text-lg text-foreground truncate">
            {partner.name}
          </h3>
          <Badge
            variant={partner.status === "ativo" ? "default" : "secondary"}
            className={
              partner.status === "ativo"
                ? "bg-green-100 text-green-700 hover:bg-green-100"
                : "bg-muted text-muted-foreground"
            }
          >
            {partner.status}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <span>{partner.category}</span>
          {partner.city && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {partner.city}
                {partner.state && `, ${partner.state}`}
              </span>
            </>
          )}
        </div>

        {displayTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {displayTags.map((tag, i) => (
              <Badge
                key={i}
                variant="outline"
                className={cn("text-xs font-medium", TAG_COLORS[i % TAG_COLORS.length])}
              >
                {tag}
              </Badge>
            ))}
            {remainingTags > 0 && (
              <Badge variant="outline" className="text-xs font-medium">
                +{remainingTags}
              </Badge>
            )}
          </div>
        )}

        <div className="space-y-1 mb-3">
          {partner.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-primary">{partner.phone}</span>
            </div>
          )}
          {partner.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{partner.email}</span>
            </div>
          )}
        </div>

        <div className="mb-3">
          <StarRating value={partner.rating || 0} readonly size="sm" />
        </div>

        {partner.diferencial && (
          <p className="text-sm text-muted-foreground italic line-clamp-2 mb-3">
            {partner.diferencial}
          </p>
        )}
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={() => onViewDetails(partner)}
        className="flex-shrink-0 font-semibold"
      >
        Ver detalhes
      </Button>
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
