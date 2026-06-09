import { ReactNode, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { SectionLabel } from "@/atomic/atoms/SectionLabel";
import { Tappable } from "@/atomic/atoms/Tappable";
import { FAB } from "@/atomic/molecules/FAB";
import { DoctorTabBar } from "@/atomic/organisms/DoctorTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goToScreen } from "@/navigation/screenRouter";
import { Appointment, fetchAppointments, patchAppointment, postAppointment } from "@/services/api/appointmentsApi";
import { Patient, fetchPatientsList } from "@/services/api/patientsApi";
import { DoctorShift, fetchDoctorShifts } from "@/services/api/doctorsApi";
import { getCurrentDoctorId } from "@/services/api/currentDoctor";
import { loadSession } from "@/state/sessionStore";
import { setSelectedPatientId } from "@/services/api/selectedPatient";
import { setSelectedAppointmentId } from "@/services/api/selectedAppointment";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";
import { apptWallDate, formatApptDateTime, formatApptTime } from "@/utils/dates";
import { statusLabel } from "@/utils/status";

const MONTHS_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const MONTHS_FULL  = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DOW_LABELS   = ["D","L","M","M","J","V","S"];

const VISIT_TYPES = [
  { value: "primera",      label: "Primera vez" },
  { value: "seguimiento",  label: "Seguimiento"  },
  { value: "urgencia",     label: "Urgencia"     }
] as const;
type VisitType = typeof VISIT_TYPES[number]["value"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function todayIsoDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function daysInMonth(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate();
}

function generateSlots(shifts: DoctorShift[], dayOfWeek: number): string[] {
  const dayShifts = shifts.filter((s) => s.day_of_week === dayOfWeek);
  const pairs: [number, number][] = dayShifts.length > 0
    ? dayShifts.map((s) => {
        const [sh, sm] = s.start_time.split(":").map(Number);
        const [eh, em] = s.end_time.split(":").map(Number);
        return [(sh || 0) * 60 + (sm || 0), (eh || 0) * 60 + (em || 0)];
      })
    : [[8 * 60, 18 * 60]]; // fallback 08:00–18:00
  const result: string[] = [];
  for (const [start, end] of pairs) {
    for (let t = start; t < end; t += 30) {
      result.push(`${pad(Math.floor(t / 60))}:${pad(t % 60)}`);
    }
  }
  return [...new Set(result)].sort();
}

function bookedTimesForDate(groups: Group[], dateIso: string): Set<string> {
  const set = new Set<string>();
  for (const g of groups) {
    for (const a of g.items) {
      const d = apptWallDate(a.scheduled_at) ?? new Date(a.scheduled_at);
      const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      if (key === dateIso) {
        set.add(`${pad(d.getHours())}:${pad(d.getMinutes())}`);
      }
    }
  }
  return set;
}

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
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createPatientId, setCreatePatientId] = useState<number | null>(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [createDate, setCreateDate] = useState(todayIsoDate);
  const [createHour, setCreateHour] = useState("");
  const [createReason, setCreateReason] = useState("");
  const [creating, setCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [shifts, setShifts] = useState<DoctorShift[]>([]);
  const [calCursor, setCalCursor] = useState<{ year: number; month: number }>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [visitType, setVisitType] = useState<VisitType>("primera");
  const [showCal, setShowCal] = useState(false);

  const timeSlots = useMemo(() => {
    const parts = createDate.split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return [];
    const dow = new Date(parts[0], parts[1] - 1, parts[2]).getDay();
    return generateSlots(shifts, dow);
  }, [shifts, createDate]);

  const bookedTimes = useMemo(() => bookedTimesForDate(groups, createDate), [groups, createDate]);

  async function reload(did: number) {
    const [appts, plist] = await Promise.all([
      fetchAppointments({ doctor_id: did, limit: 100 }),
      fetchPatientsList({ page: 1, limit: 100 }).catch(() => ({ items: [], total: 0, page: 1, limit: 100 }))
    ]);
    const map: Record<number, Patient> = {};
    for (const p of plist.items ?? []) {
      map[p.id] = p;
    }
    setGroups(
      groupByDay(
        (appts.items ?? []).filter(
          (a) => a.status !== "cancelled" && a.status !== "no_show"
        )
      )
    );
    setPatients(map);
    setPatientList(plist.items ?? []);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const did = await getCurrentDoctorId();
        if (!cancelled) {
          setDoctorId(did);
        }
        fetchDoctorShifts(did).then((s) => { if (!cancelled) setShifts(s); }).catch(() => {});
        const [appts, plist] = await Promise.all([
          fetchAppointments({ doctor_id: did, limit: 100 }),
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
                (a) => a.status !== "cancelled" && a.status !== "no_show"
              )
            )
          );
          setPatients(map);
          setPatientList(plist.items ?? []);
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

  async function handleCreateAppointment() {
    const pid = createPatientId ?? patientList[0]?.id ?? null;
    if (!pid) {
      setCreateMessage("Selecciona un paciente.");
      return;
    }
    if (!doctorId) {
      setCreateMessage("No se pudo determinar tu ID de médico.");
      return;
    }
    if (!createHour) {
      setCreateMessage("Selecciona un horario.");
      return;
    }
    const [hh, mm] = createHour.split(":").map(Number);
    if (!Number.isFinite(hh) || !Number.isFinite(mm) || hh < 0 || hh > 23 || mm < 0 || mm > 59) {
      setCreateMessage("Hora inválida. Selecciona un horario de la lista.");
      return;
    }
    const dateParts = createDate.split("-");
    if (dateParts.length !== 3) {
      setCreateMessage("La fecha debe tener formato AAAA-MM-DD.");
      return;
    }
    const scheduledAt = `${createDate}T${pad(hh)}:${pad(mm)}:00`;
    const scheduled = new Date(scheduledAt);
    if (Number.isNaN(scheduled.getTime())) {
      setCreateMessage("Fecha u hora inválida.");
      return;
    }
    if (scheduled.getTime() <= Date.now()) {
      setCreateMessage("Selecciona una fecha y hora futuras.");
      return;
    }
    setCreating(true);
    setCreateMessage(null);
    try {
      const session = await loadSession();
      await postAppointment({
        patient_id: pid,
        doctor_id: doctorId,
        institution_id: session.user?.institution_id ?? null,
        scheduled_at: scheduledAt,
        reason: (() => {
          const vLabel = VISIT_TYPES.find((v) => v.value === visitType)?.label ?? "";
          const rText = createReason.trim();
          return rText ? `[${vLabel}] ${rText}` : vLabel;
        })()
      });
      setShowCreate(false);
      setCreateReason("");
      setCreateDate(todayIsoDate());
      setCreateHour("");
      setVisitType("primera");
      setShowCal(false);
      setCreatePatientId(null);
      setPatientSearch("");
      setCreateMessage(null);
      await reload(doctorId);
    } catch (err) {
      setCreateMessage(err instanceof Error ? err.message : "No pudimos crear la cita.");
    } finally {
      setCreating(false);
    }
  }

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
      floating={<FAB icon="plus" label="Nueva cita" onPress={() => { setShowCreate((v) => !v); setCreateMessage(null); setPatientSearch(""); setShowCal(false); }} />}
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

      {showCreate ? (
        <FadeIn>
          <View style={styles.createCard}>
            <View style={styles.createHead}>
              <Text style={styles.createTitle}>Nueva cita</Text>
              <Tappable onPress={() => { setShowCreate(false); setPatientSearch(""); setShowCal(false); }} scaleTo={0.95}>
                <Text style={styles.createClose}>Cancelar</Text>
              </Tappable>
            </View>

            <Text style={styles.createLabel}>Paciente</Text>
            {patientList.length === 0 ? (
              <Text style={styles.createHint}>Sin pacientes vinculados. Vincula un paciente primero.</Text>
            ) : (() => {
              const selected = patientList.find((p) => p.id === createPatientId);
              const query = patientSearch.trim().toLowerCase();
              const filtered = query
                ? patientList.filter((p) =>
                    `${p.first_name} ${p.last_name}`.toLowerCase().includes(query)
                  ).slice(0, 6)
                : [];
              return (
                <>
                  {selected && !patientSearch ? (
                    <Tappable onPress={() => { setCreatePatientId(null); setPatientSearch(""); }} scaleTo={0.98}>
                      <View style={styles.selectedPatient}>
                        <Text style={styles.selectedPatientName}>
                          {`${selected.first_name} ${selected.last_name}`.trim()}
                        </Text>
                        <Text style={styles.selectedPatientClear}>✕</Text>
                      </View>
                    </Tappable>
                  ) : (
                    <>
                      <TextInput
                        value={patientSearch}
                        onChangeText={(v) => { setPatientSearch(v); setCreatePatientId(null); }}
                        placeholder="Buscar por nombre..."
                        placeholderTextColor={colors.ink3}
                        style={styles.input}
                        autoCorrect={false}
                      />
                      {filtered.length > 0 ? (
                        <View style={styles.dropdown}>
                          {filtered.map((p, i) => (
                            <Tappable
                              key={p.id}
                              onPress={() => { setCreatePatientId(p.id); setPatientSearch(""); }}
                              scaleTo={0.98}
                            >
                              <View style={[styles.dropdownRow, i < filtered.length - 1 && styles.dropdownBorder]}>
                                <Text style={styles.dropdownName}>
                                  {`${p.first_name} ${p.last_name}`.trim()}
                                </Text>
                              </View>
                            </Tappable>
                          ))}
                        </View>
                      ) : patientSearch.trim() ? (
                        <Text style={styles.createHint}>Sin resultados.</Text>
                      ) : null}
                    </>
                  )}
                </>
              );
            })()}

            <Text style={styles.createLabel}>Fecha</Text>
            <View style={styles.dateInputRow}>
              <TextInput
                value={createDate}
                onChangeText={(v) => {
                  setCreateDate(v);
                  const parts = v.split("-").map(Number);
                  if (parts.length === 3 && parts[0] > 2000 && parts[1] >= 1 && parts[1] <= 12) {
                    setCalCursor({ year: parts[0], month: parts[1] - 1 });
                  }
                }}
                placeholder="AAAA-MM-DD"
                placeholderTextColor={colors.ink3}
                style={[styles.input, styles.dateInput]}
                keyboardType="numeric"
              />
              <Tappable onPress={() => setShowCal((v) => !v)} scaleTo={0.9}>
                <View style={[styles.calToggleBtn, showCal && styles.calToggleBtnOn]}>
                  <Icon kind="cal" size={16} color={showCal ? colors.paper : colors.ink2} />
                </View>
              </Tappable>
            </View>
            {showCal ? (() => {
              const now = new Date();
              const todayIso2 = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
              const { year, month } = calCursor;
              const firstDow = new Date(year, month, 1).getDay();
              const days = daysInMonth(year, month);
              return (
                <View style={styles.calContainer}>
                  <View style={styles.calHeader}>
                    <Tappable
                      onPress={() => setCalCursor((c) => {
                        const m = c.month === 0 ? 11 : c.month - 1;
                        const y = c.month === 0 ? c.year - 1 : c.year;
                        return { year: y, month: m };
                      })}
                      scaleTo={0.88}
                    >
                      <Icon kind="chev-l" size={14} color={colors.ink2} />
                    </Tappable>
                    <Text style={styles.calMonth}>{MONTHS_FULL[month]} {year}</Text>
                    <Tappable
                      onPress={() => setCalCursor((c) => {
                        const m = c.month === 11 ? 0 : c.month + 1;
                        const y = c.month === 11 ? c.year + 1 : c.year;
                        return { year: y, month: m };
                      })}
                      scaleTo={0.88}
                    >
                      <Icon kind="chev" size={14} color={colors.ink2} />
                    </Tappable>
                  </View>
                  <View style={styles.calRow}>
                    {DOW_LABELS.map((d, i) => (
                      <Text key={i} style={styles.calDow}>{d}</Text>
                    ))}
                  </View>
                  <View style={styles.calGrid}>
                    {Array.from({ length: firstDow }).map((_, b) => (
                      <View key={`b${b}`} style={styles.calCell} />
                    ))}
                    {Array.from({ length: days }, (_, i) => i + 1).map((day) => {
                      const iso = `${year}-${pad(month + 1)}-${pad(day)}`;
                      const isPast = iso < todayIso2;
                      const isSelected = iso === createDate;
                      const isTodayCell = iso === todayIso2;
                      return (
                        <View key={day} style={styles.calCell}>
                          <Tappable
                            disabled={isPast}
                            onPress={() => { setCreateDate(iso); setCreateHour(""); setShowCal(false); }}
                            scaleTo={0.88}
                          >
                            <View style={[
                              styles.calDay,
                              isSelected && styles.calDayOn,
                              isTodayCell && !isSelected && styles.calDayTodayBorder
                            ]}>
                              <Text style={[
                                styles.calDayText,
                                { color: isSelected ? colors.paper : isPast ? colors.ink3 : colors.ink,
                                  opacity: isPast ? 0.45 : 1,
                                  fontFamily: isSelected || isTodayCell ? family.medium : family.regular }
                              ]}>{day}</Text>
                            </View>
                          </Tappable>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })() : null}

            <Text style={styles.createLabel}>Hora</Text>
            {timeSlots.length === 0 ? (
              <Text style={styles.createHint}>Sin horario configurado para este día.</Text>
            ) : (() => {
              const now = new Date();
              const todayIso3 = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
              const isSelectedToday = createDate === todayIso3;
              return (
                <View style={styles.slotsGrid}>
                  {timeSlots.map((slot) => {
                    const isBooked = bookedTimes.has(slot);
                    const isPastSlot = isSelectedToday && (() => {
                      const [hh2, mm2] = slot.split(":").map(Number);
                      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh2, mm2).getTime() <= Date.now();
                    })();
                    const disabled = isBooked || isPastSlot;
                    const selected = slot === createHour;
                    return (
                      <Tappable
                        key={slot}
                        disabled={disabled}
                        onPress={() => setCreateHour(slot)}
                        scaleTo={0.92}
                      >
                        <View style={[
                          styles.slotChip,
                          selected && styles.slotChipSelected,
                          disabled && styles.slotChipDisabled
                        ]}>
                          <Text style={[
                            styles.slotChipText,
                            selected && styles.slotChipTextSelected,
                            disabled && styles.slotChipTextDisabled
                          ]}>{slot}</Text>
                        </View>
                      </Tappable>
                    );
                  })}
                </View>
              );
            })()}

            <Text style={styles.createLabel}>Tipo de visita</Text>
            <View style={styles.visitTypeRow}>
              {VISIT_TYPES.map((vt) => (
                <Tappable
                  key={vt.value}
                  onPress={() => setVisitType(vt.value)}
                  scaleTo={0.95}
                >
                  <View style={[styles.visitTypeChip, visitType === vt.value && styles.visitTypeChipOn]}>
                    <Text style={[styles.visitTypeText, visitType === vt.value && styles.visitTypeTextOn]}>
                      {vt.label}
                    </Text>
                  </View>
                </Tappable>
              ))}
            </View>

            <Text style={styles.createLabel}>Motivo (opcional)</Text>
            <TextInput
              value={createReason}
              onChangeText={setCreateReason}
              placeholder="Motivo de consulta"
              placeholderTextColor={colors.ink3}
              style={[styles.input, styles.inputMulti]}
              multiline
            />

            {createMessage ? <Text style={styles.createMessage}>{createMessage}</Text> : null}

            <Button
              label={creating ? "Guardando..." : "Crear cita"}
              variant="accent"
              size="md"
              height={42}
              disabled={creating || patientList.length === 0}
              onPress={handleCreateAppointment}
            />
          </View>
        </FadeIn>
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
  },
  createCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    padding: 16,
    marginTop: 14,
    gap: 10
  },
  createHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  createTitle: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  createClose: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  createLabel: {
    fontFamily: family.mono,
    fontSize: 10,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.ink3,
    marginBottom: -4
  },
  createHint: {
    fontFamily: family.regular,
    fontSize: 12,
    color: colors.ink3
  },
  createMessage: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert
  },
  selectedPatient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.accentRule,
    backgroundColor: colors.accentSoft
  },
  selectedPatientName: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.accentDeep
  },
  selectedPatientClear: {
    fontFamily: family.mono,
    fontSize: 12,
    color: colors.ink3
  },
  dropdown: {
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    overflow: "hidden"
  },
  dropdownRow: {
    paddingHorizontal: 12,
    paddingVertical: 11
  },
  dropdownBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  dropdownName: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink
  },
  input: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.paper,
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink
  },
  inputMulti: {
    height: 72,
    paddingTop: 10,
    textAlignVertical: "top"
  },
  // Date input row
  dateInputRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center"
  },
  dateInput: {
    flex: 1
  },
  calToggleBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  calToggleBtnOn: {
    backgroundColor: colors.ink,
    borderColor: colors.ink
  },
  // Calendar
  calContainer: {
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    backgroundColor: colors.paper,
    paddingHorizontal: 8,
    paddingVertical: 10
  },
  calHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingHorizontal: 4
  },
  calMonth: {
    fontFamily: family.medium,
    fontSize: 12.5,
    color: colors.ink
  },
  calRow: {
    flexDirection: "row",
    marginBottom: 4
  },
  calDow: {
    width: `${100 / 7}%`,
    textAlign: "center",
    fontFamily: family.mono,
    fontSize: 9,
    color: colors.ink3,
    letterSpacing: 0.3
  },
  calGrid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  calCell: {
    width: `${100 / 7}%`,
    paddingVertical: 2,
    alignItems: "center"
  },
  calDay: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  calDayOn: {
    backgroundColor: colors.ink
  },
  calDayTodayBorder: {
    borderWidth: 1,
    borderColor: colors.accentDeep
  },
  calDayText: {
    fontSize: 12
  },
  // Time slots
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  slotChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white
  },
  slotChipSelected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink
  },
  slotChipDisabled: {
    opacity: 0.35
  },
  slotChipText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink
  },
  slotChipTextSelected: {
    color: colors.paper
  },
  slotChipTextDisabled: {
    color: colors.ink3
  },
  // Visit type
  visitTypeRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap"
  },
  visitTypeChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white
  },
  visitTypeChipOn: {
    backgroundColor: colors.accentDeep,
    borderColor: colors.accentDeep
  },
  visitTypeText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink2
  },
  visitTypeTextOn: {
    color: colors.paper
  }
});
