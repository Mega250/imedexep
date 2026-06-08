import { ReactNode, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { Card } from "@/atomic/atoms/Card";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { RoundIconButton } from "@/atomic/atoms/RoundIconButton";
import { SectionLabel } from "@/atomic/atoms/SectionLabel";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DarkPanel } from "@/atomic/molecules/DarkPanel";
import { PatientTabBar } from "@/atomic/organisms/PatientTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goToScreen } from "@/navigation/screenRouter";
import { Appointment, AppointmentStatus, fetchAppointments, patchAppointment } from "@/services/api/appointmentsApi";
import { getCurrentPatientId } from "@/services/api/currentPatient";
import { isScreenBlocked, useBlockedScreens } from "@/state/blockedScreens";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";
import { confirmAction } from "@/utils/confirm";
import { apptWallDate, formatApptDateTime, formatApptTime } from "@/utils/dates";

const TABS = ["Próximas", "Pasadas", "Canceladas"];

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
const HOURS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30"];

function buildCurrentMonthDays(): { offset: number; total: number; year: number; month: number } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const offset = (firstDay.getDay() + 6) % 7;
  return { offset, total: lastDay.getDate(), year, month };
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

type Classified = {
  upcoming: Appointment[];
  past: Appointment[];
  cancelled: Appointment[];
  inProgress: Appointment[];
};

function classify(items: Appointment[]): Classified {
  const now = Date.now();
  const upcoming: Appointment[] = [];
  const past: Appointment[] = [];
  const cancelled: Appointment[] = [];
  const inProgress: Appointment[] = [];
  for (const a of items) {
    if (a.status === "cancelled" || a.status === "no_show") {
      cancelled.push(a);
      continue;
    }
    if (a.status === "in_progress") {
      inProgress.push(a);
      continue;
    }
    if (new Date(a.scheduled_at).getTime() >= now) {
      upcoming.push(a);
    } else {
      past.push(a);
    }
  }
  upcoming.sort((x, y) => new Date(x.scheduled_at).getTime() - new Date(y.scheduled_at).getTime());
  past.sort((x, y) => new Date(y.scheduled_at).getTime() - new Date(x.scheduled_at).getTime());
  cancelled.sort((x, y) => new Date(y.scheduled_at).getTime() - new Date(x.scheduled_at).getTime());
  inProgress.sort((x, y) => new Date(y.scheduled_at).getTime() - new Date(x.scheduled_at).getTime());
  return { upcoming, past, cancelled, inProgress };
}

function canCancel(status: AppointmentStatus): boolean {
  return status === "scheduled" || status === "confirmed" || status === "in_progress";
}

function canReschedule(status: AppointmentStatus): boolean {
  return status === "scheduled" || status === "confirmed";
}

function fmtTime(value: string): string {
  return formatApptTime(value);
}

function fmtDay(value: string): string {
  return formatApptDateTime(value, { weekday: "short", day: "2-digit", month: "short" });
}

