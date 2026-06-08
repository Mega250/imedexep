import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { Tappable } from "@/atomic/atoms/Tappable";
import { PasswordChangePanel } from "@/atomic/organisms/PasswordChangePanel";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { secretaryNav } from "@/navigation/desktopNavConfigs";
import { goToScreen } from "@/navigation/screenRouter";
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
import { colors, radii, shadow } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

function initialsFromEmail(email: string): string {
  const parts = email.split(/[.@]/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (email.slice(0, 2) || "··").toUpperCase();
}

function doctorInitials(name: string) {
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

export function SecProfileDesktopPage() {
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
          silentOrNull(fetchPatientsList({ limit: 1 }), "SecProfileDesktopPage.fetchPatientsList"),
          fetchAppointments({ limit: 100 }).catch(() => ({ items: [], total: 0, page: 1, limit: 100 })),
          silentOrEmpty(fetchInstitutionDoctors(), "SecProfileDesktopPage.fetchInstitutionDoctors"),
          silentOrNull(fetchMySecretaryProfile(), "SecProfileDesktopPage.fetchMySecretaryProfile")
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

  const STATS = [
    { k: "Pacientes que atiende", n: String(patientsCount), sub: `${doctors.length} médicos asignados` },
    { k: "Citas gestionadas / sem", n: String(apptsThisWeek), sub: "agenda de la semana" },
    { k: "Médicos en clínica", n: String(doctors.length), sub: "activos" },
    { k: "Rol", n: user?.role ?? "—", sub: `inst. #${user?.institution_id ?? "—"}` }
  ];

  const heroEmail = user?.email ?? "—";
  const heroInitials = user ? initialsFromEmail(user.email) : "··";
  const profileName = secretaryProfile
    ? `${secretaryProfile.first_name} ${secretaryProfile.last_name}`.trim()
    : "";
  const heroName = profileName || (user ? user.email.split("@")[0] : "—");

  const PERSONAL: [string, string][] = user
    ? [
        ["Correo", user.email],
        ["Rol", user.role],
        ["Institución", user.institution_id ? `#${user.institution_id}` : "—"],
        ["Estado", user.is_active ? "Activa" : "Inactiva"],
        ["ID", `#${user.id}`]
      ]
    : [];

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
    <DesktopShell
      nav={secretaryNav}
      activeScreen="sec-profile"
      role="secretaria · clínica"
      roleBadge="Secretaria"
      title="Mi cuenta"
      eyebrow="Secretaria · imedexp"
      topBarRight={
        <Button
          label="Accesibilidad"
          iconLeft="eye"
          variant="ghost"
          size="sm"
          block={false}
          height={42}
          radius={radii.md}
          onPress={() => goToScreen("settings")}
        />
      }
    >
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FadeIn>
        <View style={styles.hero}>
          <RadialBlob
            size={360}
            color={colors.accentBright}
            opacity={0.28}
            edge={70}
            style={{ top: -120, right: -90 }}
          />
          <View style={styles.heroInner}>
            <View style={styles.heroAvatar}>
              <Text style={styles.heroAvatarText}>{heroInitials}</Text>
            </View>
            <View style={styles.heroMid}>
              <Text style={styles.heroEyebrow}>Secretaria · recepción</Text>
              <Text style={styles.heroName}>{heroName}</Text>
              <View style={styles.heroMetaRow}>
                <Text style={styles.heroMeta}>{heroEmail}</Text>
                <View style={styles.heroMetaSep} />
                <Text style={styles.heroMeta}>{doctors.length} médicos asignados</Text>
                <View style={styles.heroMetaSep} />
                <Text style={styles.heroMetaMono}>
                  inst. #{user?.institution_id ?? "—"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </FadeIn>

      <FadeIn delay={100}>
        <View style={styles.statRow}>
          {STATS.map((s) => (
            <View key={s.k} style={styles.statCard}>
              <Text style={styles.eyebrow}>{s.k}</Text>
              <Text style={styles.statValue}>{s.n}</Text>
              <Text style={styles.statSub}>{s.sub}</Text>
            </View>
          ))}
        </View>
      </FadeIn>

      <FadeIn delay={140}>
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>Editar datos de secretaria</Text>
          </View>
          <View style={styles.formGrid}>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Nombre(s)</Text>
              <TextInput
                value={profileForm.first_name}
                onChangeText={(value) => setProfileForm((prev) => ({ ...prev, first_name: value }))}
                placeholder="Nombre"
                placeholderTextColor={colors.ink3}
                style={styles.input}
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Apellidos</Text>
              <TextInput
                value={profileForm.last_name}
                onChangeText={(value) => setProfileForm((prev) => ({ ...prev, last_name: value }))}
                placeholder="Apellidos"
                placeholderTextColor={colors.ink3}
                style={styles.input}
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>No. de empleado</Text>
              <TextInput
                value={profileForm.employee_number}
                onChangeText={(value) => setProfileForm((prev) => ({ ...prev, employee_number: value }))}
                placeholder="Opcional"
                placeholderTextColor={colors.ink3}
                style={styles.input}
              />
            </View>
            <View style={styles.formField}>
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
            </View>
          </View>
          <View style={styles.formFooter}>
            {profileMessage ? <Text style={styles.formMessage}>{profileMessage}</Text> : <View />}
            <Button
              label={savingProfile ? "Guardando" : "Guardar datos"}
              iconLeft="check"
              variant="primary"
              size="sm"
              block={false}
              disabled={savingProfile}
              onPress={handleSaveProfile}
            />
          </View>
        </View>
      </FadeIn>

      <View style={styles.cardGrid}>
        <FadeIn delay={160} style={styles.cardCell}>
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>Datos de cuenta</Text>
            </View>
            <View style={styles.personalGrid}>
              {PERSONAL.length === 0 ? (
                <Text style={styles.empty}>Sin datos de sesión.</Text>
              ) : null}
              {PERSONAL.map(([k, v]) => (
                <View key={k} style={styles.personalCell}>
                  <Text style={styles.personalLabel}>{k}</Text>
                  <Text style={styles.personalValue}>{v}</Text>
                </View>
              ))}
            </View>
          </View>
        </FadeIn>

        <FadeIn delay={220} style={styles.cardCell}>
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>Médicos asignados · {doctors.length}</Text>
            </View>
            <View style={styles.doctorList}>
              {doctors.length === 0 ? (
                <Text style={styles.empty}>Sin médicos en la institución.</Text>
              ) : null}
              {doctors.map((d) => {
                const fullName = `Dr. ${d.first_name} ${d.last_name}`.trim();
                return (
                  <Tappable
                    key={d.id}
                    onPress={() => goToScreen("sec-agenda", { doctorId: d.id })}
                    scaleTo={0.99}
                    style={styles.doctorRow}
                  >
                    <View style={styles.doctorAvatar}>
                      <Text style={styles.doctorAvatarText}>
                        {doctorInitials(`${d.first_name} ${d.last_name}`)}
                      </Text>
                    </View>
                    <View style={styles.doctorInfo}>
                      <Text style={styles.doctorName}>{fullName}</Text>
                      <Text style={styles.doctorMeta}>
                        céd. {d.general_license}
                        {d.contact_phone ? ` · ${d.contact_phone}` : ""}
                      </Text>
                    </View>
                    <Text style={styles.doctorLink}>Ver agenda →</Text>
                  </Tappable>
                );
              })}
            </View>
          </View>
        </FadeIn>
      </View>

      <FadeIn delay={280}>
        <PasswordChangePanel style={styles.securityPanel} />
      </FadeIn>

      <FadeIn delay={320}>
        <Tappable scaleTo={0.99} onPress={handleLogout} style={styles.logout}>
          <Icon kind="logout" size={15} color={colors.alert} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Tappable>
      </FadeIn>
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    ...text.eyebrow,
    color: colors.ink3
  },
  loading: {
    paddingVertical: 18,
    alignItems: "center"
  },
  errorText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginBottom: 10
  },
  empty: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    padding: 14,
    textAlign: "center"
  },
  hero: {
    backgroundColor: colors.ink,
    borderRadius: radii.xl,
    paddingHorizontal: 32,
    paddingVertical: 28,
    overflow: "hidden",
    ...shadow.card
  },
  heroInner: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    flexWrap: "wrap"
  },
  heroAvatar: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: colors.accentBright,
    alignItems: "center",
    justifyContent: "center"
  },
  heroAvatarText: {
    fontFamily: family.serifItalic,
    fontSize: 48,
    color: colors.ink
  },
  heroMid: {
    flex: 1,
    minWidth: 280
  },
  heroEyebrow: {
    ...text.eyebrow,
    color: "rgba(255,255,255,0.6)"
  },
  heroName: {
    fontFamily: family.serifItalic,
    fontSize: 44,
    lineHeight: 44,
    letterSpacing: -0.88,
    color: colors.paper,
    marginTop: 8
  },
  heroMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 10
  },
  heroMeta: {
    fontFamily: family.regular,
    fontSize: 13.5,
    color: "rgba(255,255,255,0.7)"
  },
  heroMetaMono: {
    fontFamily: family.mono,
    fontSize: 13.5,
    color: "rgba(255,255,255,0.7)"
  },
  heroMetaSep: {
    width: 1,
    height: 12,
    backgroundColor: "rgba(255,255,255,0.2)"
  },
  statRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 18
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 180,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  statValue: {
    fontFamily: family.medium,
    fontSize: 28,
    letterSpacing: -0.84,
    color: colors.ink,
    marginTop: 6,
    lineHeight: 28
  },
  statSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 6
  },
  formGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 18
  },
  formField: {
    flexGrow: 1,
    flexBasis: "45%",
    minWidth: 220
  },
  formLabel: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.ink2,
    marginBottom: 7
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    color: colors.ink,
    fontFamily: family.regular,
    fontSize: 14,
    paddingHorizontal: 14
  },
  formFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 18
  },
  formMessage: {
    flex: 1,
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 18
  },
  cardCell: {
    flexBasis: "48%",
    flexGrow: 1,
    minWidth: 320
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  cardHead: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  cardTitle: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  personalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 18
  },
  personalCell: {
    flexGrow: 1,
    flexBasis: "45%",
    minWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.paper,
    borderRadius: radii.md
  },
  personalLabel: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  personalValue: {
    fontFamily: family.mono,
    fontSize: 12.5,
    color: colors.ink,
    marginTop: 4
  },
  doctorList: {
    padding: 18,
    gap: 8
  },
  doctorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.paper,
    borderRadius: radii.md
  },
  doctorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  doctorAvatarText: {
    fontFamily: family.serifItalic,
    fontSize: 14,
    color: colors.accentDeep
  },
  doctorInfo: {
    flex: 1,
    minWidth: 0
  },
  doctorName: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  doctorMeta: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3
  },
  doctorLink: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.accentDeep
  },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 18,
    height: 48,
    borderWidth: 1,
    borderColor: colors.alertRule,
    backgroundColor: colors.alertSoft,
    borderRadius: radii.md
  },
  securityPanel: {
    marginTop: 18
  },
  logoutText: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.alert
  }
});
