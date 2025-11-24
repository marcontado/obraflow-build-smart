import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { MoodboardItem } from "@/types/project.types";

interface ProjectMoodboardViewProps {
  items: MoodboardItem[];
}

export function ProjectMoodboardView({ items }: ProjectMoodboardViewProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!items || items.length === 0) return null;

  const handlePrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < items.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (selectedIndex === null) return;
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "Escape") setSelectedIndex(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Referências Visuais ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                onClick={() => setSelectedIndex(index)}
              >
                <img
                  src={item.url}
                  alt={item.description || `Referência ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    {item.description && (
                      <p className="text-white text-xs font-medium line-clamp-2 mb-1">
                        {item.description}
                      </p>
                    )}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] h-4 px-1.5">
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 3 && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                            +{item.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog 
        open={selectedIndex !== null} 
        onOpenChange={() => setSelectedIndex(null)}
      >
        <DialogContent 
          className="max-w-7xl h-[90vh] p-0 bg-black/95 border-none"
          onKeyDown={(e: any) => handleKeyDown(e)}
        >
          {selectedIndex !== null && (
            <div className="relative w-full h-full flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 text-white hover:bg-white/10"
                onClick={() => setSelectedIndex(null)}
              >
                <X className="h-6 w-6" />
              </Button>

              {selectedIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/10 h-12 w-12"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
              )}

              {selectedIndex < items.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/10 h-12 w-12"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              )}

              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                <img
                  src={items[selectedIndex].url}
                  alt={items[selectedIndex].description || `Referência ${selectedIndex + 1}`}
                  className="max-w-full max-h-[calc(90vh-120px)] object-contain"
                />
                
                {(items[selectedIndex].description || items[selectedIndex].tags) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-6">
                    <div className="max-w-4xl mx-auto">
                      {items[selectedIndex].description && (
                        <p className="text-white text-sm mb-2">
                          {items[selectedIndex].description}
                        </p>
                      )}
                      {items[selectedIndex].tags && items[selectedIndex].tags!.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {items[selectedIndex].tags!.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-white/50 text-xs mt-2">
                        {selectedIndex + 1} de {items.length}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
