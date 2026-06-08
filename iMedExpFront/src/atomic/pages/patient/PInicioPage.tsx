import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/atomic/atoms/Avatar";
import { Button } from "@/atomic/atoms/Button";
import { Card } from "@/atomic/atoms/Card";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon, IconKind } from "@/atomic/atoms/Icon";
import { SectionLabel } from "@/atomic/atoms/SectionLabel";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DarkPanel } from "@/atomic/molecules/DarkPanel";
import { PatientTabBar } from "@/atomic/organisms/PatientTabBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goToScreen } from "@/navigation/screenRouter";
import { Appointment, fetchAppointments } from "@/services/api/appointmentsApi";
import { getCurrentPatientId } from "@/services/api/currentPatient";
import { PatientFull, fetchPatientFull } from "@/services/api/patientsApi";
import { VitalSign, fetchLatestPatientVitals } from "@/services/api/vitalsApi";
import { silentOrNull } from "@/services/api/silent";
import { isScreenBlocked, useBlockedScreens } from "@/state/blockedScreens";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";
import { formatApptDateTime } from "@/utils/dates";

type QuickItem = {
  icon: IconKind;
  title: string;
  sub: string;
  on: boolean;
  screen: string;
};

const QUICK: QuickItem[] = [
  { icon: "qr", title: "Compartir", sub: "QR para mi médico", on: true, screen: "pat-qr-mob" },
  { icon: "cal", title: "Mis citas", sub: "Ver y agendar", on: false, screen: "pat-citas" },
  { icon: "pill", title: "Medicamentos", sub: "Tomar a tiempo", on: false, screen: "pat-meds" },
  { icon: "folder", title: "Historial", sub: "Todo en uno", on: false, screen: "pat-hist" }
];

function initialsFromName(first: string, last: string): string {
  const a = first?.[0] ?? "";
  const b = last?.[0] ?? "";
  return (a + b).toUpperCase() || "?";
}

function formatToday(): string {
  const days = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const d = new Date();
  return `${days[d.getDay()]} · ${d.getDate()} ${months[d.getMonth()]}`;
}

function nextUpcoming(appointments: Appointment[]): Appointment | null {
  const now = Date.now();
  const upcoming = appointments
    .filter((a) => new Date(a.scheduled_at).getTime() > now && a.status !== "cancelled")
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  return upcoming[0] ?? null;
}

function statusLabelEs(status: string): string {
  const map: Record<string, string> = {
    scheduled: "Programada",
    confirmed: "Confirmada",
    in_progress: "En consulta",
    completed: "Atendida",
    cancelled: "Cancelada",
    no_show: "No asistió",
    pending: "Pendiente",
    PEND: "Pendiente"
  };
  return map[status] ?? status;
}

