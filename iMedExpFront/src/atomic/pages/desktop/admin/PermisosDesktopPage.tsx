import { ReactNode } from "react";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { ScreenPermissionsPanel, PermRoleGroup } from "@/atomic/organisms/ScreenPermissionsPanel";
import {
  directorNav,
  doctorNav,
  patientNav,
  secretaryNav,
  superadminNav
} from "@/navigation/desktopNavConfigs";

function toScreens(nav: { screen: string; label: string }[]) {
  return nav.map((n) => ({ screen: n.screen, label: n.label }));
}

const GROUPS: PermRoleGroup[] = [
  { role: "patient", label: "Pacientes", screens: toScreens(patientNav) },
  { role: "doctor", label: "Médicos", screens: toScreens(doctorNav) },
  { role: "secretary", label: "Secretarias", screens: toScreens(secretaryNav) },
  { role: "institution_admin", label: "Directores", screens: toScreens(directorNav) }
];

export function PermisosDesktopPage(): ReactNode {
  return (
    <DesktopShell
      nav={superadminNav}
      activeScreen="permisos-pc"
      role="superadmin"
      roleBadge="Superadmin"
      title="Permisos de pantallas"
      eyebrow="Controla qué pantallas ve cada rol en toda la plataforma"
    >
      <ScreenPermissionsPanel groups={GROUPS} />
    </DesktopShell>
  );
}