function fmtFull(value: string): string {
  return formatApptDateTime(value, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

function DetailRow({ label, value }: { label: string; value: string }): ReactNode {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function statusLabelEs(status: string): string {
  switch (status) {
    case "scheduled":
      return "Programada";
    case "confirmed":
      return "Confirmada";
    case "in_progress":
      return "En consulta";
    case "completed":
      return "Atendida";
    case "cancelled":
      return "Cancelada";
    case "no_show":
      return "No asistió";
    case "pending":
    case "PEND":
      return "Pendiente";
    default:
      return status;
  }
}

function statusTagColor(status: AppointmentStatus): { bg: string; fg: string } {
  switch (status) {
    case "confirmed":
      return { bg: "rgba(28,140,90,0.12)", fg: colors.ok };
    case "scheduled":
      return { bg: "rgba(201,122,18,0.12)", fg: colors.mid };
    case "completed":
      return { bg: colors.paper3, fg: colors.accentDeep };
    case "in_progress":
      return { bg: colors.paper3, fg: colors.accentDeep };
    case "cancelled":
      return { bg: colors.alertSoft, fg: colors.alert };
    case "no_show":
      return { bg: colors.alertSoft, fg: colors.alert };
    default:
      return { bg: colors.paper3, fg: colors.accentDeep };
  }
}

export function PCitasPage() {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState<Classified | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [rescheduleId, setRescheduleId] = useState<number | null>(null);
  const [rescheduleDay, setRescheduleDay] = useState<number>(1);
  const [rescheduleHour, setRescheduleHour] = useState<string>("10:30");
  const [rescheduleBusy, setRescheduleBusy] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  useBlockedScreens();
  const agendarBlocked = isScreenBlocked("pat-agendar");

  const month = useMemo(buildCurrentMonthDays, []);
  const todayDay = new Date().getDate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const patientId = await getCurrentPatientId();
        const res = await fetchAppointments({ patient_id: patientId, limit: 100 });
        if (!cancelled) {
          setData(classify(res.items ?? []));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar tus citas.");
          setData({ upcoming: [], past: [], cancelled: [], inProgress: [] });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  async function handleCancel(appt: Appointment) {
    const ok = await confirmAction(
      "Cancelar cita",
      "¿Seguro que deseas cancelar esta cita?",
      { confirmLabel: "Cancelar cita", cancelLabel: "Volver", destructive: true }
    );
    if (!ok) {
      return;
    }
    setActionId(appt.id);
    setActionMsg(null);
    try {
      await patchAppointment(appt.id, { status: "cancelled" });
      setExpandedId(null);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : "No pudimos cancelar la cita.");
    } finally {
      setActionId(null);
    }
  }

  function openReschedule(appt: Appointment) {
    const wall = apptWallDate(appt.scheduled_at);
    let day = Math.min(todayDay + 1, month.total);
    let hour = "10:30";
    if (
      wall &&
      wall.getFullYear() === month.year &&
      wall.getMonth() === month.month &&
      wall.getDate() >= todayDay
    ) {
      day = wall.getDate();
      const hhmm = `${pad(wall.getHours())}:${pad(wall.getMinutes())}`;
      if (HOURS.includes(hhmm)) {
        hour = hhmm;
      }
    }
    setRescheduleDay(day);
    setRescheduleHour(hour);
    setRescheduleError(null);
    setRescheduleId(appt.id);
  }

  function closeReschedule() {
    if (rescheduleBusy) {
      return;
    }
    setRescheduleId(null);
    setRescheduleError(null);
  }

  async function handleReschedule() {
    if (rescheduleId === null || rescheduleBusy) {
      return;
    }
    setRescheduleBusy(true);
    setRescheduleError(null);
    try {
      const [hh, mm] = rescheduleHour.split(":").map(Number);
      const scheduled = new Date(month.year, month.month, rescheduleDay, hh, mm, 0, 0);
      if (scheduled.getTime() <= Date.now()) {
        throw new Error("Selecciona una fecha y hora futuras.");
      }
      const scheduled_at = `${scheduled.getFullYear()}-${pad(scheduled.getMonth() + 1)}-${pad(scheduled.getDate())}T${pad(hh)}:${pad(mm)}:00`;
      await patchAppointment(rescheduleId, { scheduled_at });
      setRescheduleId(null);
      setExpandedId(null);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setRescheduleError(err instanceof Error ? err.message : "No pudimos reagendar la cita.");
    } finally {
      setRescheduleBusy(false);
    }
  }

  function toggleExpand(id: number) {
    setExpandedId((current) => (current === id ? null : id));
  }

  function renderAppointmentCard(c: Appointment): ReactNode {
    const tagColors = statusTagColor(c.status);
    const expanded = expandedId === c.id;
    const busy = actionId === c.id;
    return (
      <View key={c.id} style={styles.cardWrap}>
        <Tappable scaleTo={0.98} onPress={() => toggleExpand(c.id)}>
          <Card radius={radii.md} style={styles.otherCard}>
            <View style={styles.timeBlock}>
              <Text style={styles.timeText}>{fmtTime(c.scheduled_at)}</Text>
              <Text style={styles.timeDate}>{fmtDay(c.scheduled_at)}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.otherDr} numberOfLines={1}>{c.doctor_name ?? `Doctor #${c.doctor_id}`}</Text>
              <Text style={styles.otherMeta} numberOfLines={1}>{c.reason ?? "consulta"}</Text>
            </View>
            <View style={[styles.stateTag, { backgroundColor: tagColors.bg }]}>
              <Text style={[styles.stateText, { color: tagColors.fg }]} numberOfLines={1}>
                {statusLabelEs(c.status)}
              </Text>
            </View>
          </Card>
        </Tappable>
        {expanded ? (
          <View style={styles.detail}>
            <DetailRow label="Cuándo" value={fmtFull(c.scheduled_at)} />
            <DetailRow label="Médico" value={c.doctor_name ?? `Doctor #${c.doctor_id}`} />
            <DetailRow label="Institución" value={c.institution_name ?? `institución #${c.institution_id}`} />
            <DetailRow label="Motivo" value={c.reason ?? "consulta"} />
            <DetailRow label="Estado" value={statusLabelEs(c.status)} />
            {canReschedule(c.status) ? (
              <Button
                label="Reagendar"
                variant="ghost"
                size="sm"
                height={36}
                iconLeft="cal"
                style={styles.rescheduleBtn}
                disabled={busy}
                onPress={() => openReschedule(c)}
              />
            ) : null}
            {canCancel(c.status) ? (
              <Button
                label={busy ? "Cancelando…" : "Cancelar cita"}
                variant="ghost"
                size="sm"
                height={36}
                iconLeft="x"
                style={styles.cancelBtn}
                disabled={busy}
                onPress={() => handleCancel(c)}
              />
            ) : null}
          </View>
        ) : null}
      </View>
    );
  }

  const upcomingCount = data?.upcoming.length ?? 0;
  const pastCount = data?.past.length ?? 0;
  const featured = data?.upcoming[0] ?? null;
  const others = data ? data.upcoming.slice(1) : [];

  function Header(): ReactNode {
    return (
      <>
        <ScreenTopBar
          sub={data ? `${upcomingCount} próximas · ${pastCount} pasadas` : "Cargando…"}
          title="Mis Citas"
          right={agendarBlocked ? undefined : <RoundIconButton icon="plus" onPress={() => goToScreen("pat-agendar")} />}
        />
        <View style={styles.tabs}>
          {TABS.map((label, index) => {
            const on = index === tab;
            return (
              <View key={label} style={styles.tabCell}>
                <Tappable scaleTo={0.96} onPress={() => setTab(index)} style={styles.tabInner}>
                  <Text style={[styles.tabText, { color: on ? colors.ink : colors.ink3 }]}>
                    {label}
                  </Text>
                </Tappable>
                <View style={[styles.tabUnderline, on ? styles.tabUnderlineOn : null]} />
              </View>
            );
          })}
        </View>
      </>
    );
  }

  const listForTab = data
    ? tab === 0
      ? others
      : tab === 1
        ? data.past
        : data.cancelled
    : [];

  return (
    <MobileScreen
      tabBar={<PatientTabBar active={2} />}
      header={<Header />}
      contentStyle={styles.content}
    >
      {data === null ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {actionMsg ? <Text style={styles.error}>{actionMsg}</Text> : null}

      {tab === 0 && data && data.inProgress.length > 0 ? (
        <FadeIn>
          <SectionLabel label="Consulta en curso" style={styles.section} />
          <View style={styles.list}>
            {data.inProgress.map((c) => renderAppointmentCard(c))}
          </View>
        </FadeIn>
      ) : null}

      {tab === 0 && featured ? (
        <FadeIn>
          <DarkPanel radius={radii.xl} padding={20} blobSize={200} blobTop={-60} blobRight={-50}>
            <View style={styles.featTop}>
              <Text style={styles.featEyebrow} numberOfLines={1}>Tu próxima cita</Text>
              <View style={styles.confirmTag}>
                <Text style={styles.confirmText}>{statusLabelEs(featured.status)}</Text>
              </View>
            </View>
            <View style={styles.featTimeRow}>
              <Text style={styles.featTime}>{fmtTime(featured.scheduled_at)}</Text>
              <Text style={styles.featWhen}>{fmtDay(featured.scheduled_at)}</Text>
            </View>
            <View style={styles.featDoctor}>
              <Text style={styles.featName}>{featured.doctor_name ?? `Doctor #${featured.doctor_id}`}</Text>
              <Text style={styles.featMeta}>{featured.institution_name ?? `institución #${featured.institution_id}`}</Text>
              {featured.reason ? <Text style={styles.featMeta}>{featured.reason}</Text> : null}
            </View>
            <View style={styles.featButtons}>
              <View style={styles.flex}>
                <Button
                  label="Compartir por QR"
                  variant="bright"
                  size="sm"
                  height={32}
                  onPress={() => goToScreen("pat-qr-mob")}
                />
              </View>
              <Button
                label="Ver clínica"
                variant="darkGhost"
                size="sm"
                block={false}
                height={32}
                onPress={() => goToScreen("pat-clinics-mob")}
              />
            </View>
            {canReschedule(featured.status) ? (
              <Button
                label="Reagendar"
                variant="darkGhost"
                size="sm"
                height={32}
                iconLeft="cal"
                style={styles.featCancel}
                disabled={actionId === featured.id}
                onPress={() => openReschedule(featured)}
              />
            ) : null}
            {canCancel(featured.status) ? (
              <Button
                label={actionId === featured.id ? "Cancelando…" : "Cancelar cita"}
                variant="darkGhost"
                size="sm"
                height={32}
                iconLeft="x"
                style={styles.featCancel}
                disabled={actionId === featured.id}
                onPress={() => handleCancel(featured)}
              />
            ) : null}
          </DarkPanel>
        </FadeIn>
      ) : null}

      {tab === 0 && !featured && data && data.inProgress.length === 0 ? (
        <FadeIn>
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Aún no tienes citas agendadas.</Text>
            <Text style={styles.emptySub}>
              {agendarBlocked
                ? "Agendar citas no está disponible en tu cuenta por ahora."
                : "Toca el botón + para agendar tu próxima consulta."}
            </Text>
          </View>
        </FadeIn>
      ) : null}

      {listForTab.length > 0 ? (
        <FadeIn delay={90}>
          <SectionLabel
            label={tab === 0 ? "También agendadas" : tab === 1 ? "Citas anteriores" : "Canceladas"}
            style={styles.section}
          />
          <View style={styles.list}>
            {listForTab.map((c) => renderAppointmentCard(c))}
          </View>
        </FadeIn>
      ) : null}

      {tab !== 0 && listForTab.length === 0 && data ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>
            {tab === 1 ? "Sin citas anteriores." : "Sin canceladas."}
          </Text>
        </View>
      ) : null}

      <Modal
        visible={rescheduleId !== null}
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        onRequestClose={closeReschedule}
      >
        <Pressable style={styles.backdrop} onPress={closeReschedule}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalEyebrow}>Reagendar cita</Text>
            <Text style={styles.modalTitle}>Elige nueva fecha y hora</Text>
            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={styles.modalBodyContent}
              showsVerticalScrollIndicator={false}
            >
              <SectionLabel label="Fecha · mes en curso" style={styles.modalLabel} />
              <Card radius={radii.md} style={styles.calCard}>
                <View style={styles.calRow}>
                  {WEEKDAYS.map((d, i) => (
                    <Text key={i} style={styles.calWeekday}>
                      {d}
                    </Text>
                  ))}
                </View>
                <View style={styles.calGrid}>
                  {Array.from({ length: month.offset }).map((_, b) => (
                    <View key={`b${b}`} style={styles.calCell} />
                  ))}
                  {Array.from({ length: month.total }, (_, i) => i + 1).map((d) => {
                    const isToday = d === todayDay;
                    const isSel = d === rescheduleDay;
                    const past = d < todayDay;
                    return (
                      <View key={d} style={styles.calCell}>
                        <Tappable
                          onPress={() => !past && setRescheduleDay(d)}
                          disabled={past}
                          scaleTo={0.94}
                        >
                          <View
                            style={[
                              styles.calDay,
                              isSel ? { backgroundColor: colors.accent } : null,
                              isToday && !isSel
                                ? { borderWidth: 1, borderColor: colors.accent }
                                : null
                            ]}
                          >
                            <Text
                              style={[
                                styles.calDayText,
                                {
                                  color: isSel ? colors.white : past ? colors.ink4 : colors.ink,
                                  opacity: past ? 0.5 : 1
                                }
                              ]}
                            >
                              {d}
                            </Text>
                          </View>
                        </Tappable>
                      </View>
                    );
                  })}
                </View>
              </Card>

              <SectionLabel label={`Hora · día ${rescheduleDay}`} style={styles.modalLabel} />
              <View style={styles.hourGrid}>
                {HOURS.map((h) => {
                  const sel = h === rescheduleHour;
                  return (
                    <Tappable key={h} onPress={() => setRescheduleHour(h)} scaleTo={0.95} style={styles.hourTap}>
                      <View
                        style={[
                          styles.hourBtn,
                          {
                            backgroundColor: sel ? colors.ink : colors.white,
                            borderColor: sel ? colors.ink : colors.rule
                          }
                        ]}
                      >
                        <Text style={[styles.hourText, { color: sel ? colors.paper : colors.ink }]}>
                          {h}
                        </Text>
                      </View>
                    </Tappable>
                  );
                })}
              </View>

              {rescheduleError ? <Text style={styles.modalError}>{rescheduleError}</Text> : null}
            </ScrollView>
            <View style={styles.modalActions}>
              <Button
                label="Cancelar"
                variant="ghost"
                size="sm"
                block={false}
                onPress={closeReschedule}
                disabled={rescheduleBusy}
              />
              <Button
                label={rescheduleBusy ? "Guardando…" : "Reagendar"}
                size="sm"
                block={false}
                iconRight="check"
                onPress={handleReschedule}
                disabled={rescheduleBusy}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 120
  },
  flex: {
    flex: 1,
    minWidth: 0
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
  tabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 22,
    paddingTop: 12,
    backgroundColor: colors.paper
  },
  tabCell: {
    flex: 1
  },
  tabInner: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: "center"
  },
  tabUnderline: {
    height: 2,
    backgroundColor: "transparent"
  },
  tabUnderlineOn: {
    backgroundColor: colors.ink
  },
  tabText: {
    fontFamily: family.medium,
    fontSize: 13,
    textAlign: "center"
  },
  featTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  featEyebrow: {
    fontFamily: family.mono,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.6)",
    flexShrink: 1,
    minWidth: 0
  },
  confirmTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.accentBright
  },
  confirmText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.ink,
    letterSpacing: 0.8
  },
  featTimeRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
    marginTop: 10
  },
  featTime: {
    fontFamily: family.mono,
    fontSize: 32,
    letterSpacing: -0.6,
    color: colors.paper
  },
  featWhen: {
    fontFamily: family.regular,
    fontSize: 13,
    color: "rgba(255,255,255,0.6)"
  },
  featDoctor: {
    marginTop: 8
  },
  featName: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.paper
  },
  featMeta: {
    fontFamily: family.mono,
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2
  },
  featButtons: {
    flexDirection: "row",
    gap: 6,
    marginTop: 12
  },
  empty: {
    padding: 18,
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.xl,
    marginTop: 6
  },
  emptyTitle: {
    fontFamily: family.serifItalic,
    fontSize: 18,
    color: colors.ink
  },
  emptySub: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    marginTop: 6
  },
  section: {
    marginTop: 18,
    marginBottom: 8
  },
  list: {
    gap: 8
  },
  otherCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  timeBlock: {
    width: 54,
    borderRightWidth: 1,
    borderRightColor: colors.rule2,
    paddingRight: 12
  },
  timeText: {
    fontFamily: family.monoMedium,
    fontSize: 12.5,
    color: colors.ink
  },
  timeDate: {
    fontFamily: family.mono,
    fontSize: 9,
    color: colors.ink3,
    letterSpacing: 0.5,
    marginTop: 1
  },
  otherDr: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink
  },
  otherMeta: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 1
  },
  stateTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    flexShrink: 0
  },
  stateText: {
    fontFamily: family.mono,
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  cardWrap: {
    gap: 0
  },
  featCancel: {
    marginTop: 8,
    alignSelf: "flex-start"
  },
  detail: {
    marginTop: 6,
    padding: 14,
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.md
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule3
  },
  detailLabel: {
    fontFamily: family.mono,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.ink3
  },
  detailValue: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.ink,
    flexShrink: 1,
    textAlign: "right"
  },
  cancelBtn: {
    marginTop: 12,
    alignSelf: "flex-start"
  },
  rescheduleBtn: {
    marginTop: 12,
    alignSelf: "flex-start"
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(3,4,94,0.42)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    maxHeight: "86%",
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.rule,
    padding: 20
  },
  modalEyebrow: {
    fontFamily: family.mono,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: colors.ink3
  },
  modalTitle: {
    fontFamily: family.serifItalic,
    fontSize: 20,
    letterSpacing: -0.4,
    color: colors.ink,
    marginTop: 2,
    marginBottom: 8
  },
  modalBody: {
    flexGrow: 0
  },
  modalBodyContent: {
    paddingBottom: 4
  },
  modalLabel: {
    marginTop: 14,
    marginBottom: 8
  },
  modalError: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginTop: 12
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 16
  },
  calCard: {
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  calRow: {
    flexDirection: "row",
    marginBottom: 4
  },
  calWeekday: {
    width: `${100 / 7}%`,
    textAlign: "center",
    fontFamily: family.mono,
    fontSize: 9,
    color: colors.ink3,
    letterSpacing: 0.5
  },
  calGrid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  calCell: {
    width: `${100 / 7}%`,
    paddingVertical: 1.5,
    alignItems: "center"
  },
  calDay: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  calDayText: {
    fontFamily: family.regular,
    fontSize: 12
  },
  hourGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  hourTap: {
    flexGrow: 1,
    flexBasis: "22%",
    minWidth: 64
  },
  hourBtn: {
    width: "100%",
    paddingVertical: 9,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center"
  },
  hourText: {
    fontFamily: family.mono,
    fontSize: 11
  }
});
