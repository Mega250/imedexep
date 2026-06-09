import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { FormField } from "@/atomic/molecules/FormField";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import {
  isFemaleGender,
  patientDesktopNavForGender
} from "@/navigation/patientNavVisibility";
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

import { colors, radii, shadow } from "@/theme/tokens";
import { family, text } from "@/theme/typography";
import { confirmAction } from "@/utils/confirm";
import { parseDateLocal } from "@/utils/dates";

type CalCellState = "flow" | "fertile" | "ovulation" | "predict" | "none";

type CalCell = {
  state: CalCellState;
  intensity?: "heavy" | "mid";
  day: number;
};

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
const MONTH_NAMES_LONG = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
];
const MONTH_NAMES_SHORT = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic"
];

const FLOW_OPTIONS: { label: string; value: MenstrualFlow }[] = [
  { label: "Manchas", value: "spotting" },
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

function fmtShortDate(value: string): string {
  const d = parseDateLocal(value);
  if (!d) return "—";
  return `${MONTH_NAMES_SHORT[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}`;
}

function fmtRange(start: string, end: string): string {
  const s = parseDateLocal(start);
  const e = parseDateLocal(end);
  if (!s || !e) return "—";
  return `${MONTH_NAMES_SHORT[s.getMonth()]} ${s.getDate()} — ${MONTH_NAMES_SHORT[e.getMonth()]} ${e.getDate()}`;
}

function buildMonthMatrix(
  cycles: MenstrualCycle[],
  prediction: MenstrualPrediction | null,
  viewMonth: Date
): { cells: CalCell[]; monthLabel: string } {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();
  const totalCells = Math.ceil((startOffset + totalDays) / 7) * 7;
  const cells: CalCell[] = [];

  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startOffset + 1;
    if (dayNum < 1 || dayNum > totalDays) {
      cells.push({ state: "none", day: 0 });
      continue;
    }
    const date = new Date(year, month, dayNum);
    let state: CalCellState = "none";
    let intensity: "heavy" | "mid" | undefined;

    for (const c of cycles) {
      const start = parseDateLocal(c.period_start_date);
      const end = (c.period_end_date ? parseDateLocal(c.period_end_date) : start) ?? start;
      if (start && end && date >= start && date <= end) {
        state = "flow";
        intensity = c.flow === "heavy" ? "heavy" : "mid";
        break;
      }
    }

    if (state === "none" && prediction) {
      const predStart = parseDateLocal(prediction.predicted_next_period_start);
      const predEnd = parseDateLocal(prediction.predicted_next_period_end);
      const wStart = parseDateLocal(prediction.prediction_window_start);
      const wEnd = parseDateLocal(prediction.prediction_window_end);
      if (predStart && predEnd && date >= predStart && date <= predEnd) {
        state = "predict";
      } else if (wStart && wEnd && date >= wStart && date <= wEnd) {
        state = "fertile";
      }
    }

    cells.push({ state, intensity, day: dayNum });
  }

  return { cells, monthLabel: `${MONTH_NAMES_LONG[month]} ${year}` };
}

function cellBg(c: CalCell): string {
  if (c.state === "flow" && c.intensity === "heavy") {
    return colors.alert;
  }
  if (c.state === "flow") {
    return colors.alertSoft;
  }
  if (c.state === "ovulation") {
    return colors.accentBright;
  }
  if (c.state === "fertile") {
    return colors.paper3;
  }
  if (c.state === "predict") {
    return "transparent";
  }
  return colors.paper;
}

function cellFg(c: CalCell): string {
  if (c.state === "flow" && c.intensity === "heavy") {
    return colors.white;
  }
  if (c.state === "flow") {
    return colors.alert;
  }
  if (c.state === "ovulation") {
    return colors.ink;
  }
  return colors.ink2;
}

const LEGEND: { bg: string; label: string; dash?: boolean; rule?: boolean }[] = [
  { bg: colors.alert, label: "Flujo intenso" },
  { bg: colors.alertSoft, label: "Flujo medio" },
  { bg: colors.paper3, label: "Ventana fértil", rule: true },
  { bg: colors.accentBright, label: "Ovulación" },
  { bg: "transparent", label: "Predicción próximo periodo", dash: true }
];

