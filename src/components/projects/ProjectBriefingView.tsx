import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BriefingData } from "@/types/project.types";

interface ProjectBriefingViewProps {
  briefing: BriefingData;
  projectStatus?: string;
}

const statusColors = {
  planning: "bg-blue-500/10 text-blue-600 border-blue-200",
  in_progress: "bg-green-500/10 text-green-600 border-green-200",
  review: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  completed: "bg-purple-500/10 text-purple-600 border-purple-200",
  on_hold: "bg-gray-500/10 text-gray-600 border-gray-200",
};

const statusLabels = {
  planning: "Planejamento",
  in_progress: "Em Andamento",
  review: "Em Revisão",
  completed: "Concluído",
  on_hold: "Em Espera",
};

export function ProjectBriefingView({ briefing, projectStatus }: ProjectBriefingViewProps) {
  const isEmpty = !briefing || Object.values(briefing).every(v => !v || (Array.isArray(v) && v.length === 0));
  
  if (isEmpty) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Briefing do Projeto</CardTitle>
          {projectStatus && (
            <Badge
              variant="outline"
              className={cn("border", statusColors[projectStatus as keyof typeof statusColors])}
            >
              {statusLabels[projectStatus as keyof typeof statusLabels]}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {briefing.goal && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Objetivo Principal</h4>
            <p className="text-sm text-muted-foreground">{briefing.goal}</p>
          </div>
        )}
        {briefing.styles && briefing.styles.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Estilos Desejados</h4>
            <p className="text-sm text-muted-foreground">{briefing.styles.join(", ")}</p>
          </div>
        )}
        {briefing.client_profile && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Perfil do Cliente</h4>
            <p className="text-sm text-muted-foreground">{briefing.client_profile}</p>
          </div>
        )}
        {briefing.client_desires && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Desejos do Cliente</h4>
            <p className="text-sm text-muted-foreground">{briefing.client_desires}</p>
          </div>
        )}
        {briefing.client_pains && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Dores e Problemas</h4>
            <p className="text-sm text-muted-foreground">{briefing.client_pains}</p>
          </div>
        )}
        {briefing.client_essence && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Essência / Identidade</h4>
            <p className="text-sm text-muted-foreground">{briefing.client_essence}</p>
          </div>
        )}
        {briefing.client_objectives && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Objetivos e Prioridades</h4>
            <p className="text-sm text-muted-foreground">{briefing.client_objectives}</p>
          </div>
        )}
        {briefing.audience && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Público-Alvo</h4>
            <p className="text-sm text-muted-foreground">{briefing.audience}</p>
          </div>
        )}
        {briefing.needs && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Necessidades Específicas</h4>
            <p className="text-sm text-muted-foreground">{briefing.needs}</p>
          </div>
        )}
        {briefing.restrictions && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Restrições e Limitações</h4>
            <p className="text-sm text-muted-foreground">{briefing.restrictions}</p>
          </div>
        )}
        {briefing.preferred_materials && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Materiais Preferidos</h4>
            <p className="text-sm text-muted-foreground">{briefing.preferred_materials}</p>
          </div>
        )}
        {briefing.field_research && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Pesquisa de Campo</h4>
            <p className="text-sm text-muted-foreground">{briefing.field_research}</p>
          </div>
        )}
        {briefing.references_links && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Links de Referência</h4>
            <p className="text-sm text-muted-foreground break-all">{briefing.references_links}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
