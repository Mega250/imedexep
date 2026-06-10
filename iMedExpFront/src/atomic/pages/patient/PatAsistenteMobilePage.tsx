import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AssistantChat } from "@/atomic/chat/AssistantChat";
import { PatientExtrasTabBar } from "@/atomic/organisms/PatientExtrasTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";

export function PatAsistenteMobilePage() {
  const insets = useSafeAreaInsets();
  return (
    <MobileScreen
      scroll={false}
      keyboardAware
      // La tabBar es position:absolute; bottom:0 (~76-110px con el inset del
      // teléfono). Reservamos ese alto para que el ChatComposer suba y no quede
      // oculto detrás de la barra en móvil.
      header={<ScreenTopBar title="Asistente clínico" sub="Apoyo informativo · no sustituye a tu médico" />}
      tabBar={<PatientExtrasTabBar activeScreen="pat-asistente-mob" />}
      contentStyle={[styles.content, { paddingBottom: insets.bottom + 88 }]}
    >
      <AssistantChat />
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 72
  }
});
