import { AssistantChat } from "@/atomic/chat/AssistantChat";
import { PatientExtrasTabBar } from "@/atomic/organisms/PatientExtrasTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";

export function PatAsistenteMobilePage() {
  return (
    <MobileScreen
      scroll={false}
      keyboardAware
      header={<ScreenTopBar title="Asistente clínico" sub="Apoyo informativo · no sustituye a tu médico" />}
      tabBar={<PatientExtrasTabBar activeScreen="pat-asistente-mob" />}
    >
      <AssistantChat />
    </MobileScreen>
  );
}
