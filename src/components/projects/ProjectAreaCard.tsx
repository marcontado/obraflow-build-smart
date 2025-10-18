import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, DollarSign } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ProjectArea = Database["public"]["Tables"]["project_areas"]["Row"];

interface ProjectAreaCardProps {
  area: ProjectArea;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProjectAreaCard({ area, onEdit, onDelete }: ProjectAreaCardProps) {
  const budget = area.budget ? Number(area.budget) : 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-lg">{area.name}</CardTitle>
          {area.description && (
            <p className="text-sm text-muted-foreground">{area.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {budget > 0 && (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <Badge variant="secondary">
              Orçamento: R$ {budget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
