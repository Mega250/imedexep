import { StyleSheet, View } from "react-native";

import { AssistantChat } from "@/atomic/chat/AssistantChat";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { usePatientDesktopNav } from "@/navigation/patientNavVisibility";
import { colors, radii } from "@/theme/tokens";

export function PatAsistenteDesktopPage() {
  const nav = usePatientDesktopNav();
  return (
    <DesktopShell
      nav={nav}
      activeScreen="pat-asistente"
      role="paciente"
      roleBadge="Paciente"
      title="Asistente clínico"
      eyebrow="Apoyo informativo · no sustituye a tu médico"
      searchPlaceholder=""
    >
      <View style={styles.box}>
        <AssistantChat />
      </View>
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    maxWidth: 820,
    minHeight: 520,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    overflow: "hidden",
  },
});
