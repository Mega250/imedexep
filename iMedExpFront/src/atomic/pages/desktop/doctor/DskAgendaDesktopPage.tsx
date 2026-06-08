import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { doctorNav } from "@/navigation/desktopNavConfigs";
import { goToScreen } from "@/navigation/screenRouter";
import { Appointment, fetchAppointments, patchAppointment } from "@/services/api/appointmentsApi";
import { getCurrentDoctorId } from "@/services/api/currentDoctor";
import { fetchPatient } from "@/services/api/patientsApi";
import { setSelectedPatientId } from "@/services/api/selectedPatient";
import { colors, radii, shadow } from "@/theme/tokens";
import { family, text } from "@/theme/typography";
import { confirmAction } from "@/utils/confirm";
import { apptWallDate, formatApptDateTime, formatApptTime } from "@/utils/dates";
import { statusLabel } from "@/utils/status";

type DayCol = { dow: string; d: number; today: boolean; iso: string };

const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

const ROW = 56;

const DOWS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

function startOfWeek(d: Date): Date {
  const out = new Date(d);
  const day = out.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  out.setDate(out.getDate() + offset);
  out.setHours(0, 0, 0, 0);
  return out;
}

function endOfWeek(d: Date): Date {
  const out = startOfWeek(d);
  out.setDate(out.getDate() + 7);
  return out;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function weekDays(base: Date): DayCol[] {
  const start = startOfWeek(base);
  const today = new Date();
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return {
      dow: DOWS[d.getDay()],
      d: d.getDate(),
      today: isSameDay(d, today),
      iso: d.toISOString().slice(0, 10)
    };
  });
}

function eventTopHours(iso: string): number {
  const [h, m] = formatApptTime(iso, "00:00").split(":").map(Number);
  return h + m / 60 - 8;
}

function eventState(appt: Appointment, now: Date): "done" | "next" | "queued" {
  if (appt.status === "completed" || appt.status === "no_show") {
    return "done";
  }
  if (appt.status === "in_progress") {
    return "next";
  }
  const t = new Date(appt.scheduled_at).getTime();
  if (t < now.getTime() - 30 * 60 * 1000) {
    return "done";
  }
  return "queued";
}

function spanishMonth(idx: number): string {
  return ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"][idx];
}

function rangeLabel(base: Date): string {
  const first = startOfWeek(base);
  const last = new Date(first);
  last.setDate(first.getDate() + 6);
  if (
    first.getMonth() === last.getMonth() &&
    first.getFullYear() === last.getFullYear()
  ) {
    return `${first.getDate()} — ${last.getDate()} ${spanishMonth(first.getMonth())} ${first.getFullYear()}`;
  }
  return `${first.getDate()} ${spanishMonth(first.getMonth())} — ${last.getDate()} ${spanishMonth(last.getMonth())} ${last.getFullYear()}`;
}

type DayEventData = {
  id: number;
  col: number;
  top: number;
  h: number;
  t: string;
  name: string;
  tag: string;
  state: "done" | "next" | "queued";
};

function DayEvent({ ev, onPress }: { ev: DayEventData; onPress: () => void }) {
  const isNext = ev.state === "next";
  const isDone = ev.state === "done";
  return (
    <Tappable
      onPress={onPress}
      scaleTo={0.97}
      accessibilityLabel={`Cita ${ev.t} · ${ev.name}`}
      style={[
        styles.eventWrap,
        {
          top: ev.top * ROW + 2,
          height: ev.h * ROW - 4,
          zIndex: isNext ? 3 : 1
        }
      ]}
    >
      <View
        style={[
          styles.event,
          {
            backgroundColor: isNext ? colors.ink : colors.white,
            borderColor: isNext ? colors.ink : colors.accentRule,
            borderLeftColor: isNext ? colors.accentBright : colors.accent,
            opacity: isDone ? 0.45 : 1
          }
        ]}
      >
        <Text style={[styles.eventTime, { color: isNext ? "rgba(255,255,255,0.7)" : colors.ink3 }]}>
          {ev.t}
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.eventName, { color: isNext ? colors.paper : colors.ink }]}
        >
          {ev.name}
        </Text>
        <Text numberOfLines={1} style={[styles.eventTag, { color: isNext ? "rgba(255,255,255,0.6)" : colors.ink3 }]}>
          {ev.tag}
        </Text>
      </View>
    </Tappable>
  );
}

