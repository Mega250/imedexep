import { ComponentType } from "react";
import { HomeMobilePage } from "@/atomic/pages/auth/HomeMobilePage";
import { LoginMobilePage } from "@/atomic/pages/auth/LoginMobilePage";
import { RecoverMobilePage } from "@/atomic/pages/auth/RecoverMobilePage";
import { RecoverSetMobilePage } from "@/atomic/pages/auth/RecoverSetMobilePage";
import { RegDoctorMobilePage } from "@/atomic/pages/auth/RegDoctorMobilePage";
import { RegPatientMobilePage } from "@/atomic/pages/auth/RegPatientMobilePage";
import { RegRoleMobilePage } from "@/atomic/pages/auth/RegRoleMobilePage";
import { VerifyEmailMobilePage } from "@/atomic/pages/auth/VerifyEmailMobilePage";
import { DirAssignsMobilePage } from "@/atomic/pages/admin/DirAssignsMobilePage";
import { DirDashMobilePage } from "@/atomic/pages/admin/DirDashMobilePage";
import { DirDoctorDetailMobilePage } from "@/atomic/pages/admin/DirDoctorDetailMobilePage";
import { DirDoctorsMobilePage } from "@/atomic/pages/admin/DirDoctorsMobilePage";
import { DirInvitesMobilePage } from "@/atomic/pages/admin/DirInvitesMobilePage";
import { DirPatientsMobilePage } from "@/atomic/pages/admin/DirPatientsMobilePage";
import { DirProfileMobilePage } from "@/atomic/pages/admin/DirProfileMobilePage";
import { DirSecretariesMobilePage } from "@/atomic/pages/admin/DirSecretariesMobilePage";
import { DirSettingsMobilePage } from "@/atomic/pages/admin/DirSettingsMobilePage";
import { SAAdminsMobilePage } from "@/atomic/pages/admin/SAAdminsMobilePage";
import { SAAuditMobilePage } from "@/atomic/pages/admin/SAAuditMobilePage";
import { SADashboardMobilePage } from "@/atomic/pages/admin/SADashboardMobilePage";
import { SAInstitutionDetailMobilePage } from "@/atomic/pages/admin/SAInstitutionDetailMobilePage";
import { SAInstitutionsMobilePage } from "@/atomic/pages/admin/SAInstitutionsMobilePage";
import { SAPermissionsMobilePage } from "@/atomic/pages/admin/SAPermissionsMobilePage";
import { SAProfileMobilePage } from "@/atomic/pages/admin/SAProfileMobilePage";
import { SecAgendaMobilePage } from "@/atomic/pages/admin/SecAgendaMobilePage";
import { SecLinkMobilePage } from "@/atomic/pages/admin/SecLinkMobilePage";
import { SecPatientsMobilePage } from "@/atomic/pages/admin/SecPatientsMobilePage";
import { SecProfileMobilePage } from "@/atomic/pages/admin/SecProfileMobilePage";
import { SecReceptionMobilePage } from "@/atomic/pages/admin/SecReceptionMobilePage";
import { DashboardMobilePage } from "@/atomic/pages/doctor/DashboardMobilePage";
import { DocBitacoraMobilePage } from "@/atomic/pages/doctor/DocBitacoraMobilePage";
import { DocInvitesMobilePage } from "@/atomic/pages/doctor/DocInvitesMobilePage";
import { DocPatientFullMobilePage } from "@/atomic/pages/doctor/DocPatientFullMobilePage";
import { DocQRMobilePage } from "@/atomic/pages/doctor/DocQRMobilePage";
import { DocShiftsMobilePage } from "@/atomic/pages/doctor/DocShiftsMobilePage";
import { DocVitalsMobilePage } from "@/atomic/pages/doctor/DocVitalsMobilePage";
import { DoctorActiveMobilePage } from "@/atomic/pages/doctor/DoctorActiveMobilePage";
import { MAgendaPage } from "@/atomic/pages/doctor/MAgendaPage";
import { MConsultasPage } from "@/atomic/pages/doctor/MConsultasPage";
import { MPatientsPage } from "@/atomic/pages/doctor/MPatientsPage";
import { MProfilePage } from "@/atomic/pages/doctor/MProfilePage";
import { MRecetasPage } from "@/atomic/pages/doctor/MRecetasPage";
import { MValidacionesPage } from "@/atomic/pages/doctor/MValidacionesPage";
import { PAgendarPage } from "@/atomic/pages/patient/PAgendarPage";
import { PatClinicsMobilePage } from "@/atomic/pages/patient/PatClinicsMobilePage";
import { PatCycleMobilePage } from "@/atomic/pages/patient/PatCycleMobilePage";
import { PatEmergencyMobilePage } from "@/atomic/pages/patient/PatEmergencyMobilePage";
import { PatNotifsMobilePage } from "@/atomic/pages/patient/PatNotifsMobilePage";
import { PatQRMobilePage } from "@/atomic/pages/patient/PatQRMobilePage";
import { PatVitalsMobilePage } from "@/atomic/pages/patient/PatVitalsMobilePage";
import { PCitasPage } from "@/atomic/pages/patient/PCitasPage";
import { PHistAlergiasPage } from "@/atomic/pages/patient/PHistAlergiasPage";
import { PHistAntecedentesPage } from "@/atomic/pages/patient/PHistAntecedentesPage";
import { PHistCirugiasPage } from "@/atomic/pages/patient/PHistCirugiasPage";
import { PHistEnfermedadesPage } from "@/atomic/pages/patient/PHistEnfermedadesPage";
import { PHistGlucosaPage } from "@/atomic/pages/patient/PHistGlucosaPage";
import { PHistPesoPage } from "@/atomic/pages/patient/PHistPesoPage";
import { PHistResumenPage } from "@/atomic/pages/patient/PHistResumenPage";
import { PHistSintomasPage } from "@/atomic/pages/patient/PHistSintomasPage";
import { PHistVacunasPage } from "@/atomic/pages/patient/PHistVacunasPage";
import { PInicioPage } from "@/atomic/pages/patient/PInicioPage";
import { PMedicamentosPage } from "@/atomic/pages/patient/PMedicamentosPage";
import { PPerfilPage } from "@/atomic/pages/patient/PPerfilPage";
import { SettingsMobilePage } from "@/atomic/pages/SettingsMobilePage";

