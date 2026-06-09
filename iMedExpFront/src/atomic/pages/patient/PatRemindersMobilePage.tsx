import { RemindersConfig } from "@/atomic/reminders/RemindersConfig";
import { PatientExtrasTabBar } from "@/atomic/organisms/PatientExtrasTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";

export function PatRemindersMobilePage() {
  return (
    <MobileScreen
      scroll
      header={<ScreenTopBar title="Recordatorios" sub="Medicación y citas · en la app y por correo" />}
      tabBar={<PatientExtrasTabBar activeScreen="pat-recordatorios-mob" />}
    >
      <RemindersConfig />
    </MobileScreen>
  );
}
