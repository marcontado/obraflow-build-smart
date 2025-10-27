import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

      // Se não há workspace atual, tentar carregar do localStorage ou pegar o primeiro
      if (!currentWorkspace) {
        const savedWorkspaceId = localStorage.getItem("currentWorkspaceId");
        const workspaceToSet = savedWorkspaceId
          ? data?.find((w) => w.id === savedWorkspaceId)
          : data?.[0];

        if (workspaceToSet) {
          setCurrentWorkspace(workspaceToSet);
          localStorage.setItem("currentWorkspaceId", workspaceToSet.id);
        } else if (data && data.length === 0 && location.pathname !== "/workspace/select") {
          // Nenhum workspace encontrado - redirecionar para criar (apenas se não estiver já na rota)
          navigate("/workspace/select");
        }
      }
    } catch (error) {
      console.error("Unexpected error fetching workspaces:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao carregar os workspaces.",
        variant: "destructive",
      });
    }
  }, [user, currentWorkspace, navigate, location.pathname]);

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
