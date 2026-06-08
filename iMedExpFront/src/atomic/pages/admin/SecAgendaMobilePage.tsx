import { ReactNode, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Tappable } from "@/atomic/atoms/Tappable";
import { FAB } from "@/atomic/molecules/FAB";
import { IconTabBar } from "@/atomic/organisms/IconTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goToScreen } from "@/navigation/screenRouter";
import { secretaryTabs } from "@/navigation/tabConfigs";
import { Appointment, fetchAppointments, postAppointment } from "@/services/api/appointmentsApi";
import { Doctor } from "@/services/api/doctorsApi";
import { Patient, fetchPatientsList } from "@/services/api/patientsApi";
import { fetchInstitutionDoctors } from "@/services/api/secretaryApi";
import { silentOrEmpty } from "@/services/api/silent";
import { loadSession } from "@/state/sessionStore";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";
import { formatApptTime } from "@/utils/dates";

const DOCTOR_COLORS = [colors.accentDeep, colors.mid, colors.ok, colors.accent, colors.ink3];

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

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function HeaderBlock({
  weekDays,
  selectedIdx,
  doctorFilters,
  selectedDoctor,
  onSelectDay,
  onSelectDoctor
}: {
  weekDays: Date[];
  selectedIdx: number;
  doctorFilters: { name: string; color: string | null; id: number | null }[];
  selectedDoctor: number | null;
  onSelectDay: (i: number) => void;
  onSelectDoctor: (id: number | null) => void;
}): ReactNode {
  const labels = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
  const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const sel = weekDays[selectedIdx];
  const sub = `${labels[selectedIdx]} ${sel.getDate()} ${months[sel.getMonth()].slice(0, 3)} · sem.`;
  return (
    <>
      <ScreenTopBar sub={sub} title="Agenda" />
      <View style={styles.tools}>
        <View style={styles.weekRow}>
          {weekDays.map((d, i) => {
            const today = i === selectedIdx;
            return (
              <Tappable
                key={d.toISOString()}
                style={[
                  styles.weekDay,
                  {
                    backgroundColor: today ? colors.ink : colors.white,
                    borderColor: today ? colors.ink : colors.rule
                  }
                ]}
                onPress={() => onSelectDay(i)}
              >
                <Text
                  style={[
                    styles.weekDow,
                    { color: today ? "rgba(255,255,255,0.7)" : colors.ink3 }
                  ]}
                >
                  {labels[i]}
                </Text>
                <Text
                  style={[styles.weekNum, { color: today ? colors.paper : colors.ink }]}
                >
                  {d.getDate()}
                </Text>
              </Tappable>
            );
          })}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.docFilters}
        >
          {doctorFilters.map((f) => {
            const on = selectedDoctor === f.id;
            return (
              <Tappable
                key={f.name}
                style={[
                  styles.docChip,
                  {
                    backgroundColor: on ? colors.ink : colors.white,
                    borderColor: on ? colors.ink : colors.rule
                  }
                ]}
                onPress={() => onSelectDoctor(f.id)}
              >
                {f.color ? <View style={[styles.docDot, { backgroundColor: f.color }]} /> : null}
                <Text
                  style={[styles.docChipText, { color: on ? colors.paper : colors.ink2 }]}
                >
                  {f.name}
                </Text>
              </Tappable>
            );
          })}
        </ScrollView>
      </View>
    </>
  );
}

