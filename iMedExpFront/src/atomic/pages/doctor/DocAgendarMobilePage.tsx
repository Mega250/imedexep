import { ReactNode, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Avatar } from "@/atomic/atoms/Avatar";
import { Button } from "@/atomic/atoms/Button";
import { Card } from "@/atomic/atoms/Card";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { SectionLabel } from "@/atomic/atoms/SectionLabel";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DatePickerField } from "@/atomic/molecules/DatePickerField";
import { DoctorTabBar } from "@/atomic/organisms/DoctorTabBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goBack } from "@/navigation/screenRouter";
import { Appointment, fetchAppointments, postAppointment } from "@/services/api/appointmentsApi";
import { getCurrentDoctorId } from "@/services/api/currentDoctor";
import { Doctor, fetchDoctor } from "@/services/api/doctorsApi";
import { Patient, fetchPatientsList, createPatientAuthed } from "@/services/api/patientsApi";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";
import { validateCurp } from "@/utils/validators";

const TYPES: [string, string][] = [
  ["Primera vez", "Nuevo paciente"],
  ["Seguimiento", "Control"],
  ["Urgencia", "Prioritario"],
  ["Control", "Rutina"]
];

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
const HOURS = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "16:00", "16:30", "17:00"];

function buildCurrentMonthDays(): { offset: number; total: number; year: number; month: number } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const offset = (firstDay.getDay() + 6) % 7;
  return { offset, total: lastDay.getDate(), year, month };
}

type NewPatientDraft = {
  first_name: string;
  last_name: string;
  curp: string;
  date_of_birth: string;
  phone: string;
};

const EMPTY_DRAFT: NewPatientDraft = {
  first_name: "",
  last_name: "",
  curp: "",
  date_of_birth: "",
  phone: ""
};

