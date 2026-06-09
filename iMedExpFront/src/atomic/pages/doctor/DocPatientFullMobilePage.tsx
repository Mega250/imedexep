import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/atomic/atoms/Avatar";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { Pill } from "@/atomic/atoms/Pill";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { Tappable } from "@/atomic/atoms/Tappable";
import { FAB } from "@/atomic/molecules/FAB";
import { Section } from "@/atomic/molecules/Section";
import { goBack, goToScreen } from "@/navigation/screenRouter";
import { PatientFull, SocioeconomicData, fetchPatientFull, fetchSocioeconomic, updatePatientAuthed } from "@/services/api/patientsApi";
import { EditPatientSheet } from "@/atomic/molecules/EditPatientSheet";
import { PatientEditableValues, buildPatientUpdate, hasPatientChanges, valuesFromPatient } from "@/atomic/pages/doctor/patientEditForm";
import { getSelectedPatientId } from "@/services/api/selectedPatient";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

const TABS = ["Resumen", "Vitales", "Dx", "Cirugías", "Meds", "Vacunas", "Estudios", "Ciclo"];

function initialsFromName(first: string, last: string): string {
  return ((first?.[0] ?? "") + (last?.[0] ?? "")).toUpperCase() || "··";
}

function ageFrom(dob: string): number | null {
  if (!dob) {
    return null;
  }
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) {
    age--;
  }
  return age;
}

function sexSymbol(gender: string | null): string {
  if (!gender) {
    return "·";
  }
  const g = gender.toLowerCase();
  if (g.startsWith("f")) {
    return "♀";
  }
  if (g.startsWith("m")) {
    return "♂";
  }
  return "·";
}

