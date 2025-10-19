import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        setIsAdmin(false);
        setAdminRole(null);
        setLoading(false);
        return;
      }

      try {
        // Verificar se é admin usando a função security definer
        const { data: isAdminData, error: isAdminError } = await supabase.rpc(
          'is_platform_admin',
          { _user_id: user.id }
        );

        if (isAdminError) {
          console.error('Error checking admin status:', isAdminError);
          setIsAdmin(false);
          setAdminRole(null);
        } else {
          setIsAdmin(!!isAdminData);

          if (isAdminData) {
            // Buscar role do admin
            const { data: roleData, error: roleError } = await supabase.rpc(
              'get_platform_admin_role',
              { _user_id: user.id }
            );

            if (!roleError && roleData) {
              setAdminRole(roleData);
            }
          }
        }
      } catch (error) {
        console.error('Error in useAdmin:', error);
        setIsAdmin(false);
        setAdminRole(null);
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, [user]);

  return { isAdmin, adminRole, loading };
}