function CalendarCell({ cell, isToday }: { cell: CalCell; isToday: boolean }) {
  if (cell.day === 0) {
    return <View style={styles.calCell} />;
  }
  return (
    <View
      style={[
        styles.calCell,
        { backgroundColor: cellBg(cell) },
        cell.state === "predict"
          ? styles.calCellPredict
          : isToday
            ? styles.calCellToday
            : styles.calCellPlain
      ]}
    >
      <Text
        style={[
          styles.calCellNum,
          { color: cellFg(cell), fontFamily: isToday ? family.monoMedium : family.mono }
        ]}
      >
        {cell.day}
      </Text>
    </View>
  );
}

export function PatCycleDesktopPage() {
  const [cycles, setCycles] = useState<MenstrualCycle[] | null>(null);
  const [prediction, setPrediction] = useState<MenstrualPrediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [bloodType, setBloodType] = useState<string | null>(null);
  const [genderLoaded, setGenderLoaded] = useState(false);

  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

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
      setBloodType(patient.blood_type ?? null);
      setGenderLoaded(true);
      if (!isFemaleGender(patient.gender)) {
        setCycles([]);
        return;
      }
      const [cyclesData, predData] = await Promise.all([
        fetchMenstrualCycles(id, 24).catch(() => ({ items: [], total: 0, patient_id: id })),
        silentOrNull(fetchMenstrualPrediction(id), "PatCycleDesktopPage.fetchMenstrualPrediction")
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
  const isCurrentMonth =
    viewMonth.getFullYear() === today.getFullYear() &&
    viewMonth.getMonth() === today.getMonth();
  const todayDay = today.getDate();

  const { cells, monthLabel } = useMemo(
    () => buildMonthMatrix(cycles ?? [], prediction, viewMonth),
    [cycles, prediction, viewMonth]
  );

  if (genderLoaded && !isFemaleGender(gender)) {
    return (
      <DesktopShell
        nav={patientDesktopNavForGender(gender)}
        activeScreen="pat-cycle"
        role="paciente"
        roleBadge="Paciente"
        title="Ciclo menstrual"
        eyebrow="No aplica a tu perfil"
      >
        <View style={cycleGateStyles.wrap}>
          <View style={cycleGateStyles.iconBox}>
            <Icon kind="heart" size={28} color={colors.ink3} />
          </View>
          <Text style={cycleGateStyles.title}>Esta sección no aplica a tu perfil</Text>
          <Text style={cycleGateStyles.text}>
            El seguimiento del ciclo menstrual sólo está disponible para pacientes femeninas.
          </Text>
        </View>
      </DesktopShell>
    );
  }

  const cycleCount = cycles?.length ?? 0;
  const regularity = prediction?.regularity ?? null;
  const confidence = prediction ? Math.round(prediction.confidence * 100) : null;
  const cycleAvg = prediction?.average_cycle_length_days ?? null;
  const periodAvg = prediction?.predicted_period_duration_days ?? null;

  const recent = cycles ? [...cycles].slice(0, 4) : [];

  const eyebrow = prediction
    ? `Modelo · ${regularityLabel(regularity)}${confidence !== null ? ` · confianza ${confidence}%` : ""}`
    : cycles
      ? `${cycleCount} ciclo${cycleCount === 1 ? "" : "s"} registrado${cycleCount === 1 ? "" : "s"}`
      : "Cargando…";

  const roleLabel = bloodType ? `paciente · ${bloodType}` : "paciente";

  function shiftMonth(delta: number) {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  return (
    <DesktopShell
      nav={patientDesktopNavForGender(gender)}
      activeScreen="pat-cycle"
      role={roleLabel}
      roleBadge="Paciente"
      title="Ciclo menstrual"
      eyebrow={eyebrow}
      searchPlaceholder="Buscar fecha…"
      topBarRight={
        <Button
          label={showForm ? "Cancelar" : "Registrar día"}
          variant="accent"
          size="sm"
          block={false}
          height={42}
          radius={radii.md}
          iconLeft={showForm ? "x" : "drop"}
          onPress={toggleForm}
        />
      }
    >
      {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

      {cycles === null ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}

      <FadeIn>
        <View style={styles.heroRow}>
          <View style={styles.heroCard}>
            <View pointerEvents="none" style={styles.heroBlob} />
            <View style={styles.heroInner}>
              <Text style={styles.heroEyebrow}>Próximo periodo · predicción</Text>
              <Text style={styles.heroTitle}>
                {prediction
                  ? fmtRange(
                      prediction.predicted_next_period_start,
                      prediction.predicted_next_period_end
                    )
                  : "Aún sin predicción"}
              </Text>
              <Text style={styles.heroMeta}>
                {prediction
                  ? `ventana ${fmtShortDate(prediction.prediction_window_start)} – ${fmtShortDate(prediction.prediction_window_end)}${confidence !== null ? ` · confianza ${confidence}%` : ""}${cycleAvg ? ` · ciclo medio ${cycleAvg.toFixed(1)} d` : ""}`
                  : "registra al menos un periodo para activar la predicción"}
              </Text>
              <View style={styles.heroActions}>
                <Tappable onPress={openCreateForm}>
                  <View style={styles.heroPrimaryBtn}>
                    <Text style={styles.heroPrimaryText}>Registrar día</Text>
                  </View>
                </Tappable>
              </View>
            </View>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.eyebrow}>Regularidad</Text>
            <Text style={styles.statValue}>{regularityLabel(regularity)}</Text>
            <Text style={styles.statSub}>
              {prediction && prediction.cycle_length_stddev_days !== null
                ? `±${prediction.cycle_length_stddev_days.toFixed(1)} días`
                : "necesita más registros"}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.eyebrow}>Duración media</Text>
            <Text style={styles.statValue}>{periodAvg ? `${periodAvg.toFixed(1)} d` : "—"}</Text>
            <Text style={styles.statSub}>
              {cycleAvg ? `ciclo ${cycleAvg.toFixed(1)} d` : "—"}
            </Text>
          </View>
        </View>
      </FadeIn>

      {showForm ? (
        <FadeIn>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editingId !== null ? "Editar registro de ciclo" : "Nuevo registro de ciclo"}
            </Text>
            <View style={styles.formGrid}>
              <View style={styles.formCol}>
                <FormField
                  label="Inicio · YYYY-MM-DD"
                  placeholder="2026-05-15"
                  value={periodStart}
                  onChangeText={setPeriodStart}
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.formCol}>
                <FormField
                  label="Fin · opcional"
                  placeholder="2026-05-19"
                  value={periodEnd}
                  onChangeText={setPeriodEnd}
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.formCol}>
                <FormField
                  label="Notas · opcional"
                  placeholder="cólicos, cansancio…"
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>
            </View>
            <Text style={styles.formGroupLabel}>FLUJO</Text>
            <View style={styles.chipRow}>
              {FLOW_OPTIONS.map((f) => {
                const on = flow === f.value;
                return (
                  <Tappable key={f.value} onPress={() => setFlow(f.value)}>
                    <View
                      style={[
                        styles.chip,
                        {
                          backgroundColor: on ? colors.ink : colors.white,
                          borderColor: on ? colors.ink : colors.rule
                        }
                      ]}
                    >
                      <Text style={[styles.chipText, { color: on ? colors.paper : colors.ink2 }]}>
                        {f.label}
                      </Text>
                    </View>
                  </Tappable>
                );
              })}
            </View>
            {formError ? <Text style={styles.formError}>{formError}</Text> : null}
            <View style={styles.formActions}>
              <Button
                label={
                  submitting
                    ? "Guardando…"
                    : editingId !== null
                      ? "Guardar cambios"
                      : "Guardar registro"
                }
                variant="accent"
                size="sm"
                block={false}
                height={42}
                radius={radii.md}
                onPress={handleSubmit}
                disabled={submitting}
              />
            </View>
          </View>
        </FadeIn>
      ) : null}

      <View style={styles.mainRow}>
        <View style={styles.calCardWrap}>
          <View style={styles.panel}>
            <View style={styles.panelHead}>
              <Text style={styles.panelTitle}>{monthLabel}</Text>
              <View style={styles.navBtns}>
                <Tappable onPress={() => shiftMonth(-1)}>
                  <View style={styles.navBtn}>
                    <Icon kind="chev-l" size={12} color={colors.ink2} />
                  </View>
                </Tappable>
                <Tappable onPress={() => shiftMonth(1)}>
                  <View style={styles.navBtn}>
                    <Icon kind="chev" size={12} color={colors.ink2} />
                  </View>
                </Tappable>
              </View>
            </View>
            <View style={styles.calBody}>
              <View style={styles.calGrid}>
                {WEEKDAYS.map((d, i) => (
                  <View key={`wd-${i}`} style={styles.calWeekCell}>
                    <Text style={styles.calWeekText}>{d}</Text>
                  </View>
                ))}
                {cells.map((c, i) => (
                  <View key={`cell-${i}`} style={styles.calCellSlot}>
                    <CalendarCell cell={c} isToday={isCurrentMonth && c.day === todayDay} />
                  </View>
                ))}
              </View>
              <View style={styles.legend}>
                {LEGEND.map((l) => (
                  <View key={l.label} style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendSwatch,
                        { backgroundColor: l.bg },
                        l.dash && styles.legendSwatchDash,
                        l.rule && styles.legendSwatchRule
                      ]}
                    />
                    <Text style={styles.legendText}>{l.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.asideWrap}>
          <View style={styles.disclaimer}>
            <Icon kind="shield-2" size={18} color={colors.accentDeep} />
            <View style={styles.disclaimerBody}>
              <Text style={styles.disclaimerTitle}>No es diagnóstico</Text>
              <Text style={styles.disclaimerText}>
                La predicción es una ayuda. Si tu ciclo cambia mucho, comparte el registro con tu
                médico.
              </Text>
            </View>
          </View>

          {prediction && prediction.warnings.length > 0 ? (
            <View style={styles.warnCard}>
              <Text style={styles.eyebrow}>Avisos del modelo</Text>
              {prediction.warnings.map((w) => (
                <Text key={w} style={styles.warnText}>
                  · {w}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      </View>

      <View style={[styles.panel, styles.historyPanel]}>
        <View style={styles.panelHead}>
          <Text style={styles.panelTitle}>
            {recent.length > 0
              ? `Histórico · últimos ${recent.length} ciclos`
              : "Histórico"}
          </Text>
          {cycleCount > recent.length ? (
            <Text style={styles.panelLink}>{`Total ${cycleCount} ciclos`}</Text>
          ) : null}
        </View>
        {recent.length === 0 && cycles !== null ? (
          <View style={styles.emptyRow}>
            <Icon kind="alert" size={14} color={colors.accentDeep} />
            <Text style={styles.emptyRowText}>
              Aún no has registrado ningún ciclo. Toca "Registrar día" para empezar.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.historyHead}>
              <Text style={[styles.historyHeadCell, styles.colStart]}>Inicio</Text>
              <Text style={[styles.historyHeadCell, styles.colLen]}>Duración</Text>
              <Text style={[styles.historyHeadCell, styles.colCycle]}>Flujo</Text>
              <Text style={[styles.historyHeadCell, styles.colNotes]}>Notas</Text>
              <View style={styles.colMore} />
            </View>
            {recent.map((h, i) => (
              <View
                key={h.id}
                style={[
                  styles.historyRow,
                  { borderBottomWidth: i < recent.length - 1 ? 1 : 0 }
                ]}
              >
                <Text style={[styles.colStart, styles.historyStart]}>
                  {fmtShortDate(h.period_start_date)}
                </Text>
                <Text style={[styles.colLen, styles.historyMono]}>
                  {h.duration_days ? `${h.duration_days} días` : "—"}
                </Text>
                <Text style={[styles.colCycle, styles.historyMono]}>{flowLabel(h.flow)}</Text>
                <Text style={[styles.colNotes, styles.historyMood]} numberOfLines={1}>
                  {h.notes ?? "—"}
                </Text>
                <View style={styles.colMore}>
                  <Tappable
                    accessibilityLabel="Editar registro de ciclo"
                    onPress={() => startEdit(h)}
                    hitSlop={8}
                  >
                    <Icon kind="edit" size={15} color={colors.ink3} />
                  </Tappable>
                  <Tappable
                    accessibilityLabel="Eliminar registro de ciclo"
                    onPress={() => handleDelete(h.id)}
                    hitSlop={8}
                  >
                    <Icon kind="trash" size={15} color={colors.alert} />
                  </Tappable>
                </View>
              </View>
            ))}
          </>
        )}
        {deleteError ? <Text style={styles.deleteError}>{deleteError}</Text> : null}
      </View>
    </DesktopShell>
  );
}

const cycleGateStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 80,
    gap: 14
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: colors.rule2,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    fontFamily: family.medium,
    fontSize: 22,
    color: colors.ink,
    textAlign: "center"
  },
  text: {
    fontFamily: family.regular,
    fontSize: 14,
    color: colors.ink3,
    textAlign: "center",
    maxWidth: 420,
    lineHeight: 21
  }
});

const styles = StyleSheet.create({
  loading: {
    paddingVertical: 18,
    alignItems: "center"
  },
  errorBanner: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginBottom: 12
  },
  eyebrow: {
    ...text.eyebrow,
    color: colors.ink3
  },
  heroRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  heroCard: {
    flexGrow: 14,
    flexBasis: 360,
    backgroundColor: colors.ink,
    borderRadius: radii.xl,
    paddingHorizontal: 26,
    paddingVertical: 22,
    overflow: "hidden",
    ...shadow.card
  },
  heroBlob: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: 999,
    backgroundColor: "rgba(0,180,216,0.16)",
    top: -120,
    right: -80
  },
  heroInner: {
    position: "relative"
  },
  heroEyebrow: {
    ...text.eyebrow,
    color: "rgba(255,255,255,0.6)"
  },
  heroTitle: {
    fontFamily: family.serifItalic,
    fontSize: 44,
    lineHeight: 46,
    letterSpacing: -1,
    color: colors.paper,
    marginTop: 8
  },
  heroMeta: {
    fontFamily: family.mono,
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 10
  },
  heroActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 18
  },
  heroPrimaryBtn: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    backgroundColor: colors.accentBright,
    alignItems: "center",
    justifyContent: "center"
  },
  heroPrimaryText: {
    fontFamily: family.semibold,
    fontSize: 12.5,
    color: colors.ink
  },
  statCard: {
    flexGrow: 10,
    flexBasis: 160,
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
  formCard: {
    marginTop: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    padding: 22,
    gap: 12
  },
  formTitle: {
    fontFamily: family.medium,
    fontSize: 14,
    color: colors.ink
  },
  formGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  formCol: {
    flexGrow: 1,
    flexBasis: 200,
    minWidth: 0
  },
  formGroupLabel: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    letterSpacing: 0.8,
    marginTop: 6
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1
  },
  chipText: {
    fontFamily: family.regular,
    fontSize: 11.5
  },
  formError: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  mainRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 18
  },
  calCardWrap: {
    flexGrow: 15,
    flexBasis: 420,
    minWidth: 0
  },
  asideWrap: {
    flexGrow: 10,
    flexBasis: 260,
    minWidth: 0,
    gap: 14
  },
  panel: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  panelHead: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  panelTitle: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  panelLink: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.accentDeep
  },
  navBtns: {
    flexDirection: "row",
    gap: 6
  },
  navBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  calBody: {
    padding: 22
  },
  calGrid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  calWeekCell: {
    width: "14.2857%",
    alignItems: "center",
    paddingBottom: 6
  },
  calWeekText: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    letterSpacing: 1
  },
  calCellSlot: {
    width: "14.2857%",
    padding: 3
  },
  calCell: {
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  calCellPlain: {
    borderWidth: 1,
    borderColor: "transparent"
  },
  calCellToday: {
    borderWidth: 2,
    borderColor: colors.ink
  },
  calCellPredict: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.alertRule
  },
  calCellNum: {
    fontSize: 12
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.rule3
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  legendSwatch: {
    width: 14,
    height: 14,
    borderRadius: 4
  },
  legendSwatchDash: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.alertRule
  },
  legendSwatchRule: {
    borderWidth: 1,
    borderColor: colors.accentRule
  },
  legendText: {
    fontFamily: family.regular,
    fontSize: 11.5,
    color: colors.ink2
  },
  disclaimer: {
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.md,
    padding: 14,
    flexDirection: "row",
    gap: 10
  },
  disclaimerBody: {
    flex: 1,
    minWidth: 0
  },
  disclaimerTitle: {
    fontFamily: family.medium,
    fontSize: 12.5,
    color: colors.accentDeep
  },
  disclaimerText: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 4,
    lineHeight: 15.75
  },
  warnCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    padding: 14,
    gap: 4
  },
  warnText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink2,
    lineHeight: 16
  },
  historyPanel: {
    marginTop: 18
  },
  historyHead: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  historyHeadCell: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    letterSpacing: 1.05,
    textTransform: "uppercase"
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderBottomColor: colors.rule3
  },
  colStart: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 0
  },
  colLen: {
    flexGrow: 0.8,
    flexBasis: 0,
    minWidth: 0
  },
  colCycle: {
    flexGrow: 0.8,
    flexBasis: 0,
    minWidth: 0
  },
  colNotes: {
    flexGrow: 1.4,
    flexBasis: 0,
    minWidth: 0
  },
  colMore: {
    width: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  historyStart: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  historyMono: {
    fontFamily: family.mono,
    fontSize: 12,
    color: colors.ink2
  },
  historyMood: {
    fontFamily: family.regular,
    fontSize: 12,
    color: colors.ink2
  },
  emptyRow: {
    paddingHorizontal: 22,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  emptyRowText: {
    flex: 1,
    fontFamily: family.mono,
    fontSize: 11.5,
    color: colors.ink3
  },
  deleteError: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    paddingHorizontal: 20,
    paddingVertical: 12
  }
});
