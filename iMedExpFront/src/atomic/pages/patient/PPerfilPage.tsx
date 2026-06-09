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
import { PatientTabBar } from "@/atomic/organisms/PatientTabBar";
import { PasswordChangePanel } from "@/atomic/organisms/PasswordChangePanel";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goToScreen, replaceScreen } from "@/navigation/screenRouter";
import { clearCurrentPatientCache, getCurrentPatientId } from "@/services/api/currentPatient";
import { Patient, SocioeconomicData, fetchPatient, fetchSocioeconomic } from "@/services/api/patientsApi";
import { logout as performLogout } from "@/services/api/authedRequest";
import { loadSession } from "@/state/sessionStore";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";
import { formatDateLocal } from "@/utils/dates";

function calcAge(dob: string): number {
  const d = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) {
    age -= 1;
  }
  return age;
}

function genderLabel(value: string | null): string {
  if (!value) {
    return "—";
  }
  const map: Record<string, string> = { M: "Masculino", F: "Femenino", O: "Otro" };
  return map[value] ?? value;
}

async function logout() {
  clearCurrentPatientCache();
  await performLogout();
}

export function PPerfilPage() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [email, setEmail] = useState<string>("");
  const [soc, setSoc] = useState<SocioeconomicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [patientId, session] = await Promise.all([getCurrentPatientId(), loadSession()]);
        const [data, socData] = await Promise.all([
          fetchPatient(patientId),
          fetchSocioeconomic(patientId).catch(() => null)
        ]);
        if (!cancelled) {
          setPatient(data);
          setSoc(socData);
          setEmail(session.user?.email ?? "");
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

  const initials = patient
    ? `${patient.first_name?.[0] ?? ""}${patient.last_name?.[0] ?? ""}`.toUpperCase()
    : "··";
  const fullName = patient ? `${patient.first_name} ${patient.last_name}` : "—";
  const age = patient ? `${calcAge(patient.date_of_birth)} años` : "—";
  const bloodType = patient?.blood_type ?? "—";

  const personal: [string, string][] = [
    ["Nombre", fullName],
    ["Edad", patient ? `${age} · ${formatDateLocal(patient.date_of_birth)}` : "—"],
    ["Género", genderLabel(patient?.gender ?? null)],
    ["Sangre", bloodType]
  ];

  const contact: [IconKind, string, string][] = [
    ["mail", email || "—", "correo registrado"],
    [
      "pin",
      patient && patient.city ? `${patient.city}${patient.state ? ` · ${patient.state}` : ""}` : "—",
      "ciudad registrada"
    ]
  ];

  return (
    <MobileScreen
      tabBar={<PatientTabBar active={4} />}
      header={
        <ScreenTopBar
          sub="Cuenta · paciente"
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
        <DarkPanel radius={radii.xl} padding={18} blobSize={240} blobTop={-80} blobRight={-60}>
          <View style={styles.idRow}>
            <Avatar
              initials={initials}
              size={64}
              radius={18}
              bg={colors.accentBright}
              fg={colors.ink}
              serif
              fontSize={30}
            />
            <View style={styles.flex}>
              <Text style={styles.idName} numberOfLines={1} adjustsFontSizeToFit>{fullName}</Text>
              <Text style={styles.idMeta} numberOfLines={1}>
                {patient ? `${age} · ${bloodType}` : "—"}
              </Text>
            </View>
          </View>
        </DarkPanel>
      </FadeIn>

      <FadeIn delay={120}>
        <SectionLabel label="Datos personales" style={styles.section} />
        <Card radius={radii.lg}>
          {personal.map(([key, value], index) => (
            <View
              key={key}
              style={[styles.dataRow, index < personal.length - 1 ? styles.rowBorder : null]}
            >
              <Text style={styles.dataKey}>{key}</Text>
              <Text style={styles.dataValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
              <Icon kind="edit" size={12} color={colors.ink3} />
            </View>
          ))}
        </Card>
      </FadeIn>

      <FadeIn delay={170}>
        <SectionLabel label="Contacto" style={styles.section} />
        <Card radius={radii.lg}>
          {contact.map(([icon, value, sub], index) => (
            <View
              key={`${value}-${index}`}
              style={[styles.contactRow, index < contact.length - 1 ? styles.rowBorder : null]}
            >
              <Icon kind={icon} size={15} color={colors.ink2} />
              <View style={styles.flex}>
                <Text style={styles.contactValue} numberOfLines={1} ellipsizeMode="middle">{value}</Text>
                <Text style={styles.contactSub}>{sub}</Text>
              </View>
              <Icon kind="edit" size={12} color={colors.ink3} />
            </View>
          ))}
        </Card>
      </FadeIn>

      <FadeIn delay={210}>
        <SectionLabel label="Condiciones del hogar" style={styles.section} />
        {soc && Object.values(soc).some((v) => v !== null && v !== "") ? (
          <Card radius={radii.lg}>
            {([
              ["Drenaje", soc.drainage],
              ["Agua potable", soc.water],
              ["Electricidad", soc.electricity],
              ["Personas en el hogar", soc.household_members],
              ["Material p/cocinar", soc.cooking_material],
              ["Método p/cocinar", soc.cooking_method]
            ] as [string, string | null][])
              .filter(([, v]) => v !== null)
              .map(([key, value], index, arr) => (
                <View
                  key={key}
                  style={[styles.dataRow, index < arr.length - 1 ? styles.rowBorder : null]}
                >
                  <Text style={styles.dataKey}>{key}</Text>
                  <Text style={styles.dataValue}>{value}</Text>
                </View>
              ))}
          </Card>
        ) : (
          <View style={styles.socPending}>
            <Icon kind="home" size={15} color={colors.ink3} />
            <Text style={styles.socPendingText}>
              Pendiente · tu médico registrará esta información en tu primera consulta.
            </Text>
          </View>
        )}
      </FadeIn>

      <FadeIn delay={230}>
        <PasswordChangePanel compact style={styles.section} />
      </FadeIn>

      <FadeIn delay={270}>
        <Tappable
          scaleTo={0.97}
          onPress={() => goToScreen("settings-mob")}
          style={styles.settingsBtn}
        >
          <Icon kind="build" size={14} color={colors.ink2} />
          <Text style={styles.settingsText}>Accesibilidad</Text>
        </Tappable>
        <Tappable scaleTo={0.97} onPress={logout} style={styles.logout}>
          <Icon kind="logout" size={14} color={colors.alert} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Tappable>
        <Text style={styles.version}>imedexp · paciente</Text>
      </FadeIn>
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 22,
    paddingTop: 16,
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
  idName: {
    fontFamily: family.medium,
    fontSize: 19,
    letterSpacing: -0.4,
    color: colors.paper
  },
  idMeta: {
    fontFamily: family.mono,
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4
  },
  section: {
    marginTop: 18,
    marginBottom: 8
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.rule3
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 11
  },
  dataKey: {
    width: 90,
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    letterSpacing: 0.7,
    textTransform: "uppercase"
  },
  dataValue: {
    flex: 1,
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11
  },
  contactValue: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink
  },
  contactSub: {
    fontFamily: family.mono,
    fontSize: 10,
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
  socPending: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    padding: 14
  },
  socPendingText: {
    flex: 1,
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.ink3,
    lineHeight: 18
  },
  version: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.ink3,
    textAlign: "center",
    marginTop: 12,
    letterSpacing: 0.3
  }
});
