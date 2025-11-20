import { ReactNode } from "react";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import type { PlanLimits } from "@/constants/plans";

interface FeatureRouteProps {
  children: ReactNode;
  lockedChildren: ReactNode;
  feature: keyof PlanLimits['features'];
}

export function FeatureRoute({ children, lockedChildren, feature }: FeatureRouteProps) {
  const { hasFeature } = useFeatureAccess();
  
  if (!hasFeature(feature)) {
    return <>{lockedChildren}</>;
  }
  
  return <>{children}</>;
}
