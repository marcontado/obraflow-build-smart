import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { workspacesService } from "@/services/workspaces.service";
import { useAuth } from "./AuthContext";
import { PLAN_LIMITS, type SubscriptionPlan } from "@/constants/plans";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";

type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  loading: boolean;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
  canCreateWorkspace: () => boolean;
  getWorkspaceLimits: () => typeof PLAN_LIMITS[SubscriptionPlan];
  hasWorkspaces: () => boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshWorkspaces = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await workspacesService.getAll();
      if (error) {
        console.error("Error fetching workspaces:", error);
        toast({
          title: "Erro ao carregar workspaces",
          description: "Não foi possível carregar seus workspaces. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      setWorkspaces(data || []);

      // Sempre validar e setar o currentWorkspace
      if (data && data.length > 0) {
        const savedWorkspaceId = localStorage.getItem("currentWorkspaceId");
        
        // Tentar encontrar o workspace salvo
        let workspaceToSet = savedWorkspaceId
          ? data.find((w) => w.id === savedWorkspaceId)
          : null;
        
        // Se não encontrou o workspace salvo, usar o primeiro disponível
        if (!workspaceToSet) {
          workspaceToSet = data[0];
        }

        setCurrentWorkspace(workspaceToSet);
        localStorage.setItem("currentWorkspaceId", workspaceToSet.id);
      } else {
        // Se não há workspaces, limpar o estado
        setCurrentWorkspace(null);
        localStorage.removeItem("currentWorkspaceId");
      }
    } catch (error) {
      console.error("Unexpected error fetching workspaces:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao carregar os workspaces.",
        variant: "destructive",
      });
    }
  }, [user]);

  const switchWorkspace = async (workspaceId: string) => {
    const workspace = workspaces.find((w) => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
      localStorage.setItem("currentWorkspaceId", workspaceId);
    }
  };

  const canCreateWorkspace = () => {
    if (!currentWorkspace) return true;
    const limits = PLAN_LIMITS[currentWorkspace.subscription_plan as SubscriptionPlan];
    return workspaces.length < limits.workspaces;
  };

  const getWorkspaceLimits = () => {
    if (!currentWorkspace) return PLAN_LIMITS.atelier;
    return PLAN_LIMITS[currentWorkspace.subscription_plan as SubscriptionPlan];
  };

  const hasWorkspaces = () => {
    return workspaces.length > 0;
  };

  useEffect(() => {
    if (user) {
      refreshWorkspaces().finally(() => setLoading(false));
    } else {
      setLoading(false);
      setCurrentWorkspace(null);
      setWorkspaces([]);
    }
  }, [user, refreshWorkspaces]);

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        workspaces,
        loading,
        switchWorkspace,
        refreshWorkspaces,
        canCreateWorkspace,
        getWorkspaceLimits,
        hasWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
