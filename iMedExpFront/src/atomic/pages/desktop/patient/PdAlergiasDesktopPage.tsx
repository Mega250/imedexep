import { DesktopMobileFrame } from "@/atomic/templates/DesktopMobileFrame";
import { PHistAlergiasPage } from "@/atomic/pages/patient/PHistAlergiasPage";

export function PdAlergiasDesktopPage() {
  return (
    <DesktopMobileFrame>
      <PHistAlergiasPage />
    </DesktopMobileFrame>
  );
}
