import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, User, Building2, Crown, Shield, UserCircle, Plus, Settings, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useNavigate } from "react-router-dom";
import { profileUpdateSchema, ProfileUpdateData } from "@/schemas/profile.schema";
import { PLAN_LIMITS } from "@/constants/plans";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/contexts/LocaleContext";

export function ProfileTab() {
  const { user } = useAuth();
  const { currentWorkspace, workspaces, switchWorkspace, canCreateWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const { t } = useTranslation('settings');
  const { dateLocale } = useLocale();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [profile, setProfile] = useState<any>(null);
  const [workspaceRoles, setWorkspaceRoles] = useState<Record<string, string>>({});

  const hasAdminRole = Object.values(workspaceRoles).some(
    role => role === 'owner' || role === 'admin'
  );
  const canCreateNewWorkspace = canCreateWorkspace() && hasAdminRole;

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
      fetchWorkspaceRoles();
    }
  }, [user?.id]);

  const fetchWorkspaceRoles = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from("workspace_members")
        .select("workspace_id, role")
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      const rolesMap: Record<string, string> = {};
      data?.forEach(member => {
        rolesMap[member.workspace_id] = member.role;
      });
      setWorkspaceRoles(rolesMap);
    } catch (error) {
      console.error("Error fetching workspace roles:", error);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .maybeSingle();

      if (error) throw error;
      
      setProfile(data);
      setAvatarUrl(data?.avatar_url || "");
      reset({
        full_name: data?.full_name || "",
        phone: data?.phone || "",
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

      if (file.size > 2 * 1024 * 1024) {
        toast.error(t('profile.avatarTooBig'));
        return;
      }

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error(t('profile.avatarInvalidFormat'));
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
      toast.success(t('profile.avatarSuccess'));
    } catch (error: any) {
      toast.error(error.message || t('profile.avatarError'));
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

      toast.success(t('profile.success'));
      fetchProfile();
    } catch (error: any) {
      toast.error(error.message || t('profile.error'));
    } finally {
      setLoading(false);
    }
  };

  const planNames = {
    atelier: "Atelier",
    studio: "Studio",
    domus: "Domus"
  };

  const roleConfig = {
    owner: { icon: Crown, label: t('workspace.role.owner'), color: "text-yellow-600 bg-yellow-50" },
    admin: { icon: Shield, label: t('workspace.role.admin'), color: "text-blue-600 bg-blue-50" },
    member: { icon: UserCircle, label: t('workspace.role.member'), color: "text-gray-600 bg-gray-50" }
  };

  return (
    <div className="space-y-8 p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{t('profile.title')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('profile.description')}
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
                    {t('profile.uploading')}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    {t('profile.changeAvatar')}
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
              {t('profile.avatarInfo')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('profile.email')}</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              {t('profile.emailCannotChange')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">{t('profile.fullName')}</Label>
            <Input
              id="full_name"
              {...register("full_name")}
              placeholder={t('profile.fullNamePlaceholder')}
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t('profile.phone')}</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder={t('profile.phonePlaceholder')}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          {profile && (
            <div className="space-y-2">
              <Label>{t('profile.memberSince')}</Label>
              <Input
                value={new Date(profile.created_at).toLocaleDateString(dateLocale as any)}
                disabled
                className="bg-muted"
              />
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('profile.save')}
            </Button>
          </div>
        </form>
      </div>

      <div className="space-y-6 pt-6 border-t">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{t('profile.organizations.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('profile.organizations.description')}
            </p>
          </div>
          <Button 
            onClick={() => navigate("/workspace/new")}
            disabled={!canCreateNewWorkspace}
            variant="default"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('profile.organizations.newOrganization')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workspaces.map((workspace) => {
            const role = workspaceRoles[workspace.id];
            const isActive = currentWorkspace?.id === workspace.id;

            const currentRoleConfig = roleConfig[role as keyof typeof roleConfig] || roleConfig.member;
            const RoleIcon = currentRoleConfig.icon;

            return (
              <Card 
                key={workspace.id} 
                className={`relative transition-all hover:shadow-md ${
                  isActive ? 'border-primary ring-2 ring-primary/20' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={workspace.logo_url || ""} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {workspace.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{workspace.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {workspace.slug}
                        </CardDescription>
                      </div>
                    </div>
                    {isActive && (
                      <Badge variant="default" className="text-xs">
                        {t('profile.organizations.current')}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {planNames[workspace.subscription_plan as keyof typeof planNames]}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${currentRoleConfig.color}`}>
                      <RoleIcon className="h-3 w-3 mr-1" />
                      {currentRoleConfig.label}
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    {!isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          await switchWorkspace(workspace.id);
                          toast.success(t('profile.organizations.switchSuccess'), {
                            description: t('profile.organizations.switchDescription', { name: workspace.name }),
                          });
                          navigate("/");
                        }}
                        className="flex-1"
                      >
                        {t('profile.organizations.select')}
                      </Button>
                    )}
                    {(role === 'owner' || role === 'admin') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/workspace/${workspace.id}/settings`)}
                        className="flex-1"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        {t('profile.organizations.manage')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {workspaces.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('profile.organizations.emptyTitle')}</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center">
                {t('profile.organizations.emptyDescription')}
              </p>
              <Button onClick={() => navigate("/workspace/new")}>
                <Plus className="h-4 w-4 mr-2" />
                {t('profile.organizations.createFirst')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
