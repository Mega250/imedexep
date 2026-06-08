import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { usePathname } from "expo-router";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { toDesktopScreenId } from "@/navigation/desktopVariants";
import { usePatientDesktopNav } from "@/navigation/patientNavVisibility";
import { colors } from "@/theme/tokens";

const TITLE_MAP: Record<string, { title: string; eyebrow?: string }> = {
  "pd-inicio": { title: "Inicio", eyebrow: "Tu salud · de un vistazo" },
  "pd-hist": { title: "Mi historial", eyebrow: "Resumen clínico" },
  "pd-alergias": { title: "Alergias", eyebrow: "Mi historial" },
  "pd-enf": { title: "Enfermedades crónicas", eyebrow: "Mi historial" },
  "pd-cirugias": { title: "Cirugías", eyebrow: "Mi historial" },
  "pd-familia": { title: "Antecedentes familiares", eyebrow: "Mi historial" },
  "pd-vacunas": { title: "Vacunas", eyebrow: "Mi historial" },
  "pd-peso": { title: "Peso e IMC", eyebrow: "Mi historial" },
  "pd-sintomas": { title: "Síntomas", eyebrow: "Mi historial" },
  "pd-glucosa": { title: "Glucosa", eyebrow: "Mi historial" },
  "pd-citas": { title: "Mis citas", eyebrow: "Próximas · pasadas" },
  "pd-agendar": { title: "Agendar cita", eyebrow: "Nueva consulta" },
  "pd-meds": { title: "Medicamentos", eyebrow: "Tomar a tiempo" },
  "pd-perfil": { title: "Mi perfil", eyebrow: "Cuenta · paciente" }
};

export function DesktopMobileFrame({ children }: { children: ReactNode }) {
  const path = usePathname();
  const rawScreenId = path?.replace(/^\/screen\//, "") ?? "pd-inicio";
  const screenId = toDesktopScreenId(rawScreenId);
  const nav = usePatientDesktopNav();

  const meta = TITLE_MAP[screenId] ?? { title: "iMedExp" };
  const hideTopBar = meta.eyebrow === "Mi historial";

  return (
    <DesktopShell
      nav={nav}
      activeScreen={screenId}
      role="paciente"
      roleBadge="Paciente"
      title={meta.title}
      eyebrow={meta.eyebrow}
      hideTopBar={hideTopBar}
    >
      <View style={styles.column}>{children}</View>
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
