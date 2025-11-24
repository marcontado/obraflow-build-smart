import { useState } from "react";
import { Upload, X, Image as ImageIcon, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { moodboardCategories, type MoodboardItem } from "@/types/project.types";

interface MoodboardUploadProps {
  projectId: string;
  items: MoodboardItem[];
  onItemsChange: (items: MoodboardItem[]) => void;
}

export function MoodboardUpload({ projectId, items, onItemsChange }: MoodboardUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string>('reference');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    const newItems: MoodboardItem[] = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${projectId}/${currentCategory}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('project-moodboards')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('project-moodboards')
          .getPublicUrl(fileName);

        newItems.push({
          url: publicUrl,
          file_name: file.name,
          category: currentCategory,
        });
      }

      onItemsChange([...items, ...newItems]);
      toast.success(`${newItems.length} imagem(ns) adicionada(s)`);
    } catch (error: any) {
      toast.error("Erro ao fazer upload das imagens");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveItem = async (index: number) => {
    const item = items[index];
    const urlParts = item.url.split('/');
    const filePath = urlParts.slice(-3).join('/');

    try {
      await supabase.storage
        .from('project-moodboards')
        .remove([filePath]);

      const newItems = items.filter((_, i) => i !== index);
      onItemsChange(newItems);
      toast.success("Imagem removida");
    } catch (error) {
      toast.error("Erro ao remover imagem");
      console.error(error);
    }
  };

  // Agrupar por categoria
  const groupedItems = items.reduce((acc, item, index) => {
    const category = item.category || 'reference';
    if (!acc[category]) acc[category] = [];
    acc[category].push({ item, index });
    return acc;
  }, {} as Record<string, Array<{ item: MoodboardItem; index: number }>>);

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <Label>Categoria da Imagem</Label>
        <Select value={currentCategory} onValueChange={setCurrentCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {moodboardCategories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/20">
        <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <Label htmlFor="moodboard-upload" className="cursor-pointer">
          <div className="space-y-2">
            <p className="text-sm font-medium">Arraste imagens ou clique para fazer upload</p>
            <p className="text-xs text-muted-foreground">PNG, JPG, WEBP até 10MB cada</p>
          </div>
        </Label>
        <Input
          id="moodboard-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => document.getElementById('moodboard-upload')?.click()}
          disabled={uploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Enviando..." : "Selecionar Imagens"}
        </Button>
      </div>

      {items.length > 0 && (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-semibold text-sm">
                  {moodboardCategories.find(c => c.value === category)?.label || category}
                </h4>
                <Badge variant="secondary" className="text-xs">
                  {categoryItems.length}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categoryItems.map(({ item, index }) => (
                  <Card key={index} className="relative group overflow-hidden">
                    <img
                      src={item.url}
                      alt={item.description || `Imagem ${index + 1}`}
                      className="w-full h-40 object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    {item.description && (
                      <div className="p-2 text-xs text-muted-foreground">{item.description}</div>
                    )}
                    {item.tags && item.tags.length > 0 && (
                      <div className="p-2 flex flex-wrap gap-1">
                        {item.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
