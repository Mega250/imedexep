import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { Card } from "@/atomic/atoms/Card";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DarkPanel } from "@/atomic/molecules/DarkPanel";
import { FAB } from "@/atomic/molecules/FAB";
import { FormField } from "@/atomic/molecules/FormField";
import { Section } from "@/atomic/molecules/Section";
import { PatientExtrasTabBar } from "@/atomic/organisms/PatientExtrasTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { isFemaleGender } from "@/navigation/patientNavVisibility";
import { getCurrentPatient } from "@/services/api/currentPatient";
import { silentOrNull } from "@/services/api/silent";
import {
  MenstrualCycle,
  MenstrualFlow,
  MenstrualPrediction,
  deleteMenstrualCycle,
  fetchMenstrualCycles,
  fetchMenstrualPrediction,
  postMenstrualCycle,
  updateMenstrualCycle
} from "@/services/api/menstrualApi";

import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";
import { confirmAction } from "@/utils/confirm";
import { parseDateLocal } from "@/utils/dates";

const WEEKDAYS = ["L", "Ma", "Mi", "J", "V", "S", "D"];

function fmtDateRange(start: string, end: string): string {
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const s = parseDateLocal(start);
  const e = parseDateLocal(end);
  if (!s || !e) return "—";
  return `${months[s.getMonth()]} ${s.getDate()} — ${months[e.getMonth()]} ${e.getDate()}`;
}

