import { ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { SectionLabel } from "@/atomic/atoms/SectionLabel";
import { Tappable } from "@/atomic/atoms/Tappable";
import { FAB } from "@/atomic/molecules/FAB";
import { DoctorTabBar } from "@/atomic/organisms/DoctorTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goToScreen } from "@/navigation/screenRouter";
import { Appointment, fetchAppointments, patchAppointment } from "@/services/api/appointmentsApi";
import { Patient, fetchPatientsList } from "@/services/api/patientsApi";
import { getCurrentDoctorId } from "@/services/api/currentDoctor";
import { setSelectedPatientId } from "@/services/api/selectedPatient";
import { setSelectedAppointmentId } from "@/services/api/selectedAppointment";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";
import { apptWallDate, formatApptDateTime, formatApptTime } from "@/utils/dates";
import { statusLabel } from "@/utils/status";

type Group = { key: string; label: string; items: Appointment[] };

function dayKey(iso: string): string {
  const d = apptWallDate(iso) ?? new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dayLabel(iso: string): string {
  return formatApptDateTime(iso, { weekday: "short", day: "numeric", month: "short" });
}

function isToday(iso: string): boolean {
  const d = apptWallDate(iso) ?? new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function groupByDay(items: Appointment[]): Group[] {
  const buckets: Record<string, Appointment[]> = {};
  for (const it of items) {
    const k = dayKey(it.scheduled_at);
    if (!buckets[k]) {
      buckets[k] = [];
    }
    buckets[k].push(it);
  }
  return Object.keys(buckets)
    .sort()
    .map((k) => ({
      key: k,
      label: dayLabel(buckets[k][0].scheduled_at) + (isToday(buckets[k][0].scheduled_at) ? " · hoy" : ""),
      items: buckets[k].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    }));
}

function Header(): ReactNode {
  return (
    <ScreenTopBar
      sub="Tu agenda"
      title="Mi Agenda"
      right={
        <View style={styles.todayBtn}>
          <Text style={styles.todayText}>Hoy</Text>
        </View>
      }
    />
  );
}

export function MAgendaPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [patients, setPatients] = useState<Record<number, Patient>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const doctorId = await getCurrentDoctorId();
        const [appts, plist] = await Promise.all([
          fetchAppointments({ doctor_id: doctorId, limit: 100 }),
          fetchPatientsList({ page: 1, limit: 100 }).catch(() => ({ items: [], total: 0, page: 1, limit: 100 }))
        ]);
        const map: Record<number, Patient> = {};
        for (const p of plist.items ?? []) {
          map[p.id] = p;
        }
        if (!cancelled) {
          setGroups(
            groupByDay(
              (appts.items ?? []).filter(
                (appointment) =>
                  appointment.status !== "cancelled" &&
                  appointment.status !== "no_show"
              )
            )
          );
          setPatients(map);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar tu agenda.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function openConsultation(appointment: Appointment) {
    await setSelectedPatientId(appointment.patient_id);
    if (appointment.status === "completed") {
      goToScreen("doc-full-mob");
      return;
    }
    if (appointment.status !== "in_progress") {
      await patchAppointment(appointment.id, { status: "in_progress" });
    }
    await setSelectedAppointmentId(appointment.id);
    goToScreen("active-mob");
  }

  const total = groups.reduce((acc, g) => acc + g.items.length, 0);

  return (
    <MobileScreen
      tabBar={<DoctorTabBar active={2} />}
      header={<Header />}
      floating={<FAB icon="plus" label="Nueva cita" />}
      contentStyle={styles.content}
    >
      <View style={styles.dayHead}>
        <Text style={styles.dayTitle}>Agenda · {total} citas</Text>
        <Text style={styles.dayMeta}>{groups.length} días</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}

      {!loading && !error && groups.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Sin citas registradas.</Text>
          <Text style={styles.emptyMeta}>Aún no tienes citas en tu agenda.</Text>
        </View>
      ) : null}

      {groups.map((group) => (
        <View key={group.key} style={styles.group}>
          <SectionLabel label={group.label} style={styles.groupLabel} />
          <View style={styles.timeline}>
            <View style={styles.rail} />
            {group.items.map((a, index) => {
              const isNext =
                isToday(a.scheduled_at) &&
                (apptWallDate(a.scheduled_at)?.getTime() ?? 0) >= Date.now() &&
                index === 0;
              const isDone = a.status === "completed" || a.status === "cancelled" || a.status === "no_show";
              const patient = patients[a.patient_id];
              const name = patient ? `${patient.first_name} ${patient.last_name}` : `Paciente #${a.patient_id}`;
              const dotColor = isNext ? colors.accentBright : isDone ? colors.ok : colors.ink3;
              return (
                <FadeIn key={a.id} delay={index * 40}>
                  <View style={styles.slotRow}>
                    <Text style={[styles.slotTime, styles.slotTimeActive]}>{formatApptTime(a.scheduled_at)}</Text>
                    <Tappable scaleTo={0.99} onPress={() => openConsultation(a)}>
                      <View
                        style={[
                          styles.slotCard,
                          {
                            backgroundColor: isNext ? colors.ink : colors.white,
                            borderColor: isNext ? colors.ink : colors.rule,
                            opacity: isDone ? 0.6 : 1
                          }
                        ]}
                      >
                        <View style={[styles.dot, { backgroundColor: dotColor }]} />
                        <View style={styles.slotTop}>
                          <View style={styles.flex}>
                            <Text
                              numberOfLines={1}
                              ellipsizeMode="tail"
                              style={[
                                styles.slotName,
                                {
                                  color: isNext ? colors.paper : colors.ink,
                                  textDecorationLine: isDone ? "line-through" : "none"
                                }
                              ]}
                            >
                              {name}
                            </Text>
                            <Text
                              numberOfLines={1}
                              ellipsizeMode="tail"
                              style={[
                                styles.slotTag,
                                { color: isNext ? "rgba(255,255,255,0.6)" : colors.ink3 }
                              ]}
                            >
                              {a.reason ?? statusLabel(a.status)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </Tappable>
                  </View>
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
    paddingTop: 18,
    paddingBottom: 130
  },
  flex: {
    flex: 1,
    minWidth: 0
  },
  todayBtn: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  todayText: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.ink2
  },
  dayHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline"
  },
  dayTitle: {
    fontFamily: family.medium,
    fontSize: 18,
    letterSpacing: -0.2,
    color: colors.ink
  },
  dayMeta: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
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
  group: {
    marginTop: 14
  },
  groupLabel: {
    marginBottom: 8
  },
  timeline: {
    position: "relative"
  },
  rail: {
    position: "absolute",
    left: 43,
    top: 8,
    bottom: 8,
    width: 1,
    backgroundColor: colors.rule
  },
  slotRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 6,
    alignItems: "flex-start"
  },
  slotTime: {
    width: 48,
    paddingTop: 12,
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  slotTimeActive: {
    color: colors.ink2,
    fontFamily: family.monoMedium
  },
  slotCard: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    position: "relative"
  },
  dot: {
    position: "absolute",
    left: -17,
    top: 18,
    width: 8,
    height: 8,
    borderRadius: 99,
    borderWidth: 2,
    borderColor: colors.paper
  },
  slotTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8
  },
  slotName: {
    fontFamily: family.medium,
    fontSize: 14
  },
  slotTag: {
    fontFamily: family.mono,
    fontSize: 10.5,
    marginTop: 2
  }
});
