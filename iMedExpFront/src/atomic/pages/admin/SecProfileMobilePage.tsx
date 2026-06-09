import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { Avatar } from "@/atomic/atoms/Avatar";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { Section } from "@/atomic/molecules/Section";
import { StatTile } from "@/atomic/molecules/StatTile";
import { IconTabBar } from "@/atomic/organisms/IconTabBar";
import { PasswordChangePanel } from "@/atomic/organisms/PasswordChangePanel";
import { DarkHeroScreen } from "@/atomic/templates/DarkHeroScreen";
import { goToScreen } from "@/navigation/screenRouter";
import { secretaryTabs } from "@/navigation/tabConfigs";
import { Appointment, fetchAppointments } from "@/services/api/appointmentsApi";
import { CurrentUser, getCurrentUser } from "@/services/auth/authApi";
import { Doctor } from "@/services/api/doctorsApi";
import { fetchPatientsList } from "@/services/api/patientsApi";
import {
  fetchInstitutionDoctors,
  fetchMySecretaryProfile,
  Secretary,
  updateMySecretaryProfile
} from "@/services/api/secretaryApi";
import { silentOrEmpty, silentOrNull } from "@/services/api/silent";
import { logout as performLogout } from "@/services/api/authedRequest";
import { loadSession } from "@/state/sessionStore";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

