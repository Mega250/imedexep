import { ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { Card } from "@/atomic/atoms/Card";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon, IconKind } from "@/atomic/atoms/Icon";
import { Logo } from "@/atomic/atoms/Logo";
import { RoundIconButton } from "@/atomic/atoms/RoundIconButton";
import { SectionLabel } from "@/atomic/atoms/SectionLabel";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DarkPanel } from "@/atomic/molecules/DarkPanel";
import { FAB } from "@/atomic/molecules/FAB";
import { QuickAppointmentModal } from "@/atomic/molecules/QuickAppointmentModal";
import { DoctorTabBar } from "@/atomic/organisms/DoctorTabBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goToScreen } from "@/navigation/screenRouter";
import { Appointment, fetchAppointments } from "@/services/api/appointmentsApi";
import { setSelectedPatientId } from "@/services/api/selectedPatient";
import { setSelectedAppointmentId } from "@/services/api/selectedAppointment";
import { fetchPatientsList, Patient } from "@/services/api/patientsApi";
import { fetchConsultations } from "@/services/api/consultationsApi";
import { Doctor, fetchDoctor } from "@/services/api/doctorsApi";
import { getCurrentDoctorId } from "@/services/api/currentDoctor";
import { silentOrNull } from "@/services/api/silent";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";
import { formatApptTime } from "@/utils/dates";
import { statusLabel } from "@/utils/status";

const MORE_ACTIONS: { icon: IconKind; label: string; sub: string; screen: string }[] = [
  { icon: "inbox", label: "Invitaciones", sub: "Clínica y accesos", screen: "doc-invites-mob" },
  { icon: "cal", label: "Turnos", sub: "Disponibilidad", screen: "doc-shifts-mob" },
  { icon: "qr", label: "Escanear QR", sub: "Abrir expediente", screen: "doc-qr-mob" },
  { icon: "user", label: "Perfil", sub: "Cuenta médica", screen: "mob-profile" }
];

