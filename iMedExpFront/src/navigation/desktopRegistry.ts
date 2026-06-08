import { ComponentType } from "react";
import { HomeDesktopPage } from "@/atomic/pages/desktop/auth/HomeDesktopPage";
import { LoginDesktopPage } from "@/atomic/pages/desktop/auth/LoginDesktopPage";
import { RecoverDesktopPage } from "@/atomic/pages/desktop/auth/RecoverDesktopPage";
import { RecoverSetDesktopPage } from "@/atomic/pages/desktop/auth/RecoverSetDesktopPage";
import { RegDoctorDesktopPage } from "@/atomic/pages/desktop/auth/RegDoctorDesktopPage";
import { RegPatientDesktopPage } from "@/atomic/pages/desktop/auth/RegPatientDesktopPage";
import { RegRoleDesktopPage } from "@/atomic/pages/desktop/auth/RegRoleDesktopPage";
import { VerifyEmailDesktopPage } from "@/atomic/pages/desktop/auth/VerifyEmailDesktopPage";
import { DoctorActiveDesktopPage } from "@/atomic/pages/desktop/doctor/DoctorActiveDesktopPage";
import { DoctorDashDesktopPage } from "@/atomic/pages/desktop/doctor/DoctorDashDesktopPage";
import { DskAgendaDesktopPage } from "@/atomic/pages/desktop/doctor/DskAgendaDesktopPage";
import { DskConsultasDesktopPage } from "@/atomic/pages/desktop/doctor/DskConsultasDesktopPage";
import { DskPatientsDesktopPage } from "@/atomic/pages/desktop/doctor/DskPatientsDesktopPage";
import { DskProfileDesktopPage } from "@/atomic/pages/desktop/doctor/DskProfileDesktopPage";
import { DskRecetasDesktopPage } from "@/atomic/pages/desktop/doctor/DskRecetasDesktopPage";
import { DskValidacionesDesktopPage } from "@/atomic/pages/desktop/doctor/DskValidacionesDesktopPage";
import { DocInvitesDesktopPage } from "@/atomic/pages/desktop/doctor/DocInvitesDesktopPage";
import { DocShiftsDesktopPage } from "@/atomic/pages/desktop/doctor/DocShiftsDesktopPage";
import { DocQRDesktopPage } from "@/atomic/pages/desktop/doctor/DocQRDesktopPage";
import { DocVitalsDesktopPage } from "@/atomic/pages/desktop/doctor/DocVitalsDesktopPage";
import { DocFullDesktopPage } from "@/atomic/pages/desktop/doctor/DocFullDesktopPage";
import { PdAgendarDesktopPage } from "@/atomic/pages/desktop/patient/PdAgendarDesktopPage";
import { PdAlergiasDesktopPage } from "@/atomic/pages/desktop/patient/PdAlergiasDesktopPage";
import { PdCirugiasDesktopPage } from "@/atomic/pages/desktop/patient/PdCirugiasDesktopPage";
import { PdCitasDesktopPage } from "@/atomic/pages/desktop/patient/PdCitasDesktopPage";
import { PdEnfDesktopPage } from "@/atomic/pages/desktop/patient/PdEnfDesktopPage";
import { PdFamiliaDesktopPage } from "@/atomic/pages/desktop/patient/PdFamiliaDesktopPage";
import { PdGlucosaDesktopPage } from "@/atomic/pages/desktop/patient/PdGlucosaDesktopPage";
import { PdHistDesktopPage } from "@/atomic/pages/desktop/patient/PdHistDesktopPage";
import { PdInicioDesktopPage } from "@/atomic/pages/desktop/patient/PdInicioDesktopPage";
import { PdMedsDesktopPage } from "@/atomic/pages/desktop/patient/PdMedsDesktopPage";
import { PdPerfilDesktopPage } from "@/atomic/pages/desktop/patient/PdPerfilDesktopPage";
import { PdPesoDesktopPage } from "@/atomic/pages/desktop/patient/PdPesoDesktopPage";
import { PdSintomasDesktopPage } from "@/atomic/pages/desktop/patient/PdSintomasDesktopPage";
import { PdVacunasDesktopPage } from "@/atomic/pages/desktop/patient/PdVacunasDesktopPage";
import { PatEmergencyDesktopPage } from "@/atomic/pages/desktop/patient/PatEmergencyDesktopPage";
import { PatCycleDesktopPage } from "@/atomic/pages/desktop/patient/PatCycleDesktopPage";
import { PatQRDesktopPage } from "@/atomic/pages/desktop/patient/PatQRDesktopPage";
import { PatVitalsDesktopPage } from "@/atomic/pages/desktop/patient/PatVitalsDesktopPage";
import { PatClinicsDesktopPage } from "@/atomic/pages/desktop/patient/PatClinicsDesktopPage";
import { PatNotifsDesktopPage } from "@/atomic/pages/desktop/patient/PatNotifsDesktopPage";
import { DirAssignsDesktopPage } from "@/atomic/pages/desktop/admin/DirAssignsDesktopPage";
import { DirDashDesktopPage } from "@/atomic/pages/desktop/admin/DirDashDesktopPage";
import { DirDoctorDetailDesktopPage } from "@/atomic/pages/desktop/admin/DirDoctorDetailDesktopPage";
import { DirDoctorsDesktopPage } from "@/atomic/pages/desktop/admin/DirDoctorsDesktopPage";
import { DirInvitesDesktopPage } from "@/atomic/pages/desktop/admin/DirInvitesDesktopPage";
import { DirPatientsDesktopPage } from "@/atomic/pages/desktop/admin/DirPatientsDesktopPage";
import { DirProfileDesktopPage } from "@/atomic/pages/desktop/admin/DirProfileDesktopPage";
import { DirSecsDesktopPage } from "@/atomic/pages/desktop/admin/DirSecsDesktopPage";
import { DirSettingsDesktopPage } from "@/atomic/pages/desktop/admin/DirSettingsDesktopPage";
import { DirPermisosDesktopPage } from "@/atomic/pages/desktop/admin/DirPermisosDesktopPage";
import { SAAdminsDesktopPage } from "@/atomic/pages/desktop/admin/SAAdminsDesktopPage";
import { SAAuditDesktopPage } from "@/atomic/pages/desktop/admin/SAAuditDesktopPage";
import { SADashDesktopPage } from "@/atomic/pages/desktop/admin/SADashDesktopPage";
import { SAInstDesktopPage } from "@/atomic/pages/desktop/admin/SAInstDesktopPage";
import { SAInstDetailDesktopPage } from "@/atomic/pages/desktop/admin/SAInstDetailDesktopPage";
import { SAProfileDesktopPage } from "@/atomic/pages/desktop/admin/SAProfileDesktopPage";
import { SecAgendaDesktopPage } from "@/atomic/pages/desktop/admin/SecAgendaDesktopPage";
import { SecLinkDesktopPage } from "@/atomic/pages/desktop/admin/SecLinkDesktopPage";
import { SecPatientsDesktopPage } from "@/atomic/pages/desktop/admin/SecPatientsDesktopPage";
import { SecProfileDesktopPage } from "@/atomic/pages/desktop/admin/SecProfileDesktopPage";
import { SecReceptionDesktopPage } from "@/atomic/pages/desktop/admin/SecReceptionDesktopPage";
import { BitacoraDesktopPage } from "@/atomic/pages/desktop/admin/BitacoraDesktopPage";
import { BitacoraPrintDesktopPage } from "@/atomic/pages/desktop/admin/BitacoraPrintDesktopPage";
import { PermisosDesktopPage } from "@/atomic/pages/desktop/admin/PermisosDesktopPage";
import { SettingsDesktopPage } from "@/atomic/pages/SettingsDesktopPage";