function initialsFromEmail(email: string): string {
  const parts = email.split(/[.@]/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (email.slice(0, 2) || "··").toUpperCase();
}

function initialsFromName(name: string): string {
  return name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

async function handleLogout() {
  await performLogout();
}

export function SecProfileMobilePage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [secretaryProfile, setSecretaryProfile] = useState<Secretary | null>(null);
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    employee_number: "",
    contact_phone: ""
  });
  const [patientsCount, setPatientsCount] = useState<number>(0);
  const [weekAppts, setWeekAppts] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const session = await loadSession();
        let me: CurrentUser | null = session.user;
        if (session.tokens) {
          try {
            me = await getCurrentUser(session.tokens.access_token);
          } catch {
            me = session.user;
          }
        }
        const [patList, apptList, docList, secProfile] = await Promise.all([
          silentOrNull(fetchPatientsList({ limit: 1 }), "SecProfileMobilePage.fetchPatientsList"),
          fetchAppointments({ limit: 100 }).catch(() => ({ items: [], total: 0, page: 1, limit: 100 })),
          silentOrEmpty(fetchInstitutionDoctors(), "SecProfileMobilePage.fetchInstitutionDoctors"),
          silentOrNull(fetchMySecretaryProfile(), "SecProfileMobilePage.fetchMySecretaryProfile")
        ]);
        if (!cancelled) {
          setUser(me);
          setSecretaryProfile(secProfile);
          if (secProfile) {
            setProfileForm({
              first_name: secProfile.first_name ?? "",
              last_name: secProfile.last_name ?? "",
              employee_number: secProfile.employee_number ?? "",
              contact_phone: secProfile.contact_phone ?? ""
            });
          }
          setPatientsCount(patList?.total ?? 0);
          setWeekAppts(apptList.items ?? []);
          setDoctors(docList ?? []);
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

  const now = new Date();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const apptsThisWeek = weekAppts.filter(
    (a) => Math.abs(new Date(a.scheduled_at).getTime() - now.getTime()) < oneWeek
  ).length;

  const STATS: [string, string, string][] = [
    ["Pacientes", String(patientsCount), `${doctors.length} médicos`],
    ["Citas / sem", String(apptsThisWeek), "agenda"],
    ["Vinculaciones", "—", "este mes"],
    ["Check-in", "—", "mediana"]
  ];

  const heroLabel = user ? user.email : "—";
  const heroInitials = user ? initialsFromEmail(user.email) : "··";
  const heroRoleEyebrow = user?.role === "secretary" ? "Secretaria · recepción" : `Rol: ${user?.role ?? "—"}`;
  const profileName = secretaryProfile
    ? `${secretaryProfile.first_name} ${secretaryProfile.last_name}`.trim()
    : "";

  async function handleSaveProfile() {
    const normalizedPhone = profileForm.contact_phone.replace(/\D/g, "");
    if (normalizedPhone && normalizedPhone.length !== 10) {
      setProfileMessage("El teléfono debe tener exactamente 10 dígitos.");
      return;
    }

    setSavingProfile(true);
    setProfileMessage(null);
    try {
      const saved = await updateMySecretaryProfile({
        first_name: profileForm.first_name.trim(),
        last_name: profileForm.last_name.trim(),
        employee_number: profileForm.employee_number.trim() || null,
        contact_phone: normalizedPhone || null
      });
      setSecretaryProfile(saved);
      setProfileForm({
        first_name: saved.first_name ?? "",
        last_name: saved.last_name ?? "",
        employee_number: saved.employee_number ?? "",
        contact_phone: saved.contact_phone ?? ""
      });
      setProfileMessage("Datos actualizados.");
    } catch (err) {
      setProfileMessage(err instanceof Error ? err.message : "No pudimos guardar tus datos.");
    } finally {
      setSavingProfile(false);
    }
  }

  return (
    <DarkHeroScreen
      tabBar={<IconTabBar tabs={secretaryTabs} active={4} />}
      heroChildren={
        <View style={styles.heroRow}>
          <Avatar
            initials={heroInitials}
            size={64}
            radius={18}
            bg={colors.accentBright}
            fg={colors.ink}
            serif
            fontSize={28}
          />
          <View style={styles.flex}>
            <Text style={styles.heroEyebrow}>{heroRoleEyebrow}</Text>
            <Text style={styles.heroName}>{profileName || (user ? user.email.split("@")[0] : "—")}</Text>
            <Text style={styles.heroMeta}>{heroLabel}</Text>
          </View>
        </View>
      }
    >
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FadeIn>
        <View style={styles.statGrid}>
          {STATS.map(([k, n, s]) => (
            <StatTile key={k} label={k} value={n} sub={s} style={styles.statCell} />
          ))}
        </View>
      </FadeIn>

      <FadeIn delay={80}>
        <Section title={`Médicos asignados · ${doctors.length}`}>
          {doctors.length === 0 ? (
            <Text style={styles.empty}>Sin médicos asignados.</Text>
          ) : null}
          {doctors.map((d) => {
            const fullName = `Dr. ${d.first_name} ${d.last_name}`.trim();
            return (
              <View key={d.id} style={styles.docRow}>
                <Avatar
                  initials={initialsFromName(`${d.first_name} ${d.last_name}`)}
                  size={32}
                  radius={9}
                  bg={colors.paper3}
                  fg={colors.accentDeep}
                  serif
                  fontSize={13}
                />
                <View style={styles.flex}>
                  <Text style={styles.docName}>{fullName}</Text>
                  <Text style={styles.docSub}>
                    céd. {d.general_license}
                  </Text>
                </View>
                <Icon kind="chev" size={14} color={colors.ink3} />
              </View>
            );
          })}
        </Section>
      </FadeIn>

      <FadeIn delay={120}>
        <Section title="Editar datos">
          <Text style={styles.formLabel}>Nombre(s)</Text>
          <TextInput
            value={profileForm.first_name}
            onChangeText={(value) => setProfileForm((prev) => ({ ...prev, first_name: value }))}
            placeholder="Nombre"
            placeholderTextColor={colors.ink3}
            style={styles.input}
          />
          <Text style={styles.formLabel}>Apellidos</Text>
          <TextInput
            value={profileForm.last_name}
            onChangeText={(value) => setProfileForm((prev) => ({ ...prev, last_name: value }))}
            placeholder="Apellidos"
            placeholderTextColor={colors.ink3}
            style={styles.input}
          />
          <Text style={styles.formLabel}>No. de empleado</Text>
          <TextInput
            value={profileForm.employee_number}
            onChangeText={(value) => setProfileForm((prev) => ({ ...prev, employee_number: value }))}
            placeholder="Opcional"
            placeholderTextColor={colors.ink3}
            style={styles.input}
          />
          <Text style={styles.formLabel}>Teléfono</Text>
          <TextInput
            value={profileForm.contact_phone}
            onChangeText={(value) =>
              setProfileForm((prev) => ({
                ...prev,
                contact_phone: value.replace(/\D/g, "").slice(0, 10)
              }))
            }
            placeholder="10 dígitos"
            placeholderTextColor={colors.ink3}
            keyboardType="phone-pad"
            style={styles.input}
          />
          {profileMessage ? <Text style={styles.formMessage}>{profileMessage}</Text> : null}
          <Tappable
            scaleTo={0.97}
            onPress={handleSaveProfile}
            style={[styles.saveBtn, savingProfile ? styles.saveBtnDisabled : null]}
          >
            <Icon kind="check" size={15} color={colors.ink} />
            <Text style={styles.saveText}>{savingProfile ? "Guardando" : "Guardar datos"}</Text>
          </Tappable>
        </Section>
      </FadeIn>

      <FadeIn delay={160}>
        <PasswordChangePanel compact />
      </FadeIn>

      <FadeIn delay={200}>
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
    </DarkHeroScreen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
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
  empty: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    paddingVertical: 12,
    textAlign: "center"
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  heroEyebrow: {
    fontFamily: family.mono,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.6)"
  },
  heroName: {
    fontFamily: family.serifItalic,
    fontSize: 24,
    color: colors.paper,
    marginTop: 4
  },
  heroMeta: {
    fontFamily: family.mono,
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  statCell: {
    width: "48%",
    maxWidth: "48%",
    flexBasis: "48%",
    flexGrow: 0,
    flexShrink: 0
  },
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    marginBottom: 6
  },
  docName: {
    fontFamily: family.medium,
    fontSize: 12.5,
    color: colors.ink
  },
  docSub: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3
  },
  formLabel: {
    fontFamily: family.medium,
    fontSize: 11.5,
    color: colors.ink2,
    marginBottom: 6,
    marginTop: 8
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    color: colors.ink,
    fontFamily: family.regular,
    fontSize: 13,
    paddingHorizontal: 12,
    marginBottom: 4
  },
  formMessage: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 8
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    height: 42,
    borderRadius: radii.md,
    backgroundColor: colors.accentBright
  },
  saveBtnDisabled: {
    opacity: 0.65
  },
  saveText: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  settingsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 18,
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