export const nativeScreens: Record<string, ComponentType> = {
  "home-mob": HomeMobilePage,
  "login-mob": LoginMobilePage,
  "reg-role-mob": RegRoleMobilePage,
  "reg-patient-mob": RegPatientMobilePage,
  "reg-doctor-mob": RegDoctorMobilePage,
  "recover-mob": RecoverMobilePage,
  "recover-set-mob": RecoverSetMobilePage,
  "verify-email-mob": VerifyEmailMobilePage,
  "pat-inicio": PInicioPage,
  "pat-hist": PHistResumenPage,
  "pat-alergias": PHistAlergiasPage,
  "pat-enf": PHistEnfermedadesPage,
  "pat-cirugias": PHistCirugiasPage,
  "pat-familia": PHistAntecedentesPage,
  "pat-vacunas": PHistVacunasPage,
  "pat-peso": PHistPesoPage,
  "pat-sintomas": PHistSintomasPage,
  "pat-glucosa": PHistGlucosaPage,
  "pat-citas": PCitasPage,
  "pat-agendar": PAgendarPage,
  "pat-meds": PMedicamentosPage,
  "pat-perfil": PPerfilPage,
  "dash-mob": DashboardMobilePage,
  "active-mob": DoctorActiveMobilePage,
  "mob-patients": MPatientsPage,
  "mob-agenda": MAgendaPage,
  "mob-consultas": MConsultasPage,
  "mob-recetas": MRecetasPage,
  "mob-validaciones": MValidacionesPage,
  "mob-profile": MProfilePage,
  "doc-invites-mob": DocInvitesMobilePage,
  "doc-shifts-mob": DocShiftsMobilePage,
  "doc-qr-mob": DocQRMobilePage,
  "doc-vitals-mob": DocVitalsMobilePage,
  "doc-full-mob": DocPatientFullMobilePage,
  "pat-emergency-mob": PatEmergencyMobilePage,
  "pat-cycle-mob": PatCycleMobilePage,
  "pat-qr-mob": PatQRMobilePage,
  "pat-vitals-mob": PatVitalsMobilePage,
  "pat-clinics-mob": PatClinicsMobilePage,
  "pat-notifs-mob": PatNotifsMobilePage,
  "bitacora-mob": DocBitacoraMobilePage,
  "permisos-mob": SAPermissionsMobilePage,
  "dir-dash-mob": DirDashMobilePage,
  "dir-doctors-mob": DirDoctorsMobilePage,
  "dir-doc-det-mob": DirDoctorDetailMobilePage,
  "dir-secs-mob": DirSecretariesMobilePage,
  "dir-invites-mob": DirInvitesMobilePage,
  "dir-assigns-mob": DirAssignsMobilePage,
  "dir-patients-mob": DirPatientsMobilePage,
  "dir-settings-mob": DirSettingsMobilePage,
  "dir-profile-mob": DirProfileMobilePage,
  "sec-reception-mob": SecReceptionMobilePage,
  "sec-patients-mob": SecPatientsMobilePage,
  "sec-agenda-mob": SecAgendaMobilePage,
  "sec-link-mob": SecLinkMobilePage,
  "sec-profile-mob": SecProfileMobilePage,
  "sa-dash-mob": SADashboardMobilePage,
  "sa-inst-mob": SAInstitutionsMobilePage,
  "sa-inst-det-mob": SAInstitutionDetailMobilePage,
  "sa-admins-mob": SAAdminsMobilePage,
  "sa-audit-mob": SAAuditMobilePage,
  "sa-profile-mob": SAProfileMobilePage,
  "settings-mob": SettingsMobilePage
};

export function findNativeScreen(id: string | undefined): ComponentType | undefined {
  return id ? nativeScreens[id] : undefined;
}