export function DocPatientFullMobilePage() {
  const insets = useSafeAreaInsets();
  const [patient, setPatient] = useState<PatientFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsSelection, setNeedsSelection] = useState(false);
  const [soc, setSoc] = useState<SocioeconomicData | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const id = await getSelectedPatientId();
        if (id === null) {
          if (!cancelled) {
            setNeedsSelection(true);
            setLoading(false);
          }
          return;
        }
        const [full, socData] = await Promise.all([
          fetchPatientFull(id),
          fetchSocioeconomic(id).catch(() => null)
        ]);
        if (!cancelled) {
          setPatient(full);
          setSoc(socData);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar el expediente.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fullName = patient ? `${patient.first_name} ${patient.last_name}` : "—";
  const ini = patient ? initialsFromName(patient.first_name, patient.last_name) : "··";
  const age = patient ? ageFrom(patient.date_of_birth) : null;
  const meta = patient
    ? `${sexSymbol(patient.gender)} ${age !== null ? `${age}a` : "—"}${patient.blood_type ? ` · ${patient.blood_type}` : ""}${
        patient.city ? ` · ${patient.city}` : ""
      }`
    : "";

  const vitalsCells: [string, string][] = patient
    ? [
        ["T/A", patient.systolic_bp && patient.diastolic_bp ? `${patient.systolic_bp}/${patient.diastolic_bp}` : "—"],
        ["FC", patient.heart_rate !== null ? String(patient.heart_rate) : "—"],
        ["Temp", patient.temperature_celsius !== null ? String(patient.temperature_celsius) : "—"],
        ["SpO₂", patient.oxygen_saturation !== null ? `${patient.oxygen_saturation}%` : "—"]
      ]
    : [];

  const basicInfo: [string, string][] = patient
    ? [
        ["Peso", patient.weight_kg !== null ? `${patient.weight_kg} kg` : "—"],
        ["Estatura", patient.height_cm !== null ? `${patient.height_cm} cm` : "—"],
        ["IMC", patient.bmi !== null ? String(patient.bmi) : "—"],
        ["Glucosa", patient.glucose_mg_dl !== null ? `${patient.glucose_mg_dl} mg/dL` : "—"]
      ]
    : [];

  async function handleSave(values: PatientEditableValues) {
    if (!patient) {
      return;
    }
    const update = buildPatientUpdate(valuesFromPatient(patient), values);
    if (!hasPatientChanges(update)) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await updatePatientAuthed(patient.id, update);
      const fresh = await fetchPatientFull(patient.id);
      setPatient(fresh);
      setEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "No pudimos guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={[styles.hero, { paddingTop: insets.top + 14 }]}>
          <RadialBlob size={240} color="rgba(0,180,216,0.28)" style={{ top: -90, right: -70 }} />
          <Tappable onPress={() => goBack("mob-patients")} scaleTo={0.95} style={styles.backRow}>
            <Icon kind="chev-l" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.backText}>Pacientes</Text>
          </Tappable>
          <View style={styles.heroMain}>
            <Avatar
              initials={ini}
              size={60}
              radius={16}
              bg={colors.accentBright}
              fg={colors.ink}
              serif
              fontSize={26}
            />
            <View style={styles.flex}>
              <Text style={styles.heroEyebrow}>Expediente clínico completo</Text>
              <Text style={styles.heroName} numberOfLines={1} ellipsizeMode="tail">{fullName}</Text>
              <Text style={styles.heroMeta} numberOfLines={1} ellipsizeMode="tail">{meta}</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.accentDeep} />
            </View>
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {needsSelection ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Selecciona un paciente</Text>
              <Text style={styles.emptyMeta}>
                Abre un paciente desde "Mis Pacientes" o tu agenda para ver el expediente.
              </Text>
            </View>
          ) : null}

          {patient ? (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsRow}
              >
                {TABS.map((t, i) => (
                  <Pill key={t} label={t} on={i === 0} />
                ))}
              </ScrollView>

              <FadeIn delay={60}>
                <Section title="Datos básicos" action="Editar →" onAction={() => setEditing(true)}>
                  {basicInfo.map(([k, v]) => (
                    <View key={k} style={styles.itemCard}>
                      <View style={styles.itemTop}>
                        <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">{k}</Text>
                        <View style={styles.icdTag}>
                          <Text style={styles.icdText} numberOfLines={1} ellipsizeMode="tail">{v}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </Section>
              </FadeIn>

              <FadeIn delay={100}>
                <Section title="Dirección">
                  <View style={styles.itemCard}>
                    <Text style={styles.itemName} numberOfLines={2} ellipsizeMode="tail">
                      {patient.street_address ?? "—"}
                      {patient.neighborhood ? ` · ${patient.neighborhood}` : ""}
                    </Text>
                    <Text style={styles.itemSub} numberOfLines={1} ellipsizeMode="tail">
                      {[patient.city, patient.state, patient.postal_code].filter(Boolean).join(" · ") || "sin dirección"}
                    </Text>
                  </View>
                </Section>
              </FadeIn>

              <FadeIn delay={140}>
                <Section
                  title="Vitales recientes"
                  action="Ver gráfica →"
                  onAction={() => goToScreen("doc-vitals-mob")}
                >
                  <View style={styles.vitalGrid}>
                    {vitalsCells.map(([k, n]) => (
                      <View key={k} style={styles.vitalCell}>
                        <Text style={styles.vitalKey}>{k}</Text>
                        <Text style={styles.vitalValue}>{n}</Text>
                      </View>
                    ))}
                  </View>
                  {patient.glucose_risk ? (
                    <View style={styles.riskRow}>
                      <Icon kind="alert" size={12} color={colors.alert} />
                      <Text style={styles.riskText}>riesgo de glucosa · {patient.glucose_risk}</Text>
                    </View>
                  ) : null}
                </Section>
              </FadeIn>

              <FadeIn delay={180}>
                <Section title="Sensibilidad">
                  <View style={styles.itemCard}>
                    <Text style={styles.itemName}>
                      Nivel {patient.sensitivity_level}
                    </Text>
                    <Text style={styles.itemSub}>
                      sensibilidad del expediente (más alto = más restringido)
                    </Text>
                  </View>
                </Section>
              </FadeIn>

              <FadeIn delay={220}>
                <Section title="Condiciones del hogar">
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
                      .map(([key, value]) => (
                        <View key={key} style={styles.itemCard}>
                          <View style={styles.itemTop}>
                            <Text style={styles.itemName}>{key}</Text>
                            <View style={styles.icdTag}>
                              <Text style={styles.icdText}>{value}</Text>
                            </View>
                          </View>
                        </View>
                      ))
                  ) : (
                    <View style={styles.itemCard}>
                      <Text style={styles.itemName}>Pendiente</Text>
                      <Text style={styles.itemSub}>
                        El médico capturará esta información en la primera consulta.
                      </Text>
                    </View>
                  )}
                </Section>
              </FadeIn>
            </>
          ) : null}
        </View>
      </ScrollView>
      {editing && patient ? (
        <EditPatientSheet
          visible
          initial={valuesFromPatient(patient)}
          submitting={saving}
          error={saveError}
          onClose={() => {
            setEditing(false);
            setSaveError(null);
          }}
          onSubmit={handleSave}
        />
      ) : null}
      <FAB icon="check" label="Empezar consulta" onPress={() => goToScreen("active-mob")} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.paper
  },
  scroll: {
    paddingBottom: 130
  },
  flex: {
    flex: 1,
    minWidth: 0
  },
  hero: {
    backgroundColor: colors.ink,
    paddingHorizontal: 20,
    paddingBottom: 22,
    overflow: "hidden"
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12
  },
  backText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 0.3
  },
  heroMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  heroEyebrow: {
    fontFamily: family.mono,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.6)"
  },
  heroName: {
    fontFamily: family.serifItalic,
    fontSize: 22,
    lineHeight: 26,
    color: colors.paper,
    marginTop: 2
  },
  heroMeta: {
    fontFamily: family.mono,
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4
  },
  body: {
    paddingHorizontal: 20
  },
  loading: {
    paddingVertical: 24,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginTop: 14,
    textAlign: "center"
  },
  empty: {
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: colors.rule2,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    alignItems: "center",
    gap: 6
  },
  emptyTitle: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink
  },
  emptyMeta: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    textAlign: "center"
  },
  tabsRow: {
    gap: 6,
    paddingTop: 12
  },
  itemCard: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    marginBottom: 5
  },
  itemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  itemName: {
    flex: 1,
    fontFamily: family.medium,
    fontSize: 12.5,
    color: colors.ink
  },
  itemSub: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 4
  },
  icdTag: {
    flexShrink: 0,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.paper3
  },
  icdText: {
    fontFamily: family.mono,
    fontSize: 9,
    color: colors.accentDeep,
    letterSpacing: 0.5
  },
  vitalGrid: {
    flexDirection: "row",
    gap: 6
  },
  vitalCell: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    alignItems: "center"
  },
  vitalKey: {
    fontFamily: family.mono,
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.ink3
  },
  vitalValue: {
    fontFamily: family.monoMedium,
    fontSize: 13,
    color: colors.ink,
    marginTop: 4
  },
  riskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.alertSoft,
    borderWidth: 1,
    borderColor: colors.alertRule,
    borderRadius: radii.md
  },
  riskText: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.alert
  }
});
