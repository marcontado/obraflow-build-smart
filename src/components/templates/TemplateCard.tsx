import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, MoreVertical, Edit, FileCheck, Copy, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DocumentTemplate } from "@/types/template.types";
import { TEMPLATE_CATEGORIES } from "@/types/template.types";
import { Badge } from "@/components/ui/badge";

interface TemplateCardProps {
  template: DocumentTemplate;
  onEdit: () => void;
  onGenerate: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function TemplateCard({
  template,
  onEdit,
  onGenerate,
  onDuplicate,
  onDelete,
}: TemplateCardProps) {
  const category = TEMPLATE_CATEGORIES.find((c) => c.value === template.category);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{template.name}</h3>
              <Badge variant="secondary" className="mt-1">
                {category?.label}
              </Badge>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground">
          Última atualização:{" "}
          {format(new Date(template.updated_at), "dd/MM/yyyy 'às' HH:mm", {
            locale: ptBR,
          })}
        </p>
      </CardContent>

      <CardFooter>
        <Button onClick={onGenerate} className="w-full">
          <FileCheck className="h-4 w-4 mr-2" />
          Gerar Documento
        </Button>
      </CardFooter>
    </Card>
  );
}
