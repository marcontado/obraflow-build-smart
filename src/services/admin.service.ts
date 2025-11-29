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

    if (error) {
      console.error('Admin action error:', error);
      throw new Error(error.message || 'Erro ao alterar plano do workspace');
    }
    
    if (data?.error) {
      console.error('Admin action response error:', data.error);
      throw new Error(data.error);
    }
    
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

  // Deletar workspace
  async deleteWorkspace(workspaceId: string) {
    const { data, error } = await supabase.functions.invoke('admin-actions', {
      headers: getAdminHeaders(),
      body: {
        action: 'delete_workspace',
        workspaceId,
      },
    });

    if (error) {
      console.error('Admin delete workspace error:', error);
      throw new Error(error.message || 'Erro ao deletar workspace');
    }
    
    if (data?.error) {
      console.error('Admin delete workspace response error:', data.error);
      throw new Error(data.error);
    }
    
    return data;
  },

  // Deletar usuário
  async deleteUser(userId: string) {
    const { data, error } = await supabase.functions.invoke('admin-actions', {
      headers: getAdminHeaders(),
      body: {
        action: 'delete_user',
        userId,
      },
    });

    if (error) {
      console.error('Admin delete user error:', error);
      throw new Error(error.message || 'Erro ao deletar usuário');
    }
    
    if (data?.error) {
      console.error('Admin delete user response error:', data.error);
      throw new Error(data.error);
    }
    
    return data;
  },
};
