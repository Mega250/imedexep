import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Polyline, Text as SvgText } from "react-native-svg";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { doctorNav } from "@/navigation/desktopNavConfigs";
import { fetchPatient, Patient } from "@/services/api/patientsApi";
import { fetchPatientVitals, VitalSign } from "@/services/api/vitalsApi";
import { getSelectedPatientId } from "@/services/api/selectedPatient";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

const W = 700;
const H = 200;
const P = 28;

function ys(v: number, min: number, max: number, count: number, idx: number, totalCount: number) {
  const x = P + (idx * (W - 2 * P)) / Math.max(1, totalCount - 1);
  const y = P + ((max - v) / (max - min)) * (H - 2 * P);
  return { x, y };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const mon = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"][d.getMonth()];
  return `${d.getDate()} ${mon}`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return `hoy ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  return formatDate(iso);
}

function computeAge(dob: string): number {
  const d = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) {
    age -= 1;
  }
  return age;
}

function CardBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export function DocVitalsDesktopPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [vitals, setVitals] = useState<VitalSign[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const selectedPatientId = await getSelectedPatientId();
        if (selectedPatientId === null) {
          if (!cancelled) {
            setError("Selecciona un paciente antes de abrir sus signos vitales.");
            setLoading(false);
          }
          return;
        }
        const p = await fetchPatient(selectedPatientId);
        const v = await fetchPatientVitals(p.id, 12);
        if (cancelled) {
          return;
        }
        setPatient(p);
        setVitals(v);
        setLoading(false);
      } catch (err) {
        if (cancelled) {
          return;
        }
        setError(err instanceof Error ? err.message : "No pudimos cargar los vitales.");
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const sorted = [...vitals].sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
  const latest = sorted[sorted.length - 1] ?? null;

  const summary: [string, string, string, string][] = latest
    ? [
        ["T/A", latest.systolic_bp && latest.diastolic_bp ? `${latest.systolic_bp} / ${latest.diastolic_bp}` : "—", "mmHg", "actual"],
        ["FC", latest.heart_rate ? String(latest.heart_rate) : "—", "lpm", "actual"],
        ["Temp", latest.body_temperature ? String(latest.body_temperature) : "—", "°C", "actual"],
        ["SpO₂", latest.oxygen_saturation ? String(latest.oxygen_saturation) : "—", "%", "actual"]
      ]
    : [];

  return (
    <DesktopShell
      nav={doctorNav}
      activeScreen="dsk-patients"
      role="médico"
      roleBadge="Médico"
      title={patient ? `Signos vitales · ${patient.first_name} ${patient.last_name}` : "Signos vitales"}
      eyebrow="Signos vitales del paciente"
      searchPlaceholder="Buscar fecha…"
      topBarRight={
        <View style={styles.ctaWrap}>
          <Button
            label="Registrar toma"
            variant="accent"
            size="sm"
            block={false}
            height={42}
            radius={radii.md}
            iconLeft="plus"
            disabled
            style={styles.ctaBtnDisabled}
          />
          <Text style={styles.ctaHint}>Próximamente</Text>
        </View>
      }
    >
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.accentDeep} />
          <Text style={styles.loadingText}>Cargando vitales…</Text>
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : !patient ? null : (
        <>
          <FadeIn>
            <View style={styles.summaryBand}>
              <View style={styles.summaryBlob} />
              <View style={styles.summaryRow}>
                <View style={styles.summaryIdentity}>
                  <Text style={styles.summaryEyebrow}>
                    {latest ? `Última toma · ${formatDateTime(latest.recorded_at)}` : "Sin tomas registradas"}
                  </Text>
                  <Text style={styles.summaryName}>
                    {patient.first_name} {patient.last_name}
                  </Text>
                  <Text style={styles.summaryMeta}>
                    {computeAge(patient.date_of_birth)}a
                    {patient.blood_type ? ` · ${patient.blood_type}` : ""}
                    {latest?.imc ? ` · IMC ${latest.imc}` : ""}
                  </Text>
                </View>
                {summary.length === 0 ? (
                  <Text style={styles.summaryMeta}>Sin lecturas recientes</Text>
                ) : (
                  summary.map(([k, n, u, tag]) => (
                    <View key={k} style={styles.summaryMetric}>
                      <Text style={styles.summaryEyebrow}>{k}</Text>
                      <View style={styles.summaryValueRow}>
                        <Text style={styles.summaryValue}>{n}</Text>
                        <Text style={styles.summaryUnit}>{u}</Text>
                      </View>
                      <View style={styles.summaryTag}>
                        <Text style={styles.summaryTagText}>{tag.toUpperCase()}</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>
          </FadeIn>

          {sorted.length >= 2 ? (
            <FadeIn delay={60}>
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <Text style={styles.chartTitle}>Tendencia · últimas {sorted.length} tomas</Text>
                </View>
                <View style={styles.chartBody}>
                  <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
                    {[60, 80, 100, 120, 140].map((v) => {
                      const y = P + ((140 - v) / (140 - 60)) * (H - 2 * P);
                      return (
                        <React.Fragment key={v}>
                          <Line x1={P} x2={W - P} y1={y} y2={y} stroke={colors.rule3} strokeWidth={1} />
                          <SvgText x={4} y={y + 4} fontFamily={family.mono} fontSize={10} fill={colors.ink3}>
                            {String(v)}
                          </SvgText>
                        </React.Fragment>
                      );
                    })}
                    {sorted.map((v, i) => (
                      <SvgText
                        key={`d${v.id}`}
                        x={ys(0, 60, 140, sorted.length, i, sorted.length).x}
                        y={H - 6}
                        fontFamily={family.mono}
                        fontSize={10}
                        fill={colors.ink3}
                        textAnchor="middle"
                      >
                        {formatDate(v.recorded_at)}
                      </SvgText>
                    ))}
                    <Polyline
                      fill="none"
                      stroke={colors.ink}
                      strokeWidth={2}
                      points={sorted
                        .map((v, i) => {
                          if (!v.systolic_bp) {
                            return null;
                          }
                          const p = ys(v.systolic_bp, 60, 140, sorted.length, i, sorted.length);
                          return `${p.x},${p.y}`;
                        })
                        .filter(Boolean)
                        .join(" ")}
                    />
                    {sorted.map((v, i) => {
                      if (!v.systolic_bp) {
                        return null;
                      }
                      const p = ys(v.systolic_bp, 60, 140, sorted.length, i, sorted.length);
                      return <Circle key={`s${v.id}`} cx={p.x} cy={p.y} r={3.5} fill={colors.ink} />;
                    })}
                    <Polyline
                      fill="none"
                      stroke={colors.accent}
                      strokeWidth={2}
                      points={sorted
                        .map((v, i) => {
                          if (!v.diastolic_bp) {
                            return null;
                          }
                          const p = ys(v.diastolic_bp, 60, 140, sorted.length, i, sorted.length);
                          return `${p.x},${p.y}`;
                        })
                        .filter(Boolean)
                        .join(" ")}
                    />
                    {sorted.map((v, i) => {
                      if (!v.diastolic_bp) {
                        return null;
                      }
                      const p = ys(v.diastolic_bp, 60, 140, sorted.length, i, sorted.length);
                      return <Circle key={`d${v.id}`} cx={p.x} cy={p.y} r={3.5} fill={colors.accent} />;
                    })}
                  </Svg>
                  <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendSwatch, { backgroundColor: colors.ink }]} />
                      <Text style={styles.legendText}>TA sistólica</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendSwatch, { backgroundColor: colors.accent }]} />
                      <Text style={styles.legendText}>TA diastólica</Text>
                    </View>
                  </View>
                </View>
              </View>
            </FadeIn>
          ) : null}

          <FadeIn delay={120}>
            <View style={styles.bottomGrid}>
              <View style={styles.historyCol}>
                <CardBlock title="Histórico de tomas">
                  {sorted.length === 0 ? (
                    <View style={styles.emptyBox}>
                      <Text style={styles.emptyText}>Sin tomas registradas</Text>
                    </View>
                  ) : (
                    <>
                      <View style={styles.historyHead}>
                        <Text style={[styles.historyHeadCell, styles.cellDate]}>Fecha</Text>
                        <Text style={[styles.historyHeadCell, styles.cellFlex]}>T/A</Text>
                        <Text style={[styles.historyHeadCell, styles.cellFlex]}>FC</Text>
                        <Text style={[styles.historyHeadCell, styles.cellFlex]}>Temp</Text>
                        <Text style={[styles.historyHeadCell, styles.cellFlex]}>SpO₂</Text>
                      </View>
                      {[...sorted].reverse().map((r, i, arr) => (
                        <View
                          key={r.id}
                          style={[styles.historyRow, { borderBottomWidth: i < arr.length - 1 ? 1 : 0 }]}
                        >
                          <Text style={[styles.historyDate, styles.cellDate]}>{formatDateTime(r.recorded_at)}</Text>
                          <Text style={[styles.historyTA, styles.cellFlex]}>
                            {r.systolic_bp && r.diastolic_bp ? `${r.systolic_bp}/${r.diastolic_bp}` : "—"}
                          </Text>
                          <Text style={[styles.historyMono, styles.cellFlex]}>{r.heart_rate ?? "—"}</Text>
                          <Text style={[styles.historyMono, styles.cellFlex]}>{r.body_temperature ?? "—"}</Text>
                          <Text style={[styles.historyMono, styles.cellFlex]}>{r.oxygen_saturation ?? "—"}</Text>
                        </View>
                      ))}
                    </>
                  )}
                </CardBlock>
              </View>
            </View>
          </FadeIn>
        </>
      )}
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  ctaWrap: {
    alignItems: "flex-end",
    gap: 4
  },
  ctaBtnDisabled: {
    opacity: 0.45
  },
  ctaHint: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3
  },
  summaryBand: {
    backgroundColor: colors.ink,
    borderRadius: radii.xl,
    paddingHorizontal: 26,
    paddingVertical: 22,
    overflow: "hidden"
  },
  summaryBlob: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 999,
    backgroundColor: "rgba(0,180,216,0.18)",
    top: -120,
    right: -80
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 16
  },
  summaryIdentity: {
    flexGrow: 1.4,
    flexBasis: 200,
    minWidth: 0
  },
  summaryEyebrow: {
    ...text.eyebrow,
    color: "rgba(255,255,255,0.6)"
  },
  summaryName: {
    fontFamily: family.serif,
    fontSize: 30,
    lineHeight: 32,
    letterSpacing: -0.6,
    color: colors.paper,
    marginTop: 8
  },
  summaryMeta: {
    fontFamily: family.mono,
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginTop: 8
  },
  summaryMetric: {
    flexGrow: 1,
    flexBasis: 110,
    minWidth: 0
  },
  summaryValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 4
  },
  summaryValue: {
    fontFamily: family.serif,
    fontSize: 26,
    lineHeight: 28,
    letterSpacing: -0.6,
    color: colors.paper
  },
  summaryUnit: {
    fontFamily: family.mono,
    fontSize: 11,
    color: "rgba(255,255,255,0.6)"
  },
  summaryTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "rgba(28,140,90,0.25)",
    marginTop: 6
  },
  summaryTagText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    letterSpacing: 0.76,
    color: "#A8E5C7"
  },
  chartCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden",
    marginTop: 18
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  chartTitle: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
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
  legendSwatch: {
    width: 22,
    height: 3,
    borderRadius: 99
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
  historyCol: {
    flexGrow: 1,
    flexBasis: 420,
    minWidth: 0
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  cardHeader: {
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
  historyHead: {
    flexDirection: "row",
    paddingHorizontal: 18,
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
  cellDate: {
    width: 110
  },
  cellFlex: {
    flex: 1,
    minWidth: 0
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomColor: colors.rule3
  },
  historyDate: {
    fontFamily: family.mono,
    fontSize: 11.5,
    color: colors.ink2
  },
  historyTA: {
    fontFamily: family.monoMedium,
    fontSize: 12.5,
    color: colors.ink
  },
  historyMono: {
    fontFamily: family.mono,
    fontSize: 12,
    color: colors.ink2
  },
  emptyBox: {
    paddingVertical: 30,
    alignItems: "center"
  },
  emptyText: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink3
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
