import { DesktopMobileFrame } from "@/atomic/templates/DesktopMobileFrame";
import { PHistAntecedentesPage } from "@/atomic/pages/patient/PHistAntecedentesPage";

export function PdFamiliaDesktopPage() {
  return (
    <DesktopMobileFrame>
      <PHistAntecedentesPage />
    </DesktopMobileFrame>
  );
}
