import { DesktopMobileFrame } from "@/atomic/templates/DesktopMobileFrame";
import { PMedicamentosPage } from "@/atomic/pages/patient/PMedicamentosPage";

export function PdMedsDesktopPage() {
  return (
    <DesktopMobileFrame>
      <PMedicamentosPage />
    </DesktopMobileFrame>
  );
}