function fmtShortDate(value: string): string {
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const d = parseDateLocal(value);
  if (!d) return "—";
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}`;
}

const FLOW_OPTIONS: { label: string; value: MenstrualFlow }[] = [
  { label: "Manch.", value: "spotting" },
  { label: "Ligero", value: "light" },
  { label: "Medio", value: "medium" },
  { label: "Intenso", value: "heavy" }
];

const REGULARITY_LABELS: Record<string, string> = {
  insufficient_data: "Datos insuficientes",
  limited_data: "Datos limitados",
  regular: "Regular",
  irregular: "Irregular"
};

const FLOW_LABELS: Record<string, string> = {
  heavy: "Intenso",
  medium: "Medio",
  light: "Ligero",
  spotting: "Manchas"
};

function regularityLabel(value: string | null | undefined): string {
  if (!value) return "—";
  return REGULARITY_LABELS[value] ?? value;
}

function flowLabel(value: string | null | undefined): string {
  if (!value) return "—";
  return FLOW_LABELS[value] ?? value;
}

function buildMonthMatrix(prediction: MenstrualPrediction | null, today: Date): {
  cells: { state: "flow" | "flowHeavy" | "ov" | "fert" | "pred" | "none"; day: number }[];
  monthLabel: string;
} {
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();
  const totalCells = Math.ceil((startOffset + totalDays) / 7) * 7;
  const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const cells: { state: "flow" | "flowHeavy" | "ov" | "fert" | "pred" | "none"; day: number }[] = [];

  for (let i = 0; i < totalCells; i++) {
    const day = i - startOffset + 1;
    if (day < 1 || day > totalDays) {
      cells.push({ state: "none", day: 0 });
      continue;
    }
    const date = new Date(year, month, day);
    let state: "flow" | "flowHeavy" | "ov" | "fert" | "pred" | "none" = "none";
    if (prediction) {
      const start = parseDateLocal(prediction.predicted_next_period_start);
      const end = parseDateLocal(prediction.predicted_next_period_end);
      const wStart = parseDateLocal(prediction.prediction_window_start);
      const wEnd = parseDateLocal(prediction.prediction_window_end);
      if (start && end && date >= start && date <= end) {
        state = "pred";
      } else if (wStart && wEnd && date >= wStart && date <= wEnd) {
        state = "fert";
      }
    }
    cells.push({ state, day });
  }
  return { cells, monthLabel: `${months[month][0].toUpperCase()}${months[month].slice(1)} ${year}` };
}

export function PatCycleMobilePage() {
  const [cycles, setCycles] = useState<MenstrualCycle[] | null>(null);
  const [prediction, setPrediction] = useState<MenstrualPrediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [genderLoaded, setGenderLoaded] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [flow, setFlow] = useState<MenstrualFlow | null>("light");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function load() {
    try {
      const patient = await getCurrentPatient();
      const id = patient.id;
      setPatientId(id);
      setGender(patient.gender ?? null);
      setGenderLoaded(true);
      if (!isFemaleGender(patient.gender)) {
        setCycles([]);
        return;
      }
      const [cyclesData, predData] = await Promise.all([
        fetchMenstrualCycles(id, 24).catch(() => ({ items: [], total: 0, patient_id: id })),
        silentOrNull(fetchMenstrualPrediction(id), "PatCycleMobilePage.fetchMenstrualPrediction")
      ]);
      setCycles(cyclesData.items);
      setPrediction(predData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos cargar tu ciclo.");
      setCycles([]);
      setGenderLoaded(true);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (genderLoaded && !isFemaleGender(gender)) {
    return (
      <MobileScreen tabBar={<PatientExtrasTabBar activeScreen="pat-cycle-mob" />}>
        <ScreenTopBar title="Ciclo menstrual" sub="No aplica a tu perfil" />
        <View style={styles.gateWrap}>
          <View style={styles.gateIcon}>
            <Icon kind="heart" size={22} color={colors.ink3} />
          </View>
          <Text style={styles.gateTitle}>Esta sección no aplica a tu perfil</Text>
          <Text style={styles.gateText}>
            El seguimiento del ciclo menstrual sólo está disponible para pacientes femeninas.
          </Text>
        </View>
      </MobileScreen>
    );
  }

  function resetForm() {
    setEditingId(null);
    setPeriodStart("");
    setPeriodEnd("");
    setFlow("light");
    setNotes("");
    setFormError(null);
  }

  function openCreateForm() {
    resetForm();
    setShowForm(true);
  }

  function toggleForm() {
    if (showForm) {
      resetForm();
      setShowForm(false);
    } else {
      openCreateForm();
    }
  }

  function startEdit(cycle: MenstrualCycle) {
    setEditingId(cycle.id);
    setPeriodStart(cycle.period_start_date);
    setPeriodEnd(cycle.period_end_date ?? "");
    setFlow(cycle.flow ?? null);
    setNotes(cycle.notes ?? "");
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit() {
    if (!patientId || submitting) {
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      if (editingId !== null) {
        await updateMenstrualCycle(editingId, {
          period_start_date: periodStart.trim(),
          period_end_date: periodEnd.trim() || null,
          flow: flow ?? null
        });
      } else {
        await postMenstrualCycle({
          patient_id: patientId,
          period_start_date: periodStart.trim(),
          period_end_date: periodEnd.trim() || undefined,
          flow: flow ?? undefined,
          notes: notes.trim() || undefined,
          source: "manual"
        });
      }
      resetForm();
      setShowForm(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No pudimos guardar el registro.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    setDeleteError(null);
    const ok = await confirmAction("Eliminar registro", "¿Eliminar este registro de ciclo?", {
      confirmLabel: "Eliminar",
      destructive: true
    });
    if (!ok) {
      return;
    }
    try {
      await deleteMenstrualCycle(id);
      await load();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "No pudimos eliminar el registro.");
    }
  }

  const today = new Date();
  const { cells, monthLabel } = buildMonthMatrix(prediction, today);

  const regularity = regularityLabel(prediction?.regularity ?? null);
  const confidence = prediction ? Math.round(prediction.confidence * 100) : null;
  const cycleAvg = prediction?.average_cycle_length_days ?? null;

  return (
    <MobileScreen
      tabBar={<PatientExtrasTabBar activeScreen="pat-cycle-mob" />}
      header={
        <ScreenTopBar
          sub={
            prediction
              ? `Modelo · ${regularity}${confidence !== null ? ` · ${confidence}%` : ""}`
              : "Cargando…"
          }
          title="Ciclo menstrual"
        />
      }
      floating={<FAB icon="drop" label="Registrar hoy" onPress={toggleForm} />}
      contentStyle={styles.content}
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {cycles === null ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}

      <FadeIn>
        <DarkPanel radius={radii.lg} padding={18} blobSize={220} blobTop={-80} blobRight={-50}>
          <Text style={styles.heroEyebrow}>Próximo periodo</Text>
          <Text style={styles.heroTitle}>
            {prediction
              ? fmtDateRange(prediction.predicted_next_period_start, prediction.predicted_next_period_end)
              : "Aún sin predicción"}
          </Text>
          <Text style={styles.heroMeta}>
            {prediction
              ? `ventana ${fmtShortDate(prediction.prediction_window_start)} – ${fmtShortDate(prediction.prediction_window_end)} · confianza ${confidence}%${cycleAvg ? ` · ciclo medio ${cycleAvg.toFixed(1)} d` : ""}`
              : "registra al menos un periodo para activar la predicción"}
          </Text>
        </DarkPanel>
      </FadeIn>

      {showForm ? (
        <FadeIn>
          <View style={styles.form}>
            <FormField
              label="Inicio de periodo · YYYY-MM-DD"
              placeholder="2026-05-15"
              value={periodStart}
              onChangeText={setPeriodStart}
              autoCapitalize="none"
            />
            <FormField
              label="Fin de periodo · opcional"
              placeholder="2026-05-19"
              value={periodEnd}
              onChangeText={setPeriodEnd}
              autoCapitalize="none"
            />
            <Text style={styles.feelLabel}>Flujo</Text>
            <View style={styles.tagWrap}>
              {FLOW_OPTIONS.map((f) => {
                const on = flow === f.value;
                return (
                  <Text
                    key={f.value}
                    onPress={() => setFlow(f.value)}
                    style={[
                      styles.tag,
                      {
                        backgroundColor: on ? colors.ink : colors.white,
                        color: on ? colors.paper : colors.ink2,
                        borderColor: on ? colors.ink : colors.rule
                      }
                    ]}
                  >
                    {f.label}
                  </Text>
                );
              })}
            </View>
            <FormField
              label="Notas · opcional"
              placeholder="cólicos, cansancio..."
              value={notes}
              onChangeText={setNotes}
            />
            {formError ? <Text style={styles.formError}>{formError}</Text> : null}
            <Button
              label={
                submitting
                  ? "Guardando…"
                  : editingId !== null
                    ? "Guardar cambios"
                    : "Guardar día"
              }
              onPress={handleSubmit}
              disabled={submitting}
            />
          </View>
        </FadeIn>
      ) : null}

      <FadeIn delay={80}>
        <Section title={monthLabel}>
          <Card radius={radii.lg} style={styles.calCard}>
            <View style={styles.calGrid}>
              {WEEKDAYS.map((d, i) => (
                <View key={i} style={styles.calCell}>
                  <Text style={styles.calWeekday}>{d}</Text>
                </View>
              ))}
              {cells.map((cell, i) => {
                if (cell.day === 0) {
                  return <View key={i} style={styles.calCell} />;
                }
                const isToday = cell.day === today.getDate();
                const bg =
                  cell.state === "flowHeavy"
                    ? colors.alert
                    : cell.state === "flow"
                      ? colors.alertSoft
                      : cell.state === "ov"
                        ? colors.accentBright
                        : cell.state === "fert"
                          ? colors.paper3
                          : cell.state === "pred"
                            ? "transparent"
                            : colors.paper;
                const fg =
                  cell.state === "flowHeavy"
                    ? colors.white
                    : cell.state === "flow"
                      ? colors.alert
                      : cell.state === "ov"
                        ? colors.ink
                        : colors.ink2;
                return (
                  <View key={i} style={styles.calCell}>
                    <View
                      style={[
                        styles.calDay,
                        { backgroundColor: bg },
                        cell.state === "pred"
                          ? { borderWidth: 1.5, borderStyle: "dashed", borderColor: colors.alertRule }
                          : null,
                        isToday ? { borderWidth: 2, borderColor: colors.ink } : null
                      ]}
                    >
                      <Text style={[styles.calNum, { color: fg }]}>{cell.day}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>
        </Section>
      </FadeIn>

      {cycles && cycles.length > 0 ? (
        <FadeIn delay={200}>
          <Section title={`Últimos ${Math.min(4, cycles.length)} ciclos`}>
            {cycles.slice(0, 4).map((c) => (
              <View key={c.id} style={styles.histRow}>
                <Text style={styles.histDate}>{fmtShortDate(c.period_start_date)}</Text>
                <Text style={styles.histMono}>{c.duration_days ? `${c.duration_days} días` : "—"}</Text>
                <Text style={styles.histMono}>{flowLabel(c.flow)}</Text>
                <Tappable
                  accessibilityLabel="Editar registro de ciclo"
                  onPress={() => startEdit(c)}
                  hitSlop={8}
                  style={styles.histEdit}
                >
                  <Icon kind="edit" size={15} color={colors.ink3} />
                </Tappable>
                <Tappable
                  accessibilityLabel="Eliminar registro de ciclo"
                  onPress={() => handleDelete(c.id)}
                  hitSlop={8}
                  style={styles.histDelete}
                >
                  <Icon kind="trash" size={15} color={colors.alert} />
                </Tappable>
              </View>
            ))}
            {deleteError ? <Text style={styles.formError}>{deleteError}</Text> : null}
          </Section>
        </FadeIn>
      ) : cycles && cycles.length === 0 ? (
        <FadeIn delay={200}>
          <View style={styles.empty}>
            <Icon kind="alert" size={16} color={colors.accentDeep} />
            <Text style={styles.emptyText}>
              Aún no has registrado ningún ciclo. Toca "Registrar hoy" para empezar.
            </Text>
          </View>
        </FadeIn>
      ) : null}
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  gateWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12
  },
  gateIcon: {
    width: 56,
    height: 56,
    borderRadius: 99,
    backgroundColor: colors.rule2,
    alignItems: "center",
    justifyContent: "center"
  },
  gateTitle: {
    fontFamily: family.medium,
    fontSize: 16,
    color: colors.ink,
    textAlign: "center"
  },
  gateText: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink3,
    textAlign: "center",
    maxWidth: 320
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 120
  },
  loading: {
    paddingVertical: 12,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginBottom: 8
  },
  heroEyebrow: {
    fontFamily: family.mono,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.6)"
  },
  heroTitle: {
    fontFamily: family.serifItalic,
    fontSize: 28,
    color: colors.paper,
    marginTop: 6
  },
  heroMeta: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: "rgba(255,255,255,0.6)",
    marginTop: 8
  },
  form: {
    marginTop: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    padding: 14,
    gap: 12
  },
  formError: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert
  },
  feelLabel: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5
  },
  tag: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    fontFamily: family.regular,
    fontSize: 10.5
  },
  calCard: {
    padding: 14
  },
  calGrid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  calCell: {
    width: `${100 / 7}%`,
    padding: 2,
    overflow: "hidden"
  },
  calWeekday: {
    textAlign: "center",
    fontFamily: family.mono,
    fontSize: 9,
    color: colors.ink3,
    letterSpacing: 0.6,
    paddingBottom: 4
  },
  calDay: {
    aspectRatio: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  calNum: {
    fontFamily: family.mono,
    fontSize: 10
  },
  histRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    marginBottom: 5
  },
  histDate: {
    flex: 1,
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.ink
  },
  histMono: {
    flex: 1,
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink2
  },
  histEdit: {
    paddingLeft: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  histDelete: {
    paddingLeft: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  empty: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.md,
    marginTop: 10
  },
  emptyText: {
    flex: 1,
    fontFamily: family.regular,
    fontSize: 12,
    color: colors.ink2
  }
});
