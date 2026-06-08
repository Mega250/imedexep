import { ReactNode, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { Card } from "@/atomic/atoms/Card";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { RoundIconButton } from "@/atomic/atoms/RoundIconButton";
import { SectionLabel } from "@/atomic/atoms/SectionLabel";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DarkPanel } from "@/atomic/molecules/DarkPanel";
import { RecordFormModal } from "@/atomic/molecules/RecordFormModal";
import { HistChips } from "@/atomic/organisms/HistChips";
import { PatientTabBar } from "@/atomic/organisms/PatientTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { getCurrentPatientId } from "@/services/api/currentPatient";
import { Weight, addWeight, deleteWeight, listWeight } from "@/services/api/clinicalReadingsApi";
import { VitalSign, fetchPatientVitals } from "@/services/api/vitalsApi";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";
import { confirmAction } from "@/utils/confirm";
import { formatDateLocal, isFutureDateLocal } from "@/utils/dates";

const CW = 320;
const CH = 100;

type Point = { date: string; weight: number; imc: number | null };

function fmtShortDate(value: string): string {
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const d = new Date(value);
  return `${months[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`;
}

function Header({ onAdd }: { onAdd: () => void }): ReactNode {
  return (
    <>
      <ScreenTopBar sub="Mi historial" title="Peso e IMC" right={<RoundIconButton icon="plus" onPress={onAdd} />} />
      <HistChips active={7} />
    </>
  );
}

