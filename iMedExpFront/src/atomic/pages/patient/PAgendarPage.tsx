import { ReactNode, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { Avatar } from "@/atomic/atoms/Avatar";
import { Button } from "@/atomic/atoms/Button";
import { Card } from "@/atomic/atoms/Card";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { SectionLabel } from "@/atomic/atoms/SectionLabel";
import { Tappable } from "@/atomic/atoms/Tappable";
import { PatientExtrasTabBar } from "@/atomic/organisms/PatientExtrasTabBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goBack } from "@/navigation/screenRouter";
import { fetchAppointments, postAppointment } from "@/services/api/appointmentsApi";
import { getCurrentPatientId } from "@/services/api/currentPatient";
import { Doctor, fetchAvailableDoctors } from "@/services/api/doctorsApi";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

const TYPES: [string, string][] = [
  ["Primera vez", "$ 1 200"],
  ["Seguimiento", "$ 800"],
  ["Urgencia", "$ 1 800"],
  ["Control", "$ 800"]
];

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

export function PAgendarPage() {
  const [type, setType] = useState(1);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorIndex, setDoctorIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reason, setReason] = useState("Control mensual.");

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
        const id = await getCurrentPatientId();
        if (!cancelled) {
          setPatientId(id);
        }
        const [doctorList, apptList] = await Promise.all([
          fetchAvailableDoctors({ page: 1, limit: 50 }),
          fetchAppointments({ patient_id: id, limit: 50 }).catch(() => ({ items: [], total: 0, page: 1, limit: 50 }))
        ]);
        const allDoctors = doctorList.items ?? [];
        const last = apptList.items?.sort(
          (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
        )[0];
        const preferred =
          (last && allDoctors.find((d) => d.id === last.doctor_id)) ?? allDoctors[0] ?? null;
        if (!cancelled) {
          setDoctors(allDoctors);
          setDoctor(preferred);
          if (preferred) {
            setDoctorIndex(Math.max(0, allDoctors.findIndex((d) => d.id === preferred.id)));
          }
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

  function cycleDoctor() {
    if (doctors.length === 0) {
      return;
    }
    const next = (doctorIndex + 1) % doctors.length;
    setDoctorIndex(next);
    setDoctor(doctors[next]);
  }

  async function handleConfirm() {
    if (!patientId || !doctor || submitting) {
      setSubmitError(!doctor ? "Selecciona un médico." : null);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const [hh, mm] = selectedHour.split(":").map(Number);
      const scheduled = new Date(month.year, month.month, selectedDay, hh, mm, 0, 0);
      if (scheduled.getTime() <= Date.now()) {
        throw new Error("Selecciona una fecha y hora futuras.");
      }
      const scheduled_at = `${scheduled.getFullYear()}-${pad(scheduled.getMonth() + 1)}-${pad(scheduled.getDate())}T${pad(hh)}:${pad(mm)}:00`;
      await postAppointment({
        patient_id: patientId,
        doctor_id: doctor.id,
        institution_id: doctor.institution_id ?? null,
        scheduled_at,
        reason: `${TYPES[type][0]} · ${reason}`.slice(0, 500)
      });
      goBack("pat-citas");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "No pudimos agendar la cita.");
    } finally {
      setSubmitting(false);
    }
  }

  function Header(): ReactNode {
    return (
      <View style={styles.header}>
        <Tappable onPress={() => goBack("pat-citas")} scaleTo={0.92}>
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

  const doctorInitials = doctor
    ? `${doctor.first_name?.[0] ?? ""}${doctor.last_name?.[0] ?? ""}`.toUpperCase()
    : "··";
  const doctorName = doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : "Sin médico";
  const doctorSubtitle = doctor
    ? `céd. ${doctor.general_license}${doctor.office_location ? ` · ${doctor.office_location}` : ""}`
    : "—";
  const noDoctors = !loading && doctors.length === 0;

  return (
    <MobileScreen
      tabBar={<PatientExtrasTabBar activeScreen="pat-citas" />}
      header={<Header />}
      contentStyle={styles.content}
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}

      {noDoctors ? (
        <FadeIn>
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No tienes médicos disponibles.</Text>
            <Text style={styles.emptySub}>Vincula una clínica para poder agendar.</Text>
          </View>
        </FadeIn>
      ) : null}

      {noDoctors ? null : (
        <>
      <FadeIn>
        <SectionLabel label="Tu médico" style={styles.firstLabel} />
        <Card radius={radii.md} style={styles.doctorCard}>
          <Avatar
            initials={doctorInitials}
            size={40}
            radius={11}
            bg={colors.accentBright}
            fg={colors.ink}
            serif
            fontSize={18}
          />
          <View style={styles.flex}>
            <Text style={styles.doctorName} numberOfLines={1}>{doctorName}</Text>
            <Text style={styles.doctorMeta} numberOfLines={1}>{doctorSubtitle}</Text>
          </View>
          {doctors.length > 1 ? (
            <Tappable onPress={cycleDoctor} scaleTo={0.95}>
              <Text style={styles.changeLink}>cambiar</Text>
            </Tappable>
          ) : null}
        </Card>
      </FadeIn>

      <FadeIn delay={70}>
        <SectionLabel label="Tipo de cita" style={styles.label} />
        <View style={styles.typeGrid}>
          {TYPES.map(([name, price], index) => {
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
                      styles.typePrice,
                      { color: on ? "rgba(255,255,255,0.6)" : colors.ink3 }
                    ]}
                  >
                    {price}
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
            placeholder="Escribe el motivo de tu consulta"
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
            return (
              <Tappable
                key={h}
                onPress={() => setSelectedHour(h)}
                scaleTo={0.95}
                style={styles.hourTap}
                disabled={isPastHour}
              >
                <View
                  style={[
                    styles.hourBtn,
                    {
                      backgroundColor: sel ? colors.ink : colors.white,
                      borderColor: sel ? colors.ink : colors.rule,
                      opacity: isPastHour ? 0.35 : 1
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.hourText,
                      { color: sel ? colors.paper : isPastHour ? colors.ink4 : colors.ink }
                    ]}
                  >
                    {h}
                  </Text>
                </View>
              </Tappable>
            );
          })}
        </View>
      </FadeIn>

      {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

      <FadeIn delay={240}>
        <Button
          label={submitting ? "Agendando…" : "Confirmar cita"}
          iconRight="check"
          height={48}
          style={styles.confirm}
          onPress={handleConfirm}
          disabled={submitting || !doctor}
        />
      </FadeIn>
        </>
      )}
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
  doctorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  doctorName: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink
  },
  doctorMeta: {
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
  typePrice: {
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
  confirm: {
    marginTop: 18
  }
});
