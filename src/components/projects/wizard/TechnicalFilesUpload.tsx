import { useState } from "react";
import { Upload, X, FileText, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { technicalFileCategories, type TechnicalFile } from "@/types/project.types";

interface TechnicalFilesUploadProps {
  projectId: string;
  files: TechnicalFile[];
  onFilesChange: (files: TechnicalFile[]) => void;
}

export function TechnicalFilesUpload({ projectId, files, onFilesChange }: TechnicalFilesUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string>('other');
  const [currentNotes, setCurrentNotes] = useState("");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    if (uploadedFiles.length === 0) return;

    setUploading(true);
    const newFiles: TechnicalFile[] = [];

    try {
      for (const file of uploadedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${projectId}/${currentCategory}/${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from('project-technical-files')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('project-technical-files')
          .getPublicUrl(fileName);

        newFiles.push({
          file_url: publicUrl,
          category: currentCategory,
          file_name: file.name,
          file_size: file.size,
          notes: currentNotes || undefined,
        });
      }

      onFilesChange([...files, ...newFiles]);
      toast.success(`${newFiles.length} arquivo(s) adicionado(s)`);
      setCurrentNotes("");
    } catch (error: any) {
      toast.error("Erro ao fazer upload dos arquivos");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = async (index: number) => {
    const file = files[index];
    const urlParts = file.file_url.split('/');
    const filePath = urlParts.slice(-3).join('/');

    try {
      await supabase.storage
        .from('project-technical-files')
        .remove([filePath]);

      const newFiles = files.filter((_, i) => i !== index);
      onFilesChange(newFiles);
      toast.success("Arquivo removido");
    } catch (error) {
      toast.error("Erro ao remover arquivo");
      console.error(error);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Categoria do arquivo</Label>
          <Select value={currentCategory} onValueChange={setCurrentCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {technicalFileCategories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Notas técnicas (opcional)</Label>
          <Input
            value={currentNotes}
            onChange={(e) => setCurrentNotes(e.target.value)}
            placeholder="Ex: Versão revisada, corrigido medidas..."
          />
        </div>
      </div>

      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/20">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <Label htmlFor="technical-upload" className="cursor-pointer">
          <div className="space-y-2">
            <p className="text-sm font-medium">Upload de arquivos técnicos</p>
            <p className="text-xs text-muted-foreground">PDF, DWG, JPG, PNG, ZIP até 50MB cada</p>
          </div>
        </Label>
        <Input
          id="technical-upload"
          type="file"
          accept=".pdf,.dwg,.jpg,.jpeg,.png,.zip"
          multiple
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => document.getElementById('technical-upload')?.click()}
          disabled={uploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Enviando..." : "Selecionar Arquivos"}
        </Button>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <Card key={index} className="p-4 flex items-center justify-between group">
              <div className="flex items-center gap-3 flex-1">
                <File className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{file.file_name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Badge variant="outline" className="text-xs">
                      {technicalFileCategories.find(c => c.value === file.category)?.label}
                    </Badge>
                    {file.file_size && <span>{formatFileSize(file.file_size)}</span>}
                  </div>
                  {file.notes && <p className="text-xs text-muted-foreground mt-1">{file.notes}</p>}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
