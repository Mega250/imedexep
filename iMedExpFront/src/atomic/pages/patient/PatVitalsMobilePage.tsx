import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Polyline, Rect } from "react-native-svg";
import { Card } from "@/atomic/atoms/Card";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { DarkPanel } from "@/atomic/molecules/DarkPanel";
import { Section } from "@/atomic/molecules/Section";
import { PatientExtrasTabBar } from "@/atomic/organisms/PatientExtrasTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { getCurrentPatientId } from "@/services/api/currentPatient";
import { VitalSign, fetchLatestPatientVitals, fetchPatientVitals } from "@/services/api/vitalsApi";
import { silentOrEmpty, silentOrNull } from "@/services/api/silent";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

const W = 340;
const H = 130;
const P = 20;

function fmtDate(value: string): string {
  const d = new Date(value);
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function fmtLatest(value: string): string {
  const d = new Date(value);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm} · ${fmtDate(value)}`;
}

type ChartProps = {
  sys: number[];
  dia: number[];
  min: number;
  max: number;
};

function xs(i: number, count: number): number {
  return P + (i * (W - 2 * P)) / Math.max(1, count - 1);
}

function ys(v: number, min: number, max: number): number {
  return P + ((max - v) / Math.max(1, max - min)) * (H - 2 * P);
}

function pointsString(values: number[], min: number, max: number): string {
  return values.map((v, i) => `${xs(i, values.length)},${ys(v, min, max)}`).join(" ");
}

function VitalsChart({ sys, dia, min, max }: ChartProps) {
  if (sys.length === 0 && dia.length === 0) {
    return null;
  }
  return (
    <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <Rect
        x={P}
        y={ys(Math.min(130, max), min, max)}
        width={W - 2 * P}
        height={Math.max(0, ys(80, min, max) - ys(130, min, max))}
        fill="rgba(28,140,90,0.08)"
      />
      {[80, 100, 120, 140].map((v) =>
        v >= min && v <= max ? (
          <Line
            key={v}
            x1={P}
            x2={W - P}
            y1={ys(v, min, max)}
            y2={ys(v, min, max)}
            stroke={colors.rule3}
            strokeWidth={1}
          />
        ) : null
      )}
      {sys.length > 1 ? (
        <Polyline
          points={pointsString(sys, min, max)}
          fill="none"
          stroke={colors.ink}
          strokeWidth={2.5}
        />
      ) : null}
      {sys.map((v, i) => (
        <Circle key={`s${i}`} cx={xs(i, sys.length)} cy={ys(v, min, max)} r={3} fill={colors.ink} />
      ))}
      {dia.length > 1 ? (
        <Polyline
          points={pointsString(dia, min, max)}
          fill="none"
          stroke={colors.accent}
          strokeWidth={2.5}
        />
      ) : null}
      {dia.map((v, i) => (
        <Circle key={`d${i}`} cx={xs(i, dia.length)} cy={ys(v, min, max)} r={3} fill={colors.accent} />
      ))}
    </Svg>
  );
}

export function PatVitalsMobilePage() {
  const [latest, setLatest] = useState<VitalSign | null>(null);
  const [history, setHistory] = useState<VitalSign[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const patientId = await getCurrentPatientId();
        const [hist, latestVal] = await Promise.all([
          silentOrEmpty(fetchPatientVitals(patientId, 50), "PatVitalsMobilePage.fetchPatientVitals"),
          silentOrNull(fetchLatestPatientVitals(patientId), "PatVitalsMobilePage.fetchLatestPatientVitals")
        ]);
        if (!cancelled) {
          setHistory(hist);
          setLatest(latestVal);
        }
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

  const sortedHistory = useMemo(
    () =>
      history
        ? [...history].sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
        : [],
    [history]
  );

  const sysSeries = sortedHistory.map((v) => v.systolic_bp).filter((v): v is number => typeof v === "number");
  const diaSeries = sortedHistory.map((v) => v.diastolic_bp).filter((v): v is number => typeof v === "number");

  const allValues = [...sysSeries, ...diaSeries];
  const minV = allValues.length ? Math.min(60, ...allValues) : 60;
  const maxV = allValues.length ? Math.max(160, ...allValues) : 160;

  return (
    <MobileScreen
      tabBar={<PatientExtrasTabBar activeScreen="pat-vitals-mob" />}
      header={
        <ScreenTopBar
          sub={latest ? fmtLatest(latest.recorded_at) : "Cargando…"}
          title="Tus signos vitales"
        />
      }
      contentStyle={styles.content}
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {history === null ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}

      <FadeIn>
        <DarkPanel radius={radii.lg} padding={18} blobSize={220} blobTop={-80} blobRight={-50}>
          <Text style={styles.heroEyebrow}>Lectura más reciente</Text>
          <Text style={styles.heroTitle}>
            {latest ? "Lectura registrada." : "Aún sin lecturas."}
          </Text>
          <View style={styles.heroGrid}>
            <HeroItem
              k="T/A"
              n={latest && latest.systolic_bp && latest.diastolic_bp ? `${latest.systolic_bp}/${latest.diastolic_bp}` : null}
              u="mmHg"
            />
            <HeroItem k="FC" n={latest?.heart_rate ?? null} u="lpm" />
            <HeroItem k="Temp" n={latest?.body_temperature ?? null} u="°C" />
            <HeroItem k="SpO₂" n={latest?.oxygen_saturation ?? null} u="%" />
          </View>
        </DarkPanel>
      </FadeIn>

      {sysSeries.length > 0 || diaSeries.length > 0 ? (
        <FadeIn delay={80}>
          <Section title="Tu presión arterial">
            <Card radius={radii.lg} style={styles.chartCard}>
              <VitalsChart sys={sysSeries} dia={diaSeries} min={minV} max={maxV} />
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBar, { backgroundColor: colors.ink }]} />
                  <Text style={styles.legendText}>Sistólica</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBar, { backgroundColor: colors.accent }]} />
                  <Text style={styles.legendText}>Diastólica</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={styles.legendSwatch} />
                  <Text style={styles.legendText}>Sano</Text>
                </View>
              </View>
            </Card>
          </Section>
        </FadeIn>
      ) : history && history.length === 0 ? (
        <FadeIn delay={80}>
          <View style={styles.emptyCard}>
            <Icon kind="alert" size={16} color={colors.accentDeep} />
            <Text style={styles.emptyText}>
              No hay mediciones registradas en tu expediente.
            </Text>
          </View>
        </FadeIn>
      ) : null}

      {sortedHistory.length > 0 ? (
        <FadeIn delay={140}>
          <Section title="Últimas mediciones">
            {[...sortedHistory].reverse().slice(0, 10).map((v) => (
              <View key={v.id} style={styles.row}>
                <Text style={styles.rowDate} numberOfLines={1}>{fmtDate(v.recorded_at)}</Text>
                <Text style={styles.rowVal} numberOfLines={1}>
                  {v.systolic_bp && v.diastolic_bp ? `${v.systolic_bp}/${v.diastolic_bp} mmHg` : "—"}
                </Text>
                <Text style={styles.rowHr} numberOfLines={1}>
                  {v.heart_rate ? `${v.heart_rate} lpm` : "—"}
                </Text>
              </View>
            ))}
          </Section>
        </FadeIn>
      ) : null}
    </MobileScreen>
  );
}

type HeroItemProps = { k: string; n: number | string | null; u: string };

function HeroItem({ k, n, u }: HeroItemProps) {
  return (
    <View style={styles.heroItem}>
      <Text style={styles.heroKey}>{k}</Text>
      <View style={styles.heroValueRow}>
        <Text style={styles.heroValue}>{n === null || n === undefined ? "—" : n}</Text>
        <Text style={styles.heroUnit}>{u}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 26,
    color: colors.paper,
    marginTop: 6
  },
  heroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 14
  },
  heroItem: {
    width: "50%",
    marginBottom: 10
  },
  heroKey: {
    fontFamily: family.mono,
    fontSize: 9,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.6)"
  },
  heroValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 2
  },
  heroValue: {
    fontFamily: family.serifItalic,
    fontSize: 22,
    color: colors.paper
  },
  heroUnit: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: "rgba(255,255,255,0.6)"
  },
  chartCard: {
    padding: 14
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    rowGap: 8,
    marginTop: 8
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  legendBar: {
    width: 14,
    height: 2
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: "rgba(28,140,90,0.15)",
    borderWidth: 1,
    borderColor: colors.okRule
  },
  legendText: {
    fontFamily: family.regular,
    fontSize: 10.5,
    color: colors.ink2
  },
  emptyCard: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginTop: 16,
    padding: 14,
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.md
  },
  emptyText: {
    flex: 1,
    fontFamily: family.regular,
    fontSize: 12,
    color: colors.ink2
  },
  row: {
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
  rowDate: {
    flex: 1,
    minWidth: 0,
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink2
  },
  rowVal: {
    flex: 1,
    minWidth: 0,
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.ink
  },
  rowHr: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  }
});
