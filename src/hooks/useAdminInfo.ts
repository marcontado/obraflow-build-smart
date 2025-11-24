import { useState, useEffect } from "react";
import { adminAuthService } from "@/services/admin-auth.service";
import { supabase } from "@/integrations/supabase/client";

interface AdminInfo {
  userId: string;
  email: string;
  fullName: string | null;
  role: string;
  avatarUrl: string | null;
}

export function useAdminInfo() {
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenExpiringSoon, setTokenExpiringSoon] = useState(false);

  useEffect(() => {
    async function loadAdminInfo() {
      try {
        const token = adminAuthService.getAdminToken();
        if (!token) {
          setLoading(false);
          return;
        }

        const tokenData = adminAuthService.verifyToken(token);
        if (!tokenData) {
          setLoading(false);
          return;
        }

        // Buscar informações via edge function (que tem acesso service_role)
        const { data, error } = await supabase.functions.invoke('admin-auth', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: { action: 'verify' }
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        setAdminInfo({
          userId: data.userId,
          email: data.email,
          fullName: data.fullName,
          role: data.role,
          avatarUrl: data.avatarUrl,
        });

        // Verificar se token está expirando em breve
        setTokenExpiringSoon(adminAuthService.isTokenExpiringSoon(30));
      } catch (error) {
        console.error("Erro ao carregar informações do admin:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAdminInfo();

    // Verificar expiração do token a cada minuto
    const interval = setInterval(() => {
      setTokenExpiringSoon(adminAuthService.isTokenExpiringSoon(30));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return { adminInfo, loading, tokenExpiringSoon };
}
