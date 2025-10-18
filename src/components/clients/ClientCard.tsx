import { Mail, Phone, MapPin, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ClientCardProps {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  projectCount?: number;
  onEdit: () => void;
  onDelete: () => void;
}

export function ClientCard({
  name,
  email,
  phone,
  city,
  state,
  projectCount = 0,
  onEdit,
  onDelete,
}: ClientCardProps) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{name}</CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{email}</span>
          </div>
        )}

        {phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{phone}</span>
          </div>
        )}

        {(city || state) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{[city, state].filter(Boolean).join(", ")}</span>
          </div>
        )}

        <div className="mt-4 pt-3 border-t">
          <p className="text-sm text-muted-foreground">
            {projectCount} projeto{projectCount !== 1 ? "s" : ""}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
