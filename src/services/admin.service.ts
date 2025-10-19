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
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.plan) queryParams.append('plan', params.plan);
    if (params?.search) queryParams.append('search', params.search);

    const { data, error } = await supabase.functions.invoke('admin-organizations', {
      body: {},
      method: 'GET',
    });
    
    if (error) throw error;
    return data;
  },

  // Usuários
  async getUsers(params?: { page?: number; limit?: number; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const { data, error } = await supabase.functions.invoke('admin-users', {
      body: {},
      method: 'GET',
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
