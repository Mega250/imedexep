import { ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Card } from "@/atomic/atoms/Card";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { SectionLabel } from "@/atomic/atoms/SectionLabel";
import { DarkPanel } from "@/atomic/molecules/DarkPanel";
import { FAB } from "@/atomic/molecules/FAB";
import { DoctorTabBar } from "@/atomic/organisms/DoctorTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { ConsultationSummary, fetchConsultations } from "@/services/api/consultationsApi";
import { Patient, fetchPatientsList } from "@/services/api/patientsApi";
import { getCurrentDoctorId } from "@/services/api/currentDoctor";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

type Group = { key: string; label: string; items: ConsultationSummary[] };

function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const now = new Date();
  if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()) {
    return "Hoy";
  }
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (d.getFullYear() === y.getFullYear() && d.getMonth() === y.getMonth() && d.getDate() === y.getDate()) {
    return "Ayer";
  }
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function startOfWeek(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = (day + 6) % 7;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - diff);
  return monday;
}

function Header({
  todayCount,
  weekCount,
  total
}: {
  todayCount: number;
  weekCount: number;
  total: number;
}): ReactNode {
  return (
    <>
      <ScreenTopBar sub="Tu práctica" title="Mis Consultas" />
      <View style={styles.tools}>
        <View style={styles.statRow}>
          <DarkPanel
            radius={radii.lg}
            padding={14}
            blobSize={140}
            blobTop={-60}
            blobRight={-50}
            elevated={false}
            style={styles.statDark}
          >
            <Text style={styles.darkLabel}>Hoy</Text>
            <View style={styles.darkValueRow}>
              <Text style={styles.darkValue}>{todayCount}</Text>
              <Text style={styles.darkSuffix}>consultas</Text>
            </View>
          </DarkPanel>
          <Card radius={radii.lg} style={styles.statCard}>
            <SectionLabel label="Semana" />
            <Text style={styles.statValue}>{weekCount}</Text>
            <Text style={styles.statSub}>esta semana</Text>
          </Card>
          <Card radius={radii.lg} style={styles.statCard}>
            <SectionLabel label="Total" />
            <Text style={styles.statValue}>{total}</Text>
            <Text style={styles.statSub}>en tu cuenta</Text>
          </Card>
        </View>
      </View>
    </>
  );
}

function groupByDay(items: ConsultationSummary[]): Group[] {
  const buckets: Record<string, ConsultationSummary[]> = {};
  for (const it of items) {
    const k = dayKey(it.created_at);
    if (!buckets[k]) {
      buckets[k] = [];
    }
    buckets[k].push(it);
  }
  return Object.keys(buckets)
    .sort((a, b) => (a < b ? 1 : -1))
    .map((k) => ({
      key: k,
      label: dayLabel(buckets[k][0].created_at),
      items: buckets[k].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }));
}

