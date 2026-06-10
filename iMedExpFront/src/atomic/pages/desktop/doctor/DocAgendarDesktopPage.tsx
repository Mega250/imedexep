import { StyleSheet, View } from "react-native";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { doctorNav } from "@/navigation/desktopNavConfigs";
import { DocAgendarMobilePage } from "@/atomic/pages/doctor/DocAgendarMobilePage";
import { colors } from "@/theme/tokens";

export function DocAgendarDesktopPage() {
  return (
    <DesktopShell
      nav={doctorNav}
      activeScreen="dsk-doc-agendar"
      role="médico"
      roleBadge="Médico"
      title="Agendar cita"
      eyebrow="Nueva consulta"
    >
      <View style={styles.column}>
        <DocAgendarMobilePage />
      </View>
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  column: {
    flex: 1,
    width: "100%",
    backgroundColor: colors.paper
  }
});
