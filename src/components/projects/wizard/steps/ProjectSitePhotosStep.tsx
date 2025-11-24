import { SitePhotosUpload } from "../SitePhotosUpload";
import type { SitePhoto } from "@/types/project.types";

interface ProjectSitePhotosStepProps {
  projectId: string;
  photos: SitePhoto[];
  onPhotosChange: (photos: SitePhoto[]) => void;
}

export function ProjectSitePhotosStep({ projectId, photos, onPhotosChange }: ProjectSitePhotosStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Registro Fotográfico do Local</h3>
        <p className="text-sm text-muted-foreground">
          Adicione fotos do local antes da reforma para documentar o estado inicial do projeto.
          Organize por data, área e adicione etiquetas para facilitar a identificação.
        </p>
      </div>

      <SitePhotosUpload
        projectId={projectId}
        photos={photos}
        onPhotosChange={onPhotosChange}
      />

      {photos.length === 0 && (
        <div className="text-center p-8 border border-dashed border-border rounded-lg bg-muted/10">
          <p className="text-sm text-muted-foreground">
            Nenhuma foto adicionada ainda. O registro fotográfico é importante para documentar o estado inicial do projeto.
          </p>
        </div>
      )}
    </div>
  );
}
