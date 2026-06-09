import { DesktopMobileFrame } from "@/atomic/templates/DesktopMobileFrame";
import { PHistCirugiasPage } from "@/atomic/pages/patient/PHistCirugiasPage";

export function PdCirugiasDesktopPage() {
  return (
    <DesktopMobileFrame>
      <PHistCirugiasPage />
    </DesktopMobileFrame>
  );
}
