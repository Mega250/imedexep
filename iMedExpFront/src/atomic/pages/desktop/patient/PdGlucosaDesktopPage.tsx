import { DesktopMobileFrame } from "@/atomic/templates/DesktopMobileFrame";
import { PHistGlucosaPage } from "@/atomic/pages/patient/PHistGlucosaPage";

export function PdGlucosaDesktopPage() {
  return (
    <DesktopMobileFrame>
      <PHistGlucosaPage />
    </DesktopMobileFrame>
  );
}
