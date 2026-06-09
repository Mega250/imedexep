import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Polyline } from "react-native-svg";
import { Card } from "@/atomic/atoms/Card";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Pill } from "@/atomic/atoms/Pill";
import { DarkPanel } from "@/atomic/molecules/DarkPanel";
import { Section } from "@/atomic/molecules/Section";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goBack } from "@/navigation/screenRouter";
import { VitalSign, fetchPatientVitals } from "@/services/api/vitalsApi";
import { Patient, fetchPatient } from "@/services/api/patientsApi";
import { silentOrNull } from "@/services/api/silent";
import { getSelectedPatientId } from "@/services/api/selectedPatient";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

const W = 350;
const H = 140;
const P = 22;

function valueAxis(values: number[]): { min: number; max: number } {
  const filtered = values.filter((v) => Number.isFinite(v));
  if (filtered.length === 0) {
    return { min: 60, max: 140 };
  }
  const min = Math.min(...filtered);
  const max = Math.max(...filtered);
  return { min: Math.max(min - 10, 0), max: max + 10 };
}

function xs(i: number, n: number): number {
  if (n <= 1) {
    return W / 2;
  }
  return P + (i * (W - 2 * P)) / (n - 1);
}

function ys(v: number, min: number, max: number): number {
  if (max === min) {
    return H / 2;
  }
  return P + ((max - v) / (max - min)) * (H - 2 * P);
}

