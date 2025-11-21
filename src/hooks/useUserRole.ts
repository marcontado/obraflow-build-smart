import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";

type WorkspaceRole = "owner" | "admin" | "member";

interface UserRoleData {
  role: WorkspaceRole | null;
  loading: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isMember: boolean;
}

export function useUserRole(): UserRoleData {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [role, setRole] = useState<WorkspaceRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id || !currentWorkspace?.id) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("workspace_members")
          .select("role")
          .eq("user_id", user.id)
          .eq("workspace_id", currentWorkspace.id)
          .single();

        if (error) throw error;
        setRole(data?.role as WorkspaceRole || null);
      } catch (error) {
        console.error("Error fetching user role:", error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user?.id, currentWorkspace?.id]);

  return {
    role,
    loading,
    isOwner: role === "owner",
    isAdmin: role === "admin",
    isMember: role === "member",
  };
}
