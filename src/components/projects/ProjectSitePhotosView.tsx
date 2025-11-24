import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Calendar, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import type { SitePhoto } from "@/types/project.types";

interface ProjectSitePhotosViewProps {
  photos: SitePhoto[];
}

export function ProjectSitePhotosView({ photos }: ProjectSitePhotosViewProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!photos || photos.length === 0) return null;

  const handlePrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "Escape") setSelectedIndex(null);
  };

  const selectedPhoto = selectedIndex !== null ? photos[selectedIndex] : null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Registro Fotográfico do Local</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="relative group cursor-pointer overflow-hidden rounded-lg border border-border hover:border-primary transition-colors"
                onClick={() => setSelectedIndex(index)}
              >
                <img
                  src={photo.url}
                  alt={photo.description || `Foto ${index + 1}`}
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  {photo.date && (
                    <div className="flex items-center gap-1 text-white text-xs mb-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(photo.date).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                  {photo.area && (
                    <div className="flex items-center gap-1 text-white text-xs">
                      <MapPin className="h-3 w-3" />
                      {photo.area}
                    </div>
                  )}
                </div>
                {photo.labels && photo.labels.length > 0 && (
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    {photo.labels.slice(0, 2).map((label, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] h-4">
                        {label}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedPhoto && (
        <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
          <DialogContent 
            className="max-w-6xl max-h-[90vh] p-0 overflow-hidden"
            onKeyDown={handleKeyDown}
          >
            <div className="relative flex items-center justify-center bg-black/95 min-h-[60vh]">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-white hover:bg-white/20 z-50"
                onClick={() => setSelectedIndex(null)}
              >
                <X className="h-4 w-4" />
              </Button>

              {selectedIndex !== null && selectedIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-50"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              )}

              {selectedIndex !== null && selectedIndex < photos.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-50"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              )}

              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.description || "Foto"}
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>

            <div className="p-6 bg-background">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">
                  Foto {(selectedIndex || 0) + 1} de {photos.length}
                </p>
              </div>

              {(selectedPhoto.date || selectedPhoto.area) && (
                <div className="flex flex-wrap gap-3 mb-3">
                  {selectedPhoto.date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(selectedPhoto.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                  {selectedPhoto.area && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedPhoto.area}</span>
                    </div>
                  )}
                </div>
              )}

              {selectedPhoto.labels && selectedPhoto.labels.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedPhoto.labels.map((label, i) => (
                    <Badge key={i} variant="secondary">
                      {label}
                    </Badge>
                  ))}
                </div>
              )}

              {selectedPhoto.description && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">{selectedPhoto.description}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