function Header({
  menuOpen,
  onToggleMenu,
  onCloseMenu
}: {
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
}): ReactNode {
  return (
    <View style={styles.headerWrap}>
      <View style={styles.topbar}>
        <RoundIconButton
          icon="menu"
          variant="ghost"
          onPress={onToggleMenu}
          accessibilityLabel={menuOpen ? "Cerrar menú" : "Abrir menú"}
          accessibilityExpanded={menuOpen}
        />
        <Logo height={14} />
        <View>
          <RoundIconButton
            icon="bell"
            variant="ghost"
            onPress={() => goToScreen("doc-invites-mob")}
            accessibilityLabel="Ver invitaciones"
          />
        </View>
      </View>
      {menuOpen ? (
        <View style={styles.moreMenu}>
          {MORE_ACTIONS.map((item) => (
            <Tappable
              key={item.screen}
              scaleTo={0.97}
              onPress={() => {
                onCloseMenu();
                goToScreen(item.screen);
              }}
              style={styles.moreItem}
            >
              <View style={styles.moreIcon}>
                <Icon kind={item.icon} size={15} color={colors.accentDeep} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.moreLabel}>{item.label}</Text>
                <Text style={styles.moreSub}>{item.sub}</Text>
              </View>
              <Icon kind="chev" size={13} color={colors.ink3} />
            </Tappable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function formatToday(): string {
  const days = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${days[d.getDay()]} · ${d.getDate()} ${months[d.getMonth()]} · ${hh}:${mm}`;
}

function greetingForHour(): string {
  const h = new Date().getHours();
  if (h < 12) {
    return "Buenos días";
  }
  if (h < 19) {
    return "Buenas tardes";
  }
  return "Buenas noches";
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function minutesUntil(iso: string): number {
  return Math.round((new Date(iso).getTime() - Date.now()) / 60000);
}

function patientNameById(list: Patient[], id: number): string {
  const p = list.find((x) => x.id === id);
  return p ? `${p.first_name} ${p.last_name}` : `Paciente #${id}`;
}

export function DashboardMobilePage() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [todayAppts, setTodayAppts] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientsTotal, setPatientsTotal] = useState<number>(0);
  const [consultationsToday, setConsultationsToday] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [quickModal, setQuickModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const doctorId = await getCurrentDoctorId();
        const [doc, appts, patientsList, todayConsultas] = await Promise.all([
          silentOrNull(fetchDoctor(doctorId), "DashboardMobilePage.fetchDoctor"),
          fetchAppointments({ doctor_id: doctorId, limit: 100 }).catch(() => ({ items: [], total: 0, page: 1, limit: 100 })),
          fetchPatientsList({ page: 1, limit: 100 }).catch(() => ({ items: [], total: 0, page: 1, limit: 100 })),
          fetchConsultations({ doctor_id: doctorId, page: 1, limit: 100 }).catch(() => ({ items: [], total: 0, page: 1, limit: 100 }))
        ]);
        const today = (appts.items ?? [])
          .filter((a) => isToday(a.scheduled_at))
          .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
        const consultasHoy = (todayConsultas.items ?? []).filter((c) => isToday(c.created_at)).length;
        if (!cancelled) {
          setDoctor(doc);
          setTodayAppts(today);
          setPatients(patientsList.items ?? []);
          setPatientsTotal(patientsList.total ?? 0);
          setConsultationsToday(consultasHoy);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar el panel.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const now = Date.now();
  const upcoming = todayAppts.filter((a) => new Date(a.scheduled_at).getTime() >= now);
  const done = todayAppts.length - upcoming.length;
  const next = upcoming[0] ?? null;
  const nextName = next ? patientNameById(patients, next.patient_id) : "";
  const minsLabel = next ? Math.max(minutesUntil(next.scheduled_at), 0) : 0;

  const STATS: [string, string][] = [
    [`${done}/${todayAppts.length}`, "citas hoy"],
    [String(patientsTotal), "pacientes"],
    [String(upcoming.length), "pendientes"]
  ];

  const agendaList = upcoming.slice(0, 5);
  const greetingName = doctor ? `Dr. ${doctor.last_name}` : "";

  return (
    <MobileScreen
      tabBar={<DoctorTabBar active={0} />}
      header={
        <Header
          menuOpen={menuOpen}
          onToggleMenu={() => setMenuOpen((v) => !v)}
          onCloseMenu={() => setMenuOpen(false)}
        />
      }
      floating={<FAB icon="cal" label="Agendar cita" onPress={() => goToScreen("doc-agendar-mob")} />}
      contentStyle={styles.content}
    >
      <FadeIn>
        <Text style={styles.eyebrow}>{formatToday()}</Text>
        <Text style={styles.greeting}>
          {greetingForHour()}, <Text style={styles.greetingAccent}>{greetingName || "—"}</Text>.
        </Text>
        <View style={styles.search}>
          <Icon kind="search" size={15} color={colors.ink3} />
          <Text style={styles.searchText}>Buscar paciente, diagnóstico…</Text>
        </View>
      </FadeIn>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}

      <FadeIn delay={90}>
        <DarkPanel
          radius={radii.xl}
          padding={18}
          blobSize={300}
          blobTop={-110}
          blobRight={-80}
          blobColor="rgba(0,180,216,0.22)"
          style={styles.hero}
        >
          {next ? (
            <>
              <View style={styles.heroTop}>
                <Text style={styles.heroKicker}>
                  PRÓXIMA CITA · EN {minsLabel} MIN
                </Text>
                <View style={styles.timeTag}>
                  <Text style={styles.timeTagText}>{formatApptTime(next.scheduled_at)}</Text>
                </View>
              </View>
              <Text style={styles.heroName} numberOfLines={1} ellipsizeMode="tail">{nextName}</Text>
              <Text style={styles.heroMeta} numberOfLines={1} ellipsizeMode="tail">
                {next.reason ?? "consulta"} · estado {statusLabel(next.status)}
              </Text>
              <View style={styles.heroButtons}>
                <View style={styles.flex}>
                  <Button
                    label="Abrir expediente  →"
                    variant="bright"
                    height={40}
                    onPress={() => {
                      setSelectedPatientId(next.patient_id).catch(() => {});
                      setSelectedAppointmentId(next.id).catch(() => {});
                      goToScreen("active-mob");
                    }}
                  />
                </View>
                <Tappable scaleTo={0.9}>
                  <View style={styles.phoneBtn}>
                    <Icon kind="phone" size={15} color={colors.paper} />
                  </View>
                </Tappable>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.heroKicker}>SIN PRÓXIMA CITA</Text>
              <Text style={styles.heroName}>Sin agenda hoy</Text>
              <Text style={styles.heroMeta}>no tienes próximas citas en la jornada</Text>
            </>
          )}
        </DarkPanel>
      </FadeIn>

      <FadeIn delay={130}>
        <Tappable
          onPress={() => setQuickModal(true)}
          scaleTo={0.97}
          style={styles.urgBtn}
        >
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

      <FadeIn delay={150}>
        <View style={styles.statRow}>
          {STATS.map(([n, l]) => (
            <Card key={l} radius={radii.md} style={styles.statCard}>
              <Text style={styles.statNum}>{n}</Text>
              <Text style={styles.statLabel}>{l}</Text>
            </Card>
          ))}
        </View>
      </FadeIn>

      <FadeIn delay={210}>
        <View style={styles.agendaHead}>
          <SectionLabel label={`Agenda · ${consultationsToday} consultas hoy`} />
          <Tappable onPress={() => goToScreen("mob-agenda")} hitSlop={8} scaleTo={0.95}>
            <Text style={styles.seeAll}>ver todo →</Text>
          </Tappable>
        </View>
        <View style={styles.agendaList}>
          {agendaList.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Sin citas próximas hoy.</Text>
            </View>
          ) : (
            agendaList.map((a) => (
              <Tappable
                key={a.id}
                scaleTo={0.99}
                onPress={() => {
                  setSelectedPatientId(a.patient_id).catch(() => {});
                  setSelectedAppointmentId(a.id).catch(() => {});
                  goToScreen("active-mob");
                }}
                style={styles.agendaRow}
              >
                <Text style={styles.agendaTime}>{formatApptTime(a.scheduled_at)}</Text>
                <View style={styles.flex}>
                  <Text style={styles.agendaName} numberOfLines={1} ellipsizeMode="tail">{patientNameById(patients, a.patient_id)}</Text>
                  <Text style={styles.agendaTag} numberOfLines={1} ellipsizeMode="tail">{a.reason ?? statusLabel(a.status)}</Text>
                </View>
                <Icon kind="chev" size={13} color={colors.ink3} />
              </Tappable>
            ))
          )}
        </View>
      </FadeIn>

      {doctor ? (
        <QuickAppointmentModal
          visible={quickModal}
          doctorId={doctor.id}
          institutionId={doctor.institution_id ?? null}
          role="doctor"
          onClose={() => setQuickModal(false)}
          onCreated={() => {
            setQuickModal(false);
            goToScreen("dash-mob");
          }}
          onStartConsultation={async (patientId, appointmentId) => {
            await setSelectedPatientId(patientId);
            await setSelectedAppointmentId(appointmentId);
            goToScreen("active-mob");
          }}
          onViewAgenda={() => goToScreen("mob-agenda")}
        />
      ) : null}
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 120
  },
  flex: {
    flex: 1,
    minWidth: 0
  },
  headerWrap: {
    backgroundColor: colors.paper
  },
  topbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 12,
    backgroundColor: colors.paper
  },
  moreMenu: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    overflow: "hidden"
  },
  moreItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule3
  },
  moreIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  moreLabel: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  moreSub: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 2
  },
  eyebrow: {
    ...text.eyebrow,
    color: colors.ink3
  },
  greeting: {
    fontFamily: family.medium,
    fontSize: 28,
    letterSpacing: -0.7,
    lineHeight: 32,
    color: colors.ink,
    marginTop: 4
  },
  greetingAccent: {
    fontFamily: family.serifItalic,
    color: colors.accentDeep
  },
  search: {
    marginTop: 14,
    height: 42,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white,
    borderRadius: radii.md
  },
  searchText: {
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.ink3
  },
  loading: {
    paddingVertical: 12,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginTop: 8
  },
  hero: {
    marginTop: 14
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline"
  },
  heroKicker: {
    fontFamily: family.mono,
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1.1
  },
  timeTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)"
  },
  timeTagText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 0.5
  },
  heroName: {
    fontFamily: family.serifItalic,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.5,
    color: colors.paper,
    marginTop: 6
  },
  heroMeta: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4
  },
  heroButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14
  },
  phoneBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center"
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
  statRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14
  },
  statCard: {
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  statNum: {
    fontFamily: family.medium,
    fontSize: 18,
    letterSpacing: -0.4,
    color: colors.ink
  },
  statLabel: {
    fontFamily: family.mono,
    fontSize: 9,
    color: colors.ink3,
    letterSpacing: 0.5,
    marginTop: 2
  },
  agendaHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 18,
    marginBottom: 8
  },
  seeAll: {
    fontFamily: family.regular,
    fontSize: 11,
    color: colors.ink3
  },
  agendaList: {
    gap: 6
  },
  agendaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule2
  },
  agendaTime: {
    width: 42,
    fontFamily: family.mono,
    fontSize: 11.5,
    color: colors.ink2
  },
  agendaName: {
    fontFamily: family.medium,
    fontSize: 12.5,
    color: colors.ink
  },
  agendaTag: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.ink3,
    letterSpacing: 0.3,
    marginTop: 1
  },
  empty: {
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.rule2,
    borderRadius: radii.md,
    backgroundColor: colors.white
  },
  emptyText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  }
});
