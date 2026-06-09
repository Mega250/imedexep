import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/atomic/atoms/Avatar";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { TextField } from "@/atomic/atoms/TextField";
import { Tappable } from "@/atomic/atoms/Tappable";
import { PasswordChangePanel } from "@/atomic/organisms/PasswordChangePanel";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { usePatientDesktopNav } from "@/navigation/patientNavVisibility";
import { goToScreen } from "@/navigation/screenRouter";
import {
  clearCurrentPatientCache,
  getCurrentPatientId
} from "@/services/api/currentPatient";
import {
  PatientFull,
  SocioeconomicData,
  fetchPatientFull,
  fetchSocioeconomic,
  updatePatientAuthed
} from "@/services/api/patientsApi";
import { logout as performLogout } from "@/services/api/authedRequest";
import { loadSession } from "@/state/sessionStore";
import { colors, radii, shadow } from "@/theme/tokens";
import { family, text } from "@/theme/typography";
import { formatDateLocal } from "@/utils/dates";
import { validatePhoneMx } from "@/utils/validators";

type PatientDraft = {
  first_name: string;
  last_name: string;
  gender: string;
  blood_type: string;
  phone: string;
  street_address: string;
  neighborhood: string;
  postal_code: string;
  city: string;
  state: string;
};

const GENDER_OPTIONS = [
  { label: "Hombre", value: "M" },
  { label: "Mujer", value: "F" },
  { label: "Otro", value: "O" }
];

const BLOOD_OPTIONS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"];