export function DocAgendarMobilePage() {
  const [type, setType] = useState(1);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const [isNewPatient, setIsNewPatient] = useState(false);
  const [draft, setDraft] = useState<NewPatientDraft>(EMPTY_DRAFT);

  const month = useMemo(buildCurrentMonthDays, []);
  const today = new Date();
  const todayDay = today.getDate();
  const [selectedDay, setSelectedDay] = useState<number>(todayDay);
  const [selectedHour, setSelectedHour] = useState<string>(() => {
    const now = new Date();
    return (
      HOURS.find((h) => {
        const [hh, mm] = h.split(":").map(Number);
        return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm).getTime() > Date.now();
      }) ?? HOURS[HOURS.length - 1]
    );
  });

  useEffect(() => {
    if (selectedDay !== todayDay) return;
    const [hh, mm] = selectedHour.split(":").map(Number);
    const candidate = new Date(month.year, month.month, selectedDay, hh, mm, 0, 0);
    if (candidate.getTime() <= Date.now()) {
      const firstValid = HOURS.find((h) => {
        const [fh, fm] = h.split(":").map(Number);
        return new Date(month.year, month.month, selectedDay, fh, fm, 0, 0).getTime() > Date.now();
      });
      if (firstValid) setSelectedHour(firstValid);
    }
  }, [selectedDay]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const id = await getCurrentDoctorId();
        const [doc, patientsList, apptList] = await Promise.all([
          fetchDoctor(id),
          fetchPatientsList({ page: 1, limit: 100 }),
          fetchAppointments({ doctor_id: id, limit: 50 }).catch(() => ({ items: [], total: 0, page: 1, limit: 50 }))
        ]);
        if (!cancelled) {
          setDoctorId(id);
          setDoctor(doc);
          const allPatients = patientsList.items ?? [];
          setPatients(allPatients);
          const allAppts = apptList.items ?? [];
          setAppointments(allAppts);
          const last = allAppts.sort(
            (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
          )[0];
          const preferred =
            (last && allPatients.find((p) => p.id === last.patient_id)) ?? allPatients[0] ?? null;
          setSelectedPatient(preferred);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar el formulario.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const bookedHours = useMemo(() => {
    const set = new Set<string>();
    for (const a of appointments) {
      if (a.status === "cancelled" || a.status === "no_show") continue;
      const d = new Date(a.scheduled_at);
      if (d.getFullYear() === month.year && d.getMonth() === month.month && d.getDate() === selectedDay) {
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        set.add(`${hh}:${mm}`);
      }
    }
    return set;
  }, [appointments, selectedDay, month.year, month.month]);

  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patients;
    const q = patientSearch.toLowerCase();
    return patients.filter(
      (p) =>
        p.first_name.toLowerCase().includes(q) ||
        p.last_name.toLowerCase().includes(q)
    );
  }, [patients, patientSearch]);

  function toggleNewPatient() {
    setIsNewPatient((v) => !v);
    if (!isNewPatient) {
      setSelectedPatient(null);
      setPatientSearch("");
      setType(0);
    } else {
      setDraft(EMPTY_DRAFT);
      const first = patients[0] ?? null;
      setSelectedPatient(first);
    }
  }

  function updateDraft(field: keyof NewPatientDraft, value: string) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  function parseDob(value: string): string | null {
    const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;
    const [, dd, mm, yyyy] = match;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (d.getFullYear() !== Number(yyyy) || d.getMonth() !== Number(mm) - 1 || d.getDate() !== Number(dd)) return null;
    if (d >= new Date()) return null;
    return `${yyyy}-${mm}-${dd}`;
  }

  function validateDraft(): string | null {
    if (!draft.first_name.trim()) return "Ingresa el nombre del paciente.";
    if (!draft.last_name.trim()) return "Ingresa el apellido del paciente.";
    const curpError = validateCurp(draft.curp);
    if (curpError) return curpError;
    if (!draft.date_of_birth.trim()) return "Ingresa la fecha de nacimiento (dd/mm/aaaa).";
    if (!parseDob(draft.date_of_birth)) return "Fecha de nacimiento inválida. Usa dd/mm/aaaa.";
    return null;
  }

  async function handleConfirm() {
    if (!doctorId || submitting) return;

    if (!isNewPatient && !selectedPatient) {
      setSubmitError("Selecciona un paciente.");
      return;
    }

    if (isNewPatient) {
      const draftError = validateDraft();
      if (draftError) {
        setSubmitError(draftError);
        return;
      }
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const [hh, mm] = selectedHour.split(":").map(Number);
      const scheduled = new Date(month.year, month.month, selectedDay, hh, mm, 0, 0);
      if (scheduled.getTime() <= Date.now()) {
        throw new Error("Selecciona una fecha y hora futuras.");
      }

      let patientId: number;
      if (isNewPatient) {
        const dobIso = parseDob(draft.date_of_birth);
        if (!dobIso) throw new Error("Fecha de nacimiento inválida.");
        const created = await createPatientAuthed({
          curp: draft.curp.trim().toUpperCase(),
          first_name: draft.first_name.trim(),
          last_name: draft.last_name.trim(),
          date_of_birth: dobIso,
          phone: draft.phone.trim() || undefined
        });
        patientId = created.id;
      } else {
        patientId = selectedPatient!.id;
      }

      const scheduled_at = scheduled.toISOString();
      await postAppointment({
        patient_id: patientId,
        doctor_id: doctorId,
        institution_id: doctor?.institution_id ?? null,
        scheduled_at,
        reason: `${TYPES[type][0]} · ${reason || "Consulta"}`.slice(0, 500)
      });
      goBack("dash-mob");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "No pudimos agendar la cita.");
    } finally {
      setSubmitting(false);
    }
  }

  function Header(): ReactNode {
    return (
      <View style={styles.header}>
        <Tappable onPress={() => goBack("dash-mob")} scaleTo={0.92}>
          <View style={styles.backBtn}>
            <Icon kind="chev-l" size={13} color={colors.ink2} />
          </View>
        </Tappable>
        <View>
          <Text style={styles.headerEyebrow}>Nueva cita</Text>
          <Text style={styles.headerTitle}>Agendar cita</Text>
        </View>
      </View>
    );
  }

  const canConfirm = isNewPatient
    ? draft.first_name.trim() && draft.last_name.trim() && !validateCurp(draft.curp) && !!parseDob(draft.date_of_birth)
    : !!selectedPatient;

  const patientInitials = selectedPatient
    ? `${selectedPatient.first_name?.[0] ?? ""}${selectedPatient.last_name?.[0] ?? ""}`.toUpperCase()
    : "··";
  const patientFullName = selectedPatient
    ? `${selectedPatient.first_name} ${selectedPatient.last_name}`.trim()
    : "Sin paciente";

  return (
    <MobileScreen
      tabBar={<DoctorTabBar active={-1} />}
      header={<Header />}
      contentStyle={styles.content}
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}

      {!loading ? (
        <>
          <FadeIn>
            <SectionLabel label="Paciente" style={styles.firstLabel} />
            <View style={styles.modeRow}>
              <Tappable
                onPress={() => isNewPatient && toggleNewPatient()}
                scaleTo={0.96}
                style={[styles.modeTab, !isNewPatient && styles.modeTabOn]}
              >
                <Icon kind="users" size={13} color={!isNewPatient ? colors.paper : colors.ink3} />
                <Text style={[styles.modeText, !isNewPatient && styles.modeTextOn]}>Registrado</Text>
              </Tappable>
              <Tappable
                onPress={() => !isNewPatient && toggleNewPatient()}
                scaleTo={0.96}
                style={[styles.modeTab, isNewPatient && styles.modeTabOn]}
              >
                <Icon kind="plus" size={13} color={isNewPatient ? colors.paper : colors.ink3} />
                <Text style={[styles.modeText, isNewPatient && styles.modeTextOn]}>No registrado</Text>
              </Tappable>
            </View>
          </FadeIn>

          {!isNewPatient ? (
            <>
              {patients.length === 0 ? (
                <FadeIn>
                  <View style={styles.empty}>
                    <Text style={styles.emptyTitle}>No tienes pacientes vinculados.</Text>
                    <Text style={styles.emptySub}>
                      Usa la opción "No registrado" para agendar un paciente nuevo.
                    </Text>
                  </View>
                </FadeIn>
              ) : (
                <>
                  <FadeIn>
                    <Card radius={radii.md} style={styles.patientCard}>
                      <Avatar
                        initials={patientInitials}
                        size={40}
                        radius={11}
                        bg={colors.accentBright}
                        fg={colors.ink}
                        serif
                        fontSize={18}
                      />
                      <View style={styles.flex}>
                        <Text style={styles.patientName} numberOfLines={1}>{patientFullName}</Text>
                        {selectedPatient ? (
                          <Text style={styles.patientMeta} numberOfLines={1}>
                            {selectedPatient.gender ?? "—"} · {selectedPatient.date_of_birth ?? "—"}
                          </Text>
                        ) : null}
                      </View>
                      {patients.length > 1 ? (
                        <Tappable
                          onPress={() => setPatientSearch(patientSearch ? "" : " ")}
                          scaleTo={0.95}
                        >
                          <Text style={styles.changeLink}>cambiar</Text>
                        </Tappable>
                      ) : null}
                    </Card>
                  </FadeIn>

                  {patientSearch !== "" ? (
                    <FadeIn>
                      <View style={styles.searchBox}>
                        <Icon kind="search" size={14} color={colors.ink3} />
                        <TextInput
                          value={patientSearch.trim() ? patientSearch : ""}
                          onChangeText={setPatientSearch}
                          placeholder="Buscar paciente…"
                          placeholderTextColor={colors.ink3}
                          style={styles.searchInput}
                          autoFocus
                        />
                      </View>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.patientPills}
                      >
                        {filteredPatients.slice(0, 20).map((p) => {
                          const on = selectedPatient?.id === p.id;
                          return (
                            <Tappable
                              key={p.id}
                              onPress={() => {
                                setSelectedPatient(p);
                                setPatientSearch("");
                              }}
                              scaleTo={0.96}
                            >
                              <View style={[styles.pill, on && styles.pillOn]}>
                                <Text style={[styles.pillText, on && styles.pillTextOn]}>
                                  {`${p.first_name} ${p.last_name}`.trim()}
                                </Text>
                              </View>
                            </Tappable>
                          );
                        })}
                        {filteredPatients.length === 0 ? (
                          <Text style={styles.noResults}>Sin resultados</Text>
                        ) : null}
                      </ScrollView>
                    </FadeIn>
                  ) : null}
                </>
              )}
            </>
          ) : (
            <FadeIn>
              <Card radius={radii.md} style={styles.newPatientCard}>
                <View style={styles.newPatientHeader}>
                  <Icon kind="user" size={16} color={colors.accentDeep} />
                  <Text style={styles.newPatientTitle}>Datos del paciente nuevo</Text>
                </View>
                <View style={styles.fieldRow}>
                  <View style={styles.fieldHalf}>
                    <Text style={styles.fieldLabel}>Nombre *</Text>
                    <TextInput
                      value={draft.first_name}
                      onChangeText={(v) => updateDraft("first_name", v)}
                      placeholder="Nombre(s)"
                      placeholderTextColor={colors.ink3}
                      style={styles.fieldInput}
                    />
                  </View>
                  <View style={styles.fieldHalf}>
                    <Text style={styles.fieldLabel}>Apellido *</Text>
                    <TextInput
                      value={draft.last_name}
                      onChangeText={(v) => updateDraft("last_name", v)}
                      placeholder="Apellido(s)"
                      placeholderTextColor={colors.ink3}
                      style={styles.fieldInput}
                    />
                  </View>
                </View>
                <Text style={styles.fieldLabel}>CURP *</Text>
                <TextInput
                  value={draft.curp}
                  onChangeText={(v) => updateDraft("curp", v.toUpperCase())}
                  placeholder="18 caracteres"
                  placeholderTextColor={colors.ink3}
                  maxLength={18}
                  autoCapitalize="characters"
                  style={[
                    styles.fieldInput,
                    draft.curp.trim().length > 0 && validateCurp(draft.curp)
                      ? { borderColor: colors.alert }
                      : draft.curp.trim().length === 18 && !validateCurp(draft.curp)
                        ? { borderColor: colors.ok }
                        : null
                  ]}
                />
                {draft.curp.trim().length > 0 && validateCurp(draft.curp) ? (
                  <Text style={styles.curpError}>{validateCurp(draft.curp)}</Text>
                ) : null}
                <View style={styles.fieldRow}>
                  <DatePickerField
                    label="Nacimiento *"
                    placeholder="dd/mm/aaaa"
                    value={draft.date_of_birth}
                    onChange={(v) => updateDraft("date_of_birth", v)}
                    style={styles.fieldHalf}
                    valid={!!draft.date_of_birth.trim() && !!parseDob(draft.date_of_birth)}
                    errorText={draft.date_of_birth.trim() && !parseDob(draft.date_of_birth) ? "Fecha inválida" : null}
                  />
                  <View style={styles.fieldHalf}>
                    <Text style={styles.fieldLabel}>Teléfono</Text>
                    <TextInput
                      value={draft.phone}
                      onChangeText={(v) => updateDraft("phone", v)}
                      placeholder="Opcional"
                      placeholderTextColor={colors.ink3}
                      keyboardType="phone-pad"
                      style={styles.fieldInput}
                    />
                  </View>
                </View>
                <Text style={styles.fieldHint}>
                  Se creará un registro básico del paciente. Podrá completar su perfil después.
                </Text>
              </Card>
            </FadeIn>
          )}

          <FadeIn delay={70}>
            <SectionLabel label="Tipo de cita" style={styles.label} />
            <View style={styles.typeGrid}>
              {TYPES.map(([name, sub], index) => {
                const on = index === type;
                return (
                  <View key={name} style={styles.typeCell}>
                    <Tappable
                      scaleTo={0.97}
                      onPress={() => setType(index)}
                      style={[
                        styles.typeBtn,
                        {
                          backgroundColor: on ? colors.ink : colors.white,
                          borderColor: on ? colors.ink : colors.rule
                        }
                      ]}
                    >
                      <Text style={[styles.typeName, { color: on ? colors.paper : colors.ink }]}>
                        {name}
                      </Text>
                      <Text
                        style={[
                          styles.typeSub,
                          { color: on ? "rgba(255,255,255,0.6)" : colors.ink3 }
                        ]}
                      >
                        {sub}
                      </Text>
                    </Tappable>
                  </View>
                );
              })}
            </View>
          </FadeIn>

          <FadeIn delay={120}>
            <SectionLabel label="Motivo de consulta" style={styles.label} />
            <View style={styles.reasonBox}>
              <TextInput
                value={reason}
                onChangeText={setReason}
                placeholder="Escribe el motivo de la consulta"
                placeholderTextColor={colors.ink3}
                multiline
                maxLength={450}
                style={styles.reasonText}
                textAlignVertical="top"
              />
            </View>
          </FadeIn>

          <FadeIn delay={160}>
            <SectionLabel label="Fecha · mes en curso" style={styles.label} />
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
                  const isSel = d === selectedDay;
                  const past = d < todayDay;
                  return (
                    <View key={d} style={styles.calCell}>
                      <Tappable
                        onPress={() => !past && setSelectedDay(d)}
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
          </FadeIn>

          <FadeIn delay={200}>
            <SectionLabel label={`Hora · día ${selectedDay}`} style={styles.label} />
            <View style={styles.hourGrid}>
              {HOURS.map((h) => {
                const sel = h === selectedHour;
                const isPastHour =
                  selectedDay === todayDay &&
                  (() => {
                    const [hh, mm] = h.split(":").map(Number);
                    return (
                      new Date(month.year, month.month, selectedDay, hh, mm, 0, 0).getTime() <=
                      Date.now()
                    );
                  })();
                const isBooked = bookedHours.has(h);
                const disabled = isPastHour || isBooked;
                return (
                  <Tappable
                    key={h}
                    onPress={() => setSelectedHour(h)}
                    scaleTo={0.95}
                    style={styles.hourTap}
                    disabled={disabled}
                  >
                    <View
                      style={[
                        styles.hourBtn,
                        {
                          backgroundColor: sel ? colors.ink : isBooked ? colors.paper2 : colors.white,
                          borderColor: sel ? colors.ink : isBooked ? colors.rule2 : colors.rule,
                          opacity: isPastHour ? 0.35 : 1
                        }
                      ]}
                    >
                      <Text
                        style={[
                          styles.hourText,
                          { color: sel ? colors.paper : disabled ? colors.ink4 : colors.ink }
                        ]}
                      >
                        {h}
                      </Text>
                      {isBooked ? <Text style={styles.bookedLabel}>ocupado</Text> : null}
                    </View>
                  </Tappable>
                );
              })}
            </View>
          </FadeIn>

          {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

          <FadeIn delay={240}>
            <Button
              label={submitting ? (isNewPatient ? "Creando paciente y cita…" : "Agendando…") : "Confirmar cita"}
              iconRight="check"
              height={48}
              style={styles.confirm}
              onPress={handleConfirm}
              disabled={submitting || !canConfirm}
            />
          </FadeIn>
        </>
      ) : null}
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
  submitError: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginTop: 10
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2,
    backgroundColor: colors.paper
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  headerEyebrow: {
    ...text.eyebrow,
    color: colors.ink3
  },
  headerTitle: {
    fontFamily: family.serifItalic,
    fontSize: 22,
    letterSpacing: -0.4,
    color: colors.ink,
    marginTop: 2
  },
  firstLabel: {
    marginBottom: 8
  },
  label: {
    marginTop: 18,
    marginBottom: 8
  },
  modeRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 10
  },
  modeTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    backgroundColor: colors.white
  },
  modeTabOn: {
    borderColor: colors.ink,
    backgroundColor: colors.ink
  },
  modeText: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.ink2
  },
  modeTextOn: {
    color: colors.paper
  },
  patientCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  patientName: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink
  },
  patientMeta: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 1
  },
  changeLink: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.accentDeep
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    backgroundColor: colors.white
  },
  searchInput: {
    flex: 1,
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.ink,
    padding: 0
  },
  patientPills: {
    gap: 6,
    paddingVertical: 10,
    paddingRight: 8
  },
  pill: {
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: colors.white
  },
  pillOn: {
    borderColor: colors.ink,
    backgroundColor: colors.ink
  },
  pillText: {
    fontFamily: family.medium,
    fontSize: 11.5,
    color: colors.ink2
  },
  pillTextOn: {
    color: colors.paper
  },
  noResults: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    paddingVertical: 8
  },
  newPatientCard: {
    padding: 16,
    gap: 2
  },
  newPatientHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12
  },
  newPatientTitle: {
    fontFamily: family.medium,
    fontSize: 14,
    color: colors.ink
  },
  fieldRow: {
    flexDirection: "row",
    gap: 8
  },
  fieldHalf: {
    flex: 1
  },
  fieldLabel: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 4
  },
  fieldInput: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink,
    backgroundColor: colors.paper
  },
  curpError: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.alert,
    marginTop: 3
  },
  fieldHint: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 10,
    lineHeight: 15
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  typeCell: {
    width: "48.7%"
  },
  typeBtn: {
    width: "100%",
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 12
  },
  typeName: {
    fontFamily: family.medium,
    fontSize: 13
  },
  typeSub: {
    fontFamily: family.mono,
    fontSize: 10,
    marginTop: 3
  },
  reasonBox: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 70
  },
  reasonText: {
    fontFamily: family.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.ink2,
    minHeight: 44,
    padding: 0
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
  },
  bookedLabel: {
    fontFamily: family.mono,
    fontSize: 7.5,
    color: colors.ink4,
    letterSpacing: 0.3,
    marginTop: 1
  },
  confirm: {
    marginTop: 18
  }
});
