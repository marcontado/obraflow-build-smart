import { supabase } from "@/integrations/supabase/client";

const ADMIN_TOKEN_KEY = 'admin_jwt_token';

interface AdminLoginResponse {
  token: string;
  firstLogin: boolean;
  role: string;
}

export const adminAuthService = {
  async adminLogin(email: string, password: string): Promise<AdminLoginResponse> {
    const { data, error } = await supabase.functions.invoke('admin-auth/login', {
      body: { email, password }
    });

    if (error) throw error;
    if (data.error) throw new Error(data.error);

    // Armazenar token
    localStorage.setItem(ADMIN_TOKEN_KEY, data.token);

    return data;
  },

  async adminResetPassword(email: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke('admin-auth/reset-password', {
      body: { email }
    });

    if (error) throw error;
    if (data.error) throw new Error(data.error);
  },

  async adminChangePassword(oldPassword: string, newPassword: string): Promise<void> {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) throw new Error('Token não encontrado');

    const { data, error } = await supabase.functions.invoke('admin-auth/change-password', {
      body: { adminToken: token, oldPassword, newPassword }
    });

    if (error) throw error;
    if (data.error) throw new Error(data.error);
  },

  getAdminToken(): string | null {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  },

  clearAdminToken(): void {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  },

  verifyToken(token: string): { userId: string; email: string; exp: number } | null {
    try {
      const payload = JSON.parse(atob(token));
      if (payload.type !== 'admin' || payload.exp < Date.now()) {
        return null;
      }
      return payload;
    } catch {
      return null;
    }
  },

  isTokenValid(): boolean {
    const token = this.getAdminToken();
    if (!token) return false;
    
    const payload = this.verifyToken(token);
    return payload !== null;
  },

  getTokenExpirationTime(): number | null {
    const token = this.getAdminToken();
    if (!token) return null;
    
    const payload = this.verifyToken(token);
    return payload?.exp || null;
  },

  getTokenTimeRemaining(): number | null {
    const exp = this.getTokenExpirationTime();
    if (!exp) return null;
    
    return Math.max(0, exp - Date.now());
  },

  isTokenExpiringSoon(minutesThreshold: number = 30): boolean {
    const timeRemaining = this.getTokenTimeRemaining();
    if (timeRemaining === null) return false;
    
    return timeRemaining < (minutesThreshold * 60 * 1000);
  },

  async refreshToken(): Promise<void> {
    const token = this.getAdminToken();
    if (!token) throw new Error('No token to refresh');

    const payload = this.verifyToken(token);
    if (!payload) throw new Error('Invalid token');

    // Re-authenticate to get a new token
    const { data, error } = await supabase.functions.invoke('admin-auth', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: { action: 'refresh' }
    });

    if (error) throw error;
    if (data.error) throw new Error(data.error);
    if (data.token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
    }
  }
};
