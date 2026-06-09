import { StyleSheet } from "react-native";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { ScreenPermissionsPanel, PermRoleGroup } from "@/atomic/organisms/ScreenPermissionsPanel";
import { IconTabBar } from "@/atomic/organisms/IconTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { superadminTabs } from "@/navigation/tabConfigs";
import { directorNav, doctorNav, patientNav, secretaryNav } from "@/navigation/desktopNavConfigs";

function toScreens(nav: { screen: string; label: string }[]) {
  return nav.map((n) => ({ screen: n.screen, label: n.label }));
}

const GROUPS: PermRoleGroup[] = [
  { role: "patient", label: "Pacientes", screens: toScreens(patientNav) },
  { role: "doctor", label: "Médicos", screens: toScreens(doctorNav) },
  { role: "secretary", label: "Secretarias", screens: toScreens(secretaryNav) },
  { role: "institution_admin", label: "Directores", screens: toScreens(directorNav) }
];

export function SAPermissionsMobilePage() {
  return (
    <MobileScreen
      tabBar={<IconTabBar tabs={superadminTabs} active={3} />}
      header={
        <ScreenTopBar
          sub="Controla qué pantallas ve cada rol"
          title="Permisos de pantallas"
        />
      }
      contentStyle={styles.content}
    >
      <FadeIn>
        <ScreenPermissionsPanel groups={GROUPS} />
      </FadeIn>
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 130
  }
});
