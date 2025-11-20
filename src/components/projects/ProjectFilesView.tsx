import { FileText, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { technicalFileCategories, type TechnicalFile } from "@/types/project.types";

interface ProjectFilesViewProps {
  files: TechnicalFile[];
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(2)} MB`;
};

export function ProjectFilesView({ files }: ProjectFilesViewProps) {
  if (!files || files.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Arquivos Técnicos ({files.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {files.map((file, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
