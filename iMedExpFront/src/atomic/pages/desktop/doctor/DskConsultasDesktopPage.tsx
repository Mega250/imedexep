import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { doctorNav } from "@/navigation/desktopNavConfigs";
import { goToScreen } from "@/navigation/screenRouter";
import { ConsultationSummary, fetchConsultations } from "@/services/api/consultationsApi";
import { getCurrentDoctorId } from "@/services/api/currentDoctor";
import { fetchPatient } from "@/services/api/patientsApi";
import { getSelectedPatientId } from "@/services/api/selectedPatient";
import { setSelectedConsultationId } from "@/services/api/selectedConsultation";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(iso: string): { time: string; day: string } {
  const d = new Date(iso);
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return { time, day: "hoy" };
  }
  const yest = new Date(today);
  yest.setDate(today.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) {
    return { time, day: "ayer" };
  }
  const mon = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"][d.getMonth()];
  return { time, day: `${d.getDate()} ${mon}` };
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isInWeek(d: Date, ref: Date): boolean {
  const start = new Date(ref);
  start.setDate(ref.getDate() - 7);
  return d >= start && d <= ref;
}

function isInMonth(d: Date, ref: Date): boolean {
  const start = new Date(ref);
  start.setDate(ref.getDate() - 30);
  return d >= start && d <= ref;
}

