export const DESKTOP_BREAKPOINT = 860;

const MOBILE_TO_DESKTOP: Record<string, string> = {
  "home-mob": "home",
  "login-mob": "login",
  "reg-role-mob": "reg-role",
  "reg-patient-mob": "reg-patient",
  "reg-doctor-mob": "reg-doctor",
  "recover-mob": "recover",
  "recover-set-mob": "recover-set",
  "verify-email-mob": "verify-email",
  "pat-inicio": "pd-inicio",
  "pat-hist": "pd-hist",
  "pat-alergias": "pd-alergias",
  "pat-enf": "pd-enf",
  "pat-cirugias": "pd-cirugias",
  "pat-familia": "pd-familia",
  "pat-vacunas": "pd-vacunas",
  "pat-peso": "pd-peso",
  "pat-sintomas": "pd-sintomas",
  "pat-glucosa": "pd-glucosa",
  "pat-citas": "pd-citas",
  "pat-agendar": "pd-agendar",
  "pat-meds": "pd-meds",
  "pat-perfil": "pd-perfil",
  "dash-mob": "doctor-dash",
  "active-mob": "doctor-active",
  "mob-patients": "dsk-patients",
  "mob-agenda": "dsk-agenda",
  "mob-consultas": "dsk-consultas",
  "mob-recetas": "dsk-recetas",
  "mob-validaciones": "dsk-validaciones",
  "mob-profile": "dsk-profile",
  "doc-invites-mob": "doc-invites",
  "doc-shifts-mob": "doc-shifts",
  "doc-qr-mob": "doc-qr",
  "doc-vitals-mob": "doc-vitals",
  "doc-full-mob": "doc-full",
  "pat-emergency-mob": "pat-emergency",
  "pat-cycle-mob": "pat-cycle",
  "pat-qr-mob": "pat-qr",
  "pat-vitals-mob": "pat-vitals",
  "pat-clinics-mob": "pat-clinics",
  "pat-notifs-mob": "pat-notifs",
  "bitacora-mob": "bitacora-pc",
  "permisos-mob": "permisos-pc",
  "dir-dash-mob": "dir-dash",
  "dir-doctors-mob": "dir-doctors",
  "dir-doc-det-mob": "dir-doctor-detail",
  "dir-secs-mob": "dir-secs",
  "dir-invites-mob": "dir-invites",
  "dir-assigns-mob": "dir-assigns",
  "dir-patients-mob": "dir-patients",
  "dir-settings-mob": "dir-settings",
  "dir-profile-mob": "dir-profile",
  "sec-reception-mob": "sec-reception",
  "sec-patients-mob": "sec-patients",
  "sec-agenda-mob": "sec-agenda",
  "sec-link-mob": "sec-link",
  "sec-profile-mob": "sec-profile",
  "sa-dash-mob": "sa-dash",
  "sa-inst-mob": "sa-inst",
  "sa-inst-det-mob": "sa-inst-detail",
  "sa-admins-mob": "sa-admins",
  "sa-audit-mob": "sa-audit",
  "sa-profile-mob": "sa-profile",
  "settings-mob": "settings"
};

const DESKTOP_TO_MOBILE: Record<string, string> = Object.fromEntries(
  Object.entries(MOBILE_TO_DESKTOP).map(([mobile, desktop]) => [desktop, mobile])
);

export function toDesktopScreenId(id: string | undefined): string {
  if (!id) {
    return "home";
  }
  return MOBILE_TO_DESKTOP[id] ?? id;
}

export function toMobileScreenId(id: string | undefined): string {
  if (!id) {
    return "home-mob";
  }
  if (id in MOBILE_TO_DESKTOP) {
    return id;
  }
  return DESKTOP_TO_MOBILE[id] ?? id;
}
