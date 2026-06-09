import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/atomic/atoms/Avatar";
import { Card } from "@/atomic/atoms/Card";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon, IconKind } from "@/atomic/atoms/Icon";
import { RoundIconButton } from "@/atomic/atoms/RoundIconButton";
import { SectionLabel } from "@/atomic/atoms/SectionLabel";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DarkPanel } from "@/atomic/molecules/DarkPanel";
import { DoctorTabBar } from "@/atomic/organisms/DoctorTabBar";
import { PasswordChangePanel } from "@/atomic/organisms/PasswordChangePanel";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goToScreen, replaceScreen } from "@/navigation/screenRouter";
import { Doctor, fetchDoctor } from "@/services/api/doctorsApi";
import { getCurrentDoctorId, clearCurrentDoctorCache } from "@/services/api/currentDoctor";
import { fetchPatientsList } from "@/services/api/patientsApi";
import { fetchConsultations } from "@/services/api/consultationsApi";
import { silentOrNull } from "@/services/api/silent";
import { logout as performLogout } from "@/services/api/authedRequest";
import { loadSession } from "@/state/sessionStore";
import { CurrentUser } from "@/services/auth/authApi";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

const ACTIONS: [string, string, IconKind][] = [
  ["Mi firma electrónica", "configurada · vigente", "pen"],
  ["Plantillas clínicas", "gestiona tus formatos", "doc"],
  ["Notificaciones", "push y correo", "spark"],
  ["Privacidad y datos", "NOM-024 · paciente al centro", "shield"]
];

function initials(first: string, last: string): string {
  const a = first?.[0] ?? "";
  const b = last?.[0] ?? "";
  return (a + b).toUpperCase() || "··";
}

async function handleLogout() {
  clearCurrentDoctorCache();
  await performLogout();
}