export function DskConsultasDesktopPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ConsultationSummary[]>([]);
  const [names, setNames] = useState<Record<number, string>>({});
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  useEffect(() => {
    getSelectedPatientId().then(setSelectedPatientId).catch(() => setSelectedPatientId(null));
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const doctorId = await getCurrentDoctorId();
        const list = await fetchConsultations({ doctor_id: doctorId, page: 1, limit: 50 });
        if (cancelled) {
          return;
        }
        const sorted = [...list.items].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const nameMap: Record<number, string> = {};
        await Promise.all(
          Array.from(new Set(sorted.map((c) => c.patient_id))).map(async (pid) => {
            try {
              const p = await fetchPatient(pid);
              nameMap[pid] = `${p.first_name} ${p.last_name}`.trim();
            } catch {
              nameMap[pid] = `Paciente #${pid}`;
            }
          })
        );
        if (cancelled) {
          return;
        }
        setNames(nameMap);
        setItems(sorted);
        setLoading(false);
      } catch (err) {
        if (cancelled) {
          return;
        }
        setError(err instanceof Error ? err.message : "No pudimos cargar las consultas.");
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const now = new Date();
  const todayCount = items.filter((i) => isSameDay(new Date(i.created_at), now)).length;
  const weekCount = items.filter((i) => isInWeek(new Date(i.created_at), now)).length;
  const monthCount = items.filter((i) => isInMonth(new Date(i.created_at), now)).length;
  const signedCount = items.filter((i) => i.signed).length;

  const stats: [string, string, string, boolean][] = [
    ["Hoy", String(todayCount), `${signedCount} firmadas`, true],
    ["Esta semana", String(weekCount), `de últimos 30 d`, false],
    ["Este mes", String(monthCount), `total ${items.length}`, false],
    ["Firmadas", String(signedCount), `de ${items.length}`, false]
  ];

  return (
    <DesktopShell
      nav={doctorNav}
      activeScreen="dsk-consultas"
      role="médico"
      roleBadge="Médico"
      title="Consultas"
      eyebrow={`${items.length} en los últimos registros`}
      searchPlaceholder="Buscar paciente, diagnóstico…"
      topBarRight={
        <View style={styles.ctaWrap}>
          <Button
            label="Nueva consulta"
            variant="accent"
            size="sm"
            block={false}
            height={42}
            radius={radii.md}
            iconLeft="plus"
            disabled={selectedPatientId === null}
            style={selectedPatientId === null ? styles.ctaBtnDisabled : undefined}
            onPress={() => goToScreen("consulta-registro")}
          />
          {selectedPatientId === null ? (
            <Text style={styles.ctaHint}>Selecciona un paciente primero</Text>
          ) : null}
        </View>
      }
    >
      <FadeIn>
        <View style={styles.statRow}>
          {stats.map(([k, n, sub, isDark]) => (
            <View
              key={k}
              style={[
                styles.statCard,
                {
                  backgroundColor: isDark ? colors.ink : colors.white,
                  borderColor: isDark ? colors.ink : colors.rule
                }
              ]}
            >
              {isDark ? <View style={styles.statBlob} /> : null}
              <View>
                <Text style={[styles.eyebrow, { color: isDark ? "rgba(255,255,255,0.6)" : colors.ink3 }]}>{k}</Text>
                <Text style={[styles.statValue, { color: isDark ? colors.paper : colors.ink }]}>{n}</Text>
                <Text style={[styles.statSub, { color: isDark ? "rgba(255,255,255,0.55)" : colors.ink3 }]}>{sub}</Text>
              </View>
            </View>
          ))}
        </View>
      </FadeIn>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.accentDeep} />
          <Text style={styles.loadingText}>Cargando consultas…</Text>
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyPanel}>
          <Text style={styles.emptyTitle}>Aún no tienes consultas registradas</Text>
          <Text style={styles.emptySub}>Tus consultas aparecerán aquí al crearlas.</Text>
        </View>
      ) : (
        <View style={styles.tableCard}>
          <View style={styles.tableHead}>
            <Text style={[styles.headCell, styles.colDate]}>Fecha</Text>
            <Text style={[styles.headCell, styles.colPatient]}>Paciente</Text>
            <Text style={[styles.headCell, styles.colDx]}>Motivo</Text>
            <Text style={[styles.headCell, styles.colSign]}>Estado</Text>
            <View style={styles.colMore} />
          </View>
          {items.map((r, i) => {
            const name = names[r.patient_id] ?? `Paciente #${r.patient_id}`;
            const fd = formatDate(r.created_at);
            return (
              <Tappable
                key={r.id}
                onPress={() => {
                  setSelectedConsultationId(r.id)
                    .then(() => goToScreen("consulta-detalle"))
                    .catch(() => goToScreen("consulta-detalle"));
                }}
                scaleTo={0.995}
              >
                <View style={[styles.tableRow, { borderBottomWidth: i < items.length - 1 ? 1 : 0 }]}>
                  <View style={styles.colDate}>
                    <Text style={styles.dateTime}>{fd.time}</Text>
                    <Text style={styles.dateDay}>{fd.day}</Text>
                  </View>
                  <View style={[styles.colPatient, styles.patientCell]}>
                    <View style={styles.rowAvatar}>
                      <Text style={styles.rowAvatarText}>{initials(name)}</Text>
                    </View>
                    <View style={styles.flexShrink}>
                      <Text style={styles.patientName} numberOfLines={1} ellipsizeMode="tail">{name}</Text>
                      <Text style={styles.patientAge} numberOfLines={1} ellipsizeMode="tail">#{r.patient_id}</Text>
                    </View>
                  </View>
                  <Text style={[styles.colDx, styles.dxText]} numberOfLines={1}>
                    {r.chief_complaint ?? r.notes ?? "—"}
                  </Text>
                  <View style={styles.colSign}>
                    <View
                      style={[
                        styles.signBadge,
                        { backgroundColor: r.signed ? "rgba(28,140,90,0.12)" : colors.alertSoft }
                      ]}
                    >
                      {r.signed ? <Icon kind="check" size={10} color={colors.ok} /> : null}
                      <Text
                        style={[styles.signText, { color: r.signed ? colors.ok : colors.alert }]}
                      >
                        {r.signed ? "firmada" : "pendiente"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.colMore}>
                    <Icon kind="chev" size={14} color={colors.ink3} />
                  </View>
                </View>
              </Tappable>
            );
          })}
        </View>
      )}
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    ...text.eyebrow,
    color: colors.ink3
  },
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
  statRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 180,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: 18,
    paddingVertical: 16,
    overflow: "hidden"
  },
  statBlob: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 999,
    backgroundColor: "rgba(0,180,216,0.2)",
    top: -60,
    right: -50
  },
  statValue: {
    fontFamily: family.medium,
    fontSize: 30,
    letterSpacing: -0.9,
    marginTop: 6,
    lineHeight: 30
  },
  statSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    marginTop: 6
  },
  tableCard: {
    marginTop: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  tableHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  headCell: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    letterSpacing: 1.05,
    textTransform: "uppercase"
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderBottomColor: colors.rule3
  },
  colDate: {
    width: 90
  },
  colPatient: {
    flexGrow: 1.4,
    flexBasis: 0,
    minWidth: 0
  },
  colDx: {
    flexGrow: 2,
    flexBasis: 0,
    minWidth: 0
  },
  colSign: {
    width: 110
  },
  colMore: {
    width: 40,
    alignItems: "flex-end"
  },
  dateTime: {
    fontFamily: family.monoMedium,
    fontSize: 11.5,
    color: colors.ink2
  },
  dateDay: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.ink3,
    letterSpacing: 0.38
  },
  patientCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  flexShrink: {
    flexShrink: 1,
    minWidth: 0
  },
  rowAvatar: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.paper4,
    alignItems: "center",
    justifyContent: "center"
  },
  rowAvatarText: {
    fontFamily: family.medium,
    fontSize: 11,
    color: colors.ink
  },
  patientName: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  patientAge: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.ink3
  },
  dxText: {
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.ink2
  },
  signBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999
  },
  signText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    letterSpacing: 0.76,
    textTransform: "uppercase"
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 18,
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
    marginTop: 18,
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
  },
  emptyPanel: {
    marginTop: 18,
    padding: 32,
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    alignItems: "center",
    gap: 8
  },
  emptyTitle: {
    fontFamily: family.medium,
    fontSize: 16,
    color: colors.ink
  },
  emptySub: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink3
  }
});
