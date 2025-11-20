import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BriefingData } from "@/types/project.types";

interface ProjectBriefingViewProps {
  briefing: BriefingData;
}

export function ProjectBriefingView({ briefing }: ProjectBriefingViewProps) {
  const isEmpty = !briefing || Object.values(briefing).every(v => !v);
  
  if (isEmpty) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Briefing do Projeto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {briefing.goal && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Objetivo Principal</h4>
            <p className="text-sm text-muted-foreground">{briefing.goal}</p>
          </div>
        )}
        {briefing.style && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Estilo Desejado</h4>
            <p className="text-sm text-muted-foreground">{briefing.style}</p>
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
