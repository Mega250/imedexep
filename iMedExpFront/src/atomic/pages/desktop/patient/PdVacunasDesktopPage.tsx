import { DesktopMobileFrame } from "@/atomic/templates/DesktopMobileFrame";
import { PHistVacunasPage } from "@/atomic/pages/patient/PHistVacunasPage";

export function PdVacunasDesktopPage() {
  return (
    <DesktopMobileFrame>
      <PHistVacunasPage />
    </DesktopMobileFrame>
  );
}
