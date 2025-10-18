import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];
type WorkspaceInsert = Database["public"]["Tables"]["workspaces"]["Insert"];
type WorkspaceUpdate = Database["public"]["Tables"]["workspaces"]["Update"];
type WorkspaceMember = Database["public"]["Tables"]["workspace_members"]["Row"];
type WorkspaceInvite = Database["public"]["Tables"]["workspace_invites"]["Row"];

export const workspacesService = {
  async getAll() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("Not authenticated") };

    const { data, error } = await supabase
      .from("workspace_members")
      .select("workspace_id, workspaces(*)")
      .eq("user_id", user.id);

    if (error) return { data: null, error };

    const workspaces = data?.map((m: any) => m.workspaces).filter(Boolean) || [];
    return { data: workspaces, error: null };
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("workspaces")
      .select("*")
      .eq("id", id)
      .single();

    return { data, error };
  },

  async create(name: string, subscription_plan: string = "atelier") {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("Not authenticated") };

    // Gerar slug usando a função do banco
    const { data: slugData, error: slugError } = await supabase.rpc(
      "generate_workspace_slug",
      { workspace_name: name }
    );

    if (slugError) return { data: null, error: slugError };

    const { data, error } = await supabase
      .from("workspaces")
      .insert({
        name,
        slug: slugData,
        subscription_plan: subscription_plan as any,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) return { data: null, error };

    // Adicionar criador como owner
    const { error: memberError } = await supabase
      .from("workspace_members")
      .insert({
        workspace_id: data.id,
        user_id: user.id,
        role: "owner",
      });

    if (memberError) return { data: null, error: memberError };

    return { data, error: null };
  },

  async update(id: string, updates: WorkspaceUpdate) {
    const { data, error } = await supabase
      .from("workspaces")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  },

  async delete(id: string) {
    const { error } = await supabase.from("workspaces").delete().eq("id", id);
    return { error };
  },

  async getMembers(workspaceId: string) {
    const { data, error } = await supabase
      .from("workspace_members")
      .select("*, profiles(id, email, full_name, avatar_url)")
      .eq("workspace_id", workspaceId)
      .order("joined_at", { ascending: true });

    return { data, error };
  },

  async inviteMember(workspaceId: string, email: string, role: string = "member") {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("Not authenticated") };

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

    const { data, error } = await supabase
      .from("workspace_invites")
      .insert({
        workspace_id: workspaceId,
        email,
        role: role as any,
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    return { data, error };
  },

  async getInvites(workspaceId: string) {
    const { data, error } = await supabase
      .from("workspace_invites")
      .select("*, profiles!workspace_invites_invited_by_fkey(full_name, email)")
      .eq("workspace_id", workspaceId)
      .is("accepted_at", null)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  async acceptInvite(token: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("Not authenticated") };

    // Buscar convite
    const { data: invite, error: inviteError } = await supabase
      .from("workspace_invites")
      .select("*")
      .eq("token", token)
      .is("accepted_at", null)
      .single();

    if (inviteError) return { data: null, error: inviteError };

    // Verificar expiração
    if (new Date(invite.expires_at) < new Date()) {
      return { data: null, error: new Error("Convite expirado") };
    }

    // Adicionar usuário ao workspace
    const { error: memberError } = await supabase
      .from("workspace_members")
      .insert({
        workspace_id: invite.workspace_id,
        user_id: user.id,
        role: invite.role,
      });

    if (memberError) return { data: null, error: memberError };

    // Marcar convite como aceito
    const { error: updateError } = await supabase
      .from("workspace_invites")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invite.id);

    if (updateError) return { data: null, error: updateError };

    return { data: invite, error: null };
  },

  async cancelInvite(inviteId: string) {
    const { error } = await supabase
      .from("workspace_invites")
      .delete()
      .eq("id", inviteId);

    return { error };
  },

  async removeMember(workspaceId: string, userId: string) {
    const { error } = await supabase
      .from("workspace_members")
      .delete()
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId);

    return { error };
  },

  async updateMemberRole(workspaceId: string, userId: string, role: string) {
    const { error } = await supabase
      .from("workspace_members")
      .update({ role: role as any })
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId);

    return { error };
  },
};
