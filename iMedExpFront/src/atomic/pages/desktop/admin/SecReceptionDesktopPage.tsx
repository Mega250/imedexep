import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { Tappable } from "@/atomic/atoms/Tappable";
import { QuickAppointmentModal } from "@/atomic/molecules/QuickAppointmentModal";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { secretaryNav } from "@/navigation/desktopNavConfigs";
import { goToScreen, replaceScreen } from "@/navigation/screenRouter";
import { Appointment, AppointmentStatus, fetchAppointments, patchAppointment } from "@/services/api/appointmentsApi";
import { Doctor } from "@/services/api/doctorsApi";
import { Patient, fetchPatientsList } from "@/services/api/patientsApi";
import { fetchInstitutionDoctors } from "@/services/api/secretaryApi";
import { silentOrEmpty } from "@/services/api/silent";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";
import { formatApptTime } from "@/utils/dates";

type Tone = "alert" | "ok" | "accent" | "plain";

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function stateLabel(status: AppointmentStatus): string {
  if (status === "confirmed") return "confirmada";
  if (status === "in_progress") return "en consulta";
  if (status === "scheduled") return "esperando";
  if (status === "completed") return "atendida";
  if (status === "cancelled") return "cancelada";
  if (status === "no_show") return "no asistió";
  return status;
}

function toneFor(status: AppointmentStatus): Tone {
  if (status === "scheduled") return "alert";
  if (status === "in_progress") return "ok";
  return "plain";
}

function statePillStyle(tone: Tone): { bg: string; fg: string } {
  if (tone === "alert") return { bg: colors.alertSoft, fg: colors.alert };
  if (tone === "ok") return { bg: colors.okSoft, fg: colors.ok };
  if (tone === "accent") return { bg: colors.accentBright, fg: colors.ink };
  return { bg: colors.paper3, fg: colors.accentDeep };
}

