import { TechnicalFilesUpload } from "../TechnicalFilesUpload";
import type { TechnicalFile } from "@/types/project.types";

interface ProjectTechnicalFilesStepProps {
  projectId: string;
  files: TechnicalFile[];
  onFilesChange: (files: TechnicalFile[]) => void;
}

export function ProjectTechnicalFilesStep({ projectId, files, onFilesChange }: ProjectTechnicalFilesStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Materiais Técnicos</h3>
        <p className="text-sm text-muted-foreground">
          Adicione plantas baixas, renders, perspectivas, layouts e outros documentos técnicos do projeto.
        </p>
      </div>

      <TechnicalFilesUpload
        projectId={projectId}
        files={files}
        onFilesChange={onFilesChange}
      />

      {files.length === 0 && (
        <div className="text-center p-8 border border-dashed border-border rounded-lg bg-muted/10">
          <p className="text-sm text-muted-foreground">
            Nenhum arquivo técnico adicionado ainda. Você pode adicionar documentos posteriormente.
          </p>
        </div>
      )}
    </div>
  );
}
