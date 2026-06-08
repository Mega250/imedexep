import { DesktopMobileFrame } from "@/atomic/templates/DesktopMobileFrame";
import { PAgendarPage } from "@/atomic/pages/patient/PAgendarPage";

export function PdAgendarDesktopPage() {
  return (
    <DesktopMobileFrame>
      <PAgendarPage />
    </DesktopMobileFrame>
  );
}