export function MConsultasPage() {
  const [items, setItems] = useState<ConsultationSummary[]>([]);
  const [patients, setPatients] = useState<Record<number, Patient>>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const doctorId = await getCurrentDoctorId();
        const [cons, plist] = await Promise.all([
          fetchConsultations({ doctor_id: doctorId, page: 1, limit: 100 }),
          fetchPatientsList({ page: 1, limit: 100 }).catch(() => ({ items: [], total: 0, page: 1, limit: 100 }))
        ]);
        const map: Record<number, Patient> = {};
        for (const p of plist.items ?? []) {
          map[p.id] = p;
        }
        if (!cancelled) {
          setItems(cons.items ?? []);
          setTotal(cons.total ?? 0);
          setPatients(map);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar tus consultas.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const todayCount = items.filter((c) => isToday(c.created_at)).length;
  const week = startOfWeek().getTime();
  const weekCount = items.filter((c) => new Date(c.created_at).getTime() >= week).length;
  const groups = groupByDay(items);

  return (
    <MobileScreen
      tabBar={<DoctorTabBar active={3} />}
      header={<Header todayCount={todayCount} weekCount={weekCount} total={total} />}
      floating={<FAB icon="plus" label="Nueva consulta" />}
      contentStyle={styles.content}
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Sin consultas registradas.</Text>
          <Text style={styles.emptyMeta}>Tus próximas consultas aparecerán aquí.</Text>
        </View>
      ) : null}

      {groups.map((group) => (
        <View key={group.key} style={styles.group}>
          <SectionLabel label={group.label} style={styles.groupLabel} />
          <View style={styles.list}>
            {group.items.map((c) => {
              const patient = patients[c.patient_id];
              const name = patient ? `${patient.first_name} ${patient.last_name}` : `Paciente #${c.patient_id}`;
              const dx = c.chief_complaint ?? c.notes ?? "consulta";
              const signed = c.signed_at !== null && c.signed_at !== undefined;
              return (
                <FadeIn key={c.id}>
                  <Card radius={radii.md} style={styles.card}>
                    <View style={styles.cardTop}>
                      <View style={styles.flex}>
                        <View style={styles.cardHead}>
                          <Text style={styles.time}>{formatTime(c.created_at)}</Text>
                          <View style={styles.headDot} />
                          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">{name}</Text>
                        </View>
                        <Text style={styles.dx} numberOfLines={1} ellipsizeMode="tail">{dx}</Text>
                      </View>
                      <Text style={styles.min}>#{c.id}</Text>
                    </View>
                    <View style={styles.tagRow}>
                      <View
                        style={[
                          styles.tag,
                          { backgroundColor: signed ? colors.paper3 : colors.paper2 }
                        ]}
                      >
                        <Text
                          style={[
                            styles.tagText,
                            { color: signed ? colors.accentDeep : colors.ink2 }
                          ]}
                        >
                          {signed ? "firmada" : "borrador"}
                        </Text>
                      </View>
                      <View style={styles.flex} />
                      <Text style={styles.seeNote}>Ver nota ›</Text>
                    </View>
                  </Card>
                </FadeIn>
              );
            })}
          </View>
        </View>
      ))}
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 130
  },
  flex: {
    flex: 1,
    minWidth: 0
  },
  tools: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: colors.paper
  },
  statRow: {
    flexDirection: "row",
    gap: 8
  },
  statDark: {
    flex: 1.4
  },
  darkLabel: {
    fontFamily: family.mono,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.55)"
  },
  darkValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 6
  },
  darkValue: {
    fontFamily: family.medium,
    fontSize: 32,
    letterSpacing: -0.9,
    color: colors.paper
  },
  darkSuffix: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: "rgba(255,255,255,0.55)"
  },
  statCard: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  statValue: {
    fontFamily: family.medium,
    fontSize: 28,
    letterSpacing: -0.8,
    color: colors.ink,
    marginTop: 6
  },
  statSub: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 6,
    letterSpacing: 0.3
  },
  loading: {
    paddingVertical: 18,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginTop: 10
  },
  empty: {
    marginTop: 8,
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
    color: colors.ink3
  },
  group: {
    marginBottom: 16
  },
  groupLabel: {
    marginBottom: 8
  },
  list: {
    gap: 6
  },
  card: {
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  time: {
    fontFamily: family.monoMedium,
    fontSize: 11,
    color: colors.ink2
  },
  headDot: {
    width: 3,
    height: 3,
    borderRadius: 99,
    backgroundColor: colors.ink4
  },
  name: {
    flexShrink: 1,
    minWidth: 0,
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink
  },
  dx: {
    fontFamily: family.regular,
    fontSize: 12.5,
    lineHeight: 17,
    color: colors.ink2,
    marginTop: 4
  },
  min: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8
  },
  tag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4
  },
  tagText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  seeNote: {
    fontFamily: family.regular,
    fontSize: 12,
    color: colors.ink3
  }
});
