import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import Reports from "./Reports";
import ReportsLocked from "./ReportsLocked";

export default function ReportsWrapper() {
  const { hasFeature } = useFeatureAccess();
  
  if (!hasFeature('reports')) {
    return <ReportsLocked />;
  }
  
  return <Reports />;
}
