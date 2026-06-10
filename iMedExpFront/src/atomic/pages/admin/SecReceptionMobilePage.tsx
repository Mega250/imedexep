import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DarkPanel } from "@/atomic/molecules/DarkPanel";
import { FAB } from "@/atomic/molecules/FAB";
import { QuickAppointmentModal } from "@/atomic/molecules/QuickAppointmentModal";
import { Section } from "@/atomic/molecules/Section";
import { StatTile } from "@/atomic/molecules/StatTile";
import { IconTabBar } from "@/atomic/organisms/IconTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goToScreen } from "@/navigation/screenRouter";
import { secretaryTabs } from "@/navigation/tabConfigs";
import { Appointment, AppointmentStatus, fetchAppointments, patchAppointment } from "@/services/api/appointmentsApi";
import { Patient, fetchPatientsList } from "@/services/api/patientsApi";
import { Doctor } from "@/services/api/doctorsApi";
import { fetchInstitutionDoctors } from "@/services/api/secretaryApi";
import { silentOrEmpty } from "@/services/api/silent";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";
import { formatApptTime } from "@/utils/dates";

type Tone = "alert" | "ok" | "accent" | "plain";

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatHeaderSub(today: Date, doctors: number, total: number): string {
  const days = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${days[today.getDay()]} ${today.getDate()} ${months[today.getMonth()]} · ${doctors} médicos · ${total} citas hoy`;
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
  if (status === "confirmed") return "plain";
  return "plain";
}

function waitMinutes(value: string): number {
  const ms = Date.now() - new Date(value).getTime();
  return Math.max(0, Math.round(ms / 60000));
}

export function SecReceptionMobilePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [quickModal, setQuickModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [apptList, patList, docList] = await Promise.all([
          fetchAppointments({ limit: 100 }).catch(() => ({ items: [], total: 0, page: 1, limit: 100 })),
          fetchPatientsList({ limit: 100 }).catch(() => ({ items: [], total: 0, page: 1, limit: 100 })),
          silentOrEmpty(fetchInstitutionDoctors(), "SecReceptionMobilePage.fetchInstitutionDoctors")
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

  const today = new Date();
  const todays = appointments
    .filter((a) => isSameDay(new Date(a.scheduled_at), today))
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  const patientMap = new Map<number, Patient>();
  patients.forEach((p) => patientMap.set(p.id, p));

  const doctorMap = new Map<number, Doctor>();
  doctors.forEach((d) => doctorMap.set(d.id, d));

  function patientName(id: number): string {
    const p = patientMap.get(id);
    if (!p) return `Paciente #${id}`;
    return `${p.first_name} ${p.last_name}`.trim();
  }

  function doctorName(id: number): string {
    const d = doctorMap.get(id);
    if (!d) return `Dr. #${id}`;
    return `Dr. ${d.last_name}`;
  }

  const inRoom = todays.filter((a) => a.status === "scheduled" || a.status === "confirmed").length;
  const unconfirmed = todays.filter((a) => a.status === "scheduled").length;
  const inConsult = todays.filter((a) => a.status === "in_progress").length;
  const attended = todays.filter((a) => a.status === "completed").length;

  const next = todays.find((a) => a.status === "scheduled" || a.status === "confirmed");
  const inConsultNext = todays.find((a) => a.status === "in_progress") ?? null;
  const headerSub = formatHeaderSub(today, doctors.length, todays.length);

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
    <MobileScreen
      tabBar={<IconTabBar tabs={secretaryTabs} active={0} />}
      header={<ScreenTopBar sub={headerSub} title="Recepción" />}
      floating={<FAB icon="plus" label="Agendar" onPress={() => goToScreen("sec-agenda-mob")} />}
      contentStyle={styles.content}
    >
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FadeIn>
        <DarkPanel radius={radii.lg} padding={18} blobSize={220} blobTop={-80} blobRight={-60}>
          <Text style={styles.heroEyebrow}>Próximo en la sala</Text>
          {next ? (
            <>
              <Text style={styles.heroName}>{patientName(next.patient_id)}</Text>
              <Text style={styles.heroMeta}>
                {formatApptTime(next.scheduled_at)} · {doctorName(next.doctor_id)} ·{" "}
                {next.status === "scheduled" ? `esperando ${waitMinutes(next.scheduled_at)} min` : stateLabel(next.status)}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.heroName}>Sin pacientes en sala</Text>
              <Text style={styles.heroMeta}>Aún no hay citas pendientes hoy</Text>
            </>
          )}
          <View style={styles.heroButtons}>
            <View style={styles.flex}>
              <Button
                label="Pasar al consultorio"
                variant="bright"
                height={36}
                disabled={!next}
                style={!next ? styles.btnDisabled : undefined}
                onPress={handlePassToConsult}
              />
            </View>
            <Tappable scaleTo={0.9} onPress={handleNotifyDoctor} disabled={!next}>
              <View style={[styles.phoneBtn, !next && styles.btnDisabled]}>
                <Icon kind="phone" size={14} color={colors.paper} />
              </View>
            </Tappable>
            <Tappable scaleTo={0.9} onPress={handleCompleteConsult} disabled={!inConsultNext}>
              <View style={[styles.phoneBtn, !inConsultNext && styles.btnDisabled]}>
                <Icon kind="check" size={14} color={colors.paper} />
              </View>
            </Tappable>
          </View>
        </DarkPanel>
      </FadeIn>
      {actionMessage ? <Text style={styles.actionText}>{actionMessage}</Text> : null}

      {doctors.length > 0 ? (
        <FadeIn delay={50}>
          <Tappable onPress={() => setQuickModal(true)} scaleTo={0.97} style={styles.urgBtn}>
            <View style={styles.urgIcon}>
              <Icon kind="alert" size={14} color={colors.alert} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.urgLabel}>Cita rápida</Text>
              <Text style={styles.urgSub}>Urgencia · agendar ahora</Text>
            </View>
            <Icon kind="chev" size={13} color={colors.ink3} />
          </Tappable>
        </FadeIn>
      ) : null}

      <FadeIn delay={70}>
        <View style={styles.statRow}>
          <StatTile label="En sala" value={String(inRoom)} sub={`${inConsult} en consulta`} />
          <StatTile
            label="Sin confirmar"
            value={String(unconfirmed)}
            sub="por confirmar"
            valueColor={colors.alert}
          />
          <StatTile label="Atendidas" value={String(attended)} sub="del día" />
        </View>
      </FadeIn>

      <FadeIn delay={120}>
        <Section title="Citas del día" action="Ver →">
          {todays.length === 0 && !loading ? (
            <Text style={styles.empty}>No hay citas programadas para hoy.</Text>
          ) : null}
          {todays.map((a) => {
            const label = stateLabel(a.status);
            const t = toneFor(a.status);
            const bg =
              t === "alert"
                ? colors.alertSoft
                : t === "ok"
                  ? colors.okSoft
                  : t === "accent"
                    ? colors.accentBright
                    : colors.paper3;
            const fg =
              t === "alert"
                ? colors.alert
                : t === "ok"
                  ? colors.ok
                  : t === "accent"
                    ? colors.ink
                    : colors.accentDeep;
            const wait = a.status === "scheduled" ? `${waitMinutes(a.scheduled_at)} min` : null;
            return (
              <View
                key={a.id}
                style={[
                  styles.row,
                  { backgroundColor: t === "accent" ? colors.paper3 : colors.white }
                ]}
              >
                <Text style={styles.time}>{formatApptTime(a.scheduled_at)}</Text>
                <View style={styles.flex}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{patientName(a.patient_id)}</Text>
                  </View>
                  <Text style={[styles.sub, wait ? { color: colors.alert } : null]}>
                    {doctorName(a.doctor_id)}
                    {wait ? ` · esperando ${wait}` : ""}
                  </Text>
                </View>
                <View style={[styles.stateTag, { backgroundColor: bg }]}>
                  <Text style={[styles.stateText, { color: fg }]}>{label}</Text>
                </View>
              </View>
            );
          })}
        </Section>
      </FadeIn>

      <FadeIn delay={170}>
        <Section title="Pendientes">
          <Text style={styles.empty}>Sin tareas de seguimiento por ahora.</Text>
        </Section>
      </FadeIn>

      {doctors.length > 0 ? (
        <QuickAppointmentModal
          visible={quickModal}
          doctorId={doctors[0].id}
          institutionId={doctors[0].institution_id ?? null}
          role="secretary"
          onClose={() => setQuickModal(false)}
          onCreated={() => {
            setQuickModal(false);
            goToScreen("sec-reception-mob");
          }}
        />
      ) : null}
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 120
  },
  flex: {
    flex: 1
  },
  loading: {
    paddingVertical: 8,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginBottom: 10
  },
  actionText: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 8
  },
  empty: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    paddingVertical: 12,
    textAlign: "center"
  },
  urgBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: radii.md,
    backgroundColor: colors.alertSoft,
    borderWidth: 1,
    borderColor: colors.alertRule
  },
  urgIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  urgLabel: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  urgSub: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.alert,
    marginTop: 1
  },
  heroEyebrow: {
    fontFamily: family.mono,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.6)"
  },
  heroName: {
    fontFamily: family.serifItalic,
    fontSize: 26,
    color: colors.paper,
    marginTop: 6
  },
  heroMeta: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: "rgba(255,255,255,0.65)",
    marginTop: 8
  },
  heroButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14
  },
  btnDisabled: {
    opacity: 0.45
  },
  phoneBtn: {
    width: 36,
    height: 36,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center"
  },
  statRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    marginBottom: 6
  },
  time: {
    width: 48,
    fontFamily: family.monoMedium,
    fontSize: 11.5,
    color: colors.ink2
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  name: {
    fontFamily: family.medium,
    fontSize: 12.5,
    color: colors.ink
  },
  sub: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 2
  },
  stateTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999
  },
  stateText: {
    fontFamily: family.mono,
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: "uppercase"
  }
});
