export type AppRole =
  | "patient"
  | "doctor"
  | "secretary"
  | "institution_admin"
  | "superadmin";

const PUBLIC_SCREENS = new Set<string>([
  "home",
  "home-mob",
  "login",
  "login-mob",
  "reg-role",
  "reg-role-mob",
  "reg-patient",
  "reg-patient-mob",
  "reg-doctor",
  "reg-doctor-mob",
  "verify-email",
  "verify-email-mob",
  "recover",
  "recover-mob",
  "recover-set",
  "recover-set-mob",
]);

const SHARED_AUTHENTICATED = new Set<string>(["settings", "settings-mob"]);

const PATIENT_SCREENS = new Set<string>([
  "pat-inicio",
  "pat-hist",
  "pat-alergias",
  "pat-enf",
  "pat-cirugias",
  "pat-familia",
  "pat-vacunas",
  "pat-peso",
  "pat-sintomas",
  "pat-glucosa",
  "pat-citas",
  "pat-agendar",
  "pat-meds",
  "pat-perfil",
  "pat-emergency",
  "pat-emergency-mob",
  "pat-cycle",
  "pat-cycle-mob",
  "pat-qr",
  "pat-qr-mob",
  "pat-vitals",
  "pat-vitals-mob",
  "pat-clinics",
  "pat-clinics-mob",
  "pat-notifs",
  "pat-notifs-mob",
  "pd-inicio",
  "pd-hist",
  "pd-alergias",
  "pd-enf",
  "pd-cirugias",
  "pd-familia",
  "pd-vacunas",
  "pd-peso",
  "pd-sintomas",
  "pd-glucosa",
  "pd-citas",
  "pd-agendar",
  "pd-meds",
  "pd-perfil",
]);

const DOCTOR_SCREENS = new Set<string>([
  "dash-mob",
  "active-mob",
  "mob-patients",
  "mob-agenda",
  "mob-consultas",
  "mob-recetas",
  "mob-validaciones",
  "mob-profile",
  "doc-invites-mob",
  "doc-shifts-mob",
  "doc-qr-mob",
  "doc-vitals-mob",
  "doc-full-mob",
  "doctor-dash",
  "doctor-active",
  "dsk-patients",
  "dsk-agenda",
  "dsk-consultas",
  "dsk-recetas",
  "dsk-validaciones",
  "dsk-profile",
  "doc-invites",
  "doc-shifts",
  "doc-qr",
  "doc-vitals",
  "doc-full",
  "bitacora-mob",
  "bitacora-pc",
  "bitacora-print",
]);

const SECRETARY_SCREENS = new Set<string>([
  "sec-reception-mob",
  "sec-patients-mob",
  "sec-agenda-mob",
  "sec-link-mob",
  "sec-profile-mob",
  "sec-reception",
  "sec-patients",
  "sec-agenda",
  "sec-link",
  "sec-profile",
]);

const INSTITUTION_ADMIN_SCREENS = new Set<string>([
  "dir-dash-mob",
  "dir-doctors-mob",
  "dir-doc-det-mob",
  "dir-secs-mob",
  "dir-invites-mob",
  "dir-assigns-mob",
  "dir-patients-mob",
  "dir-settings-mob",
  "dir-profile-mob",
  "dir-dash",
  "dir-doctors",
  "dir-doctor-detail",
  "dir-secs",
  "dir-invites",
  "dir-assigns",
  "dir-permisos",
  "dir-patients",
  "dir-settings",
  "dir-profile",
]);

const SUPERADMIN_SCREENS = new Set<string>([
  "sa-dash-mob",
  "sa-inst-mob",
  "sa-inst-det-mob",
  "sa-admins-mob",
  "sa-audit-mob",
  "sa-profile-mob",
  "sa-dash",
  "sa-inst",
  "sa-inst-detail",
  "sa-admins",
  "sa-audit",
  "sa-profile",
  "permisos-mob",
  "permisos-pc",
  "bitacora-print",
]);

export function isPublicScreen(screenId: string | undefined): boolean {
  return !!screenId && PUBLIC_SCREENS.has(screenId);
}

export function isScreenAllowedForRole(
  screenId: string | undefined,
  role: AppRole | string | undefined
): boolean {
  if (!screenId) return false;
  if (PUBLIC_SCREENS.has(screenId)) return true;
  if (!role) return false;
  if (SHARED_AUTHENTICATED.has(screenId)) return true;

  switch (role.toLowerCase()) {
    case "patient":
      return PATIENT_SCREENS.has(screenId);
    case "doctor":
      return DOCTOR_SCREENS.has(screenId);
    case "secretary":
      return SECRETARY_SCREENS.has(screenId);
    case "institution_admin":
      return INSTITUTION_ADMIN_SCREENS.has(screenId);
    case "superadmin":
      return (
        SUPERADMIN_SCREENS.has(screenId) ||
        INSTITUTION_ADMIN_SCREENS.has(screenId) ||
        DOCTOR_SCREENS.has(screenId) ||
        SECRETARY_SCREENS.has(screenId) ||
        PATIENT_SCREENS.has(screenId)
      );
    default:
      return false;
  }
}
