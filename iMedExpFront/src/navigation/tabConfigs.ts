import { TabItem } from "@/atomic/organisms/IconTabBar";

export const patientExtrasTabs: TabItem[] = [
  { icon: "home", label: "Inicio", screen: "pat-inicio" },
  { icon: "doc", label: "Salud", screen: "pat-hist" },
  { icon: "cal", label: "Citas", screen: "pat-citas" },
  { icon: "heart", label: "Ciclo", screen: "pat-cycle-mob" },
  { icon: "qr", label: "QR", screen: "pat-qr-mob" },
  { icon: "spark", label: "Asistente", screen: "pat-asistente-mob" },
  { icon: "inbox", label: "Alertas", screen: "pat-recordatorios-mob" },
  { icon: "user", label: "Perfil", screen: "pat-perfil" }
];

export const bitacoraTabs: TabItem[] = [
  { icon: "home", label: "Inicio", screen: "dash-mob" },
  { icon: "users", label: "Pac.", screen: "mob-patients" },
  { icon: "cal", label: "Agenda", screen: "mob-agenda" },
  { icon: "clip", label: "Cons.", screen: "mob-consultas" },
  { icon: "edit", label: "Bitácora", screen: "bitacora-mob" },
  { icon: "user", label: "Perfil", screen: "mob-profile" }
];

export const superadminTabs: TabItem[] = [
  { icon: "home", label: "Inicio", screen: "sa-dash-mob" },
  { icon: "build", label: "Inst.", screen: "sa-inst-mob" },
  { icon: "shield-2", label: "Admins", screen: "sa-admins-mob" },
  { icon: "edit", label: "Pantallas", screen: "permisos-mob" },
  { icon: "globe", label: "Auditoría", screen: "sa-audit-mob" },
  { icon: "user", label: "Perfil", screen: "sa-profile-mob" }
];

export const directorTabs: TabItem[] = [
  { icon: "home", label: "Inicio", screen: "dir-dash-mob" },
  { icon: "stetho", label: "Médicos", screen: "dir-doctors-mob" },
  { icon: "users", label: "Sec.", screen: "dir-secs-mob" },
  { icon: "inbox", label: "Invit.", screen: "dir-invites-mob" },
  { icon: "briefcase", label: "Pacientes", screen: "dir-patients-mob" },
  { icon: "user", label: "Perfil", screen: "dir-profile-mob" }
];

export const secretaryTabs: TabItem[] = [
  { icon: "home", label: "Recepción", screen: "sec-reception-mob" },
  { icon: "users", label: "Pacientes", screen: "sec-patients-mob" },
  { icon: "cal", label: "Agenda", screen: "sec-agenda-mob" },
  { icon: "link", label: "Vincular", screen: "sec-link-mob" },
  { icon: "user", label: "Perfil", screen: "sec-profile-mob" }
];
