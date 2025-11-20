import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import Partners from "./Partners";
import PartnersLocked from "./PartnersLocked";

export default function PartnersWrapper() {
  const { hasFeature } = useFeatureAccess();
  
  if (!hasFeature('partners')) {
    return <PartnersLocked />;
  }
  
  return <Partners />;
}