export const desktopScreens: Record<string, ComponentType> = {
  home: HomeDesktopPage,
  login: LoginDesktopPage,
  recover: RecoverDesktopPage,
  "recover-set": RecoverSetDesktopPage,
  "reg-role": RegRoleDesktopPage,
  "reg-patient": RegPatientDesktopPage,
  "reg-doctor": RegDoctorDesktopPage,
  "verify-email": VerifyEmailDesktopPage,
  "doctor-dash": DoctorDashDesktopPage,
  "doctor-active": DoctorActiveDesktopPage,
  "dsk-patients": DskPatientsDesktopPage,
  "dsk-agenda": DskAgendaDesktopPage,
  "dsk-consultas": DskConsultasDesktopPage,
  "dsk-recetas": DskRecetasDesktopPage,
  "dsk-validaciones": DskValidacionesDesktopPage,
  "dsk-profile": DskProfileDesktopPage,
  "doc-invites": DocInvitesDesktopPage,
  "doc-shifts": DocShiftsDesktopPage,
  "doc-qr": DocQRDesktopPage,
  "doc-vitals": DocVitalsDesktopPage,
  "doc-full": DocFullDesktopPage,
  "pd-inicio": PdInicioDesktopPage,
  "pd-hist": PdHistDesktopPage,
  "pd-alergias": PdAlergiasDesktopPage,
  "pd-enf": PdEnfDesktopPage,
  "pd-cirugias": PdCirugiasDesktopPage,
  "pd-familia": PdFamiliaDesktopPage,
  "pd-vacunas": PdVacunasDesktopPage,
  "pd-peso": PdPesoDesktopPage,
  "pd-sintomas": PdSintomasDesktopPage,
  "pd-glucosa": PdGlucosaDesktopPage,
  "pd-citas": PdCitasDesktopPage,
  "pd-agendar": PdAgendarDesktopPage,
  "pd-meds": PdMedsDesktopPage,
  "pd-perfil": PdPerfilDesktopPage,
  "pat-emergency": PatEmergencyDesktopPage,
  "pat-cycle": PatCycleDesktopPage,
  "pat-qr": PatQRDesktopPage,
  "pat-vitals": PatVitalsDesktopPage,
  "pat-clinics": PatClinicsDesktopPage,
  "pat-notifs": PatNotifsDesktopPage,
  "dir-dash": DirDashDesktopPage,
  "dir-doctors": DirDoctorsDesktopPage,
  "dir-doctor-detail": DirDoctorDetailDesktopPage,
  "dir-secs": DirSecsDesktopPage,
  "dir-invites": DirInvitesDesktopPage,
  "dir-assigns": DirAssignsDesktopPage,
  "dir-permisos": DirPermisosDesktopPage,
  "dir-patients": DirPatientsDesktopPage,
  "dir-settings": DirSettingsDesktopPage,
  "dir-profile": DirProfileDesktopPage,
  "sec-reception": SecReceptionDesktopPage,
  "sec-patients": SecPatientsDesktopPage,
  "sec-agenda": SecAgendaDesktopPage,
  "sec-link": SecLinkDesktopPage,
  "sec-profile": SecProfileDesktopPage,
  "sa-dash": SADashDesktopPage,
  "sa-inst": SAInstDesktopPage,
  "sa-inst-detail": SAInstDetailDesktopPage,
  "sa-admins": SAAdminsDesktopPage,
  "sa-audit": SAAuditDesktopPage,
  "sa-profile": SAProfileDesktopPage,
  "bitacora-pc": BitacoraDesktopPage,
  "bitacora-print": BitacoraPrintDesktopPage,
  "permisos-pc": PermisosDesktopPage,
  settings: SettingsDesktopPage
};

export function findDesktopScreen(id: string | undefined): ComponentType | undefined {
  return id ? desktopScreens[id] : undefined;
}
