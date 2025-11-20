import { supabase } from "@/integrations/supabase/client";
import { adminAuthService } from "./admin-auth.service";

function getAdminHeaders() {
  const token = adminAuthService.getAdminToken();
  return {
    Authorization: `Bearer ${token}`
  };
}

export const adminService = {
  // Estatísticas
  async getStats() {
    const { data, error } = await supabase.functions.invoke('admin-stats', {
      headers: getAdminHeaders()
    });
    if (error) throw error;
    return data;
  },

  // Organizações
  async getOrganizations(params?: { page?: number; limit?: number; plan?: string; search?: string }) {
    const { data, error } = await supabase.functions.invoke('admin-organizations', {
      headers: getAdminHeaders(),
      body: {
        page: params?.page,
        limit: params?.limit,
        plan: params?.plan,
        search: params?.search,
      },
    });
    
    if (error) throw error;
    return data;
  },

  // Usuários
  async getUsers(params?: { page?: number; limit?: number; search?: string }) {
    const { data, error } = await supabase.functions.invoke('admin-users', {
      headers: getAdminHeaders(),
      body: {
        page: params?.page,
        limit: params?.limit,
        search: params?.search,
      },
    });
    
    if (error) throw error;
    return data;
  },

  // Mudar plano de workspace
  async changeWorkspacePlan(workspaceId: string, newPlan: string) {
    const { data, error } = await supabase.functions.invoke('admin-actions', {
      headers: getAdminHeaders(),
      body: {
        action: 'change_plan',
        workspaceId,
        newPlan,
      },
    });

    if (error) throw error;
    return data;
  },

  // Assinaturas
  async getSubscriptions() {
    const { data, error } = await supabase.functions.invoke('admin-subscriptions', {
      headers: getAdminHeaders(),
    });
    
    if (error) throw error;
    return data;
  },

  // Administradores da Plataforma
  async getPlatformAdmins() {
    const { data, error } = await supabase.functions.invoke('admin-platform-admins', {
      headers: getAdminHeaders(),
      body: { action: 'list' },
    });
    
    if (error) throw error;
    return data;
  },

  async addPlatformAdmin(userId: string, role: string) {
    const { data, error } = await supabase.functions.invoke('admin-platform-admins', {
      headers: getAdminHeaders(),
      body: {
        action: 'add',
        userId,
        role,
      },
    });

    if (error) throw error;
    return data;
  },

  async removePlatformAdmin(userId: string) {
    const { data, error } = await supabase.functions.invoke('admin-platform-admins', {
      headers: getAdminHeaders(),
      body: {
        action: 'remove',
        userId,
      },
    });

    if (error) throw error;
    return data;
  },

  async updatePlatformAdminRole(userId: string, newRole: string) {
    const { data, error } = await supabase.functions.invoke('admin-platform-admins', {
      headers: getAdminHeaders(),
      body: {
        action: 'update_role',
        userId,
        newRole,
      },
    });

    if (error) throw error;
    return data;
  },
};
