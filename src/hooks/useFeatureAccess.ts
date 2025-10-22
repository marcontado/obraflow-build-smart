import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useNavigate } from "react-router-dom";
import type { PlanLimits } from "@/constants/plans";

export function useFeatureAccess() {
  const { getWorkspaceLimits, currentWorkspace } = useWorkspace();
  const navigate = useNavigate();
  
  const hasFeature = (feature: keyof PlanLimits['features']) => {
    return getWorkspaceLimits().features[feature];
  };
  
  const requireFeature = (feature: keyof PlanLimits['features']) => {
    if (!hasFeature(feature)) {
      return false;
    }
    return true;
  };

  const getRequiredPlan = (feature: keyof PlanLimits['features']): 'studio' | 'domus' => {
    // Gantt, Reports, Invites → Studio
    if (['gantt', 'reports', 'invites'].includes(feature)) {
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
