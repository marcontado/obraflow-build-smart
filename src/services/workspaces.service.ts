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

    // Usar função segura que cria workspace e adiciona owner (resolve RLS)
    const { data, error } = await supabase.rpc("create_workspace", {
      workspace_name: name,
      plan: subscription_plan as any,
    });

    if (error) return { data: null, error };

    // A função retorna um array com um único workspace
    const workspace = Array.isArray(data) ? data[0] : data;
    return { data: workspace, error: null };
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
    // Buscar membros
    const { data: members, error: membersError } = await supabase
      .from("workspace_members")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("joined_at", { ascending: true });

    if (membersError) return { data: null, error: membersError };
    if (!members || members.length === 0) return { data: [], error: null };

    // Buscar profiles dos membros
    const userIds = members.map(m => m.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url")
      .in("id", userIds);

    if (profilesError) return { data: null, error: profilesError };

    // Combinar dados
    const membersWithProfiles = members.map(member => ({
      ...member,
      profiles: profiles?.find(p => p.id === member.user_id) || null,
    }));

    return { data: membersWithProfiles, error: null };
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
    // Buscar convites
    const { data: invites, error: invitesError } = await supabase
      .from("workspace_invites")
      .select("*")
      .eq("workspace_id", workspaceId)
      .is("accepted_at", null)
      .order("created_at", { ascending: false });

    if (invitesError) return { data: null, error: invitesError };
    if (!invites || invites.length === 0) return { data: [], error: null };

    // Buscar profiles dos criadores dos convites
    const inviterIds = [...new Set(invites.map(i => i.invited_by))];
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", inviterIds);

    if (profilesError) return { data: null, error: profilesError };

    // Combinar dados
    const invitesWithProfiles = invites.map(invite => ({
      ...invite,
      inviter_profile: profiles?.find(p => p.id === invite.invited_by) || null,
    }));

    return { data: invitesWithProfiles, error: null };
  },

  async acceptInvite(token: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("Not authenticated") };

    // Usar função segura que aceita convite e adiciona membro (resolve RLS)
    const { data, error } = await supabase.rpc("accept_workspace_invite", {
      invite_token: token,
    });

    if (error) return { data: null, error };

    // A função retorna informações do workspace aceito
    const result = Array.isArray(data) ? data[0] : data;
    return { data: result, error: null };
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
