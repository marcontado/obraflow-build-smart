import { MoodboardUpload } from "../MoodboardUpload";
import type { MoodboardItem } from "@/types/project.types";

interface ProjectMoodboardStepProps {
  projectId: string;
  items: MoodboardItem[];
  onItemsChange: (items: MoodboardItem[]) => void;
}

export function ProjectMoodboardStep({ projectId, items, onItemsChange }: ProjectMoodboardStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Referências Visuais</h3>
        <p className="text-sm text-muted-foreground">
          Adicione imagens de inspiração, moodboards e referências visuais que ajudem a comunicar a visão do projeto.
        </p>
      </div>

      <MoodboardUpload
        projectId={projectId}
        items={items}
        onItemsChange={onItemsChange}
      />

      {items.length === 0 && (
        <div className="text-center p-8 border border-dashed border-border rounded-lg bg-muted/10">
          <p className="text-sm text-muted-foreground">
            Nenhuma imagem adicionada ainda. As referências visuais ajudam a alinhar expectativas e inspirar o projeto.
          </p>
        </div>
      )}
    </div>
  );
}
