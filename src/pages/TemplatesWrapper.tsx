import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import Templates from "./Templates";
import TemplatesLocked from "./TemplatesLocked";

export default function TemplatesWrapper() {
  const { hasFeature } = useFeatureAccess();
  
  if (!hasFeature('templates')) {
    return <TemplatesLocked />;
  }
  
  return <Templates />;
}
