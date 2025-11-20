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

        // Buscar informações do perfil
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", tokenData.userId)
          .single();

        // Buscar role do admin
        const { data: adminData } = await supabase
          .from("platform_admins")
          .select("role")
          .eq("user_id", tokenData.userId)
          .single();

        setAdminInfo({
          userId: tokenData.userId,
          email: tokenData.email,
          fullName: profile?.full_name || null,
          role: adminData?.role || "analyst",
          avatarUrl: profile?.avatar_url || null,
        });
      } catch (error) {
        console.error("Erro ao carregar informações do admin:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAdminInfo();
  }, []);

  return { adminInfo, loading };
}
