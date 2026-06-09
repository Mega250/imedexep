import { IconKind } from "@/atomic/atoms/Icon";

export type DesktopNavItem = {
  icon: IconKind;
  label: string;
  screen: string;
  count?: number;
};

export const doctorNav: DesktopNavItem[] = [
  { icon: "home", label: "Inicio", screen: "doctor-dash" },
  { icon: "users", label: "Pacientes", screen: "dsk-patients" },
  { icon: "cal", label: "Agenda", screen: "dsk-agenda" },
  { icon: "clip", label: "Consultas", screen: "dsk-consultas" },
  { icon: "rx", label: "Recetas", screen: "dsk-recetas" },
  { icon: "check", label: "Validaciones", screen: "dsk-validaciones" },
  { icon: "edit", label: "Bitácora", screen: "bitacora-pc" },
  { icon: "inbox", label: "Invitaciones", screen: "doc-invites" },
  { icon: "user", label: "Perfil", screen: "dsk-profile" }
];

export const doctorNavActive: DesktopNavItem[] = [
  { icon: "home", label: "Inicio", screen: "doctor-dash" },
  { icon: "users", label: "Pacientes", screen: "dsk-patients" },
  { icon: "cal", label: "Agenda", screen: "dsk-agenda" },
  { icon: "clip", label: "Consultas", screen: "dsk-consultas" },
  { icon: "rx", label: "Recetas", screen: "dsk-recetas" },
  { icon: "check", label: "Validaciones", screen: "dsk-validaciones" },
  { icon: "edit", label: "Bitácora", screen: "bitacora-pc" },
  { icon: "inbox", label: "Invitaciones", screen: "doc-invites" },
  { icon: "user", label: "Perfil", screen: "dsk-profile" }
];

export const patientNav: DesktopNavItem[] = [
  { icon: "home", label: "Inicio", screen: "pd-inicio" },
  { icon: "doc", label: "Historial", screen: "pd-hist" },
  { icon: "cal", label: "Citas", screen: "pd-citas" },
  { icon: "pill", label: "Medicamentos", screen: "pd-meds" },
  { icon: "heart", label: "Ciclo", screen: "pat-cycle" },
  { icon: "qr", label: "QR", screen: "pat-qr" },
  { icon: "spark", label: "Asistente", screen: "pat-asistente" },
  { icon: "inbox", label: "Alertas", screen: "pat-recordatorios" },
  { icon: "user", label: "Perfil", screen: "pd-perfil" }
];

export const directorNav: DesktopNavItem[] = [
  { icon: "home", label: "Inicio", screen: "dir-dash" },
  { icon: "stetho", label: "Médicos", screen: "dir-doctors" },
  { icon: "users", label: "Secretarias", screen: "dir-secs" },
  { icon: "inbox", label: "Invitaciones", screen: "dir-invites" },
  { icon: "briefcase", label: "Pacientes", screen: "dir-patients" },
  { icon: "link", label: "Asignaciones", screen: "dir-assigns" },
  { icon: "shield", label: "Permisos", screen: "dir-permisos" },
  { icon: "build", label: "Configuración", screen: "dir-settings" },
  { icon: "user", label: "Perfil", screen: "dir-profile" }
];

export const secretaryNav: DesktopNavItem[] = [
  { icon: "home", label: "Recepción", screen: "sec-reception" },
  { icon: "users", label: "Pacientes", screen: "sec-patients" },
  { icon: "cal", label: "Agenda", screen: "sec-agenda" },
  { icon: "link", label: "Vincular", screen: "sec-link" },
  { icon: "user", label: "Perfil", screen: "sec-profile" }
];

export const superadminNav: DesktopNavItem[] = [
  { icon: "home", label: "Inicio", screen: "sa-dash" },
  { icon: "build", label: "Instituciones", screen: "sa-inst" },
  { icon: "shield-2", label: "Admins", screen: "sa-admins" },
  { icon: "shield", label: "Permisos", screen: "permisos-pc" },
  { icon: "globe", label: "Auditoría", screen: "sa-audit" },
  { icon: "user", label: "Perfil", screen: "sa-profile" }
];
