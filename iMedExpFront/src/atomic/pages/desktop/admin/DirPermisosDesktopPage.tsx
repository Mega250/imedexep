import { ReactNode } from "react";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { ScreenPermissionsPanel, PermRoleGroup } from "@/atomic/organisms/ScreenPermissionsPanel";
import { directorNav, doctorNav, secretaryNav } from "@/navigation/desktopNavConfigs";

const GROUPS: PermRoleGroup[] = [
  { role: "doctor", label: "Médicos de mi clínica", screens: doctorNav.map((n) => ({ screen: n.screen, label: n.label })) },
  { role: "secretary", label: "Secretarias de mi clínica", screens: secretaryNav.map((n) => ({ screen: n.screen, label: n.label })) }
];

export function DirPermisosDesktopPage(): ReactNode {
  return (
    <DesktopShell
      nav={directorNav}
      activeScreen="dir-permisos"
      role="director"
      roleBadge="Director"
      title="Permisos de pantallas"
      eyebrow="Personaliza qué pantallas ve el personal de tu clínica"
    >
      <ScreenPermissionsPanel groups={GROUPS} />
    </DesktopShell>
  );
}
