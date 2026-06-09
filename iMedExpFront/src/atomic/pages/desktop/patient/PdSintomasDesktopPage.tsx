import { DesktopMobileFrame } from "@/atomic/templates/DesktopMobileFrame";
import { PHistSintomasPage } from "@/atomic/pages/patient/PHistSintomasPage";

export function PdSintomasDesktopPage() {
  return (
    <DesktopMobileFrame>
      <PHistSintomasPage />
    </DesktopMobileFrame>
  );
}
