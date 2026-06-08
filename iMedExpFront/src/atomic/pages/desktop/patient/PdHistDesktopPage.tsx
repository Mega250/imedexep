import { DesktopMobileFrame } from "@/atomic/templates/DesktopMobileFrame";
import { PHistResumenPage } from "@/atomic/pages/patient/PHistResumenPage";

export function PdHistDesktopPage() {
  return (
    <DesktopMobileFrame>
      <PHistResumenPage />
    </DesktopMobileFrame>
  );
}