export function MProfilePage() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [patientsCount, setPatientsCount] = useState<number | null>(null);
  const [consultationsCount, setConsultationsCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const session = await loadSession();
        const doctorId = await getCurrentDoctorId();
        const [doc, patients, consultas] = await Promise.all([
          silentOrNull(fetchDoctor(doctorId), "MProfilePage.fetchDoctor"),
          silentOrNull(fetchPatientsList({ page: 1, limit: 1 }), "MProfilePage.fetchPatientsList"),
          silentOrNull(
            fetchConsultations({ doctor_id: doctorId, page: 1, limit: 1 }),
            "MProfilePage.fetchConsultations"
          )
        ]);
        if (!cancelled) {
          setDoctor(doc);
          setUser(session.user);
          setPatientsCount(patients ? patients.total : null);
          setConsultationsCount(consultas ? consultas.total : null);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar tu perfil.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fullName = doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : "—";
  const ini = doctor ? initials(doctor.first_name, doctor.last_name) : "··";
  const phone = doctor?.contact_phone ?? "sin teléfono registrado";
  const office = doctor?.office_location ?? "consultorio sin definir";
  const email = user?.email ?? "—";
  const license = doctor?.general_license ?? "—";

  const CONTACT: [IconKind, string, string][] = [
    ["mail", email, user ? "correo de tu cuenta" : ""],
    ["phone", phone, "contacto del expediente"],
    ["pin", office, "ubicación de consulta"]
  ];

  const STATS: [string, string][] = [
    ["Pacientes", patientsCount !== null ? String(patientsCount) : "—"],
    ["Consultas", consultationsCount !== null ? String(consultationsCount) : "—"],
    ["Céd. prof.", license]
  ];

  return (
    <MobileScreen
      tabBar={<DoctorTabBar active={6} />}
      header={
        <ScreenTopBar
          sub="Cuenta · imedexp"
          title="Mi perfil"
          right={<RoundIconButton icon="edit" variant="ghost" />}
        />
      }
      contentStyle={styles.content}
    >
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FadeIn>
        <DarkPanel radius={radii.xl} padding={20} blobSize={240} blobTop={-80} blobRight={-60}>
          <View style={styles.idRow}>
            <Avatar
              initials={ini}
              size={64}
              radius={18}
              bg={colors.accentBright}
              fg={colors.ink}
              serif
              fontSize={30}
            />
            <View style={styles.flex}>
              <Text style={styles.idEyebrow}>Médico</Text>
              <Text style={styles.idName} numberOfLines={1} ellipsizeMode="tail">{fullName}</Text>
              <Text style={styles.idMeta} numberOfLines={1} ellipsizeMode="tail">
                céd. prof. <Text style={styles.idMetaStrong}>{license}</Text>
              </Text>
            </View>
          </View>
          <View style={styles.statRow}>
            {STATS.map(([k, v], index) => (
              <View
                key={k}
                style={[styles.statItem, index < 2 ? styles.statBorder : null]}
              >
                <Text style={styles.statKey}>{k}</Text>
                <Text style={styles.statValue}>{v}</Text>
              </View>
            ))}
          </View>
        </DarkPanel>
      </FadeIn>

      <FadeIn delay={70}>
        <View style={styles.specCard}>
          <View style={styles.flex}>
            <SectionLabel label="Especialidad" />
            <Text style={styles.specName} numberOfLines={1} ellipsizeMode="tail">
              {doctor?.specialty_id ? `Especialidad #${doctor.specialty_id}` : "Sin especialidad registrada"}
            </Text>
            <Text style={styles.specSub} numberOfLines={1} ellipsizeMode="tail">
              {doctor?.sub_specialty_id ? `sub-esp. #${doctor.sub_specialty_id}` : "sin sub-especialidad"}
            </Text>
          </View>
          <View style={styles.verifiedTag}>
            <Icon kind="check" size={11} color={colors.white} />
            <Text style={styles.verifiedText}>VERIFICADO</Text>
          </View>
        </View>
      </FadeIn>

      <FadeIn delay={120}>
        <SectionLabel label="Contacto" style={styles.section} />
        <Card radius={radii.lg}>
          {CONTACT.map(([icon, val, sub], index) => (
            <View
              key={`${icon}-${index}`}
              style={[styles.contactRow, index < CONTACT.length - 1 ? styles.rowBorder : null]}
            >
              <View style={styles.contactIcon}>
                <Icon kind={icon} size={15} color={colors.accentDeep} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.contactVal} numberOfLines={1} ellipsizeMode="tail">{val}</Text>
                <Text style={styles.contactSub} numberOfLines={1} ellipsizeMode="tail">{sub}</Text>
              </View>
              <Icon kind="chev" size={14} color={colors.ink3} />
            </View>
          ))}
        </Card>
      </FadeIn>

      <FadeIn delay={170}>
        <View style={styles.dualRow}>
          <Card radius={radii.lg} style={styles.dualCard}>
            <SectionLabel label="Institución" />
            <Text style={styles.dualText}>
              {doctor?.institution_id ? `Institución #${doctor.institution_id}` : "sin asignación"}
            </Text>
          </Card>
          <Card radius={radii.lg} style={styles.dualCard}>
            <SectionLabel label="Nivel" />
            <Text style={styles.dualPrice}>
              {doctor?.clearance_level !== undefined && doctor?.clearance_level !== null ? doctor.clearance_level : "—"}
            </Text>
            <Text style={styles.dualSub}>clearance</Text>
          </Card>
        </View>
      </FadeIn>

      <FadeIn delay={200}>
        <Tappable scaleTo={0.98} onPress={() => goToScreen("doc-invites-mob")}>
          <Card radius={radii.lg} style={styles.section}>
            <View style={styles.actionRow}>
              <Icon kind="mail" size={17} color={colors.accentDeep} />
              <View style={styles.flex}>
                <Text style={styles.actionTitle}>Invitaciones a clínicas</Text>
                <Text style={styles.actionSub}>revisa y responde invitaciones</Text>
              </View>
              <Icon kind="chev" size={13} color={colors.ink3} />
            </View>
          </Card>
        </Tappable>
      </FadeIn>

      <FadeIn delay={220}>
        <Card radius={radii.lg} style={styles.section}>
          {ACTIONS.map(([title, sub, icon], index) => (
            <View
              key={title}
              style={[styles.actionRow, index < ACTIONS.length - 1 ? styles.rowBorder : null]}
            >
              <Icon kind={icon} size={17} color={colors.ink2} />
              <View style={styles.flex}>
                <Text style={styles.actionTitle} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
                <Text style={styles.actionSub} numberOfLines={1} ellipsizeMode="tail">{sub}</Text>
              </View>
              <Icon kind="chev" size={13} color={colors.ink3} />
            </View>
          ))}
        </Card>
      </FadeIn>

      <FadeIn delay={245}>
        <PasswordChangePanel compact style={styles.section} />
      </FadeIn>

      <FadeIn delay={270}>
        <Tappable
          scaleTo={0.97}
          onPress={() => goToScreen("settings-mob")}
          style={styles.settingsBtn}
        >
          <Icon kind="build" size={15} color={colors.ink2} />
          <Text style={styles.settingsText}>Accesibilidad</Text>
        </Tappable>
        <Tappable scaleTo={0.97} onPress={handleLogout} style={styles.logout}>
          <Icon kind="logout" size={15} color={colors.alert} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Tappable>
        <Text style={styles.version}>imedexp · sesión activa</Text>
      </FadeIn>
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 120
  },
  flex: {
    flex: 1,
    minWidth: 0
  },
  loading: {
    paddingVertical: 12,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginBottom: 10
  },
  idRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  idEyebrow: {
    fontFamily: family.mono,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.6)"
  },
  idName: {
    fontFamily: family.medium,
    fontSize: 20,
    letterSpacing: -0.4,
    color: colors.paper,
    marginTop: 4
  },
  idMeta: {
    fontFamily: family.mono,
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4
  },
  idMetaStrong: {
    color: colors.paper
  },
  statRow: {
    flexDirection: "row",
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.12)"
  },
  statItem: {
    flex: 1
  },
  statBorder: {
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.1)"
  },
  statKey: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 1.1,
    textTransform: "uppercase"
  },
  statValue: {
    fontFamily: family.medium,
    fontSize: 19,
    letterSpacing: -0.4,
    color: colors.paper,
    marginTop: 4
  },
  specCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 14,
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  specName: {
    fontFamily: family.medium,
    fontSize: 17,
    color: colors.ink,
    marginTop: 4
  },
  specSub: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    marginTop: 2
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.accentDeep
  },
  verifiedText: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.white,
    letterSpacing: 1
  },
  section: {
    marginTop: 14
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  contactIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  contactVal: {
    fontFamily: family.regular,
    fontSize: 13.5,
    color: colors.ink
  },
  contactSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 1
  },
  dualRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14
  },
  dualCard: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  dualText: {
    fontFamily: family.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.ink,
    marginTop: 6
  },
  dualPrice: {
    fontFamily: family.medium,
    fontSize: 17,
    color: colors.ink,
    marginTop: 6
  },
  dualSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 2
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13
  },
  actionTitle: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink
  },
  actionSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 1
  },
  settingsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    height: 44,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white,
    borderRadius: radii.md
  },
  settingsText: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink2
  },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
    height: 44,
    borderWidth: 1,
    borderColor: colors.alertRule,
    backgroundColor: colors.alertSoft,
    borderRadius: radii.md
  },
  logoutText: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.alert
  },
  version: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.ink3,
    textAlign: "center",
    marginTop: 14,
    letterSpacing: 0.3
  }
});
