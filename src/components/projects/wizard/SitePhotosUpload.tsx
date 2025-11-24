import { useState } from "react";
import { Upload, X, Camera, Calendar, MapPin, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { SitePhoto } from "@/types/project.types";

interface SitePhotosUploadProps {
  projectId: string;
  photos: SitePhoto[];
  onPhotosChange: (photos: SitePhoto[]) => void;
}

export function SitePhotosUpload({ projectId, photos, onPhotosChange }: SitePhotosUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<{ index: number; photo: SitePhoto } | null>(null);
  const [tempDescription, setTempDescription] = useState("");
  const [tempArea, setTempArea] = useState("");
  const [tempDate, setTempDate] = useState("");
  const [tempLabels, setTempLabels] = useState("");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    const newPhotos: SitePhoto[] = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${projectId}/site-photos/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('project-moodboards')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('project-moodboards')
          .getPublicUrl(fileName);

        newPhotos.push({
          url: publicUrl,
          file_name: file.name,
          date: new Date().toISOString().split('T')[0],
        });
      }

      onPhotosChange([...photos, ...newPhotos]);
      toast.success(`${newPhotos.length} foto(s) adicionada(s)`);
    } catch (error: any) {
      toast.error("Erro ao fazer upload das fotos");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async (index: number) => {
    const photo = photos[index];
    const urlParts = photo.url.split('/');
    const filePath = urlParts.slice(-3).join('/');

    try {
      await supabase.storage
        .from('project-moodboards')
        .remove([filePath]);

      const newPhotos = photos.filter((_, i) => i !== index);
      onPhotosChange(newPhotos);
      toast.success("Foto removida");
    } catch (error) {
      toast.error("Erro ao remover foto");
      console.error(error);
    }
  };

  const handleEditPhoto = (index: number) => {
    const photo = photos[index];
    setEditingPhoto({ index, photo });
    setTempDescription(photo.description || "");
    setTempArea(photo.area || "");
    setTempDate(photo.date || "");
    setTempLabels(photo.labels?.join(", ") || "");
  };

  const handleSaveEdit = () => {
    if (!editingPhoto) return;

    const updatedPhotos = [...photos];
    updatedPhotos[editingPhoto.index] = {
      ...editingPhoto.photo,
      description: tempDescription,
      area: tempArea,
      date: tempDate,
      labels: tempLabels.split(',').map(l => l.trim()).filter(Boolean),
    };

    onPhotosChange(updatedPhotos);
    setEditingPhoto(null);
    toast.success("Informações atualizadas");
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/20">
        <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <Label htmlFor="site-photos-upload" className="cursor-pointer">
          <div className="space-y-2">
            <p className="text-sm font-medium">Registro fotográfico do local</p>
            <p className="text-xs text-muted-foreground">Fotos antes da reforma - JPG, PNG até 10MB cada</p>
          </div>
        </Label>
        <Input
          id="site-photos-upload"
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
          onClick={() => document.getElementById('site-photos-upload')?.click()}
          disabled={uploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Enviando..." : "Adicionar Fotos"}
        </Button>
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <img
                src={photo.url}
                alt={photo.description || `Foto ${index + 1}`}
                className="w-full h-40 object-cover cursor-pointer"
                onClick={() => handleEditPhoto(index)}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemovePhoto(index);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardContent className="p-2">
                {photo.date && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(photo.date).toLocaleDateString('pt-BR')}
                  </div>
                )}
                {photo.area && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <MapPin className="h-3 w-3" />
                    {photo.area}
                  </div>
                )}
                {photo.labels && photo.labels.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {photo.labels.map((label, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] h-4">
                        {label}
                      </Badge>
                    ))}
                  </div>
                )}
                {photo.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{photo.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editingPhoto && (
        <Dialog open={!!editingPhoto} onOpenChange={() => setEditingPhoto(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Informações da Foto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Data da Foto</Label>
                <Input
                  type="date"
                  value={tempDate}
                  onChange={(e) => setTempDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Área / Local</Label>
                <Input
                  placeholder="Ex: Sala, Cozinha, Quarto Principal..."
                  value={tempArea}
                  onChange={(e) => setTempArea(e.target.value)}
                />
              </div>
              <div>
                <Label>Etiquetas</Label>
                <Input
                  placeholder="Ex: Antes, Estrutura, Piso (separar por vírgula)"
                  value={tempLabels}
                  onChange={(e) => setTempLabels(e.target.value)}
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  placeholder="Observações sobre a foto..."
                  value={tempDescription}
                  onChange={(e) => setTempDescription(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingPhoto(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit}>
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
