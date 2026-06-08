import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Polyline, Rect, Text as SvgText } from "react-native-svg";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { HistChips } from "@/atomic/organisms/HistChips";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { usePatientDesktopNav } from "@/navigation/patientNavVisibility";
import { getCurrentPatient } from "@/services/api/currentPatient";
import { VitalSign, fetchLatestPatientVitals, fetchPatientVitals, postVitalSign } from "@/services/api/vitalsApi";
import { RecordFormModal } from "@/atomic/molecules/RecordFormModal";
import { silentOrNull } from "@/services/api/silent";
import { colors, radii, shadow } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

const W = 740;
const H = 200;
const P = 28;

const MONTH_NAMES = [
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

function fmtDate(value: string): string {
  const d = new Date(value);
  return `${MONTH_NAMES[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}`;
}

function fmtDateTime(value: string): string {
  const d = new Date(value);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${fmtDate(value)} · ${hh}:${mm}`;
}

function fmtNumber(value: number | null | undefined, decimals = 0): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  return decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
}

function xs(i: number, count: number): number {
  if (count <= 1) {
    return W / 2;
  }
  return P + (i * (W - 2 * P)) / (count - 1);
}

function ys(v: number, min: number, max: number): number {
  if (max === min) {
    return H / 2;
  }
  return P + ((max - v) / (max - min)) * (H - 2 * P);
}

export function PatVitalsDesktopPage() {
  const nav = usePatientDesktopNav();
  const [latest, setLatest] = useState<VitalSign | null>(null);
  const [history, setHistory] = useState<VitalSign[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pid, setPid] = useState<number | null>(null);
  const [bloodType, setBloodType] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function reload(patientId: number) {
    const [hist, latestVal] = await Promise.all([
      fetchPatientVitals(patientId, 50).catch(() => [] as VitalSign[]),
      silentOrNull(fetchLatestPatientVitals(patientId), "PatVitalsDesktopPage.fetchLatestPatientVitals")
    ]);
    setHistory(hist);
    setLatest(latestVal);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const patient = await getCurrentPatient();
        if (cancelled) return;
        setPid(patient.id);
        setBloodType(patient.blood_type ?? null);
        await reload(patient.id);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar tus signos vitales.");
          setHistory([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAddVital(values: Record<string, string>) {
    if (!pid) return;
    setSubmitting(true);
    setFormError(null);
    const num = (k: string) => (values[k] ? Number(values[k]) : undefined);
    try {
      await postVitalSign({
        patient_id: pid,
        weight: num("weight"),
        height: num("height"),
        systolic_bp: num("systolic_bp"),
        diastolic_bp: num("diastolic_bp"),
        heart_rate: num("heart_rate"),
        oxygen_saturation: num("oxygen_saturation"),
        body_temperature: num("body_temperature"),
        source: "home"
      });
      setOpen(false);
      await reload(pid);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No pudimos guardar la toma.");
    } finally {
      setSubmitting(false);
    }
  }

  const sortedAsc = useMemo(
    () =>
      history
        ? [...history].sort(
            (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
          )
        : [],
    [history]
  );

  const sortedDesc = useMemo(() => [...sortedAsc].reverse(), [sortedAsc]);

  const sysSeries = sortedAsc
    .map((v) => v.systolic_bp)
    .filter((v): v is number => typeof v === "number");
  const diaSeries = sortedAsc
    .map((v) => v.diastolic_bp)
    .filter((v): v is number => typeof v === "number");

  const allValues = [...sysSeries, ...diaSeries];
  const dataMin = allValues.length ? Math.min(...allValues) : 60;
  const dataMax = allValues.length ? Math.max(...allValues) : 140;
  const minV = Math.min(60, dataMin - 5);
  const maxV = Math.max(140, dataMax + 5);

  const sysPoints = sysSeries
    .map((v, i) => `${xs(i, sysSeries.length)},${ys(v, minV, maxV)}`)
    .join(" ");
  const diaPoints = diaSeries
    .map((v, i) => `${xs(i, diaSeries.length)},${ys(v, minV, maxV)}`)
    .join(" ");
  const bandTop = ys(Math.min(130, maxV), minV, maxV);
  const bandHeight = Math.max(0, ys(80, minV, maxV) - ys(130, minV, maxV));

  const xLabelCount = Math.min(sortedAsc.length, 8);
  const xLabelIndexes = sortedAsc.length
    ? Array.from({ length: xLabelCount }, (_, k) =>
        Math.round((k * (sortedAsc.length - 1)) / Math.max(1, xLabelCount - 1))
      )
    : [];

  const totalCount = history?.length ?? 0;
  const eyebrow = latest
    ? `Última toma · ${fmtDateTime(latest.recorded_at)}`
    : history
      ? `${totalCount} ${totalCount === 1 ? "medición" : "mediciones"} en tu expediente`
      : "Cargando…";

  const heroMetrics: { k: string; n: string; u: string }[] = [
    {
      k: "T/A",
      n:
        latest && latest.systolic_bp && latest.diastolic_bp
          ? `${latest.systolic_bp} / ${latest.diastolic_bp}`
          : "—",
      u: "mmHg"
    },
    {
      k: "FC",
      n: fmtNumber(latest?.heart_rate ?? null),
      u: "lpm"
    },
    {
      k: "Temp",
      n: fmtNumber(latest?.body_temperature ?? null, 1),
      u: "°C"
    },
    {
      k: "SpO₂",
      n: fmtNumber(latest?.oxygen_saturation ?? null),
      u: "%"
    }
  ];

  const roleLabel = bloodType ? `paciente · ${bloodType}` : "paciente";

  return (
    <DesktopShell
      nav={nav}
      activeScreen="pat-vitals"
      role={roleLabel}
      roleBadge="Paciente"
      title="Mis signos vitales"
      eyebrow={eyebrow}
      searchPlaceholder="Buscar…"
      subBar={<HistChips active={6} />}
      topBarRight={
        <Button
          label="Anotar toma en casa"
          variant="ghost"
          size="sm"
          block={false}
          height={42}
          radius={radii.md}
          iconLeft="plus"
          onPress={() => setOpen(true)}
        />
      }
    >
      {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

      {history === null ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}

      <FadeIn>
        <View style={styles.hero}>
          <View pointerEvents="none" style={styles.heroBlob} />
          <View style={styles.heroGrid}>
            <View style={styles.heroIntro}>
              <Text style={styles.heroEyebrow}>
                {latest ? `Última toma · ${fmtDateTime(latest.recorded_at)}` : "Aún sin lecturas"}
              </Text>
              <Text style={styles.heroTitle}>
                {latest ? "Lectura registrada." : "Aún no tienes lecturas."}
              </Text>
              <Text style={styles.heroSub}>
                {latest
                  ? `Registro #${latest.id}`
                  : "Usa 'Anotar toma en casa' para registrar tu primera lectura."}
              </Text>
            </View>
            {heroMetrics.map((m) => (
              <View key={m.k} style={styles.heroMetric}>
                <Text style={styles.heroEyebrow}>{m.k}</Text>
                <View style={styles.heroMetricValueRow}>
                  <Text style={styles.heroMetricValue}>{m.n}</Text>
                  <Text style={styles.heroMetricUnit}>{m.u}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </FadeIn>

      {sysSeries.length > 0 || diaSeries.length > 0 ? (
        <FadeIn delay={80}>
          <View style={styles.chartCard}>
            <View style={styles.chartHead}>
              <View style={styles.flexShrink}>
                <Text style={styles.cardTitle}>
                  {`Tu presión arterial · ${sortedAsc.length} toma${sortedAsc.length === 1 ? "" : "s"}`}
                </Text>
                <Text style={styles.cardSub}>
                  Desde {fmtDate(sortedAsc[0].recorded_at)} · histórico real
                </Text>
              </View>
            </View>
            <View style={styles.chartBody}>
              <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
                {bandHeight > 0 ? (
                  <Rect
                    x={P}
                    y={bandTop}
                    width={W - 2 * P}
                    height={bandHeight}
                    fill="rgba(28,140,90,0.08)"
                  />
                ) : null}
                {[60, 80, 100, 120, 140].map((v) =>
                  v >= minV && v <= maxV ? (
                    <Line
                      key={`grid-${v}`}
                      x1={P}
                      x2={W - P}
                      y1={ys(v, minV, maxV)}
                      y2={ys(v, minV, maxV)}
                      stroke={colors.rule3}
                      strokeWidth={1}
                    />
                  ) : null
                )}
                {[60, 80, 100, 120, 140].map((v) =>
                  v >= minV && v <= maxV ? (
                    <SvgText
                      key={`axis-${v}`}
                      x={4}
                      y={ys(v, minV, maxV) + 4}
                      fontFamily={family.mono}
                      fontSize={10}
                      fill={colors.ink3}
                    >
                      {String(v)}
                    </SvgText>
                  ) : null
                )}
                {xLabelIndexes.map((idx, k) => (
                  <SvgText
                    key={`xlbl-${k}`}
                    x={xs(idx, sortedAsc.length)}
                    y={H - 6}
                    fontFamily={family.mono}
                    fontSize={10}
                    fill={colors.ink3}
                    textAnchor="middle"
                  >
                    {fmtDate(sortedAsc[idx].recorded_at)}
                  </SvgText>
                ))}
                {sysSeries.length > 1 ? (
                  <Polyline
                    points={sysPoints}
                    fill="none"
                    stroke={colors.ink}
                    strokeWidth={2.5}
                  />
                ) : null}
                {sysSeries.map((v, i) => (
                  <Circle
                    key={`s${i}`}
                    cx={xs(i, sysSeries.length)}
                    cy={ys(v, minV, maxV)}
                    r={4}
                    fill={colors.ink}
                  />
                ))}
                {diaSeries.length > 1 ? (
                  <Polyline
                    points={diaPoints}
                    fill="none"
                    stroke={colors.accent}
                    strokeWidth={2.5}
                  />
                ) : null}
                {diaSeries.map((v, i) => (
                  <Circle
                    key={`d${i}`}
                    cx={xs(i, diaSeries.length)}
                    cy={ys(v, minV, maxV)}
                    r={4}
                    fill={colors.accent}
                  />
                ))}
              </Svg>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendLine, { backgroundColor: colors.ink }]} />
                  <Text style={styles.legendText}>Sistólica</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendLine, { backgroundColor: colors.accent }]} />
                  <Text style={styles.legendText}>Diastólica</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={styles.legendSwatch} />
                  <Text style={styles.legendText}>Rango saludable</Text>
                </View>
              </View>
            </View>
          </View>
        </FadeIn>
      ) : history && history.length === 0 ? (
        <FadeIn delay={80}>
          <View style={styles.empty}>
            <Icon kind="alert" size={18} color={colors.accentDeep} />
            <View style={styles.emptyBody}>
              <Text style={styles.emptyTitle}>Aún no registras tomas.</Text>
              <Text style={styles.emptySub}>
                Usa 'Anotar toma en casa' para registrar tu primera lectura.
              </Text>
            </View>
          </View>
        </FadeIn>
      ) : null}

      <FadeIn delay={160}>
        <View style={styles.bottomGrid}>
          <View style={[styles.card, styles.historyCol]}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>Histórico</Text>
              <Text style={styles.cardAction}>
                {totalCount > 0 ? `${totalCount} registro${totalCount === 1 ? "" : "s"}` : ""}
              </Text>
            </View>
            {sortedDesc.length === 0 ? (
              <View style={styles.histEmpty}>
                <Text style={styles.histEmptyText}>Sin mediciones aún.</Text>
              </View>
            ) : (
              <>
                <View style={styles.histHead}>
                  <Text style={[styles.histHeadCell, styles.histColDate]}>Fecha</Text>
                  <Text style={[styles.histHeadCell, styles.histCol]}>T/A</Text>
                  <Text style={[styles.histHeadCell, styles.histCol]}>FC</Text>
                  <Text style={[styles.histHeadCell, styles.histCol]}>Temp</Text>
                  <Text style={[styles.histHeadCell, styles.histCol]}>SpO₂</Text>
                </View>
                {sortedDesc.slice(0, 12).map((r, i, arr) => (
                  <View
                    key={r.id}
                    style={[
                      styles.histRow,
                      { borderBottomWidth: i < arr.length - 1 ? 1 : 0 }
                    ]}
                  >
                    <Text style={[styles.histDate, styles.histColDate]}>
                      {fmtDate(r.recorded_at)}
                    </Text>
                    <Text style={[styles.histTa, styles.histCol]}>
                      {r.systolic_bp && r.diastolic_bp ? `${r.systolic_bp}/${r.diastolic_bp}` : "—"}
                    </Text>
                    <Text style={[styles.histVal, styles.histCol]}>
                      {fmtNumber(r.heart_rate)}
                    </Text>
                    <Text style={[styles.histVal, styles.histCol]}>
                      {fmtNumber(r.body_temperature, 1)}
                    </Text>
                    <Text style={[styles.histVal, styles.histCol]}>
                      {fmtNumber(r.oxygen_saturation)}
                    </Text>
                  </View>
                ))}
              </>
            )}
          </View>
        </View>
      </FadeIn>

      <RecordFormModal
        visible={open}
        title="Anotar toma en casa"
        submitting={submitting}
        error={formError}
        fields={[
          { key: "systolic_bp", label: "Presión sistólica", placeholder: "120", keyboardType: "numeric" },
          { key: "diastolic_bp", label: "Presión diastólica", placeholder: "80", keyboardType: "numeric" },
          { key: "heart_rate", label: "Pulso (lpm)", placeholder: "72", keyboardType: "numeric" },
          { key: "oxygen_saturation", label: "SpO₂ (%)", placeholder: "98", keyboardType: "numeric" },
          { key: "body_temperature", label: "Temperatura (°C)", placeholder: "36.5", keyboardType: "numeric" },
          { key: "weight", label: "Peso (kg)", placeholder: "70", keyboardType: "numeric" },
          { key: "height", label: "Estatura (m)", placeholder: "1.70", keyboardType: "numeric" }
        ]}
        onClose={() => {
          setOpen(false);
          setFormError(null);
        }}
        onSubmit={handleAddVital}
      />
    </DesktopShell>
  );
}

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
  hero: {
    backgroundColor: colors.ink,
    borderRadius: radii.xl,
    paddingHorizontal: 28,
    paddingVertical: 24,
    overflow: "hidden",
    ...shadow.hero
  },
  heroBlob: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: 999,
    backgroundColor: "rgba(0,180,216,0.18)",
    top: -120,
    right: -90
  },
  heroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 16
  },
  heroIntro: {
    flexGrow: 1.2,
    flexBasis: 220,
    minWidth: 0
  },
  heroEyebrow: {
    ...text.eyebrow,
    color: "rgba(255,255,255,0.6)"
  },
  heroTitle: {
    fontFamily: family.serif,
    fontSize: 30,
    lineHeight: 32,
    letterSpacing: -0.6,
    color: colors.paper,
    marginTop: 8
  },
  heroSub: {
    fontFamily: family.mono,
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginTop: 8
  },
  heroMetric: {
    flexGrow: 1,
    flexBasis: 110,
    minWidth: 0
  },
  heroMetricValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 4
  },
  heroMetricValue: {
    fontFamily: family.serif,
    fontSize: 30,
    lineHeight: 30,
    letterSpacing: -0.6,
    color: colors.paper
  },
  heroMetricUnit: {
    fontFamily: family.mono,
    fontSize: 11,
    color: "rgba(255,255,255,0.6)"
  },
  empty: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 20,
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.xl,
    flexDirection: "row",
    gap: 14,
    alignItems: "center"
  },
  emptyBody: {
    flex: 1,
    minWidth: 0
  },
  emptyTitle: {
    fontFamily: family.medium,
    fontSize: 14,
    color: colors.ink
  },
  emptySub: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    marginTop: 4
  },
  chartCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden",
    marginTop: 18
  },
  chartHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  flexShrink: {
    flexShrink: 1,
    minWidth: 0
  },
  cardTitle: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  cardSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 2
  },
  chartBody: {
    padding: 24
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
    marginTop: 16
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  legendLine: {
    width: 22,
    height: 3,
    borderRadius: 99
  },
  legendSwatch: {
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: "rgba(28,140,90,0.15)",
    borderWidth: 1,
    borderColor: "#BFE3CF"
  },
  legendText: {
    fontFamily: family.regular,
    fontSize: 12,
    color: colors.ink2
  },
  bottomGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 18
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  historyCol: {
    flexGrow: 1,
    flexBasis: 360,
    minWidth: 0
  },
  cardHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  cardAction: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.accentDeep
  },
  histHead: {
    flexDirection: "row",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  histHeadCell: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    letterSpacing: 1.05,
    textTransform: "uppercase"
  },
  histColDate: {
    width: 110
  },
  histCol: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 0
  },
  histRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomColor: colors.rule3
  },
  histDate: {
    fontFamily: family.mono,
    fontSize: 11.5,
    color: colors.ink2
  },
  histTa: {
    fontFamily: family.monoMedium,
    fontSize: 12.5,
    color: colors.ink
  },
  histVal: {
    fontFamily: family.mono,
    fontSize: 12,
    color: colors.ink2
  },
  histEmpty: {
    paddingHorizontal: 22,
    paddingVertical: 18
  },
  histEmptyText: {
    fontFamily: family.mono,
    fontSize: 11.5,
    color: colors.ink3
  }
});
