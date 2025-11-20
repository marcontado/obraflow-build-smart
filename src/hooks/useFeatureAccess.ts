import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import type { PlanLimits } from "@/constants/plans";

export function useFeatureAccess() {
  const { getWorkspaceLimits, currentWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  
  const hasFeature = (feature: keyof PlanLimits['features']) => {
    // Platform admins têm acesso total a todas as features, independente do plano
    if (isAdmin) {
      return true;
    }
    return getWorkspaceLimits().features[feature];
  };
  
  const requireFeature = (feature: keyof PlanLimits['features']) => {
    if (!hasFeature(feature)) {
      return false;
    }
    return true;
  };

  const getRequiredPlan = (feature: keyof PlanLimits['features']): 'studio' | 'domus' => {
    // Gantt, Reports, Invites, Templates, Partners → Studio
    if (['gantt', 'reports', 'invites', 'templates', 'partners'].includes(feature)) {
      return 'studio';
    }
    // AI Assist, Client Portal, Customization → Domus
    return 'domus';
  };
  
  return { 
    hasFeature, 
    requireFeature, 
    getRequiredPlan,
    currentPlan: currentWorkspace?.subscription_plan || 'atelier'
  };
}
