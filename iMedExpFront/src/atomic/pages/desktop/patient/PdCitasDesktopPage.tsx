import { DesktopMobileFrame } from "@/atomic/templates/DesktopMobileFrame";
import { PCitasPage } from "@/atomic/pages/patient/PCitasPage";

export function PdCitasDesktopPage() {
  return (
    <DesktopMobileFrame>
      <PCitasPage />
    </DesktopMobileFrame>
  );
}