function calcAge(dob: string): number {
  const d = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

function genderLabel(value: string | null | undefined): string {
  if (!value) return "-";
  return { M: "Hombre", F: "Mujer", O: "Otro" }[value] ?? value;
}

function initials(first: string, last: string): string {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "DA";
}

function draftFromPatient(patient: PatientFull): PatientDraft {
  return {
    first_name: patient.first_name ?? "",
    last_name: patient.last_name ?? "",
    gender: patient.gender ?? "",
    blood_type: patient.blood_type ?? "",
    phone: patient.phone ?? "",
    street_address: patient.street_address ?? "",
    neighborhood: patient.neighborhood ?? "",
    postal_code: patient.postal_code ?? "",
    city: patient.city ?? "",
    state: patient.state ?? ""
  };
}

export function PdPerfilDesktopPage() {
  const nav = usePatientDesktopNav();
  const [patient, setPatient] = useState<PatientFull | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<PatientDraft>(() => ({
    first_name: "",
    last_name: "",
    gender: "",
    blood_type: "",
    phone: "",
    street_address: "",
    neighborhood: "",
    postal_code: "",
    city: "",
    state: ""
  }));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [soc, setSoc] = useState<SocioeconomicData | null>(null);

  async function load() {
    try {
      setLoading(true);
      const [patientId, session] = await Promise.all([getCurrentPatientId(), loadSession()]);
      const [data, socData] = await Promise.all([
        fetchPatientFull(patientId),
        fetchSocioeconomic(patientId).catch(() => null)
      ]);
      setPatient(data);
      setSoc(socData);
      setDraft(draftFromPatient(data));
      setEmail(session.user?.email ?? "");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos cargar tu perfil.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function setDraftField<K extends keyof PatientDraft>(key: K, value: PatientDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function beginEdit() {
    if (patient) setDraft(draftFromPatient(patient));
    setSaveError(null);
    setEditing(true);
  }

  function cancelEdit() {
    if (patient) setDraft(draftFromPatient(patient));
    setSaveError(null);
    setEditing(false);
  }

  async function saveProfile() {
    if (!patient || saving) return;
    const phoneError = validatePhoneMx(draft.phone.trim());
    if (phoneError) {
      setSaveError(phoneError);
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await updatePatientAuthed(patient.id, {
        first_name: draft.first_name.trim(),
        last_name: draft.last_name.trim(),
        gender: draft.gender || null,
        blood_type: draft.blood_type || null,
        phone: draft.phone.trim(),
        street_address: draft.street_address.trim() || null,
        neighborhood: draft.neighborhood.trim() || null,
        postal_code: draft.postal_code.trim() || null,
        city: draft.city.trim() || null,
        state: draft.state.trim() || null
      });
      clearCurrentPatientCache();
      const fresh = await fetchPatientFull(patient.id);
      setPatient(fresh);
      setDraft(draftFromPatient(fresh));
      setEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "No pudimos guardar tu perfil.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    clearCurrentPatientCache();
    await performLogout();
  }

  const fullName = patient ? `${patient.first_name} ${patient.last_name}`.trim() : "Paciente";
  const patientInitials = patient ? initials(patient.first_name, patient.last_name) : "DA";
  const ageLabel = patient ? `${calcAge(patient.date_of_birth)} años` : "-";
  const location = patient
    ? [patient.city, patient.state].filter(Boolean).join(", ") || "-"
    : "-";

  return (
    <DesktopShell
      nav={nav}
      activeScreen="pd-perfil"
      role="paciente"
      roleBadge="Paciente"
      title="Mi perfil"
      eyebrow="Cuenta · paciente"
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
          )}
        </View>
      }
    >
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.accentDeep} />
          <Text style={styles.loadingText}>Cargando tu perfil...</Text>
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : patient ? (
        <>
          <FadeIn>
            <View style={styles.hero}>
              <Avatar
                initials={patientInitials}
                size={78}
                radius={20}
                bg={colors.accentBright}
                fg={colors.ink}
                serif
                fontSize={34}
              />
              <View style={styles.heroInfo}>
                <Text style={styles.heroEyebrow}>Paciente · iMedExp</Text>
                <Text style={styles.heroName} numberOfLines={1} adjustsFontSizeToFit>
                  {fullName}
                </Text>
                <Text style={styles.heroMeta} numberOfLines={1}>
                  {ageLabel} · {genderLabel(patient.gender)} · {patient.blood_type ?? "sin sangre"}
                </Text>
              </View>
            </View>
          </FadeIn>

          {editing ? (
            <FadeIn delay={80}>
              <View style={styles.panel}>
                <View style={styles.panelHead}>
                  <Text style={styles.panelTitle}>Editar datos del paciente</Text>
                </View>
                <View style={styles.formGrid}>
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
                    value={draft.phone}
                    onChangeText={(v) => setDraftField("phone", v)}
                    keyboardType="phone-pad"
                    placeholder="10 dígitos"
                  />
                  <TextField
                    label="Calle y número"
                    value={draft.street_address}
                    onChangeText={(v) => setDraftField("street_address", v)}
                  />
                  <TextField
                    label="Colonia"
                    value={draft.neighborhood}
                    onChangeText={(v) => setDraftField("neighborhood", v)}
                  />
                  <TextField
                    label="Código postal"
                    value={draft.postal_code}
                    onChangeText={(v) => setDraftField("postal_code", v)}
                    keyboardType="number-pad"
                  />
                  <TextField
                    label="Ciudad"
                    value={draft.city}
                    onChangeText={(v) => setDraftField("city", v)}
                  />
                  <TextField
                    label="Estado"
                    value={draft.state}
                    onChangeText={(v) => setDraftField("state", v)}
                  />
                </View>
                <Text style={styles.optionLabel}>Género</Text>
                <View style={styles.optionRow}>
                  {GENDER_OPTIONS.map((opt) => (
                    <Tappable
                      key={opt.value}
                      onPress={() => setDraftField("gender", opt.value)}
                      scaleTo={0.97}
                      style={[
                        styles.optionChip,
                        draft.gender === opt.value && styles.optionChipActive
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          draft.gender === opt.value && styles.optionTextActive
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Tappable>
                  ))}
                </View>
                <Text style={styles.optionLabel}>Tipo de sangre</Text>
                <View style={styles.optionRow}>
                  {BLOOD_OPTIONS.map((opt) => (
                    <Tappable
                      key={opt}
                      onPress={() => setDraftField("blood_type", opt)}
                      scaleTo={0.97}
                      style={[
                        styles.optionChip,
                        draft.blood_type === opt && styles.optionChipActive
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          draft.blood_type === opt && styles.optionTextActive
                        ]}
                      >
                        {opt === "unknown" ? "No sé" : opt}
                      </Text>
                    </Tappable>
                  ))}
                </View>
                {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}
              </View>
            </FadeIn>
          ) : null}

          {editing ? null : (
          <View style={styles.columns}>
            <View style={styles.column}>
              <Text style={styles.sectionLabel}>Datos personales</Text>
              <View style={styles.panel}>
                {[
                  ["Nombre", fullName],
                  ["Edad", `${ageLabel} · ${formatDateLocal(patient.date_of_birth)}`],
                  ["Género", genderLabel(patient.gender)],
                  ["Sangre", patient.blood_type ?? "-"]
                ].map(([label, value], index) => (
                  <Tappable
                    key={label}
                    onPress={beginEdit}
                    scaleTo={0.99}
                    style={[styles.dataRow, index < 3 && styles.rowBorder]}
                  >
                    <Text style={styles.dataKey}>{label}</Text>
                    <Text style={styles.dataValue} numberOfLines={1}>{value}</Text>
                    <Icon kind="edit" size={14} color={colors.ink3} />
                  </Tappable>
                ))}
              </View>
            </View>

            <View style={styles.column}>
              <Text style={styles.sectionLabel}>Contacto</Text>
              <View style={styles.panel}>
                {[
                  ["mail", email || "-", "correo registrado"],
                  ["phone", patient.phone ?? "-", "teléfono"],
                  ["pin", location, "ciudad registrada"]
                ].map(([icon, value, sub], index) => (
                  <Tappable
                    key={`${icon}-${index}`}
                    onPress={icon === "mail" ? undefined : beginEdit}
                    scaleTo={0.99}
                    style={[styles.contactRow, index < 2 && styles.rowBorder]}
                  >
                    <View style={styles.contactIcon}>
                      <Icon kind={icon as never} size={15} color={colors.accentDeep} />
                    </View>
                    <View style={styles.flex}>
                      <Text style={styles.contactValue} numberOfLines={1}>{value}</Text>
                      <Text style={styles.contactSub}>{sub}</Text>
                    </View>
                    {icon === "mail" ? null : <Icon kind="edit" size={14} color={colors.ink3} />}
                  </Tappable>
                ))}
              </View>
            </View>
          </View>
          )}

          {editing ? null : (
            <FadeIn delay={200}>
              <Text style={[styles.sectionLabel, { marginTop: 18, marginBottom: 8 }]}>
                Condiciones del hogar
              </Text>
              <View style={styles.panel}>
                {soc && Object.values(soc).some((v) => v !== null && v !== "") ? (
                  (
                    [
                      ["Drenaje", soc.drainage],
                      ["Agua potable", soc.water],
                      ["Electricidad", soc.electricity],
                      ["Personas en el hogar", soc.household_members],
                      ["Material p/cocinar", soc.cooking_material],
                      ["Método p/cocinar", soc.cooking_method]
                    ] as [string, string | null][]
                  )
                    .filter(([, v]) => v !== null)
                    .map(([label, value], index, arr) => (
                      <View key={label} style={[styles.dataRow, index < arr.length - 1 && styles.rowBorder]}>
                        <Text style={styles.dataKey}>{label}</Text>
                        <Text style={styles.dataValue}>{value}</Text>
                      </View>
                    ))
                ) : (
                  <View style={styles.socPending}>
                    <Icon kind="home" size={15} color={colors.ink3} />
                    <Text style={styles.socPendingText}>
                      Pendiente · tu médico registrará esta información en tu primera consulta.
                    </Text>
                  </View>
                )}
              </View>
            </FadeIn>
          )}

          <FadeIn delay={220}>
            <PasswordChangePanel style={styles.securityPanel} />
          </FadeIn>

          <View style={styles.footerActions}>
            <Tappable onPress={() => goToScreen("settings")} scaleTo={0.97} style={styles.settingsBtn}>
              <Icon kind="eye" size={15} color={colors.ink2} />
              <Text style={styles.settingsText}>Accesibilidad</Text>
            </Tappable>
            <Tappable onPress={handleLogout} scaleTo={0.97} style={styles.logoutBtn}>
              <Icon kind="logout" size={15} color={colors.alert} />
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </Tappable>
          </View>
        </>
      ) : null}
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
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    padding: 20
  },
  loadingText: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink2
  },
  errorText: {
    fontFamily: family.mono,
    fontSize: 12,
    color: colors.alert
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    backgroundColor: colors.ink,
    borderRadius: radii.xl,
    paddingHorizontal: 26,
    paddingVertical: 24,
    overflow: "hidden",
    ...shadow.card
  },
  heroInfo: {
    flex: 1,
    minWidth: 0
  },
  heroEyebrow: {
    ...text.eyebrow,
    color: "rgba(255,255,255,0.62)"
  },
  heroName: {
    fontFamily: family.medium,
    fontSize: 24,
    color: colors.paper,
    marginTop: 6
  },
  heroMeta: {
    fontFamily: family.mono,
    fontSize: 12,
    color: "rgba(255,255,255,0.62)",
    marginTop: 6
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
  formGrid: {
    padding: 18,
    gap: 12
  },
  optionLabel: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    paddingHorizontal: 18,
    marginTop: 2,
    marginBottom: 8
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 18,
    paddingBottom: 14
  },
  optionChip: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  optionChipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink
  },
  optionText: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.ink2
  },
  optionTextActive: {
    color: colors.paper
  },
  saveError: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    paddingHorizontal: 18,
    paddingBottom: 16
  },
  columns: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 18
  },
  column: {
    flexGrow: 1,
    flexBasis: 420,
    minWidth: 0
  },
  sectionLabel: {
    ...text.eyebrow,
    color: colors.ink3,
    marginBottom: 8
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.rule3
  },
  dataRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 13
  },
  dataKey: {
    width: 108,
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    letterSpacing: 0.7,
    textTransform: "uppercase"
  },
  dataValue: {
    flex: 1,
    minWidth: 0,
    fontFamily: family.regular,
    fontSize: 14,
    color: colors.ink
  },
  contactRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 13
  },
  contactIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  flex: {
    flex: 1,
    minWidth: 0
  },
  contactValue: {
    fontFamily: family.regular,
    fontSize: 14,
    color: colors.ink
  },
  contactSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 2
  },
  footerActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18
  },
  securityPanel: {
    marginTop: 18
  },
  settingsBtn: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white
  },
  settingsText: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink2
  },
  logoutBtn: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.alertRule,
    backgroundColor: colors.alertSoft
  },
  logoutText: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.alert
  },
  socPending: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 18
  },
  socPendingText: {
    flex: 1,
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink3,
    lineHeight: 20
  }
});