async function loadWeek(base: Date): Promise<{ weekAppts: Appointment[]; nameMap: Record<number, string> }> {
  const doctorId = await getCurrentDoctorId();
  const list = await fetchAppointments({ doctor_id: doctorId, page: 1, limit: 100 });
  const start = startOfWeek(base);
  const end = endOfWeek(base);
  const weekAppts = list.items.filter((a) => {
    const t = apptWallDate(a.scheduled_at);
    return (
      t !== null &&
      t >= start &&
      t < end &&
      a.status !== "cancelled" &&
      a.status !== "no_show"
    );
  });
  const nameMap: Record<number, string> = {};
  await Promise.all(
    Array.from(new Set(weekAppts.map((a) => a.patient_id))).map(async (pid) => {
      try {
        const p = await fetchPatient(pid);
        nameMap[pid] = `${p.first_name} ${p.last_name}`.trim();
      } catch {
        nameMap[pid] = `Paciente #${pid}`;
      }
    })
  );
  return { weekAppts, nameMap };
}

export function DskAgendaDesktopPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [names, setNames] = useState<Record<number, string>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [weekAnchor, setWeekAnchor] = useState(() => new Date());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { weekAppts, nameMap } = await loadWeek(weekAnchor);
        if (cancelled) {
          return;
        }
        setNames(nameMap);
        setAppts(weekAppts);
        setLoading(false);
      } catch (err) {
        if (cancelled) {
          return;
        }
        setError(err instanceof Error ? err.message : "No pudimos cargar la agenda.");
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [weekAnchor]);

  async function reload() {
    const { weekAppts, nameMap } = await loadWeek(weekAnchor);
    setNames(nameMap);
    setAppts(weekAppts);
  }

  function openAppt(id: number) {
    setActionError(null);
    setSelectedId(id);
  }

  async function confirmAppt(a: Appointment) {
    setBusy(true);
    setActionError(null);
    try {
      await patchAppointment(a.id, { status: "confirmed" });
      await reload();
      setSelectedId(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No pudimos actualizar la cita.");
    } finally {
      setBusy(false);
    }
  }

  async function startConsult(a: Appointment) {
    await setSelectedPatientId(a.patient_id);
    setSelectedId(null);
    goToScreen("doctor-active");
  }

  async function cancelAppt(a: Appointment) {
    const ok = await confirmAction("Cancelar cita", "¿Seguro que quieres cancelar esta cita?", {
      confirmLabel: "Cancelar cita",
      cancelLabel: "Volver",
      destructive: true
    });
    if (!ok) {
      return;
    }
    setBusy(true);
    setActionError(null);
    try {
      await patchAppointment(a.id, { status: "cancelled" });
      await reload();
      setSelectedId(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No pudimos cancelar la cita.");
    } finally {
      setBusy(false);
    }
  }

  const now = new Date();
  const week = weekDays(weekAnchor);
  const monStart = startOfWeek(weekAnchor);
  const dayEvents: DayEventData[] = appts.map((a) => {
    const t = apptWallDate(a.scheduled_at) ?? new Date(a.scheduled_at);
    const col = Math.floor((t.getTime() - monStart.getTime()) / 86400000);
    const top = Math.max(0, eventTopHours(a.scheduled_at));
    return {
      id: a.id,
      col,
      top,
      h: 0.9,
      t: formatApptTime(a.scheduled_at),
      name: names[a.patient_id] ?? `Paciente #${a.patient_id}`,
      tag: a.reason ?? statusLabel(a.status),
      state: eventState(a, now)
    };
  });

  const todayAppts = appts
    .filter((a) => {
      const date = apptWallDate(a.scheduled_at);
      return date !== null && isSameDay(date, now);
    })
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  const todayDone = todayAppts.filter((a) => a.status === "completed" || a.status === "no_show").length;
  const upcoming = appts
    .filter((a) => {
      const t = new Date(a.scheduled_at).getTime();
      return (a.status === "scheduled" || a.status === "confirmed" || a.status === "in_progress") && t >= now.getTime() - 30 * 60 * 1000;
    })
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  const next = upcoming[0] ?? null;
  const nextPatientName = next ? names[next.patient_id] ?? `Paciente #${next.patient_id}` : null;
  const nextIsToday = next ? isSameDay(new Date(next.scheduled_at), now) : false;
  const minutesToNext = next ? Math.round((new Date(next.scheduled_at).getTime() - now.getTime()) / 60000) : null;
  const nextWhen = !next
    ? ""
    : nextIsToday
      ? minutesToNext && minutesToNext > 0
        ? `en ${minutesToNext} min`
        : "ahora"
      : formatApptDateTime(next.scheduled_at, { weekday: "short", day: "numeric", month: "short" });

  const selected = selectedId !== null ? appts.find((a) => a.id === selectedId) ?? null : null;

  return (
    <DesktopShell
      nav={doctorNav}
      activeScreen="dsk-agenda"
      role="médico"
      roleBadge="Médico"
      title={`Agenda · ${rangeLabel(weekAnchor)}`}
      eyebrow={`${appts.length} citas esta semana`}
      searchPlaceholder="Buscar paciente, diagnóstico…"
      topBarRight={
        <Button
          label="Editar agenda"
          variant="accent"
          size="sm"
          block={false}
          height={42}
          radius={radii.md}
          iconLeft="cal"
          onPress={() => goToScreen("doc-shifts")}
        />
      }
    >
      <View style={styles.toolbar}>
        <View style={styles.navGroup}>
          <Tappable
            style={styles.navBtn}
            onPress={() =>
              setWeekAnchor((current) => {
                const previous = new Date(current);
                previous.setDate(previous.getDate() - 7);
                return previous;
              })
            }
          >
            <Icon kind="chev-l" size={14} color={colors.ink2} />
          </Tappable>
          <Tappable style={styles.todayBtn} onPress={() => setWeekAnchor(new Date())}>
            <Text style={styles.todayBtnText}>Hoy</Text>
          </Tappable>
          <Tappable
            style={styles.navBtn}
            onPress={() =>
              setWeekAnchor((current) => {
                const nextWeek = new Date(current);
                nextWeek.setDate(nextWeek.getDate() + 7);
                return nextWeek;
              })
            }
          >
            <Icon kind="chev" size={14} color={colors.ink2} />
          </Tappable>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.accentDeep} />
          <Text style={styles.loadingText}>Cargando agenda…</Text>
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <View style={styles.mainCols}>
          <FadeIn style={styles.gridWrap}>
            <View style={styles.gridCard}>
              <View style={styles.headerRow}>
                <View style={styles.hourGutter} />
                {week.map((w, i) => (
                  <View
                    key={w.iso}
                    style={[
                      styles.dayHeader,
                      { backgroundColor: w.today ? colors.paper3 : "transparent" },
                      i > 0 && styles.dayHeaderBorder
                    ]}
                  >
                    <Text style={styles.dowText}>{w.dow}</Text>
                    <Text style={[styles.dayNum, { color: w.today ? colors.accentDeep : colors.ink }]}>
                      {w.d}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.gridBody}>
                <View style={styles.hourColumn}>
                  {HOURS.map((h, i) => (
                    <View key={h} style={[styles.hourCell, i > 0 && styles.hourCellBorder]}>
                      <Text style={styles.hourText}>{h}</Text>
                    </View>
                  ))}
                </View>
                {week.map((w, ci) => (
                  <View
                    key={w.iso}
                    style={[
                      styles.dayColumn,
                      { backgroundColor: w.today ? colors.paper3 : "transparent" }
                    ]}
                  >
                    {HOURS.map((h, i) => (
                      <View key={h} style={[styles.slotCell, i > 0 && styles.slotCellBorder]} />
                    ))}
                    {w.today ? (
                      <View
                        style={[
                          styles.nowLine,
                          { top: (now.getHours() + now.getMinutes() / 60 - 8) * ROW }
                        ]}
                      >
                        <View style={styles.nowDot} />
                      </View>
                    ) : null}
                    {dayEvents.filter((e) => e.col === ci).map((e) => (
                      <DayEvent key={e.id} ev={e} onPress={() => openAppt(e.id)} />
                    ))}
                  </View>
                ))}
              </View>
            </View>
          </FadeIn>

          <View style={styles.sideCol}>
            <View style={styles.nextCard}>
              <View style={styles.nextBlob} />
              <View>
                <Text style={styles.nextEyebrow}>
                  {next ? `Sigue · ${nextWhen}` : "Sin próximas citas"}
                </Text>
                <Text style={styles.nextName} numberOfLines={2} ellipsizeMode="tail">{nextPatientName ?? "—"}</Text>
                <Text style={styles.nextMeta}>{next ? next.reason ?? "Consulta" : "Día despejado"}</Text>
                {next ? (
                  <View style={styles.nextActions}>
                    <Button
                      label="Empezar"
                      variant="bright"
                      size="sm"
                      height={34}
                      onPress={() => goToScreen("doctor-active")}
                      style={styles.nextBtnFlex}
                    />
                    <Button
                      label="Expediente"
                      variant="darkGhost"
                      size="sm"
                      height={34}
                      block={false}
                      onPress={() => goToScreen("doc-full")}
                    />
                  </View>
                ) : null}
              </View>
            </View>

            <View style={styles.timelineCard}>
              <View style={styles.timelineHead}>
                <Text style={styles.timelineTitle}>Hoy</Text>
                <Text style={styles.timelineCount}>{todayDone} / {todayAppts.length}</Text>
              </View>
              {todayAppts.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>Sin citas para hoy</Text>
                </View>
              ) : null}
              {todayAppts.map((a, i) => {
                const st = eventState(a, now);
                const isNext = next?.id === a.id && (st === "queued" || st === "next");
                return (
                  <Tappable key={a.id} onPress={() => openAppt(a.id)} scaleTo={0.99}>
                    <View
                      style={[
                        styles.timelineRow,
                        { borderBottomWidth: i < todayAppts.length - 1 ? 1 : 0 },
                        isNext && styles.timelineRowNext,
                        { opacity: st === "done" ? 0.5 : 1 }
                      ]}
                    >
                      <Text style={styles.timelineTime}>{formatApptTime(a.scheduled_at)}</Text>
                      <View
                        style={[
                          styles.timelineDot,
                          {
                            backgroundColor:
                              isNext ? colors.accent : st === "done" ? colors.ok : colors.ink3
                          }
                        ]}
                      />
                      <View style={styles.timelineInfo}>
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={[
                            styles.timelineName,
                            isNext && styles.timelineNameNext,
                            st === "done" && styles.timelineNameDone
                          ]}
                        >
                          {names[a.patient_id] ?? `Paciente #${a.patient_id}`}
                        </Text>
                        {a.reason ? <Text style={styles.timelineSub} numberOfLines={1} ellipsizeMode="tail">{a.reason}</Text> : null}
                      </View>
                      {isNext ? (
                        <View style={styles.timelineBadge}>
                          <Text style={styles.timelineBadgeText}>SIGUE</Text>
                        </View>
                      ) : null}
                      {st === "done" ? <Icon kind="check" size={11} color={colors.ok} /> : null}
                    </View>
                  </Tappable>
                );
              })}
            </View>
          </View>
        </View>
      )}

      {selected ? (
        <Modal
          visible
          transparent
          animationType="fade"
          presentationStyle="overFullScreen"
          onRequestClose={() => setSelectedId(null)}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setSelectedId(null)}>
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <Text style={styles.modalEyebrow}>{statusLabel(selected.status)}</Text>
              <Text style={styles.modalName} numberOfLines={2} ellipsizeMode="tail">
                {names[selected.patient_id] ?? `Paciente #${selected.patient_id}`}
              </Text>
              <Text style={styles.modalWhen}>{formatApptDateTime(selected.scheduled_at)}</Text>
              <Text style={styles.modalReason}>{selected.reason ?? "Consulta"}</Text>
              {actionError ? <Text style={styles.modalError}>{actionError}</Text> : null}
              <Button
                label="Iniciar consulta"
                variant="primary"
                size="sm"
                disabled={busy}
                onPress={() => startConsult(selected)}
                style={styles.modalStartBtn}
              />
              <View style={styles.modalActions}>
                <Button
                  label="Confirmar"
                  variant="accent"
                  size="sm"
                  block={false}
                  disabled={busy}
                  onPress={() => confirmAppt(selected)}
                  style={styles.modalBtnFlex}
                />
                <Button
                  label="Cancelar"
                  variant="ghost"
                  size="sm"
                  block={false}
                  disabled={busy}
                  onPress={() => cancelAppt(selected)}
                  style={styles.modalBtnFlex}
                />
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    flexWrap: "wrap",
    gap: 10
  },
  navGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  todayBtn: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  todayBtnText: {
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.ink2
  },
  mainCols: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14
  },
  gridWrap: {
    flexGrow: 1,
    flexBasis: 560,
    minWidth: 0
  },
  gridCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  hourGutter: {
    width: 64
  },
  dayHeader: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14
  },
  dayHeaderBorder: {
    borderLeftWidth: 1,
    borderLeftColor: colors.rule2
  },
  dowText: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  dayNum: {
    fontFamily: family.medium,
    fontSize: 22,
    marginTop: 4,
    letterSpacing: -0.44
  },
  gridBody: {
    flexDirection: "row",
    position: "relative"
  },
  hourColumn: {
    width: 64
  },
  hourCell: {
    height: ROW,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  hourCellBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.rule3
  },
  hourText: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3
  },
  dayColumn: {
    flex: 1,
    position: "relative",
    borderLeftWidth: 1,
    borderLeftColor: colors.rule2
  },
  slotCell: {
    height: ROW
  },
  slotCellBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.rule3
  },
  nowLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 0,
    borderTopWidth: 1.5,
    borderTopColor: colors.accent,
    zIndex: 2
  },
  nowDot: {
    position: "absolute",
    left: -3,
    top: -5,
    width: 9,
    height: 9,
    borderRadius: 99,
    backgroundColor: colors.accent
  },
  eventWrap: {
    position: "absolute",
    left: 4,
    right: 4
  },
  event: {
    flex: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 5,
    overflow: "hidden",
    borderWidth: 1,
    borderLeftWidth: 3
  },
  eventTime: {
    fontFamily: family.mono,
    fontSize: 9.5,
    letterSpacing: 0.38
  },
  eventName: {
    fontFamily: family.medium,
    fontSize: 11,
    marginTop: 1
  },
  eventTag: {
    fontFamily: family.regular,
    fontSize: 9.5
  },
  sideCol: {
    flexGrow: 1,
    flexBasis: 320,
    gap: 12
  },
  nextCard: {
    backgroundColor: colors.ink,
    borderRadius: radii.xl,
    paddingHorizontal: 18,
    paddingVertical: 18,
    overflow: "hidden",
    ...shadow.card
  },
  nextBlob: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 999,
    backgroundColor: "rgba(0,180,216,0.2)",
    top: -60,
    right: -50
  },
  nextEyebrow: {
    ...text.eyebrow,
    color: "rgba(255,255,255,0.65)"
  },
  nextName: {
    fontFamily: family.serifItalic,
    fontSize: 28,
    lineHeight: 30,
    letterSpacing: -0.56,
    color: colors.paper,
    marginTop: 8
  },
  nextMeta: {
    fontFamily: family.mono,
    fontSize: 11,
    color: "rgba(255,255,255,0.65)",
    marginTop: 8
  },
  nextActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14
  },
  nextBtnFlex: {
    flex: 1
  },
  timelineCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  timelineHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  timelineTitle: {
    fontFamily: family.medium,
    fontSize: 14.5,
    color: colors.ink
  },
  timelineCount: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderBottomColor: colors.rule3
  },
  timelineRowNext: {
    backgroundColor: colors.paper3
  },
  timelineTime: {
    width: 46,
    fontFamily: family.monoMedium,
    fontSize: 11,
    color: colors.ink2
  },
  timelineDot: {
    width: 5,
    height: 5,
    borderRadius: 99
  },
  timelineInfo: {
    flex: 1,
    minWidth: 0
  },
  timelineName: {
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.ink
  },
  timelineNameNext: {
    fontFamily: family.medium
  },
  timelineNameDone: {
    textDecorationLine: "line-through"
  },
  timelineSub: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.ink3
  },
  timelineBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.accent
  },
  timelineBadgeText: {
    fontFamily: family.mono,
    fontSize: 9,
    letterSpacing: 0.54,
    color: colors.white
  },
  emptyBox: {
    padding: 24,
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
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(3,4,94,0.42)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.rule,
    padding: 20,
    ...shadow.card
  },
  modalEyebrow: {
    ...text.eyebrow,
    color: colors.ink3
  },
  modalName: {
    fontFamily: family.serifItalic,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.4,
    color: colors.ink,
    marginTop: 6
  },
  modalWhen: {
    fontFamily: family.monoMedium,
    fontSize: 12,
    color: colors.ink2,
    marginTop: 8
  },
  modalReason: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink3,
    marginTop: 4
  },
  modalError: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginTop: 10
  },
  modalStartBtn: {
    marginTop: 16
  },
  modalActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8
  },
  modalBtnFlex: {
    flex: 1
  }
});
