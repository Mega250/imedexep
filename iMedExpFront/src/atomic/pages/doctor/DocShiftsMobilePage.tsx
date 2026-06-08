import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Card } from "@/atomic/atoms/Card";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { StatTile } from "@/atomic/molecules/StatTile";
import { FAB } from "@/atomic/molecules/FAB";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goBack } from "@/navigation/screenRouter";
import { DoctorShift, fetchDoctorShifts, createDoctorShift } from "@/services/api/doctorsApi";
import { getCurrentDoctorId } from "@/services/api/currentDoctor";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

function parseTimeToHours(t: string): number {
  if (!t) {
    return 0;
  }
  const [hh, mm] = t.split(":").map(Number);
  return (hh || 0) + (mm || 0) / 60;
}

function formatHHMM(t: string): string {
  if (!t) {
    return "—";
  }
  return t.slice(0, 5);
}

type DayBucket = { day: number; items: DoctorShift[] };

function groupByDay(items: DoctorShift[]): DayBucket[] {
  const buckets: Record<number, DoctorShift[]> = {};
  for (const it of items) {
    if (!buckets[it.day_of_week]) {
      buckets[it.day_of_week] = [];
    }
    buckets[it.day_of_week].push(it);
  }
  return WEEK_ORDER
    .filter((d) => buckets[d] && buckets[d].length > 0)
    .map((day) => ({ day, items: buckets[day].sort((a, b) => a.start_time.localeCompare(b.start_time)) }));
}

export function DocShiftsMobilePage() {
  const [shifts, setShifts] = useState<DoctorShift[]>([]);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const id = await getCurrentDoctorId();
        const data = await fetchDoctorShifts(id);
        if (!cancelled) {
          setDoctorId(id);
          setShifts(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar tus turnos.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreate() {
    if (doctorId === null || creating) {
      return;
    }
    setError(null);
    setFeedback(null);
    setCreating(true);
    try {
      const created = await createDoctorShift(doctorId, {
        day_of_week: 1,
        start_time: "09:00",
        end_time: "13:00",
        location: "Consultorio Propio",
        shift_type: "Consulta"
      });
      setShifts((prev) => [...prev, created]);
      setFeedback("Turno creado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos crear el turno.");
    } finally {
      setCreating(false);
    }
  }

  const groups = groupByDay(shifts);
  const totalHours = shifts.reduce((acc, s) => acc + (parseTimeToHours(s.end_time) - parseTimeToHours(s.start_time)), 0);
  const distinctLocations = new Set(shifts.map((s) => s.location ?? "—").filter((s) => s !== "—"));
  const activeDays = new Set(shifts.map((s) => s.day_of_week)).size;

  const STATS: [string, string, string][] = [
    ["Horas / semana", totalHours.toFixed(0), `${shifts.length} bloques`],
    ["Días activos", String(activeDays), "de la semana"],
    ["Consultorios", String(distinctLocations.size), "distintos"],
    ["Bloques", String(shifts.length), "totales"]
  ];

  return (
    <MobileScreen
      header={
        <ScreenTopBar
          back="Más opciones"
          onBack={() => goBack("mob-profile")}
          sub="Tu agenda de turnos"
          title="Mis turnos"
        />
      }
      floating={<FAB icon="plus" label={creating ? "Creando…" : "Crear turno"} onPress={handleCreate} />}
      contentStyle={styles.content}
    >
      <FadeIn>
        <View style={styles.statGrid}>
          {STATS.map(([k, n, s]) => (
            <StatTile key={k} label={k} value={n} sub={s} style={styles.statCell} />
          ))}
        </View>
      </FadeIn>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}

      {!loading && !error && shifts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Sin turnos configurados.</Text>
          <Text style={styles.emptyMeta}>Usa "Crear turno" para agregar tu horario.</Text>
        </View>
      ) : null}

      <View style={styles.days}>
        {groups.map((group, index) => {
          const total = group.items.reduce((a, s) => a + (parseTimeToHours(s.end_time) - parseTimeToHours(s.start_time)), 0);
          return (
            <FadeIn key={group.day} delay={index * 60}>
              <Card radius={radii.lg}>
                <View style={styles.dayHead}>
                  <Text style={styles.dayName}>{DAY_NAMES[group.day]}</Text>
                  <Text style={styles.dayHours}>{total.toFixed(1)} h</Text>
                </View>
                <View style={styles.shifts}>
                  {group.items.map((s) => {
                    const isOR = (s.shift_type ?? "").toLowerCase().includes("quir");
                    return (
                      <View
                        key={s.id}
                        style={[
                          styles.shift,
                          {
                            backgroundColor: isOR ? colors.ink : colors.paper3,
                            borderColor: isOR ? colors.ink : colors.accentRule
                          }
                        ]}
                      >
                        <View>
                          <Text
                            style={[
                              styles.shiftKind,
                              { color: isOR ? colors.paper : colors.accentDeep }
                            ]}
                          >
                            {s.shift_type ?? "Bloque"}
                          </Text>
                          <Text
                            style={[
                              styles.shiftTime,
                              {
                                color: isOR
                                  ? "rgba(255,255,255,0.75)"
                                  : colors.accentDeep
                              }
                            ]}
                          >
                            {formatHHMM(s.start_time)} — {formatHHMM(s.end_time)} · {s.location ?? "sin sede"}
                          </Text>
                        </View>
                        <Icon
                          kind="edit"
                          size={13}
                          color={isOR ? colors.paper : colors.accentDeep}
                        />
                      </View>
                    );
                  })}
                </View>
              </Card>
            </FadeIn>
          );
        })}
      </View>
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 130
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  statCell: {
    width: "48%",
    maxWidth: "48%",
    flexBasis: "48%",
    flexGrow: 0,
    flexShrink: 0
  },
  loading: {
    paddingVertical: 24,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginTop: 10
  },
  feedback: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ok,
    marginTop: 10
  },
  empty: {
    marginTop: 14,
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
  days: {
    gap: 10,
    marginTop: 14
  },
  dayHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule3
  },
  dayName: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  dayHours: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink2
  },
  shifts: {
    padding: 10,
    gap: 6
  },
  shift: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1
  },
  shiftKind: {
    fontFamily: family.medium,
    fontSize: 12.5
  },
  shiftTime: {
    fontFamily: family.mono,
    fontSize: 10,
    marginTop: 2
  }
});
