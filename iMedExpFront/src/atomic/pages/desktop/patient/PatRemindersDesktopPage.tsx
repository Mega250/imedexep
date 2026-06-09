import { ScrollView, StyleSheet } from "react-native";

import { RemindersConfig } from "@/atomic/reminders/RemindersConfig";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { usePatientDesktopNav } from "@/navigation/patientNavVisibility";
import { colors, radii } from "@/theme/tokens";

export function PatRemindersDesktopPage() {
  const nav = usePatientDesktopNav();
  return (
    <DesktopShell
      nav={nav}
      activeScreen="pat-recordatorios"
      role="paciente"
      roleBadge="Paciente"
      title="Recordatorios"
      eyebrow="Medicación y citas · en la app y por correo"
      searchPlaceholder=""
    >
      <ScrollView style={styles.box} contentContainerStyle={styles.content}>
        <RemindersConfig />
      </ScrollView>
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, maxWidth: 760, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.rule, borderRadius: radii.lg },
  content: { paddingBottom: 24 },
});
