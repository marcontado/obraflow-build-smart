import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MoodboardItem } from "@/types/project.types";

interface ProjectMoodboardViewProps {
  items: MoodboardItem[];
}

export function ProjectMoodboardView({ items }: ProjectMoodboardViewProps) {
  if (!items || items.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Referências Visuais ({items.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item, index) => (
            <div key={index} className="group relative aspect-square rounded-lg overflow-hidden border border-border">
              <img 
                src={item.url} 
                alt={item.description || `Referência ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
              />
              {(item.description || item.tags) && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-xs text-white space-y-1">
                  {item.description && (
                    <p className="line-clamp-2">{item.description}</p>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px] h-4 px-1">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
