import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { secretaryNav } from "@/navigation/desktopNavConfigs";
import { goToScreen } from "@/navigation/screenRouter";
import { Appointment, AppointmentStatus, fetchAppointments, postAppointment } from "@/services/api/appointmentsApi";
import { Doctor } from "@/services/api/doctorsApi";
import { Patient, fetchPatientsList } from "@/services/api/patientsApi";
import { fetchInstitutionDoctors } from "@/services/api/secretaryApi";
import { silentOrEmpty } from "@/services/api/silent";
import { loadSession } from "@/state/sessionStore";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";
import { apptWallDate, formatApptTime } from "@/utils/dates";

const DOCTOR_COLORS = [colors.accentDeep, colors.mid, colors.ok, colors.accent, colors.ink3];
const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const ROW = 56;
const DAY_LABELS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
const HOUR_GUTTER = 64;
const MIN_DAY = 120;
const GRID_MIN_WIDTH = HOUR_GUTTER + 7 * MIN_DAY;

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function hourPos(value: string): number {
  const [hh, mm] = formatApptTime(value, "00:00").split(":").map(Number);
  const h = hh + mm / 60;
  const start = 8;
  return Math.max(0, h - start);
}

function statusVisual(status: AppointmentStatus): { bg: string; fg: string; border: string } {
  if (status === "scheduled") {
    return { bg: colors.alertSoft, fg: colors.alert, border: colors.alertRule };
  }
  if (status === "in_progress") {
    return { bg: colors.ink, fg: colors.white, border: colors.ink };
  }
  if (status === "completed") {
    return { bg: colors.okSoft, fg: colors.ok, border: colors.okRule };
  }
  if (status === "confirmed") {
    return { bg: colors.paper3, fg: colors.accentDeep, border: colors.accentRule };
  }
  return { bg: colors.paper3, fg: colors.accentDeep, border: colors.accentRule };
}