function initialsFromName(name: string) {
  return name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function waitMinutes(value: string): number {
  return Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
}

function formatTitle(d: Date): string {
  const days = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  return `Recepción · ${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()].slice(0, 3)}`;
}

function FilterPill({ label, count, on, onPress }: { label: string; count: number; on: boolean; onPress: () => void }) {
  return (
    <Tappable onPress={onPress} scaleTo={0.96}>
      <View
        style={[
          styles.pill,
          { borderColor: on ? colors.ink : colors.rule, backgroundColor: on ? colors.ink : colors.white }
        ]}
      >
        <Text style={[styles.pillText, { color: on ? colors.paper : colors.ink2 }]}>{label}</Text>
        <Text style={[styles.pillCount, { color: on ? colors.paper : colors.ink2, opacity: 0.65 }]}>
          {count}
        </Text>
      </View>
    </Tappable>
  );
}

export function SecReceptionDesktopPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDoctorFilter, setActiveDoctorFilter] = useState<number | "all">("all");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [quickModal, setQuickModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [apptList, patList, docList] = await Promise.all([
          fetchAppointments({ limit: 100 }).catch(() => ({ items: [], total: 0, page: 1, limit: 100 })),
          fetchPatientsList({ limit: 100 }).catch(() => ({ items: [], total: 0, page: 1, limit: 100 })),
          silentOrEmpty(fetchInstitutionDoctors(), "SecReceptionDesktopPage.fetchInstitutionDoctors")
        ]);
        if (!cancelled) {
          setAppointments(apptList.items ?? []);
          setPatients(patList.items ?? []);
          setDoctors(docList ?? []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar la recepción.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const today = useMemo(() => new Date(), []);
  const patientMap = useMemo(() => new Map(patients.map((p) => [p.id, p] as const)), [patients]);
  const doctorMap = useMemo(() => new Map(doctors.map((d) => [d.id, d] as const)), [doctors]);

  function patientName(id: number): string {
    const p = patientMap.get(id);
    return p ? `${p.first_name} ${p.last_name}`.trim() : `Paciente #${id}`;
  }
  function doctorName(id: number): string {
    const d = doctorMap.get(id);
    return d ? `Dr. ${d.last_name}` : `Dr. #${id}`;
  }

  const todays = appointments
    .filter((a) => isSameDay(new Date(a.scheduled_at), today))
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  const inRoom = todays.filter((a) => a.status === "scheduled" || a.status === "confirmed").length;
  const inConsult = todays.filter((a) => a.status === "in_progress").length;
  const attended = todays.filter((a) => a.status === "completed").length;
  const unconfirmed = todays.filter((a) => a.status === "scheduled").length;

  const STATS: [string, string, string, boolean][] = [
    ["En sala", String(inRoom), "esperando", false],
    ["Por confirmar", String(unconfirmed), "sin confirmar", true],
    ["Atendidas hoy", String(attended), `${inConsult} en consulta`, false]
  ];

  const filters: [string, number, boolean, number | "all"][] = [
    ["Todas", todays.length, activeDoctorFilter === "all", "all"],
    ...doctors.slice(0, 3).map((d) => {
      const count = todays.filter((a) => a.doctor_id === d.id).length;
      return [`Dr. ${d.last_name}`, count, activeDoctorFilter === d.id, d.id] as [string, number, boolean, number];
    })
  ];

  const filteredTodays =
    activeDoctorFilter === "all" ? todays : todays.filter((a) => a.doctor_id === activeDoctorFilter);
  const next = filteredTodays.find((a) => a.status === "scheduled" || a.status === "confirmed");
  const inConsultNext = filteredTodays.find((a) => a.status === "in_progress") ?? null;

  function replaceAppointment(updated: Appointment) {
    setAppointments((current) => current.map((a) => (a.id === updated.id ? updated : a)));
  }

  async function handleNotifyDoctor() {
    if (!next) {
      setActionMessage("No hay una cita pendiente para avisar al médico.");
      return;
    }
    if (next.status === "confirmed") {
      setActionMessage(`La cita de ${patientName(next.patient_id)} con ${doctorName(next.doctor_id)} ya está confirmada.`);
      return;
    }
    try {
      const updated = await patchAppointment(next.id, { status: "confirmed" });
      replaceAppointment(updated);
      setActionMessage(`Cita de ${patientName(updated.patient_id)} confirmada para ${doctorName(updated.doctor_id)}.`);
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "No pudimos confirmar la cita.");
    }
  }

  async function handlePassToConsult() {
    if (!next) {
      setActionMessage("No hay una cita pendiente para pasar al consultorio.");
      return;
    }
    try {
      const updated = await patchAppointment(next.id, { status: "in_progress" });
      replaceAppointment(updated);
      setActionMessage(`${patientName(updated.patient_id)} pasó a consulta con ${doctorName(updated.doctor_id)}.`);
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "No pudimos actualizar la cita.");
    }
  }

  async function handleCompleteConsult() {
    if (!inConsultNext) {
      setActionMessage("No hay una consulta en curso para finalizar.");
      return;
    }
    try {
      const updated = await patchAppointment(inConsultNext.id, { status: "completed" });
      replaceAppointment(updated);
      setActionMessage(`Consulta de ${patientName(updated.patient_id)} marcada como atendida.`);
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "No pudimos actualizar la cita.");
    }
  }

  return (
    <DesktopShell
      nav={secretaryNav}
      activeScreen="sec-reception"
      role="secretaria · clínica"
      roleBadge="Secretaria"
      title={formatTitle(today)}
      eyebrow={`${doctors.length} médicos · ${todays.length} citas hoy · ${unconfirmed} sin confirmar`}
      searchPlaceholder="Buscar paciente, CURP, cita…"
      hasAlert
      topBarRight={
        <View style={styles.topBarActions}>
          <Button
            label="Cita rápida"
            variant="accent"
            size="sm"
            block={false}
            height={42}
            radius={radii.md}
            iconLeft="alert"
            onPress={() => setQuickModal(true)}
          />
          <Button
            label="Agendar cita"
            variant="primary"
            size="sm"
            block={false}
            height={42}
            radius={radii.md}
            iconLeft="plus"
            onPress={() => goToScreen("sec-agenda")}
          />
        </View>
      }
    >
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FadeIn>
        <View style={styles.heroRow}>
          <View style={styles.heroCard}>
            <RadialBlob size={280} color="rgba(0,180,216,0.32)" style={styles.heroBlob} />
            <View style={styles.heroInner}>
              <Text style={styles.heroEyebrow}>Próximo en la sala</Text>
              {next ? (
                <>
                  <Text style={styles.heroName}>{patientName(next.patient_id)}</Text>
                  <Text style={styles.heroMeta}>
                    {formatApptTime(next.scheduled_at)} · {doctorName(next.doctor_id)} ·{" "}
                    {next.reason ?? "consulta"} ·{" "}
                    {next.status === "scheduled" ? `esperando ${waitMinutes(next.scheduled_at)} min` : stateLabel(next.status)}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.heroName}>Sin pacientes en sala</Text>
                  <Text style={styles.heroMeta}>Aún no hay citas pendientes por hoy</Text>
                </>
              )}
              <View style={styles.heroActions}>
                <Button
                  label="Pasar al consultorio"
                  variant="bright"
                  size="sm"
                  block={false}
                  height={38}
                  radius={radii.md}
                  iconRight="arrow"
                  disabled={!next}
                  style={!next ? styles.btnDisabled : undefined}
                  onPress={handlePassToConsult}
                />
                <Button
                  label="Aviso al médico"
                  variant="darkGhost"
                  size="sm"
                  block={false}
                  height={38}
                  radius={radii.md}
                  disabled={!next}
                  style={!next ? styles.btnDisabled : undefined}
                  onPress={handleNotifyDoctor}
                />
                <Button
                  label="Finalizar consulta"
                  variant="darkGhost"
                  size="sm"
                  block={false}
                  height={38}
                  radius={radii.md}
                  disabled={!inConsultNext}
                  style={!inConsultNext ? styles.btnDisabled : undefined}
                  onPress={handleCompleteConsult}
                />
              </View>
            </View>
          </View>
          {STATS.map(([k, n, sub, alert]) => (
            <View key={k} style={styles.statCard}>
              <Text style={styles.eyebrow}>{k}</Text>
              <Text style={[styles.statValue, alert && { color: colors.alert }]}>{n}</Text>
              <Text style={styles.statSub}>{sub}</Text>
            </View>
          ))}
        </View>
      </FadeIn>
      {actionMessage ? <Text style={styles.actionText}>{actionMessage}</Text> : null}

      <View style={styles.mainCols}>
        <View style={styles.queueCard}>
          <View style={styles.queueHead}>
            <Text style={styles.cardTitle}>Citas del día</Text>
            <View style={styles.filterPills}>
              {filters.map(([k, n, on, id]) => (
                <FilterPill key={k} label={k} count={n} on={on} onPress={() => setActiveDoctorFilter(id)} />
              ))}
            </View>
          </View>
          <View style={styles.tableHead}>
            <Text style={[styles.headCell, styles.colTime]}>Hora</Text>
            <Text style={[styles.headCell, styles.colPatient]}>Paciente</Text>
            <Text style={[styles.headCell, styles.colDr]}>Médico</Text>
            <Text style={[styles.headCell, styles.colReason]}>Motivo</Text>
            <Text style={[styles.headCell, styles.colState]}>Estado</Text>
          </View>
          {filteredTodays.length === 0 && !loading ? (
            <Text style={styles.empty}>No hay citas programadas para hoy.</Text>
          ) : null}
          {filteredTodays.map((q, i) => {
            const tone = toneFor(q.status);
            const pill = statePillStyle(tone);
            const wait = q.status === "scheduled" ? `${waitMinutes(q.scheduled_at)} min` : null;
            const pname = patientName(q.patient_id);
            return (
              <Tappable key={q.id} onPress={() => goToScreen("sec-reception")} scaleTo={0.995}>
                <View
                  style={[
                    styles.tableRow,
                    { borderBottomWidth: i < filteredTodays.length - 1 ? 1 : 0 },
                    tone === "accent" && { backgroundColor: colors.paper3 }
                  ]}
                >
                  <Text style={[styles.colTime, styles.timeText]}>{formatApptTime(q.scheduled_at)}</Text>
                  <View style={[styles.colPatient, styles.patientCell]}>
                    <View style={styles.rowAvatar}>
                      <Text style={styles.rowAvatarText}>{initialsFromName(pname)}</Text>
                    </View>
                    <View style={styles.flexShrink}>
                      <View style={styles.nameLine}>
                        <Text style={styles.patientName} numberOfLines={1} ellipsizeMode="tail">{pname}</Text>
                      </View>
                      {wait ? <Text style={styles.waitText}>esperando {wait}</Text> : null}
                    </View>
                  </View>
                  <Text style={[styles.colDr, styles.drText]} numberOfLines={1} ellipsizeMode="tail">{doctorName(q.doctor_id)}</Text>
                  <Text style={[styles.colReason, styles.reasonText]} numberOfLines={1} ellipsizeMode="tail">{q.reason ?? "—"}</Text>
                  <View style={styles.colState}>
                    <View style={[styles.statePill, { backgroundColor: pill.bg }]}>
                      <Text style={[styles.statePillText, { color: pill.fg }]}>{stateLabel(q.status)}</Text>
                    </View>
                  </View>
                </View>
              </Tappable>
            );
          })}
        </View>

        <View style={styles.sideCol}>
          <View style={styles.todoCard}>
            <View style={styles.todoHead}>
              <Text style={styles.cardTitle}>Pendientes</Text>
              <Text style={styles.todoHeadSub}>Sin tareas de seguimiento</Text>
            </View>
            <Text style={styles.empty}>Sin tareas registradas.</Text>
          </View>

          <View style={styles.quickCard}>
            <Text style={styles.eyebrow}>Acción rápida</Text>
            <Text style={styles.quickTitle}>Vincular paciente nuevo</Text>
            <Text style={styles.quickBody}>
              Busca por CURP o escanea el QR del paciente para vincularlo.
            </Text>
            <View style={styles.quickActions}>
              <Button
                label="Vincular"
                variant="accent"
                size="sm"
                iconLeft="link"
                style={styles.quickBtn}
                onPress={() => replaceScreen("sec-link")}
              />
              <Button
                label="Escanear QR"
                variant="ghost"
                size="sm"
                iconLeft="scan"
                style={styles.quickBtn}
                onPress={() => goToScreen("sec-link")}
              />
            </View>
          </View>
        </View>
      </View>
      {doctors.length > 0 ? (
        <QuickAppointmentModal
          visible={quickModal}
          doctorId={doctors[0].id}
          institutionId={doctors[0].institution_id ?? null}
          role="secretary"
          onClose={() => setQuickModal(false)}
          onCreated={() => {
            setQuickModal(false);
            goToScreen("sec-reception");
          }}
        />
      ) : null}
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  topBarActions: {
    flexDirection: "row",
    gap: 8
  },
  eyebrow: {
    ...text.eyebrow,
    color: colors.ink3
  },
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
  actionText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    marginTop: 10
  },
  empty: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    textAlign: "center",
    padding: 18
  },
  heroRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  heroCard: {
    flexGrow: 1.4,
    flexBasis: 360,
    backgroundColor: colors.ink,
    borderRadius: radii.xl,
    paddingHorizontal: 24,
    paddingVertical: 22,
    overflow: "hidden"
  },
  heroBlob: {
    top: -100,
    right: -80
  },
  heroInner: {
    position: "relative"
  },
  heroEyebrow: {
    ...text.eyebrow,
    color: "rgba(255,255,255,0.6)"
  },
  heroName: {
    fontFamily: family.serifItalic,
    fontSize: 36,
    lineHeight: 38,
    letterSpacing: -0.72,
    color: colors.paper,
    marginTop: 8
  },
  heroMeta: {
    fontFamily: family.mono,
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginTop: 8
  },
  heroActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 18
  },
  btnDisabled: {
    opacity: 0.45
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 150,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  statValue: {
    fontFamily: family.medium,
    fontSize: 28,
    letterSpacing: -0.84,
    color: colors.ink,
    marginTop: 6,
    lineHeight: 28
  },
  statSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 6
  },
  mainCols: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 18
  },
  queueCard: {
    flexGrow: 1.4,
    flexBasis: 460,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  queueHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  cardTitle: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  filterPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1
  },
  pillText: {
    fontFamily: family.medium,
    fontSize: 12
  },
  pillCount: {
    fontFamily: family.mono,
    fontSize: 10
  },
  tableHead: {
    flexDirection: "row",
    alignItems: "center",
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
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderBottomColor: colors.rule3
  },
  colTime: {
    width: 52
  },
  colPatient: {
    flexGrow: 1.6,
    flexBasis: 0,
    minWidth: 0
  },
  colDr: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 0
  },
  colReason: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 0
  },
  colState: {
    width: 100
  },
  timeText: {
    fontFamily: family.monoMedium,
    fontSize: 12,
    color: colors.ink2
  },
  patientCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  flexShrink: {
    flexShrink: 1,
    minWidth: 0
  },
  rowAvatar: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: colors.paper4,
    alignItems: "center",
    justifyContent: "center"
  },
  rowAvatarText: {
    fontFamily: family.medium,
    fontSize: 11,
    color: colors.ink
  },
  nameLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  patientName: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  waitText: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.alert,
    marginTop: 2
  },
  drText: {
    fontFamily: family.mono,
    fontSize: 11.5,
    color: colors.ink2
  },
  reasonText: {
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.ink2
  },
  statePill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999
  },
  statePillText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    letterSpacing: 0.76,
    textTransform: "uppercase"
  },
  sideCol: {
    flexGrow: 1,
    flexBasis: 300,
    gap: 14
  },
  todoCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  todoHead: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  todoHeadSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 2
  },
  quickCard: {
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.xl,
    padding: 18
  },
  quickTitle: {
    fontFamily: family.medium,
    fontSize: 16,
    color: colors.ink,
    marginTop: 6
  },
  quickBody: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    marginTop: 6,
    lineHeight: 16.5
  },
  quickActions: {
    flexDirection: "row",
    gap: 6,
    marginTop: 12
  },
  quickBtn: {
    flex: 1
  }
});