export function SecAgendaMobilePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const today = useMemo(() => new Date(), []);
  const [selectedIdx, setSelectedIdx] = useState<number>(() => {
    const wd = today.getDay();
    return wd === 0 ? 6 : wd - 1;
  });
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createPatientId, setCreatePatientId] = useState<number | null>(null);
  const [createDoctorId, setCreateDoctorId] = useState<number | null>(null);
  const [createHour, setCreateHour] = useState("10:00");
  const [createReason, setCreateReason] = useState("");
  const [creating, setCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [apptList, docList, patList] = await Promise.all([
          fetchAppointments({ limit: 100 }).catch(() => ({ items: [], total: 0, page: 1, limit: 100 })),
          silentOrEmpty(fetchInstitutionDoctors(), "SecAgendaMobilePage.fetchInstitutionDoctors"),
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

  const weekStart = useMemo(() => startOfWeek(today), [today]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const doctorColorMap = useMemo(() => {
    const m = new Map<number, string>();
    doctors.forEach((d, i) => m.set(d.id, DOCTOR_COLORS[i % DOCTOR_COLORS.length]));
    return m;
  }, [doctors]);

  const doctorMap = useMemo(() => {
    const m = new Map<number, Doctor>();
    doctors.forEach((d) => m.set(d.id, d));
    return m;
  }, [doctors]);

  const patientMap = useMemo(() => {
    const m = new Map<number, Patient>();
    patients.forEach((p) => m.set(p.id, p));
    return m;
  }, [patients]);

  const doctorFilters: { name: string; color: string | null; id: number | null }[] = [
    { name: "Todos", color: null, id: null },
    ...doctors.map((d) => ({ name: `Dr. ${d.last_name}`, color: doctorColorMap.get(d.id) ?? colors.ink, id: d.id }))
  ];

  const selDay = weekDays[selectedIdx];
  const dayAppts = appointments
    .filter((a) => isSameDay(new Date(a.scheduled_at), selDay))
    .filter((a) => selectedDoctor === null || a.doctor_id === selectedDoctor)
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  function patientLabel(id: number): string {
    const p = patientMap.get(id);
    if (!p) return `Paciente #${id}`;
    const fi = p.first_name?.[0] ?? "";
    return `${fi}. ${p.last_name}`.trim();
  }

  function doctorLabel(id: number): string {
    const d = doctorMap.get(id);
    if (!d) return `Dr. #${id}`;
    return d.last_name;
  }

  async function handleCreateAppointment() {
    const patientId = createPatientId ?? patients[0]?.id ?? null;
    const doctorId = createDoctorId ?? doctors[0]?.id ?? null;
    if (!patientId) {
      setCreateMessage("Primero vincula o crea un paciente.");
      return;
    }
    if (!doctorId) {
      setCreateMessage("No hay médicos disponibles.");
      return;
    }
    const [hh, mm] = createHour.split(":").map(Number);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) {
      setCreateMessage("La hora debe tener formato HH:MM.");
      return;
    }
    const scheduled = new Date(selDay.getFullYear(), selDay.getMonth(), selDay.getDate(), hh, mm, 0, 0);
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
      setShowCreate(false);
      setCreateReason("");
      setCreateMessage("Cita creada.");
    } catch (err) {
      setCreateMessage(err instanceof Error ? err.message : "No pudimos crear la cita.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <MobileScreen
      tabBar={<IconTabBar tabs={secretaryTabs} active={2} />}
      header={
        <HeaderBlock
          weekDays={weekDays}
          selectedIdx={selectedIdx}
          doctorFilters={doctorFilters}
          selectedDoctor={selectedDoctor}
          onSelectDay={setSelectedIdx}
          onSelectDoctor={setSelectedDoctor}
        />
      }
      floating={<FAB icon="plus" label="Nueva cita" onPress={() => setShowCreate((value) => !value)} />}
      contentStyle={styles.content}
    >
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.inlineActions}>
        <Button
          label={showCreate ? "Cerrar formulario" : "Crear nueva cita"}
          variant={showCreate ? "ghost" : "accent"}
          size="sm"
          block={false}
          height={38}
          onPress={() => setShowCreate((value) => !value)}
        />
      </View>

      {showCreate ? (
        <View style={styles.createCard}>
          <View style={styles.createHead}>
            <View style={styles.flex}>
              <Text style={styles.createTitle}>Nueva cita</Text>
              <Text style={styles.createSub}>Día seleccionado: {selDay.getDate()}</Text>
            </View>
            <Button label="Vincular" variant="ghost" size="sm" block={false} height={34} onPress={() => goToScreen("sec-link-mob")} />
          </View>
          <Text style={styles.createLabel}>Paciente</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>
            {patients.length === 0 ? <Text style={styles.createHint}>Sin pacientes vinculados.</Text> : null}
            {patients.slice(0, 10).map((p) => {
              const on = (createPatientId ?? patients[0]?.id) === p.id;
              return (
                <Tappable key={p.id} onPress={() => setCreatePatientId(p.id)} scaleTo={0.96}>
                  <View style={[styles.choicePill, on && styles.choicePillOn]}>
                    <Text style={[styles.choiceText, on && styles.choiceTextOn]}>{`${p.first_name} ${p.last_name}`.trim()}</Text>
                  </View>
                </Tappable>
              );
            })}
          </ScrollView>
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
          <Text style={styles.createLabel}>Hora</Text>
          <TextInput value={createHour} onChangeText={setCreateHour} placeholder="10:00" placeholderTextColor={colors.ink3} style={styles.input} />
          <Text style={styles.createLabel}>Motivo</Text>
          <TextInput
            value={createReason}
            onChangeText={setCreateReason}
            placeholder="Motivo de consulta"
            placeholderTextColor={colors.ink3}
            style={[styles.input, styles.reasonInput]}
            multiline
          />
          {createMessage ? <Text style={styles.createMessage}>{createMessage}</Text> : null}
          <View style={styles.createActions}>
            <Button label="Cancelar" variant="ghost" size="sm" block={false} height={36} onPress={() => setShowCreate(false)} />
            <Button label={creating ? "Guardando..." : "Crear cita"} variant="accent" size="sm" block={false} height={36} disabled={creating} onPress={handleCreateAppointment} />
          </View>
        </View>
      ) : null}

      <View style={styles.list}>
        {dayAppts.length === 0 && !loading ? (
          <Text style={styles.empty}>Sin citas para este día.</Text>
        ) : null}
        {dayAppts.map((a, index) => {
          const color = doctorColorMap.get(a.doctor_id) ?? colors.accentDeep;
          const bg =
            a.status === "scheduled"
              ? colors.alertSoft
              : a.status === "in_progress"
                ? colors.ink
                : a.status === "completed"
                  ? colors.okSoft
                  : colors.paper3;
          const fg =
            a.status === "scheduled"
              ? colors.alert
              : a.status === "in_progress"
                ? colors.paper
                : a.status === "completed"
                  ? colors.ok
                  : color;
          const border =
            a.status === "scheduled"
              ? colors.alertRule
              : a.status === "in_progress"
                ? colors.ink
                : a.status === "completed"
                  ? colors.okRule
                  : colors.accentRule;
          return (
            <FadeIn key={a.id} delay={index * 35}>
              <View style={[styles.appt, { backgroundColor: bg, borderColor: border }]}>
                <Text style={[styles.apptTime, { color: fg }]}>{formatApptTime(a.scheduled_at)}</Text>
                <View style={styles.apptBody}>
                  <View style={styles.apptNameRow}>
                    <Text style={[styles.apptName, { color: fg }]}>{patientLabel(a.patient_id)}</Text>
                  </View>
                  <Text style={[styles.apptDr, { color: fg }]}>Dr. {doctorLabel(a.doctor_id)}</Text>
                </View>
              </View>
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
    paddingTop: 14,
    paddingBottom: 120
  },
  flex: {
    flex: 1
  },
  tools: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.paper
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
  inlineActions: {
    alignItems: "flex-end",
    marginBottom: 12
  },
  createCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    padding: 14,
    marginBottom: 12
  },
  createHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10
  },
  createTitle: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  createSub: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 2
  },
  createLabel: {
    fontFamily: family.monoMedium,
    fontSize: 10.5,
    color: colors.ink2,
    marginTop: 10,
    marginBottom: 6
  },
  choiceRow: {
    gap: 6,
    paddingRight: 8
  },
  choicePill: {
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: colors.white
  },
  choicePillOn: {
    borderColor: colors.ink,
    backgroundColor: colors.ink
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
    minHeight: 66,
    textAlignVertical: "top"
  },
  createMessage: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 10
  },
  createActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12
  },
  empty: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    paddingVertical: 16,
    textAlign: "center"
  },
  weekRow: {
    flexDirection: "row",
    gap: 6
  },
  weekDay: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: "center"
  },
  weekDow: {
    fontFamily: family.mono,
    fontSize: 9,
    letterSpacing: 0.6,
    textTransform: "uppercase"
  },
  weekNum: {
    fontFamily: family.medium,
    fontSize: 16,
    marginTop: 2
  },
  docFilters: {
    gap: 6,
    paddingVertical: 10
  },
  docChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1
  },
  docDot: {
    width: 7,
    height: 7,
    borderRadius: 99
  },
  docChipText: {
    fontFamily: family.medium,
    fontSize: 11
  },
  list: {
    gap: 6
  },
  appt: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: radii.md,
    overflow: "hidden"
  },
  apptTime: {
    width: 60,
    fontFamily: family.monoMedium,
    fontSize: 12,
    paddingVertical: 12,
    textAlign: "center"
  },
  apptBody: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  apptNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  apptName: {
    fontFamily: family.medium,
    fontSize: 13
  },
  apptDr: {
    fontFamily: family.mono,
    fontSize: 10,
    marginTop: 2,
    opacity: 0.75
  }
});
