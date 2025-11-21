import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { profileUpdateSchema, ProfileUpdateData } from "@/schemas/profile.schema";

export function ProfileTab() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [profile, setProfile] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
  });

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setAvatarUrl(data.avatar_url || "");
      reset({
        full_name: data.full_name || "",
        phone: data.phone || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/${Math.random()}.${fileExt}`;

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Imagem muito grande. Tamanho máximo: 2MB");
        return;
      }

      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error("Formato não suportado. Use JPG, PNG ou WEBP");
        return;
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success("Avatar atualizado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer upload do avatar");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: ProfileUpdateData) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          phone: data.phone,
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast.success("Perfil atualizado com sucesso!");
      fetchProfile();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Informações do Perfil</h3>
        <p className="text-sm text-muted-foreground">
          Atualize suas informações pessoais e foto de perfil
        </p>
      </div>

      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={avatarUrl} alt={user?.email || ""} />
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        
        <div className="space-y-2">
          <Label htmlFor="avatar" className="cursor-pointer">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm hover:bg-muted/50 transition-colors">
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Alterar Avatar
                </>
              )}
            </div>
          </Label>
          <Input
            id="avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarUpload}
            disabled={uploading}
          />
          <p className="text-xs text-muted-foreground">
            JPG, PNG ou WEBP. Máximo 2MB.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={user?.email || ""}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            O email não pode ser alterado
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="full_name">Nome Completo</Label>
          <Input
            id="full_name"
            {...register("full_name")}
            placeholder="Seu nome completo"
          />
          {errors.full_name && (
            <p className="text-sm text-destructive">{errors.full_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            {...register("phone")}
            placeholder="(00) 00000-0000"
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>

        {profile && (
          <div className="space-y-2">
            <Label>Membro desde</Label>
            <Input
              value={new Date(profile.created_at).toLocaleDateString('pt-BR')}
              disabled
              className="bg-muted"
            />
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  );
}
