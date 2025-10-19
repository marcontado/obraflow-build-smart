import { supabase } from "@/integrations/supabase/client";

export const adminService = {
  // Estatísticas
  async getStats() {
    const { data, error } = await supabase.functions.invoke('admin-stats');
    if (error) throw error;
    return data;
  },

  // Organizações
  async getOrganizations(params?: { page?: number; limit?: number; plan?: string; search?: string }) {
    const { data, error } = await supabase.functions.invoke('admin-organizations', {
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
      body: {
        action: 'change_plan',
        workspaceId,
        newPlan,
      },
    });

    if (error) throw error;
    return data;
  },
};