export function PInicioPage() {
  const [patient, setPatient] = useState<PatientFull | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [latestVitals, setLatestVitals] = useState<VitalSign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const today = useMemo(formatToday, []);
  useBlockedScreens();
  const agendarBlocked = isScreenBlocked("pat-agendar");
  const visibleQuick = QUICK.filter((item) => !isScreenBlocked(item.screen));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const patientId = await getCurrentPatientId();
        const [full, appts] = await Promise.all([
          silentOrNull(fetchPatientFull(patientId), "PInicioPage.fetchPatientFull"),
          fetchAppointments({ patient_id: patientId, limit: 100 }).catch(() => ({ items: [] }))
        ]);
        let vitals: VitalSign | null = null;
        try {
          vitals = await fetchLatestPatientVitals(patientId);
        } catch {
          vitals = null;
        }
        if (!cancelled) {
          setPatient(full);
          setAppointment(nextUpcoming(appts.items ?? []));
          setLatestVitals(vitals);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar tu información.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const firstName = patient?.first_name ?? "";
  const initials = patient ? initialsFromName(patient.first_name, patient.last_name) : "··";

  return (
    <MobileScreen
      tabBar={<PatientTabBar active={0} />}
      contentStyle={styles.content}
    >
      <FadeIn>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <SectionLabel label={today} />
            <Avatar initials={initials} size={32} radius={99} fontSize={12} />
          </View>
          <Text style={styles.hello}>
            Hola,{"\n"}
            <Text style={styles.helloAccent} numberOfLines={1} adjustsFontSizeToFit>{firstName || "—"}</Text>.
          </Text>
          <Text style={styles.tagline}>Tu salud · de un vistazo</Text>
        </View>
      </FadeIn>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.body}>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.accentDeep} />
          </View>
        ) : null}

        <FadeIn delay={130}>
          <DarkPanel
            radius={radii.xl}
            padding={20}
            blobSize={220}
            blobTop={-70}
            blobRight={-50}
            style={styles.nextCard}
          >
            <Text style={styles.nextEyebrow}>Próxima consulta</Text>
            {appointment ? (
              <>
                <Text style={styles.nextTitle}>{formatApptDateTime(appointment.scheduled_at)}</Text>
                <Text style={styles.nextMeta} numberOfLines={2}>
                  {appointment.reason ?? "consulta"} · {statusLabelEs(appointment.status)}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.nextTitle}>Aún no tienes{"\n"}una cita agendada.</Text>
                <Text style={styles.nextMeta} numberOfLines={2}>agenda tu próxima consulta cuando lo necesites</Text>
              </>
            )}
            {agendarBlocked ? (
              <Text style={styles.restrictedNote}>
                Agendar citas no está disponible en tu cuenta por ahora.
              </Text>
            ) : (
              <Button
                label="Agendar cita"
                variant="bright"
                block={false}
                height={38}
                iconLeft="plus"
                style={styles.nextBtn}
                onPress={() => goToScreen("pat-agendar")}
              />
            )}
          </DarkPanel>
        </FadeIn>

        <FadeIn delay={190}>
          <SectionLabel label="Acceso rápido" style={styles.sectionGap} />
          <View style={styles.quickGrid}>
            {visibleQuick.map((item) => (
              <View key={item.title} style={styles.quickCell}>
                <Tappable
                  scaleTo={0.96}
                  onPress={() => goToScreen(item.screen)}
                  style={[
                    styles.quickTile,
                    {
                      backgroundColor: item.on ? colors.paper3 : colors.white,
                      borderColor: item.on ? colors.accentRule : colors.rule
                    }
                  ]}
                >
                  <View
                    style={[
                      styles.quickIcon,
                      { backgroundColor: item.on ? colors.accentBright : colors.paper3 }
                    ]}
                  >
                    <Icon
                      kind={item.icon}
                      size={16}
                      color={item.on ? colors.ink : colors.accentDeep}
                    />
                  </View>
                  <Text style={styles.quickTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.quickSub} numberOfLines={1}>{item.sub}</Text>
                </Tappable>
              </View>
            ))}
          </View>
        </FadeIn>

        <FadeIn delay={250}>
          <SectionLabel label="Tu salud · en números" style={styles.sectionGap} />
          {latestVitals ? (
            <Card radius={radii.xl}>
              <VitalRow
                icon="heart"
                label="Frecuencia"
                value={latestVitals.heart_rate}
                unit="bpm"
                sub={latestVitals.heart_rate ? "lectura más reciente" : "sin datos"}
                first={false}
              />
              <VitalRow
                icon="drop"
                label="Presión"
                value={latestVitals.systolic_bp && latestVitals.diastolic_bp ? `${latestVitals.systolic_bp}/${latestVitals.diastolic_bp}` : null}
                unit="mmHg"
                sub={latestVitals.systolic_bp ? "sistólica · diastólica" : "sin datos"}
                first={false}
              />
              <VitalRow
                icon="scale"
                label="IMC"
                value={latestVitals.imc}
                unit=""
                sub={latestVitals.weight ? `${latestVitals.weight} kg` : "sin datos"}
                first={false}
              />
              <VitalRow
                icon="lung"
                label="Saturación"
                value={latestVitals.oxygen_saturation}
                unit="%"
                sub={latestVitals.oxygen_saturation ? "SpO₂" : "sin datos"}
                first
              />
            </Card>
          ) : (
            <Card radius={radii.xl}>
              <View style={styles.emptyVitals}>
                <Text style={styles.emptyText}>
                  Aún no se han registrado tus signos vitales.
                </Text>
              </View>
            </Card>
          )}
        </FadeIn>
      </View>
    </MobileScreen>
  );
}

type VitalRowProps = {
  icon: IconKind;
  label: string;
  value: number | string | null;
  unit: string;
  sub: string;
  first: boolean;
};

function VitalRow({ icon, label, value, unit, sub, first }: VitalRowProps) {
  return (
    <View style={[styles.vitalRow, first ? null : styles.vitalBorder]}>
      <View style={styles.vitalIcon}>
        <Icon kind={icon} size={15} color={colors.accentDeep} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.vitalLabel} numberOfLines={1}>{label}</Text>
        <Text style={styles.vitalSub} numberOfLines={1}>{sub}</Text>
      </View>
      <Text style={styles.vitalValue}>
        {value === null || value === undefined ? "—" : value}
        {value !== null && unit ? <Text style={styles.vitalUnit}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 120
  },
  flex: {
    flex: 1,
    minWidth: 0
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 8
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  hello: {
    fontFamily: family.serifItalic,
    fontSize: 36,
    lineHeight: 41,
    letterSpacing: -0.7,
    color: colors.ink,
    marginTop: 8
  },
  helloAccent: {
    color: colors.accentDeep
  },
  tagline: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    letterSpacing: 0.4,
    marginTop: 8
  },
  body: {
    paddingHorizontal: 22,
    paddingTop: 18
  },
  loading: {
    paddingVertical: 8,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    paddingHorizontal: 22,
    marginTop: 8
  },
  nextCard: {
    marginTop: 14
  },
  nextEyebrow: {
    fontFamily: family.mono,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.6)"
  },
  nextTitle: {
    fontFamily: family.serifItalic,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.5,
    color: colors.paper,
    marginTop: 6
  },
  nextMeta: {
    fontFamily: family.mono,
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginTop: 10
  },
  nextBtn: {
    marginTop: 14
  },
  restrictedNote: {
    fontFamily: family.mono,
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginTop: 14,
    lineHeight: 16
  },
  sectionGap: {
    marginTop: 20,
    marginBottom: 10
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  quickCell: {
    width: "48.5%"
  },
  quickTile: {
    width: "100%",
    minHeight: 92,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: 14,
    gap: 6
  },
  quickIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center"
  },
  quickTitle: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink,
    marginTop: 4
  },
  quickSub: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.ink3,
    letterSpacing: 0.4
  },
  vitalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13
  },
  vitalBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.rule3
  },
  vitalIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  vitalLabel: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  vitalSub: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 2
  },
  vitalValue: {
    fontFamily: family.medium,
    fontSize: 17,
    letterSpacing: -0.3,
    color: colors.ink
  },
  vitalUnit: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3
  },
  emptyVitals: {
    padding: 18
  },
  emptyText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    textAlign: "center"
  }
});