export function PHistPesoPage() {
  const [history, setHistory] = useState<VitalSign[] | null>(null);
  const [readings, setReadings] = useState<Weight[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function reloadReadings() {
    const r = await listWeight();
    setReadings(r);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const patientId = await getCurrentPatientId();
        const [data, list] = await Promise.all([
          fetchPatientVitals(patientId, 50),
          listWeight().catch(() => [] as Weight[])
        ]);
        if (!cancelled) {
          setHistory(data);
          setReadings(list);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar tu historial de peso.");
          setHistory([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAdd(values: Record<string, string>) {
    const value = Number(values.weight_kg);
    if (!value || Number.isNaN(value)) {
      setFormError("Ingresa un peso válido.");
      return;
    }
    if (value < 2 || value > 400) {
      setFormError("El peso debe estar entre 2 y 400 kg.");
      return;
    }
    const height = values.height_m ? Number(values.height_m) : undefined;
    if (height !== undefined && (Number.isNaN(height) || height < 0.3 || height > 2.5)) {
      setFormError("La estatura debe estar entre 0.3 y 2.5 m.");
      return;
    }
    const measured = values.measured_on?.trim();
    if (measured && isFutureDateLocal(measured)) {
      setFormError("La fecha no puede ser futura.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await addWeight({
        weight_kg: value,
        height_m: height,
        measured_on: values.measured_on?.trim() || undefined,
        notes: values.notes?.trim() || undefined
      });
      setOpen(false);
      await reloadReadings();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No pudimos guardar la lectura.");
    } finally {
      setSubmitting(false);
    }
  }

  async function performDelete(id: number) {
    setError(null);
    try {
      await deleteWeight(id);
      await reloadReadings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos eliminar la lectura.");
    }
  }

  async function handleDelete(id: number) {
    const ok = await confirmAction("Eliminar", "¿Seguro que quieres eliminarlo?", {
      confirmLabel: "Eliminar",
      destructive: true
    });
    if (ok) {
      performDelete(id);
    }
  }

  const points: Point[] = useMemo(() => {
    if (!history) {
      return [];
    }
    return [...history]
      .filter((v) => typeof v.weight === "number")
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
      .map((v) => ({ date: v.recorded_at, weight: v.weight as number, imc: v.imc }));
  }, [history]);

  const latest = points.length > 0 ? points[points.length - 1] : null;
  const latestWeight = readings.length > 0 ? readings[0].weight_kg : latest ? latest.weight : null;
  const imcValues = points.map((p) => p.imc).filter((v): v is number => typeof v === "number");
  const minImc = imcValues.length ? Math.min(...imcValues) - 0.5 : 23.5;
  const maxImc = imcValues.length ? Math.max(...imcValues) + 0.5 : 25;

  const svgPoints = points.map((p, i) => {
    const x = points.length > 1 ? (i / (points.length - 1)) * (CW - 20) + 10 : CW / 2;
    const v = p.imc ?? 0;
    const y = CH - ((v - minImc) / Math.max(0.001, maxImc - minImc)) * (CH - 20) - 10;
    return { x, y };
  });

  const path = svgPoints.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");

  function gridY(value: number): number {
    return CH - ((value - minImc) / Math.max(0.001, maxImc - minImc)) * (CH - 20) - 10;
  }

  return (
    <MobileScreen
      tabBar={<PatientTabBar active={1} />}
      header={<Header onAdd={() => setOpen(true)} />}
      contentStyle={styles.content}
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {history === null ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}

      <FadeIn>
        <DarkPanel radius={radii.xl} padding={20} blobSize={200} blobTop={-60} blobRight={-50}>
          <View style={styles.heroTop}>
            <Text style={styles.heroEyebrow} numberOfLines={1}>
              {latest ? `Última toma · ${fmtShortDate(latest.date)}` : "Aún sin mediciones"}
            </Text>
            <View style={styles.normalTag}>
              <Text style={styles.normalText}>
                {latest && latest.imc ? "IMC" : "—"}
              </Text>
            </View>
          </View>
          <View style={styles.heroGrid}>
            <View style={styles.heroItem}>
              <Text style={styles.heroKey}>IMC</Text>
              <Text style={styles.heroImc}>
                {latest && latest.imc !== null ? latest.imc : "—"}
              </Text>
            </View>
            <View style={styles.heroItem}>
              <Text style={styles.heroKey}>Peso</Text>
              <Text style={styles.heroValue}>
                {latestWeight !== null ? latestWeight : "—"}{" "}
                {latestWeight !== null ? <Text style={styles.heroUnit}>kg</Text> : null}
              </Text>
            </View>
          </View>
        </DarkPanel>
      </FadeIn>

      {points.length > 0 ? (
        <FadeIn delay={80}>
          <SectionLabel
            label={`Evolución del IMC · ${points.length} mediciones`}
            style={styles.section}
          />
          <Card radius={radii.lg} style={styles.chartCard}>
            <Svg width="100%" height={CH} viewBox={`0 0 ${CW} ${CH}`}>
              {[Math.round(minImc) + 1, Math.round(minImc) + 2].map((v) =>
                v >= minImc && v <= maxImc ? (
                  <Line
                    key={v}
                    x1={10}
                    y1={gridY(v)}
                    x2={CW - 10}
                    y2={gridY(v)}
                    stroke={colors.rule2}
                    strokeWidth={1}
                    strokeDasharray="2 4"
                  />
                ) : null
              )}
              {svgPoints.length > 1 ? (
                <Path
                  d={path}
                  stroke={colors.accent}
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}
              {svgPoints.map((p, i) => (
                <Circle key={i} cx={p.x} cy={p.y} r={3} fill={colors.accentDeep} />
              ))}
            </Svg>
            <View style={styles.chartLabels}>
              {points.map((p, i) => {
                const step = Math.ceil(points.length / 6);
                const show = i === 0 || i === points.length - 1 || i % step === 0;
                return (
                  <Text key={i} style={styles.chartLabel} numberOfLines={1}>
                    {show ? fmtShortDate(p.date) : ""}
                  </Text>
                );
              })}
            </View>
          </Card>
        </FadeIn>
      ) : null}

      {points.length > 0 ? (
        <FadeIn delay={140}>
          <SectionLabel label="Mediciones" style={styles.section} />
          <Card radius={radii.lg}>
            {[...points].reverse().map((d, index, arr) => (
              <View
                key={d.date}
                style={[styles.measureRow, index < arr.length - 1 ? styles.rowBorder : null]}
              >
                <Text style={styles.measureDate}>{fmtShortDate(d.date)}</Text>
                <View style={styles.measureValues}>
                  <Text style={styles.measureWeight}>
                    {d.weight} <Text style={styles.measureUnit}>kg</Text>
                  </Text>
                  {d.imc !== null ? (
                    <Text style={styles.measureImc}>IMC {d.imc}</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </Card>
        </FadeIn>
      ) : history && history.length > 0 && points.length === 0 ? (
        <FadeIn delay={80}>
          <View style={styles.emptyInfo}>
            <Icon kind="alert" size={14} color={colors.accentDeep} />
            <Text style={styles.emptyInfoText}>
              Aún no hay mediciones de peso registradas.
            </Text>
          </View>
        </FadeIn>
      ) : null}

      <SectionLabel label="Lecturas registradas" style={styles.section} />

      {readings.length === 0 ? (
        <FadeIn delay={120}>
          <View style={styles.emptyCard}>
            <Icon kind="alert" size={20} color={colors.accentDeep} />
            <Text style={styles.emptyTitle}>Sin lecturas de peso.</Text>
            <Text style={styles.emptyNote}>Toca + para registrar tu primera medición.</Text>
          </View>
        </FadeIn>
      ) : (
        <View style={styles.list}>
          {readings.map((r, i) => (
            <FadeIn key={r.id} delay={i * 40}>
              <View style={styles.readingRow}>
                <View style={styles.flex}>
                  <View style={styles.valueRow}>
                    <Text style={styles.value}>{r.weight_kg}</Text>
                    <Text style={styles.unit}>kg</Text>
                  </View>
                  <Text style={styles.readingMeta}>
                    {[r.height_m ? `${r.height_m} m` : null, formatDateLocal(r.measured_on ?? r.created_at)]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                </View>
                <Tappable
                  onPress={() => handleDelete(r.id)}
                  style={styles.delBtn}
                  accessibilityLabel="Eliminar"
                >
                  <Icon kind="trash" size={14} color={colors.alert} />
                </Tappable>
              </View>
            </FadeIn>
          ))}
        </View>
      )}

      <RecordFormModal
        visible={open}
        title="Registrar peso"
        submitting={submitting}
        error={formError}
        fields={[
          { key: "weight_kg", label: "Peso (kg)", placeholder: "Ej. 70", keyboardType: "numeric", required: true },
          { key: "height_m", label: "Estatura (m)", placeholder: "Ej. 1.70", keyboardType: "numeric" },
          { key: "measured_on", label: "Fecha (aaaa-mm-dd)", placeholder: "2026-06-06" },
          { key: "notes", label: "Notas", placeholder: "Opcional" }
        ]}
        onClose={() => {
          setOpen(false);
          setFormError(null);
        }}
        onSubmit={handleAdd}
      />
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 120
  },
  loading: {
    paddingVertical: 14,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginBottom: 8
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  heroEyebrow: {
    fontFamily: family.mono,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.6)",
    flexShrink: 1,
    minWidth: 0
  },
  normalTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.accentBright,
    flexShrink: 0
  },
  normalText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.ink,
    letterSpacing: 0.8
  },
  heroGrid: {
    flexDirection: "row",
    gap: 14,
    marginTop: 12
  },
  heroItem: {
    flex: 1
  },
  heroKey: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 0.9,
    textTransform: "uppercase"
  },
  heroImc: {
    fontFamily: family.serifItalic,
    fontSize: 40,
    lineHeight: 42,
    letterSpacing: -0.6,
    color: colors.paper,
    marginTop: 4
  },
  heroValue: {
    fontFamily: family.medium,
    fontSize: 24,
    letterSpacing: -0.4,
    color: colors.paper,
    marginTop: 4
  },
  heroUnit: {
    fontFamily: family.mono,
    fontSize: 11,
    color: "rgba(255,255,255,0.55)"
  },
  section: {
    marginTop: 18,
    marginBottom: 8
  },
  chartCard: {
    paddingHorizontal: 12,
    paddingVertical: 14
  },
  chartLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4
  },
  chartLabel: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    maxWidth: 36
  },
  measureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.rule3
  },
  measureDate: {
    flex: 1,
    fontFamily: family.mono,
    fontSize: 11.5,
    color: colors.ink2
  },
  measureValues: {
    alignItems: "flex-end"
  },
  measureWeight: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  measureUnit: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3
  },
  measureImc: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3
  },
  emptyInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
    padding: 14,
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.md
  },
  emptyInfoText: {
    flex: 1,
    fontFamily: family.regular,
    fontSize: 12,
    color: colors.ink2
  },
  flex: {
    flex: 1,
    minWidth: 0
  },
  list: {
    gap: 6
  },
  readingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6
  },
  value: {
    fontFamily: family.medium,
    fontSize: 20,
    letterSpacing: -0.5,
    color: colors.ink
  },
  unit: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3
  },
  readingMeta: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 3
  },
  delBtn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyCard: {
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.xl,
    padding: 18,
    gap: 8
  },
  emptyTitle: {
    fontFamily: family.serifItalic,
    fontSize: 20,
    color: colors.ink,
    marginTop: 6
  },
  emptyNote: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  }
});
