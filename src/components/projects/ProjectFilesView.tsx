import { useState } from "react";
import { FileText, Download, Image as ImageIcon, FileCode, FileSpreadsheet, File, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { technicalFileCategories, type TechnicalFile } from "@/types/project.types";

interface ProjectFilesViewProps {
  files: TechnicalFile[];
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(2)} MB`;
};

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
    return ImageIcon;
  } else if (['pdf'].includes(ext || '')) {
    return FileText;
  } else if (['dwg', 'dxf', 'skp', 'rvt'].includes(ext || '')) {
    return FileCode;
  } else if (['xls', 'xlsx', 'csv'].includes(ext || '')) {
    return FileSpreadsheet;
  }
  return File;
};

const isImageFile = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '');
};

export function ProjectFilesView({ files }: ProjectFilesViewProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  if (!files || files.length === 0) return null;

  const imageFiles = files.filter(f => isImageFile(f.file_name));
  const otherFiles = files.filter(f => !isImageFile(f.file_name));

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Arquivos Técnicos ({files.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {imageFiles.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Imagens e Plantas</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {imageFiles.map((file, index) => {
                  const hasError = imageErrors.has(index);
                  return (
                    <div
                      key={index}
                      className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      onClick={() => !hasError && setSelectedImage(file.file_url)}
                    >
                      {hasError ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-muted-foreground">
                          <AlertCircle className="h-8 w-8" />
                          <p className="text-xs text-center">Erro ao carregar imagem</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            asChild
                            className="mt-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <a href={file.file_url} target="_blank" rel="noopener noreferrer" download>
                              <Download className="h-3 w-3 mr-1" />
                              Baixar
                            </a>
                          </Button>
                        </div>
                      ) : (
                        <>
                          <img
                            src={file.file_url}
                            alt={file.file_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            onError={() => handleImageError(index)}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-0 left-0 right-0 p-2">
                              <p className="text-white text-xs font-medium truncate">{file.file_name}</p>
                              {file.file_size && (
                                <p className="text-white/70 text-[10px]">{formatFileSize(file.file_size)}</p>
                              )}
                            </div>
                          </div>
                          <Badge variant="secondary" className="absolute top-2 right-2 text-[10px] h-5 px-1.5">
                            {technicalFileCategories.find(c => c.value === file.category)?.label || file.category}
                          </Badge>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {otherFiles.length > 0 && (
            <div>
              {imageFiles.length > 0 && (
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Outros Arquivos</h4>
              )}
              <div className="space-y-2">
                {otherFiles.map((file, index) => {
                  const Icon = getFileIcon(file.file_name);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{file.file_name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {technicalFileCategories.find(c => c.value === file.category)?.label || file.category}
                            </Badge>
                            {file.file_size && <span>{formatFileSize(file.file_size)}</span>}
                          </div>
                          {file.notes && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{file.notes}</p>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" asChild className="flex-shrink-0">
                        <a href={file.file_url} target="_blank" rel="noopener noreferrer" download>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-5xl p-2">
          {selectedImage && (
            <div className="relative w-full">
              <img
                src={selectedImage}
                alt="Preview"
                className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