function formatTitle(start: Date, end: Date): string {
  const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  if (
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  ) {
    return `Agenda · ${start.getDate()} — ${end.getDate()} ${months[start.getMonth()].slice(0, 3)} ${start.getFullYear()}`;
  }
  return `Agenda · ${start.getDate()} ${months[start.getMonth()].slice(0, 3)} — ${end.getDate()} ${months[end.getMonth()].slice(0, 3)} ${end.getFullYear()}`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function SecAgendaDesktopPage() {
  const params = useLocalSearchParams<{ doctorId?: string }>();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(() => {
    const id = params.doctorId ? Number(params.doctorId) : NaN;
    return Number.isFinite(id) ? id : null;
  });
  const [showCreate, setShowCreate] = useState(false);
  const [createPatientId, setCreatePatientId] = useState<number | null>(null);
  const [createDoctorId, setCreateDoctorId] = useState<number | null>(null);
  const [createDayIdx, setCreateDayIdx] = useState(() => {
    const wd = new Date().getDay();
    return wd === 0 ? 6 : wd - 1;
  });
  const [createHour, setCreateHour] = useState("10:00");
  const [createReason, setCreateReason] = useState("");
  const [creating, setCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [weekAnchor, setWeekAnchor] = useState(() => new Date());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [apptList, docList, patList] = await Promise.all([
          fetchAppointments({ limit: 100 }).catch(() => ({ items: [], total: 0, page: 1, limit: 100 })),
          silentOrEmpty(fetchInstitutionDoctors(), "SecAgendaDesktopPage.fetchInstitutionDoctors"),
          fetchPatientsList({ limit: 100 }).catch(() => ({ items: [], total: 0, page: 1, limit: 100 }))
        ]);
        if (!cancelled) {
          setAppointments(apptList.items ?? []);
          setDoctors(docList ?? []);
          setPatients(patList.items ?? []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar la agenda.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const today = useMemo(() => new Date(), []);
  const weekStart = useMemo(() => startOfWeek(weekAnchor), [weekAnchor]);
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const doctorMap = useMemo(() => new Map(doctors.map((d) => [d.id, d] as const)), [doctors]);
  const patientMap = useMemo(() => new Map(patients.map((p) => [p.id, p] as const)), [patients]);
  const doctorColorMap = useMemo(() => {
    const m = new Map<number, string>();
    doctors.forEach((d, i) => m.set(d.id, DOCTOR_COLORS[i % DOCTOR_COLORS.length]));
    return m;
  }, [doctors]);

  const weekAppts = useMemo(() => {
    return appointments.filter((a) => {
      const d = apptWallDate(a.scheduled_at);
      return (
        d !== null &&
        d >= weekStart &&
        d < addDays(weekStart, 7) &&
        a.status !== "cancelled" &&
        a.status !== "no_show"
      );
    });
  }, [appointments, weekStart]);

  const filteredAppts = useMemo(() => {
    return selectedDoctor === null ? weekAppts : weekAppts.filter((a) => a.doctor_id === selectedDoctor);
  }, [weekAppts, selectedDoctor]);

  const todayCount = appointments.filter((a) => isSameDay(new Date(a.scheduled_at), today)).length;
  const unconfirmed = appointments.filter((a) => a.status === "scheduled" && isSameDay(new Date(a.scheduled_at), today)).length;

  const DR_FILTERS: { k: string; c?: string; id: number | null }[] = [
    { k: "Todos", id: null },
    ...doctors.map((d) => ({ k: `Dr. ${d.last_name}`, c: doctorColorMap.get(d.id) ?? colors.ink, id: d.id }))
  ];

  const LEGEND = [
    { bg: colors.paper3, border: colors.accentRule, k: "Confirmada" },
    { bg: colors.alertSoft, border: colors.alertRule, k: "Sin confirmar" },
    { bg: colors.okSoft, border: colors.okRule, k: "Atendida" },
    { bg: colors.ink, border: colors.ink, k: "En consulta" }
  ];

  function patientLabel(id: number): string {
    const p = patientMap.get(id);
    if (!p) return `Paciente #${id}`;
    const fi = p.first_name?.[0] ?? "";
    return `${fi}. ${p.last_name}`.trim();
  }

  function doctorLabel(id: number): string {
    const d = doctorMap.get(id);
    return d ? d.last_name : `#${id}`;
  }

  async function handleCreateAppointment() {
    const patientId = createPatientId ?? patients[0]?.id ?? null;
    const doctorId = createDoctorId ?? doctors[0]?.id ?? null;
    if (!patientId) {
      setCreateMessage("Primero vincula o crea un paciente de la clínica.");
      return;
    }
    if (!doctorId) {
      setCreateMessage("No hay médicos disponibles para agendar.");
      return;
    }
    const [hh, mm] = createHour.split(":").map(Number);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) {
      setCreateMessage("La hora debe tener formato HH:MM.");
      return;
    }
    const day = weekDays[createDayIdx] ?? today;
    const scheduled = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hh, mm, 0, 0);
    if (scheduled.getTime() <= Date.now()) {
      setCreateMessage("Selecciona una fecha y hora futuras.");
      return;
    }
    setCreating(true);
    setCreateMessage(null);
    try {
      const session = await loadSession();
      const doctor = doctorMap.get(doctorId);
      const created = await postAppointment({
        patient_id: patientId,
        doctor_id: doctorId,
        institution_id: session.user?.institution_id ?? doctor?.institution_id ?? null,
        scheduled_at: `${scheduled.getFullYear()}-${pad(scheduled.getMonth() + 1)}-${pad(scheduled.getDate())}T${pad(hh)}:${pad(mm)}:00`,
        reason: createReason.trim() || "Consulta desde recepción"
      });
      setAppointments((curr) => [...curr, created]);
      setCreateMessage("Cita creada y visible en la agenda.");
      setShowCreate(false);
      setCreateReason("");
    } catch (err) {
      setCreateMessage(err instanceof Error ? err.message : "No pudimos crear la cita.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <DesktopShell
      nav={secretaryNav}
      activeScreen="sec-agenda"
      role="secretaria · clínica"
      roleBadge="Secretaria"
      title={formatTitle(weekStart, weekEnd)}
      eyebrow={`${doctors.length} médicos · ${todayCount} citas hoy · ${unconfirmed} sin confirmar`}
      searchPlaceholder="Buscar paciente, médico…"
      topBarRight={
        <Button
          label="Nueva cita"
          variant="accent"
          size="sm"
          block={false}
          height={42}
          radius={radii.md}
          iconLeft="plus"
          onPress={() => setShowCreate((value) => !value)}
        />
      }
    >
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.toolbar}>
        <View style={styles.navGroup}>
          <Tappable
            style={styles.navBtn}
            onPress={() =>
              setWeekAnchor((current) => addDays(current, -7))
            }
          >
            <Icon kind="chev-l" size={13} color={colors.ink2} />
          </Tappable>
          <Tappable style={styles.todayBtn} onPress={() => setWeekAnchor(new Date())}>
            <Text style={styles.todayBtnText}>Hoy</Text>
          </Tappable>
          <Tappable
            style={styles.navBtn}
            onPress={() =>
              setWeekAnchor((current) => addDays(current, 7))
            }
          >
            <Icon kind="chev" size={13} color={colors.ink2} />
          </Tappable>
        </View>
        <View style={styles.drFilters}>
          {DR_FILTERS.map((f) => {
            const on = selectedDoctor === f.id;
            return (
              <Tappable key={f.k} onPress={() => setSelectedDoctor(f.id)} scaleTo={0.97}>
                <View
                  style={[
                    styles.drPill,
                    {
                      backgroundColor: on ? colors.ink : colors.white,
                      borderColor: on ? colors.ink : colors.rule
                    }
                  ]}
                >
                  {f.c ? <View style={[styles.drDot, { backgroundColor: f.c }]} /> : null}
                  <Text style={[styles.drPillText, { color: on ? colors.paper : colors.ink2 }]}>
                    {f.k}
                  </Text>
                </View>
              </Tappable>
            );
          })}
        </View>
      </View>

      {showCreate ? (
        <View style={styles.createCard}>
          <View style={styles.createHead}>
            <View>
              <Text style={styles.createTitle}>Nueva cita</Text>
              <Text style={styles.createSub}>Selecciona paciente, médico, día y hora.</Text>
            </View>
            <Button
              label="Vincular paciente"
              variant="ghost"
              size="sm"
              block={false}
              height={34}
              radius={radii.md}
              onPress={() => goToScreen("sec-link")}
            />
          </View>
          <View style={styles.createGrid}>
            <View style={styles.createFieldWide}>
              <Text style={styles.createLabel}>Paciente</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>
                {patients.length === 0 ? <Text style={styles.createHint}>Sin pacientes vinculados.</Text> : null}
                {patients.slice(0, 10).map((p) => {
                  const on = (createPatientId ?? patients[0]?.id) === p.id;
                  return (
                    <Tappable key={p.id} onPress={() => setCreatePatientId(p.id)} scaleTo={0.96}>
                      <View style={[styles.choicePill, on && styles.choicePillOn]}>
                        <Text style={[styles.choiceText, on && styles.choiceTextOn]}>
                          {`${p.first_name} ${p.last_name}`.trim()}
                        </Text>
                      </View>
                    </Tappable>
                  );
                })}
              </ScrollView>
            </View>
            <View style={styles.createFieldWide}>
              <Text style={styles.createLabel}>Médico</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>
                {doctors.length === 0 ? <Text style={styles.createHint}>Sin médicos activos.</Text> : null}
                {doctors.map((d) => {
                  const on = (createDoctorId ?? doctors[0]?.id) === d.id;
                  return (
                    <Tappable key={d.id} onPress={() => setCreateDoctorId(d.id)} scaleTo={0.96}>
                      <View style={[styles.choicePill, on && styles.choicePillOn]}>
                        <Text style={[styles.choiceText, on && styles.choiceTextOn]}>Dr. {d.last_name}</Text>
                      </View>
                    </Tappable>
                  );
                })}
              </ScrollView>
            </View>
            <View style={styles.createFieldWide}>
              <Text style={styles.createLabel}>Día</Text>
              <View style={styles.choiceRow}>
                {weekDays.map((d, i) => {
                  const on = createDayIdx === i;
                  return (
                    <Tappable key={d.toISOString()} onPress={() => setCreateDayIdx(i)} scaleTo={0.96}>
                      <View style={[styles.dayChoice, on && styles.choicePillOn]}>
                        <Text style={[styles.choiceText, on && styles.choiceTextOn]}>
                          {DAY_LABELS[i]} {d.getDate()}
                        </Text>
                      </View>
                    </Tappable>
                  );
                })}
              </View>
            </View>
            <View style={styles.createField}>
              <Text style={styles.createLabel}>Hora</Text>
              <TextInput
                value={createHour}
                onChangeText={setCreateHour}
                placeholder="10:00"
                placeholderTextColor={colors.ink3}
                style={styles.input}
              />
            </View>
            <View style={styles.createFieldWide}>
              <Text style={styles.createLabel}>Motivo</Text>
              <TextInput
                value={createReason}
                onChangeText={setCreateReason}
                placeholder="Motivo de consulta"
                placeholderTextColor={colors.ink3}
                style={[styles.input, styles.reasonInput]}
                multiline
              />
            </View>
          </View>
          {createMessage ? <Text style={styles.createMessage}>{createMessage}</Text> : null}
          <View style={styles.createActions}>
            <Button label="Cancelar" variant="ghost" size="sm" block={false} height={36} radius={radii.md} onPress={() => setShowCreate(false)} />
            <Button label={creating ? "Guardando..." : "Crear cita"} variant="accent" size="sm" block={false} height={36} radius={radii.md} iconLeft="plus" disabled={creating} onPress={handleCreateAppointment} />
          </View>
        </View>
      ) : null}

      <FadeIn>
        <View style={styles.gridCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.gridScrollInner}>
          <View style={styles.headerRow}>
            <View style={styles.hourGutter} />
            {weekDays.map((d, i) => {
              const isToday = isSameDay(d, today);
              return (
                <View
                  key={d.toISOString()}
                  style={[
                    styles.dayHeader,
                    { backgroundColor: isToday ? colors.paper3 : "transparent" },
                    i > 0 && styles.dayHeaderBorder
                  ]}
                >
                  <Text style={styles.dowText}>{DAY_LABELS[i]}</Text>
                  <Text style={[styles.dayNum, { color: isToday ? colors.accentDeep : colors.ink }]}>
                    {d.getDate()}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.gridBody}>
            <View style={styles.hourColumn}>
              {HOURS.map((h, i) => (
                <View key={h} style={[styles.hourCell, i > 0 && styles.hourCellBorder]}>
                  <Text style={styles.hourText}>{h}</Text>
                </View>
              ))}
            </View>
            {weekDays.map((d) => {
              const isToday = isSameDay(d, today);
              const colAppts = filteredAppts.filter((a) => isSameDay(new Date(a.scheduled_at), d));
              return (
                <View
                  key={d.toISOString()}
                  style={[
                    styles.dayColumn,
                    { backgroundColor: isToday ? colors.paper3 : "transparent" }
                  ]}
                >
                  {HOURS.map((h, i) => (
                    <View key={h} style={[styles.slotCell, i > 0 && styles.slotCellBorder]} />
                  ))}
                  {colAppts.map((a) => {
                    const top = hourPos(a.scheduled_at);
                    const c = statusVisual(a.status);
                    return (
                      <View
                        key={a.id}
                        style={[
                          styles.event,
                          {
                            top: top * ROW + 2,
                            height: ROW - 6,
                            backgroundColor: c.bg,
                            borderColor: c.border
                          }
                        ]}
                      >
                        <Text numberOfLines={1} style={[styles.eventName, { color: c.fg }]}>
                          {patientLabel(a.patient_id)}
                        </Text>
                        <Text numberOfLines={1} style={[styles.eventDr, { color: c.fg }]}>{doctorLabel(a.doctor_id)}</Text>
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
            </View>
          </ScrollView>

          <View style={styles.legendRow}>
            {LEGEND.map((l) => (
              <View key={l.k} style={styles.legendItem}>
                <View
                  style={[styles.legendSwatch, { backgroundColor: l.bg, borderColor: l.border }]}
                />
                <Text style={styles.legendText}>{l.k}</Text>
              </View>
            ))}
          </View>
        </View>
      </FadeIn>

      {appointments.length === 0 && !loading ? (
        <Text style={styles.empty}>No hay citas en esta semana.</Text>
      ) : null}
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  loading: {
    paddingVertical: 18,
    alignItems: "center"
  },
  errorText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginBottom: 10
  },
  empty: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    marginTop: 12,
    textAlign: "center"
  },
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
  drFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  drPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1
  },
  drDot: {
    width: 8,
    height: 8,
    borderRadius: 99
  },
  drPillText: {
    fontFamily: family.medium,
    fontSize: 12
  },
  createCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    padding: 18,
    marginBottom: 16
  },
  createHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 14
  },
  createTitle: {
    fontFamily: family.medium,
    fontSize: 16,
    color: colors.ink
  },
  createSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 3
  },
  createGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  createField: {
    flexBasis: 180,
    flexGrow: 1
  },
  createFieldWide: {
    flexBasis: 360,
    flexGrow: 1
  },
  createLabel: {
    fontFamily: family.monoMedium,
    fontSize: 10.5,
    color: colors.ink2,
    marginBottom: 7
  },
  choiceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7
  },
  choicePill: {
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: colors.white
  },
  choicePillOn: {
    borderColor: colors.ink,
    backgroundColor: colors.ink
  },
  dayChoice: {
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: colors.white
  },
  choiceText: {
    fontFamily: family.medium,
    fontSize: 11.5,
    color: colors.ink2
  },
  choiceTextOn: {
    color: colors.paper
  },
  createHint: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    paddingVertical: 8
  },
  input: {
    minHeight: 40,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink,
    backgroundColor: colors.white
  },
  reasonInput: {
    minHeight: 64,
    textAlignVertical: "top"
  },
  createMessage: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    marginTop: 12
  },
  createActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 14
  },
  gridCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  gridScrollInner: {
    minWidth: GRID_MIN_WIDTH
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
    minWidth: MIN_DAY,
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
    minWidth: MIN_DAY,
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
  event: {
    position: "absolute",
    left: 4,
    right: 4,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    justifyContent: "space-between",
    overflow: "hidden"
  },
  eventName: {
    fontFamily: family.medium,
    fontSize: 11
  },
  eventDr: {
    fontFamily: family.mono,
    fontSize: 9.5,
    opacity: 0.75
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.rule2
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  legendSwatch: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1
  },
  legendText: {
    fontFamily: family.regular,
    fontSize: 11.5,
    color: colors.ink2
  }
});