function points(values: number[], min: number, max: number): string {
  return values.map((v, i) => `${xs(i, values.length)},${ys(v, min, max)}`).join(" ");
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${months[d.getMonth()]} ${hh}:${mm}`;
}

export function DocVitalsMobilePage() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsSelection, setNeedsSelection] = useState(false);

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
        const [p, v] = await Promise.all([
          silentOrNull(fetchPatient(id), "DocVitalsMobilePage.fetchPatient"),
          fetchPatientVitals(id).catch(() => [] as VitalSign[])
        ]);
        if (!cancelled) {
          setPatient(p);
          setVitals(v.sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()));
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar los signos.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const latest = vitals[vitals.length - 1];
  const sys = vitals.map((v) => v.systolic_bp ?? 0).filter((v) => v > 0);
  const dia = vitals.map((v) => v.diastolic_bp ?? 0).filter((v) => v > 0);
  const axis = valueAxis([...sys, ...dia]);

  const CURRENT: [string, string, string][] = latest
    ? [
        ["T/A", latest.systolic_bp && latest.diastolic_bp ? `${latest.systolic_bp}/${latest.diastolic_bp}` : "—", "mmHg"],
        ["FC", latest.heart_rate !== null ? String(latest.heart_rate) : "—", "lpm"],
        ["Temp", latest.body_temperature !== null ? String(latest.body_temperature) : "—", "°C"],
        ["SpO₂", latest.oxygen_saturation !== null ? String(latest.oxygen_saturation) : "—", "%"]
      ]
    : [];

  const patientName = patient ? `${patient.first_name} ${patient.last_name}` : "paciente";

  return (
    <MobileScreen
      header={
        <ScreenTopBar
          back={patient ? `Expediente · ${patient.first_name} ${patient.last_name?.[0] ?? ""}.` : "Pacientes"}
          onBack={() => goBack("mob-patients")}
          sub="Signos vitales del paciente"
          title="Signos vitales"
        />
      }
      contentStyle={styles.content}
    >
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
            Abre un paciente desde "Mis Pacientes" o tu agenda para ver sus signos vitales.
          </Text>
        </View>
      ) : null}

      {!loading && !needsSelection && latest ? (
        <FadeIn>
          <DarkPanel radius={radii.lg} padding={16} blobSize={220} blobTop={-80} blobRight={-50}>
            <Text style={styles.heroEyebrow}>
              Última toma · {patientName} · {formatDate(latest.recorded_at)}
            </Text>
            <View style={styles.heroGrid}>
              {CURRENT.map(([k, n, u]) => (
                <View key={k} style={styles.heroItem}>
                  <Text style={styles.heroKey}>{k}</Text>
                  <View style={styles.heroValueRow}>
                    <Text style={styles.heroValue}>{n}</Text>
                    <Text style={styles.heroUnit}>{u}</Text>
                  </View>
                </View>
              ))}
            </View>
          </DarkPanel>
        </FadeIn>
      ) : null}

      {!loading && !needsSelection && !latest && !error ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Sin lecturas de signos vitales</Text>
          <Text style={styles.emptyMeta}>Aún no hay tomas registradas para este paciente.</Text>
        </View>
      ) : null}

      {sys.length > 0 ? (
        <FadeIn delay={80}>
          <Section title={`Tendencia · ${vitals.length} lecturas`}>
            <Card radius={radii.lg} style={styles.chartCard}>
              <View style={styles.pillRow}>
                <Pill label="T/A" on />
                <Pill label="FC" />
                <Pill label="Temp" />
                <Pill label="SpO₂" />
              </View>
              <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
                {[axis.min, (axis.min + axis.max) / 2, axis.max].map((v) => (
                  <Line
                    key={v}
                    x1={P}
                    x2={W - P}
                    y1={ys(v, axis.min, axis.max)}
                    y2={ys(v, axis.min, axis.max)}
                    stroke={colors.rule3}
                    strokeWidth={1}
                  />
                ))}
                <Polyline points={points(sys, axis.min, axis.max)} fill="none" stroke={colors.ink} strokeWidth={2} />
                {sys.map((v, i) => (
                  <Circle key={`s${i}`} cx={xs(i, sys.length)} cy={ys(v, axis.min, axis.max)} r={3} fill={colors.ink} />
                ))}
                <Polyline points={points(dia, axis.min, axis.max)} fill="none" stroke={colors.accent} strokeWidth={2} />
                {dia.map((v, i) => (
                  <Circle key={`d${i}`} cx={xs(i, dia.length)} cy={ys(v, axis.min, axis.max)} r={3} fill={colors.accent} />
                ))}
              </Svg>
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBar, { backgroundColor: colors.ink }]} />
                  <Text style={styles.legendText}>Sistólica</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBar, { backgroundColor: colors.accent }]} />
                  <Text style={styles.legendText}>Diastólica</Text>
                </View>
              </View>
            </Card>
          </Section>
        </FadeIn>
      ) : null}

      {vitals.length > 0 ? (
        <FadeIn delay={140}>
          <Section title="Histórico">
            {vitals
              .slice()
              .reverse()
              .map((r) => (
                <View key={r.id} style={styles.histRow}>
                  <Text style={[styles.histCell, styles.histDate]}>{formatDate(r.recorded_at)}</Text>
                  <Text style={[styles.histCell, styles.histStrong]}>
                    {r.systolic_bp && r.diastolic_bp ? `${r.systolic_bp}/${r.diastolic_bp}` : "—"}
                  </Text>
                  <Text style={styles.histCell}>{r.heart_rate ?? "—"}</Text>
                  <Text style={styles.histCell}>{r.body_temperature ?? "—"}</Text>
                  <Text style={styles.histCell}>{r.oxygen_saturation ?? "—"}</Text>
                </View>
              ))}
          </Section>
        </FadeIn>
      ) : null}
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 130
  },
  loading: {
    paddingVertical: 24,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginTop: 10,
    textAlign: "center"
  },
  empty: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: colors.rule2,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    alignItems: "center",
    gap: 6,
    marginTop: 4
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
  heroEyebrow: {
    fontFamily: family.mono,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.6)"
  },
  heroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12
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
    fontSize: 24,
    color: colors.paper
  },
  heroUnit: {
    fontFamily: family.mono,
    fontSize: 10,
    color: "rgba(255,255,255,0.6)"
  },
  chartCard: {
    padding: 14
  },
  pillRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 10
  },
  legend: {
    flexDirection: "row",
    gap: 14,
    marginTop: 6
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  legendBar: {
    width: 16,
    height: 2
  },
  legendText: {
    fontFamily: family.regular,
    fontSize: 11,
    color: colors.ink2
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
  histCell: {
    flex: 1,
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink2
  },
  histDate: {
    flex: 1.3,
    fontSize: 10.5
  },
  histStrong: {
    fontSize: 12,
    color: colors.ink,
    fontFamily: family.monoMedium
  }
});
