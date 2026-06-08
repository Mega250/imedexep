import { DesktopMobileFrame } from "@/atomic/templates/DesktopMobileFrame";
import { PHistEnfermedadesPage } from "@/atomic/pages/patient/PHistEnfermedadesPage";

export function PdEnfDesktopPage() {
  return (
    <DesktopMobileFrame>
      <PHistEnfermedadesPage />
    </DesktopMobileFrame>
  );
}
