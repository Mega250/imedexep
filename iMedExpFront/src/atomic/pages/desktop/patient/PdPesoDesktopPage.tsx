import { DesktopMobileFrame } from "@/atomic/templates/DesktopMobileFrame";
import { PHistPesoPage } from "@/atomic/pages/patient/PHistPesoPage";

export function PdPesoDesktopPage() {
  return (
    <DesktopMobileFrame>
      <PHistPesoPage />
    </DesktopMobileFrame>
  );
}
