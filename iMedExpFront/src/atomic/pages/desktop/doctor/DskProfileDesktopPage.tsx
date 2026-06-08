import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon, IconKind } from "@/atomic/atoms/Icon";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { TextField } from "@/atomic/atoms/TextField";
import { Tappable } from "@/atomic/atoms/Tappable";
import { PasswordChangePanel } from "@/atomic/organisms/PasswordChangePanel";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { doctorNav } from "@/navigation/desktopNavConfigs";
import { goToScreen } from "@/navigation/screenRouter";
import { getCurrentDoctorId, clearCurrentDoctorCache } from "@/services/api/currentDoctor";
import { fetchDoctor, Doctor, updateDoctor } from "@/services/api/doctorsApi";
import { logout as performLogout } from "@/services/api/authedRequest";
import { loadSession } from "@/state/sessionStore";
import { colors, radii, shadow } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

type ProfileState = {
  loading: boolean;
  error: string | null;
  doctor: Doctor | null;
  email: string;
};

type DoctorDraft = {
  first_name: string;
  last_name: string;
  contact_phone: string;
  office_location: string;
  specialty_license: string;
  graduation_university: string;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function DskProfileDesktopPage() {
  const [state, setState] = useState<ProfileState>({ loading: true, error: null, doctor: null, email: "" });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<DoctorDraft>({
    first_name: "",
    last_name: "",
    contact_phone: "",
    office_location: "",
    specialty_license: "",
    graduation_university: ""
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const session = await loadSession();
        const email = session.user?.email ?? "";
        const doctorId = await getCurrentDoctorId();
        const doctor = await fetchDoctor(doctorId);
        if (cancelled) {
          return;
        }
        setState({ loading: false, error: null, doctor, email });
        setDraft({
          first_name: doctor.first_name ?? "",
          last_name: doctor.last_name ?? "",
          contact_phone: doctor.contact_phone ?? "",
          office_location: doctor.office_location ?? "",
          specialty_license: doctor.specialty_license ?? "",
          graduation_university: doctor.graduation_university ?? ""
        });
      } catch (err) {
        if (cancelled) {
          return;
        }
        setState({
          loading: false,
          error: err instanceof Error ? err.message : "No pudimos cargar tu perfil.",
          doctor: null,
          email: ""
        });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    clearCurrentDoctorCache();
    await performLogout();
  }

  function beginEdit() {
    if (!state.doctor) return;
    setDraft({
      first_name: state.doctor.first_name ?? "",
      last_name: state.doctor.last_name ?? "",
      contact_phone: state.doctor.contact_phone ?? "",
      office_location: state.doctor.office_location ?? "",
      specialty_license: state.doctor.specialty_license ?? "",
      graduation_university: state.doctor.graduation_university ?? ""
    });
    setSaveError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setSaveError(null);
    setEditing(false);
  }

  async function saveProfile() {
    if (!state.doctor || saving) return;
    const cedula = draft.specialty_license.trim();
    if (cedula && !/^\d{7,8}$/.test(cedula)) {
      setSaveError("La cédula de especialidad debe tener entre 7 y 8 dígitos numéricos.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await updateDoctor(state.doctor.id, {
        first_name: draft.first_name.trim(),
        last_name: draft.last_name.trim(),
        contact_phone: draft.contact_phone.trim() || null,
        office_location: draft.office_location.trim() || null,
        specialty_license: draft.specialty_license.trim() || null,
        graduation_university: draft.graduation_university.trim() || null
      });
      setState((prev) => ({ ...prev, doctor: updated }));
      setEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "No pudimos guardar tu perfil.");
    } finally {
      setSaving(false);
    }
  }

  function setDraftField<K extends keyof DoctorDraft>(key: K, value: DoctorDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  const fullName = state.doctor ? `Dr. ${state.doctor.first_name} ${state.doctor.last_name}`.trim() : "Doctor";

  const contact: [IconKind, string, string, boolean][] = state.doctor
    ? [
        ["mail", state.email || "—", state.email ? "verificado · principal" : "sin correo", false],
        ["phone", state.doctor.contact_phone ?? "—", state.doctor.contact_phone ? "móvil" : "sin teléfono", true],
        ["pin", state.doctor.office_location ?? "—", state.doctor.office_location ? "consultorio" : "sin ubicación", true]
      ]
    : [];

  const settings: [IconKind, string, string, string][] = state.doctor
    ? [
        ["doc", "Cédula profesional", state.doctor.general_license, "general"],
        ["pen", "Cédula de especialidad", state.doctor.specialty_license ?? "sin cédula de especialidad", state.doctor.specialty_license ? "vigente" : ""],
        ["shield", "Nivel de clearance", `Nivel ${state.doctor.clearance_level}`, ""]
      ]
    : [];

  return (
    <DesktopShell
      nav={doctorNav}
      activeScreen="dsk-profile"
      role="médico"
      roleBadge="Médico"
      title="Mi perfil"
      eyebrow="Cuenta · imedexp"
      topBarRight={
        <View style={styles.topActions}>
          {editing ? (
            <>
              <Button
                label="Cancelar"
                variant="ghost"
                size="sm"
                block={false}
                height={42}
                radius={radii.md}
                onPress={cancelEdit}
                disabled={saving}
              />
              <Button
                label={saving ? "Guardando..." : "Guardar"}
                iconLeft="check"
                variant="accent"
                size="sm"
                block={false}
                height={42}
                radius={radii.md}
                onPress={saveProfile}
                disabled={saving}
              />
            </>
          ) : (
            <>
              <Button
                label="Editar"
                iconLeft="edit"
                variant="accent"
                size="sm"
                block={false}
                height={42}
                radius={radii.md}
                onPress={beginEdit}
              />
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
            </>
          )}
        </View>
      }
    >
      {state.loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.accentDeep} />
          <Text style={styles.loadingText}>Cargando tu perfil…</Text>
        </View>
      ) : state.error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{state.error}</Text>
        </View>
      ) : !state.doctor ? null : (
        <>
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
                  <Text style={styles.heroAvatarText}>{initials(`${state.doctor.first_name} ${state.doctor.last_name}`)}</Text>
                </View>
                <View style={styles.heroMid}>
                  <Text style={styles.heroEyebrow}>Médico · imedexp</Text>
                  <Text
                    style={styles.heroName}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.6}
                  >
                    {fullName}
                  </Text>
                  <View style={styles.heroMetaRow}>
                    <Text style={styles.heroMetaMono} numberOfLines={1} ellipsizeMode="tail">céd. {state.doctor.general_license}</Text>
                    {state.doctor.specialty_license ? (
                      <>
                        <View style={styles.heroMetaSep} />
                        <Text style={styles.heroMetaMono} numberOfLines={1} ellipsizeMode="tail">esp. {state.doctor.specialty_license}</Text>
                      </>
                    ) : null}
                    <View style={styles.heroVerified}>
                      <Icon kind="check" size={10} color={colors.accentBright} />
                      <Text style={styles.heroVerifiedText}>verificado</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.heroStats}>
                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatLabel}>ID</Text>
                    <Text style={styles.heroStatValue}>#{state.doctor.id}</Text>
                  </View>
                </View>
              </View>
            </View>
          </FadeIn>

          <View style={styles.cols}>
            <View style={styles.colLeft}>
              {editing ? (
                <FadeIn delay={80}>
                  <View style={styles.panel}>
                    <View style={styles.panelHead}>
                      <Text style={styles.panelTitle}>Editar datos del médico</Text>
                    </View>
                    <View style={styles.editGrid}>
                      <TextField
                        label="Nombre"
                        value={draft.first_name}
                        onChangeText={(v) => setDraftField("first_name", v)}
                      />
                      <TextField
                        label="Apellidos"
                        value={draft.last_name}
                        onChangeText={(v) => setDraftField("last_name", v)}
                      />
                      <TextField
                        label="Teléfono"
                        value={draft.contact_phone}
                        onChangeText={(v) => setDraftField("contact_phone", v)}
                        keyboardType="phone-pad"
                        placeholder="10 dígitos"
                      />
                      <TextField
                        label="Consultorio"
                        value={draft.office_location}
                        onChangeText={(v) => setDraftField("office_location", v)}
                      />
                      <TextField
                        label="Cédula de especialidad"
                        value={draft.specialty_license}
                        onChangeText={(v) => setDraftField("specialty_license", v)}
                      />
                      <TextField
                        label="Universidad"
                        value={draft.graduation_university}
                        onChangeText={(v) => setDraftField("graduation_university", v)}
                      />
                    </View>
                    {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}
                  </View>
                </FadeIn>
              ) : null}
              <FadeIn delay={100}>
                <View style={styles.panel}>
                  <View style={styles.panelHead}>
                    <Text style={styles.panelTitle}>Datos de contacto</Text>
                  </View>
                  {contact.map(([icon, val, sub, editable], i) => {
                    const rowStyle = [styles.contactRow, i < contact.length - 1 && styles.contactRowBorder];
                    const rowContent = (
                      <>
                        <View style={styles.contactIcon}>
                          <Icon kind={icon} size={14} color={colors.accentDeep} />
                        </View>
                        <View style={styles.contactInfo}>
                          <Text style={styles.contactVal} numberOfLines={1} ellipsizeMode="tail">{val}</Text>
                          <Text style={styles.contactSub} numberOfLines={1} ellipsizeMode="tail">{sub}</Text>
                        </View>
                        {editable ? <Icon kind="edit" size={13} color={colors.ink3} /> : <View style={styles.contactReadonlySpacer} />}
                      </>
                    );
                    return editable ? (
                      <Tappable key={val + i} onPress={beginEdit} scaleTo={0.99} style={rowStyle}>
                        {rowContent}
                      </Tappable>
                    ) : (
                      <View key={val + i} style={rowStyle}>
                        {rowContent}
                      </View>
                    );
                  })}
                </View>
              </FadeIn>
            </View>

            <View style={styles.colRight}>
              <FadeIn delay={220}>
                <View style={styles.panel}>
                  <View style={styles.panelHead}>
                    <Text style={styles.panelTitle}>Configuración profesional</Text>
                  </View>
                  {settings.map(([icon, k, sub, badge], i) => (
                    <Tappable
                      key={k}
                      onPress={beginEdit}
                      scaleTo={0.99}
                      style={[styles.settingRow, i < settings.length - 1 && styles.settingRowBorder]}
                    >
                      <Icon kind={icon} size={17} color={colors.ink2} />
                      <View style={styles.settingInfo}>
                        <Text style={styles.settingTitle} numberOfLines={1} ellipsizeMode="tail">{k}</Text>
                        <Text style={styles.settingSub} numberOfLines={1} ellipsizeMode="tail">{sub}</Text>
                      </View>
                      {badge ? (
                        <View style={styles.settingBadge}>
                          <Text style={styles.settingBadgeText}>{badge}</Text>
                        </View>
                      ) : null}
                      <Icon kind="chev" size={13} color={colors.ink3} />
                    </Tappable>
                  ))}
                </View>
              </FadeIn>

              <FadeIn delay={280}>
                <PasswordChangePanel />
              </FadeIn>

              <FadeIn delay={320}>
                <View style={styles.logoutCard}>
                  <View style={styles.logoutInfo}>
                    <Text style={styles.logoutTitle} numberOfLines={1}>Cerrar sesión</Text>
                    <Text style={styles.logoutSub} numberOfLines={1} ellipsizeMode="tail">
                      {state.email ? `Sesión activa con ${state.email}` : "Sesión activa"}
                    </Text>
                  </View>
                  <Tappable onPress={handleLogout} scaleTo={0.97} style={styles.logoutBtn}>
                    <Icon kind="logout" size={13} color={colors.alert} />
                    <Text style={styles.logoutBtnText}>Salir</Text>
                  </Tappable>
                </View>
              </FadeIn>

              <Text style={styles.versionLine}>
                imedexp · operativo
              </Text>
            </View>
          </View>
        </>
      )}
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap"
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
    minWidth: 0
  },
  heroEyebrow: {
    ...text.eyebrow,
    color: "rgba(255,255,255,0.6)"
  },
  heroName: {
    fontFamily: family.serifItalic,
    fontSize: 44,
    lineHeight: 50,
    letterSpacing: -0.9,
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
  heroVerified: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.14)"
  },
  heroVerifiedText: {
    fontFamily: family.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.paper,
    textTransform: "uppercase"
  },
  heroStats: {
    flexDirection: "row",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.12)",
    paddingLeft: 28
  },
  heroStatItem: {
    paddingRight: 18
  },
  heroStatLabel: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 1.1,
    textTransform: "uppercase"
  },
  heroStatValue: {
    fontFamily: family.medium,
    fontSize: 26,
    letterSpacing: -0.5,
    color: colors.paper,
    marginTop: 4
  },
  cols: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 16
  },
  colLeft: {
    flexBasis: "48%",
    flexGrow: 1,
    minWidth: 320,
    gap: 12
  },
  colRight: {
    flexBasis: "48%",
    flexGrow: 1,
    minWidth: 320,
    gap: 12
  },
  panel: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  panelHead: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  panelTitle: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  editGrid: {
    padding: 18,
    gap: 12
  },
  saveError: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    paddingHorizontal: 18,
    paddingBottom: 16
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 12
  },
  contactRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.rule3
  },
  contactIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  contactInfo: {
    flex: 1,
    minWidth: 0
  },
  contactReadonlySpacer: {
    width: 13
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
    marginTop: 2
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 13
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.rule3
  },
  settingInfo: {
    flex: 1,
    minWidth: 0
  },
  settingTitle: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink
  },
  settingSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 2
  },
  settingBadge: {
    backgroundColor: "rgba(28,140,90,0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill
  },
  settingBadgeText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.ok,
    letterSpacing: 0.8
  },
  logoutCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    paddingHorizontal: 18,
    paddingVertical: 14
  },
  logoutInfo: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12
  },
  logoutTitle: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.alert
  },
  logoutSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 2
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.alertRule,
    backgroundColor: colors.alertSoft
  },
  logoutBtnText: {
    fontFamily: family.medium,
    fontSize: 12.5,
    color: colors.alert
  },
  versionLine: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    textAlign: "center",
    letterSpacing: 0.4
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 24,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg
  },
  loadingText: {
    fontFamily: family.regular,
    fontSize: 13.5,
    color: colors.ink2
  },
  errorBox: {
    padding: 18,
    borderRadius: radii.md,
    backgroundColor: colors.alertSoft,
    borderWidth: 1,
    borderColor: colors.alertRule
  },
  errorText: {
    fontFamily: family.regular,
    fontSize: 13.5,
    color: colors.alert
  }
});
