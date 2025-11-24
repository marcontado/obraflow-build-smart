import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, MapPin, Users, Image as ImageIcon, File, Target, Camera } from "lucide-react";
import { projectTypes } from "@/types/project.types";
import type { ProjectWizardData } from "@/schemas/project.schema";
import type { MoodboardItem, TechnicalFile, SitePhoto } from "@/types/project.types";

interface ProjectSummaryStepProps {
  formData: ProjectWizardData;
  sitePhotos: SitePhoto[];
  moodboardItems: MoodboardItem[];
  technicalFiles: TechnicalFile[];
}

export function ProjectSummaryStep({ formData, sitePhotos, moodboardItems, technicalFiles }: ProjectSummaryStepProps) {
  const projectType = projectTypes.find(t => t.value === formData.type);
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Resumo do Projeto</h3>
        <p className="text-sm text-muted-foreground">
          Revise todas as informações antes de criar o projeto.
        </p>
      </div>

      {/* Informações Básicas */}
      <Card className="p-6 space-y-4">
        <div>
          <h4 className="font-semibold text-lg mb-4">Informações Básicas</h4>
          <div className="space-y-3">
            <div>
              <p className="text-2xl font-bold text-foreground">{formData.name}</p>
              <div className="flex items-center gap-2 mt-2">
                {formData.type && (
                  <Badge variant="secondary">{projectType?.label}</Badge>
                )}
                <Badge>{
                  formData.status === 'planning' ? 'Planejamento' :
                  formData.status === 'in_progress' ? 'Em Andamento' :
                  formData.status === 'completed' ? 'Concluído' : 'Pausado'
                }</Badge>
              </div>
            </div>

            {formData.description && (
              <p className="text-sm text-muted-foreground">{formData.description}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {formData.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{formData.location}</span>
                </div>
              )}

              {formData.budget && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>R$ {parseFloat(formData.budget).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              {(formData.start_date || formData.end_date) && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {formData.start_date && new Date(formData.start_date).toLocaleDateString('pt-BR')}
                    {formData.start_date && formData.end_date && ' - '}
                    {formData.end_date && new Date(formData.end_date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Briefing */}
      {formData.briefing && (formData.briefing.goal || (formData.briefing.styles && formData.briefing.styles.length > 0) || formData.briefing.needs) && (
        <Card className="p-6">
          <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Briefing
          </h4>
          <div className="space-y-3 text-sm">
            {formData.briefing.goal && (
              <div>
                <p className="font-medium text-muted-foreground">Objetivo:</p>
                <p>{formData.briefing.goal}</p>
              </div>
            )}
            {formData.briefing.styles && formData.briefing.styles.length > 0 && (
              <div>
                <p className="font-medium text-muted-foreground">Estilos:</p>
                <p>{formData.briefing.styles.join(", ")}</p>
              </div>
            )}
            {formData.briefing.audience && (
              <div>
                <p className="font-medium text-muted-foreground">Público-alvo:</p>
                <p>{formData.briefing.audience}</p>
              </div>
            )}
            {formData.briefing.needs && (
              <div>
                <p className="font-medium text-muted-foreground">Necessidades:</p>
                <p>{formData.briefing.needs}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Registro Fotográfico */}
      <Card className="p-6">
        <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Registro Fotográfico
        </h4>
        {sitePhotos.length > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {sitePhotos.slice(0, 8).map((photo, index) => (
              <img
                key={index}
                src={photo.url}
                alt={`Foto do local ${index + 1}`}
                className="w-full h-20 object-cover rounded"
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma foto adicionada</p>
        )}
        {sitePhotos.length > 8 && (
          <p className="text-xs text-muted-foreground mt-2">
            +{sitePhotos.length - 8} fotos adicionais
          </p>
        )}
      </Card>

      {/* Referências Visuais */}
      <Card className="p-6">
        <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Referências Visuais
        </h4>
        {moodboardItems.length > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {moodboardItems.slice(0, 8).map((item, index) => (
              <img
                key={index}
                src={item.url}
                alt={`Referência ${index + 1}`}
                className="w-full h-20 object-cover rounded"
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma imagem adicionada</p>
        )}
        {moodboardItems.length > 8 && (
          <p className="text-xs text-muted-foreground mt-2">
            +{moodboardItems.length - 8} imagens adicionais
          </p>
        )}
      </Card>

      {/* Arquivos Técnicos */}
      <Card className="p-6">
        <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <File className="h-5 w-5" />
          Arquivos Técnicos
        </h4>
        {technicalFiles.length > 0 ? (
          <div className="space-y-2">
            {technicalFiles.slice(0, 5).map((file, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <File className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 truncate">{file.file_name}</span>
                <Badge variant="outline" className="text-xs">{file.category}</Badge>
              </div>
            ))}
            {technicalFiles.length > 5 && (
              <p className="text-xs text-muted-foreground mt-2">
                +{technicalFiles.length - 5} arquivos adicionais
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum arquivo técnico adicionado</p>
        )}
      </Card>
    </div>
  );
}
