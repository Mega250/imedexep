import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, StyleSheet, Text, View } from "react-native";
import { USE_NATIVE_DRIVER } from "@/utils/nativeDriver";
import Svg, { Circle, Defs, Pattern, RadialGradient, Rect, Stop } from "react-native-svg";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon, IconKind } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { QuickAppointmentModal } from "@/atomic/molecules/QuickAppointmentModal";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { doctorNav } from "@/navigation/desktopNavConfigs";
import { goToScreen } from "@/navigation/screenRouter";
import { Appointment, fetchAppointments } from "@/services/api/appointmentsApi";
import { getCurrentDoctorId } from "@/services/api/currentDoctor";
import { fetchDoctor } from "@/services/api/doctorsApi";
import { fetchPatient, fetchPatientsList } from "@/services/api/patientsApi";
import { loadSession } from "@/state/sessionStore";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";
import { formatApptTime } from "@/utils/dates";
import { statusLabel } from "@/utils/status";

const TILES: [IconKind, string, string, boolean, string | null][] = [
  ["search", "Buscar paciente", "⌘K", false, "dsk-patients"],
  ["plus", "Nueva nota", "En consulta", false, "doctor-active"],
  ["rx", "Receta digital", "Firma activa", false, "dsk-recetas"],
  ["qr", "Vincular paciente", "Generar QR", true, "doc-qr"],
  ["cal", "Agendar cita", "Nueva", false, "dsk-doc-agendar"],
  ["lab", "Solicitar estudio", "Lab / imagen", false, "dsk-validaciones"]
];

type DashState = {
  loading: boolean;
  error: string | null;
  doctorName: string;
  doctorSpecialty: string;
  patientCount: number;
  consultationsToday: number;
  agenda: Appointment[];
  nextAppointment: Appointment | null;
  nextPatientName: string | null;
  totalToday: number;
  doneToday: number;
};

const initialState: DashState = {
  loading: true,
  error: null,
  doctorName: "Doctor",
  doctorSpecialty: "",
  patientCount: 0,
  consultationsToday: 0,
  agenda: [],
  nextAppointment: null,
  nextPatientName: null,
  totalToday: 0,
  doneToday: 0
};

function Pulse({ color, dark }: { color: string; dark?: boolean }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(v, { toValue: 1, duration: 1900, useNativeDriver: USE_NATIVE_DRIVER })
    );
    loop.start();
    return () => loop.stop();
  }, [v]);
  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [1, 3] });
  const opacity = v.interpolate({ inputRange: [0, 1], outputRange: [dark ? 0.6 : 0.5, 0] });
  return (
    <View style={styles.pulse}>
      <Animated.View
        style={[
          styles.pulseDot,
          { backgroundColor: color, position: "absolute", opacity, transform: [{ scale }] }
        ]}
      />
      <View style={[styles.pulseDot, { backgroundColor: color }]} />
    </View>
  );
}

function HeroGlow() {
  return (
    <View pointerEvents="none" style={styles.heroGlow}>
      <Svg width={360} height={360}>
        <Defs>
          <RadialGradient id="heroGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="rgba(0,180,216,0.25)" stopOpacity={1} />
            <Stop offset="70%" stopColor="rgba(0,180,216,0)" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width={360} height={360} fill="url(#heroGlow)" />
      </Svg>
    </View>
  );
}

function HeroDots() {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: 0.06 }]}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="heroDots" width={30} height={30} patternUnits="userSpaceOnUse">
            <Circle cx={1} cy={1} r={1} fill="rgba(255,255,255,0.7)" />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#heroDots)" />
      </Svg>
    </View>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function agendaState(appt: Appointment, now: Date): "done" | "next" | "queued" | "free" {
  if (appt.status === "completed" || appt.status === "no_show") {
    return "done";
  }
  const time = new Date(appt.scheduled_at);
  if (time.getTime() < now.getTime() - 30 * 60 * 1000) {
    return "done";
  }
  return "queued";
}

function greetingText(): string {
  const h = new Date().getHours();
  if (h < 12) {
    return "Buenos días";
  }
  if (h < 19) {
    return "Buenas tardes";
  }
  return "Buenas noches";
}

function eyebrowDate(): string {
  const d = new Date();
  const dow = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][d.getDay()];
  const mon = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"][d.getMonth()];
  return `${dow} · ${d.getDate()} ${mon} · ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function StatsTicker({ patients, today, done, total }: { patients: number; today: number; done: number; total: number }) {
  const stats: [string, string, string, string][] = [
    [String(today), "consultas", "hoy", `${done} hechas`],
    [String(patients), "pacientes", "vinculados", "cartera total"],
    [String(total), "agendados", "hoy", "en agenda"],
    [done > 0 && today > 0 ? `${Math.round((done / today) * 100)}%` : "—", "atendidos", "del día", "progreso"]
  ];
  return (
    <View style={styles.statsTicker}>
      {stats.map(([n, label, ctx, trend], i) => (
        <View
          key={label + i}
          style={[styles.statCell, i < 3 && styles.statCellBorder]}
        >
          <Text style={styles.statNumber} numberOfLines={1} adjustsFontSizeToFit>{n}</Text>
          <View style={styles.flex}>
            <Text style={styles.statLabelLine}>
              <Text style={styles.statLabelStrong}>{label}</Text>
              <Text style={styles.statLabelCtx}> · {ctx}</Text>
            </Text>
            <Text style={styles.statTrend}>{trend}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function NextPatientHero({ appt, patientName }: { appt: Appointment | null; patientName: string | null }) {
  if (!appt) {
    return (
      <View style={styles.hero}>
        <HeroGlow />
        <HeroDots />
        <View style={styles.heroInner}>
          <View style={styles.heroMain}>
            <View style={styles.heroEyebrowRow}>
              <Pulse color={colors.accentBright} dark />
              <Text style={styles.heroEyebrow}>Sin próximas citas</Text>
            </View>
            <Text style={styles.heroName} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>Día despejado</Text>
            <Text style={styles.heroMeta}>No tienes citas pendientes en este momento.</Text>
          </View>
        </View>
      </View>
    );
  }
  const time = new Date(appt.scheduled_at);
  const now = new Date();
  const diffMin = Math.round((time.getTime() - now.getTime()) / 60000);
  const eyebrow = diffMin > 0 ? `Tu próximo paciente · en ${diffMin} min` : "Tu próximo paciente · ahora";
  return (
    <View style={styles.hero}>
      <HeroGlow />
      <HeroDots />
      <View style={styles.heroInner}>
        <View style={styles.heroMain}>
          <View style={styles.heroEyebrowRow}>
            <Pulse color={colors.accentBright} dark />
            <Text style={styles.heroEyebrow}>{eyebrow}</Text>
          </View>
          <Text style={styles.heroName} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>{patientName ?? `Paciente #${appt.patient_id}`}</Text>
          <View style={styles.heroMetaRow}>
            <Text style={styles.heroMeta}>{formatApptTime(appt.scheduled_at)}</Text>
            <View style={styles.heroDivider} />
            <Text style={styles.heroMeta}>{appt.reason ?? "Consulta"}</Text>
            <View style={styles.heroDivider} />
            <Text style={styles.heroMeta}>Estado: {statusLabel(appt.status)}</Text>
          </View>
        </View>
        <View style={styles.heroActions}>
          <Tappable
            scaleTo={0.97}
            onPress={() => goToScreen("doctor-active")}
            style={styles.heroPrimaryBtn}
          >
            <Text style={styles.heroPrimaryBtnText}>Empezar consulta</Text>
            <Icon kind="arrow" size={16} color={colors.ink} />
          </Tappable>
          <Tappable
            scaleTo={0.97}
            onPress={() => goToScreen("doc-full")}
            style={styles.heroGhostBtn}
          >
            <Text style={styles.heroGhostBtnText}>Ver expediente</Text>
          </Tappable>
        </View>
      </View>
    </View>
  );
}

function AccesoRapido() {
  return (
    <View style={styles.accesoWrap}>
      <View style={styles.accesoHeader}>
        <Text style={styles.eyebrow}>Acceso rápido</Text>
        <Text style={styles.accesoHint}>flujos frecuentes</Text>
      </View>
      <View style={styles.accesoGrid}>
        {TILES.map(([icon, label, hint, accent, screen]) => (
          <Tappable
            key={label}
            scaleTo={0.97}
            onPress={() => screen && goToScreen(screen)}
            style={[styles.tile, accent && styles.tileAccent]}
          >
            <View style={[styles.tileIcon, accent && styles.tileIconAccent]}>
              <Icon kind={icon} size={18} color={accent ? colors.white : colors.accentDeep} />
            </View>
            <View style={styles.tileTextBlock}>
              <Text style={[styles.tileLabel, accent && styles.tileLabelAccent]}>{label}</Text>
              <Text style={[styles.tileHint, accent && styles.tileHintAccent]}>{hint}</Text>
            </View>
          </Tappable>
        ))}
      </View>
    </View>
  );
}

function AgendaToday({ agenda, done, total, names }: { agenda: Appointment[]; done: number; total: number; names: Record<number, string> }) {
  const now = new Date();
  let nextSet = false;
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <View style={styles.panelHeaderLeft}>
          <Text style={styles.panelTitle}>Agenda de hoy</Text>
          <View style={styles.agendaPill}>
            <Text style={styles.agendaPillText}>{done} / {total}</Text>
          </View>
        </View>
        <Tappable scaleTo={0.97} onPress={() => goToScreen("dsk-agenda")}>
          <Text style={styles.panelLink}>Ver mes →</Text>
        </Tappable>
      </View>
      <View style={styles.agendaBody}>
        {agenda.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Sin citas para hoy</Text>
          </View>
        ) : null}
        {agenda.map((appt, i) => {
          const state = agendaState(appt, now);
          const isNext = state === "queued" && !nextSet;
          if (isNext) {
            nextSet = true;
          }
          const done = state === "done";
          const name = names[appt.patient_id] ?? `Paciente #${appt.patient_id}`;
          return (
            <View
              key={appt.id}
              style={[
                styles.agendaRow,
                i < agenda.length - 1 && styles.agendaRowBorder,
                isNext && styles.agendaRowNext,
                done && styles.dimmedDone
              ]}
            >
              <Text style={styles.agendaTime}>{formatApptTime(appt.scheduled_at)}</Text>
              <View
                style={[
                  styles.agendaDot,
                  {
                    backgroundColor: isNext ? colors.accent : done ? colors.ok : colors.ink3
                  }
                ]}
              />
              <View style={styles.flex}>
                <Text style={[styles.agendaName, isNext && styles.agendaNameNext]} numberOfLines={1} ellipsizeMode="tail">{name}</Text>
                <Text style={styles.agendaTag} numberOfLines={1} ellipsizeMode="tail">{appt.reason ?? "Consulta"}</Text>
              </View>
              {isNext ? (
                <View style={styles.agendaSiguePill}>
                  <Text style={styles.agendaSiguePillText}>SIGUE</Text>
                </View>
              ) : null}
              {done ? <Icon kind="check" size={14} color={colors.ok} /> : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function PendientesCard({ agenda, names }: { agenda: Appointment[]; names: Record<number, string> }) {
  const pendientes = agenda
    .filter((a) => a.status === "scheduled" || a.status === "confirmed")
    .slice(0, 4)
    .map((a) => ({
      title: `Cita pendiente — ${names[a.patient_id] ?? `Paciente #${a.patient_id}`}`,
      sub: `${formatApptTime(a.scheduled_at)} · ${a.reason ?? "Consulta"}`,
      pri: "media" as const
    }));
  return (
    <View style={styles.panel}>
      <View style={styles.pendHeader}>
        <View style={styles.panelHeaderLeft}>
          <Icon kind="spark" size={18} color={colors.accentDeep} />
          <Text style={styles.panelTitle}>Por hacer</Text>
        </View>
      </View>
      <View>
        {pendientes.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Sin pendientes</Text>
          </View>
        ) : null}
        {pendientes.map((item, i) => (
          <View
            key={i}
            style={[styles.pendRow, i < pendientes.length - 1 && styles.pendRowBorder]}
          >
            <View
              style={[
                styles.pendBar,
                { backgroundColor: colors.mid }
              ]}
            />
            <View style={styles.flex}>
              <Text style={styles.pendTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
              <Text style={styles.pendSub} numberOfLines={1} ellipsizeMode="tail">{item.sub}</Text>
            </View>
            <Text style={styles.pendChev}>›</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function DoctorDashDesktopPage() {
  const [state, setState] = useState<DashState>(initialState);
  const [names, setNames] = useState<Record<number, string>>({});
  const [quickModal, setQuickModal] = useState(false);
  const [doctorRecord, setDoctorRecord] = useState<{ id: number; institution_id: number | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const session = await loadSession();
        const userEmail = session.user?.email ?? "Doctor";
        const doctorId = await getCurrentDoctorId();
        const [doctor, patientsList, apptsAll] = await Promise.all([
          fetchDoctor(doctorId),
          fetchPatientsList({ page: 1, limit: 1 }),
          fetchAppointments({ doctor_id: doctorId, page: 1, limit: 100 })
        ]);
        if (cancelled) {
          return;
        }
        const doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`.trim() || userEmail;
        const today = new Date();
        const todayAppts = apptsAll.items
          .filter((a) => isSameDay(new Date(a.scheduled_at), today))
          .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
        const doneCount = todayAppts.filter((a) => a.status === "completed" || a.status === "no_show").length;
        const now = new Date();
        const next = todayAppts.find((a) =>
          (a.status === "scheduled" || a.status === "confirmed" || a.status === "in_progress") &&
          new Date(a.scheduled_at).getTime() >= now.getTime() - 30 * 60 * 1000
        ) ?? null;

        let nextName: string | null = null;
        if (next) {
          try {
            const p = await fetchPatient(next.patient_id);
            nextName = `${p.first_name} ${p.last_name}`.trim();
          } catch {
            nextName = null;
          }
        }

        const uniquePatientIds = Array.from(new Set(todayAppts.map((a) => a.patient_id)));
        const nameMap: Record<number, string> = {};
        await Promise.all(
          uniquePatientIds.map(async (pid) => {
            try {
              const p = await fetchPatient(pid);
              nameMap[pid] = `${p.first_name} ${p.last_name}`.trim();
            } catch {
              nameMap[pid] = `Paciente #${pid}`;
            }
          })
        );
        if (cancelled) {
          return;
        }
        setNames(nameMap);
        setDoctorRecord({ id: doctorId, institution_id: doctor.institution_id ?? null });
        setState({
          loading: false,
          error: null,
          doctorName,
          doctorSpecialty: doctor.office_location ?? "",
          patientCount: patientsList.total,
          consultationsToday: doneCount,
          agenda: todayAppts,
          nextAppointment: next,
          nextPatientName: nextName,
          totalToday: todayAppts.length,
          doneToday: doneCount
        });
      } catch (err) {
        if (cancelled) {
          return;
        }
        setState({
          ...initialState,
          loading: false,
          error: err instanceof Error ? err.message : "No pudimos cargar el panel."
        });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const greeting = `${greetingText()}, ${state.doctorName}.`;

  return (
    <DesktopShell
      nav={doctorNav}
      activeScreen="doctor-dash"
      role="médico"
      roleBadge="Médico"
      title={greeting}
      eyebrow={eyebrowDate()}
      searchPlaceholder="Buscar paciente, diagnóstico…"
    >
      {state.loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.accentDeep} />
          <Text style={styles.loadingText}>Cargando tu panel…</Text>
        </View>
      ) : state.error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{state.error}</Text>
        </View>
      ) : (
        <>
          <FadeIn delay={60}>
            <StatsTicker
              patients={state.patientCount}
              today={state.totalToday}
              done={state.doneToday}
              total={state.totalToday}
            />
          </FadeIn>
          <FadeIn delay={120}>
            <NextPatientHero appt={state.nextAppointment} patientName={state.nextPatientName} />
          </FadeIn>
          <FadeIn delay={180}>
            <AccesoRapido />
          </FadeIn>
          <FadeIn delay={200}>
            <Tappable
              onPress={() => setQuickModal(true)}
              scaleTo={0.98}
              style={styles.urgBar}
            >
              <View style={styles.urgBarIcon}>
                <Icon kind="alert" size={16} color={colors.alert} />
              </View>
              <View style={styles.urgBarText}>
                <Text style={styles.urgBarTitle}>Cita rápida de emergencia</Text>
                <Text style={styles.urgBarSub}>Buscar paciente por CURP y agendar en segundos</Text>
              </View>
              <Icon kind="chev" size={14} color={colors.ink3} />
            </Tappable>
          </FadeIn>
          <FadeIn delay={240}>
            <View style={styles.bottomGrid}>
              <View style={styles.bottomWide}>
                <AgendaToday agenda={state.agenda} done={state.doneToday} total={state.totalToday} names={names} />
              </View>
              <View style={styles.bottomNarrow}>
                <PendientesCard agenda={state.agenda} names={names} />
              </View>
            </View>
          </FadeIn>
        </>
      )}
      {doctorRecord ? (
        <QuickAppointmentModal
          visible={quickModal}
          doctorId={doctorRecord.id}
          institutionId={doctorRecord.institution_id}
          role="doctor"
          onClose={() => setQuickModal(false)}
          onCreated={() => {
            setQuickModal(false);
            goToScreen("doctor-dash");
          }}
          onStartConsultation={() => goToScreen("doctor-active")}
          onViewAgenda={() => goToScreen("dsk-agenda")}
        />
      ) : null}
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.paper
  },
  content: {
    flex: 1,
    overflow: "hidden"
  },
  scroll: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 24
  },
  flex: {
    flex: 1,
    minWidth: 0
  },
  pulse: {
    width: 8,
    height: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 99
  },
  sidebar: {
    width: 260,
    backgroundColor: colors.white,
    borderRightWidth: 1,
    borderRightColor: colors.rule
  },
  sidebarLogo: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 24
  },
  sidebarNav: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: radii.md,
    marginBottom: 2
  },
  navRowActive: {
    backgroundColor: colors.ink
  },
  navLabel: {
    flex: 1,
    fontFamily: family.regular,
    fontSize: 14,
    color: colors.ink
  },
  navLabelActive: {
    fontFamily: family.medium,
    color: colors.paper
  },
  navCount: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.paper3
  },
  navCountActive: {
    backgroundColor: "rgba(255,255,255,0.12)"
  },
  navCountText: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.accentDeep
  },
  navCountTextActive: {
    color: colors.paper
  },
  doctorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.rule
  },
  doctorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center"
  },
  doctorAvatarText: {
    fontFamily: family.semibold,
    fontSize: 13,
    color: "#FFFFFF"
  },
  doctorName: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  doctorRole: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3
  },
  dashTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 48,
    paddingTop: 28,
    paddingBottom: 8
  },
  eyebrow: {
    ...text.eyebrow,
    color: colors.ink3
  },
  greeting: {
    fontFamily: family.medium,
    fontSize: 36,
    letterSpacing: -0.9,
    color: colors.ink,
    marginTop: 4,
    lineHeight: 40
  },
  greetingSerif: {
    fontFamily: family.serif,
    color: colors.accentDeep
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: 320,
    height: 44,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white,
    borderRadius: radii.md
  },
  searchText: {
    fontFamily: family.regular,
    fontSize: 13.5,
    color: colors.ink3
  },
  kbChip: {
    borderWidth: 1,
    borderColor: colors.rule,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  kbText: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  statsTicker: {
    flexDirection: "row",
    marginHorizontal: 48,
    marginTop: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  statCell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 14,
    paddingHorizontal: 22,
    paddingVertical: 16
  },
  statCellBorder: {
    borderRightWidth: 1,
    borderRightColor: colors.rule2
  },
  statNumber: {
    fontFamily: family.medium,
    fontSize: 32,
    letterSpacing: -0.96,
    color: colors.ink
  },
  statLabelLine: {
    fontSize: 12.5,
    lineHeight: 15
  },
  statLabelStrong: {
    fontFamily: family.medium,
    fontSize: 12.5,
    color: colors.ink
  },
  statLabelCtx: {
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.ink3
  },
  statTrend: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ok,
    marginTop: 4,
    letterSpacing: 0.4
  },
  hero: {
    marginHorizontal: 48,
    marginTop: 20,
    backgroundColor: colors.ink,
    borderRadius: radii.xxl,
    overflow: "hidden"
  },
  heroGlow: {
    position: "absolute",
    top: -120,
    right: -80
  },
  heroInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 32,
    gap: 24
  },
  heroMain: {
    flex: 1,
    minWidth: 0
  },
  heroEyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  heroEyebrow: {
    ...text.eyebrow,
    color: "rgba(255,255,255,0.7)"
  },
  heroName: {
    fontFamily: family.serif,
    fontSize: 64,
    letterSpacing: -1.6,
    lineHeight: 68,
    color: colors.paper,
    marginTop: 16
  },
  heroMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 18,
    marginTop: 14
  },
  heroMeta: {
    fontFamily: family.regular,
    fontSize: 14,
    color: "rgba(255,255,255,0.75)"
  },
  heroDivider: {
    width: 1,
    height: 11,
    backgroundColor: "rgba(255,255,255,0.2)"
  },
  heroActions: {
    alignItems: "flex-end",
    gap: 10
  },
  heroPrimaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: radii.md,
    backgroundColor: colors.accentBright
  },
  heroPrimaryBtnText: {
    fontFamily: family.semibold,
    fontSize: 16,
    color: colors.ink
  },
  heroGhostBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)"
  },
  heroGhostBtnText: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.paper
  },
  accesoWrap: {
    marginHorizontal: 48,
    marginTop: 14
  },
  accesoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 10
  },
  accesoHint: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  accesoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  tile: {
    flexBasis: "16%",
    flexGrow: 1,
    minWidth: 150,
    minHeight: 88,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    backgroundColor: colors.white
  },
  tileAccent: {
    borderColor: colors.accent,
    backgroundColor: colors.accent
  },
  tileIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  tileIconAccent: {
    backgroundColor: "rgba(255,255,255,0.18)"
  },
  tileTextBlock: {
    gap: 2
  },
  tileLabel: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink,
    lineHeight: 16
  },
  tileLabelAccent: {
    color: "#FFFFFF"
  },
  tileHint: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    letterSpacing: 0.4
  },
  tileHintAccent: {
    color: "rgba(255,255,255,0.78)"
  },
  urgBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginHorizontal: 48,
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: radii.lg,
    backgroundColor: colors.alertSoft,
    borderWidth: 1,
    borderColor: colors.alertRule
  },
  urgBarIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  urgBarText: {
    flex: 1,
    gap: 2
  },
  urgBarTitle: {
    fontFamily: family.medium,
    fontSize: 14,
    color: colors.ink
  },
  urgBarSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.alert,
    letterSpacing: 0.3
  },
  bottomGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    paddingHorizontal: 48,
    paddingTop: 20,
    paddingBottom: 24
  },
  bottomWide: {
    flexBasis: "58%",
    flexGrow: 1.4,
    minWidth: 360
  },
  bottomNarrow: {
    flexBasis: "38%",
    flexGrow: 1,
    minWidth: 280
  },
  panel: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  pendHeader: {
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  panelHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  panelTitle: {
    fontFamily: family.medium,
    fontSize: 17,
    letterSpacing: -0.17,
    color: colors.ink
  },
  agendaPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.paper3
  },
  agendaPillText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.accentDeep
  },
  panelLink: {
    fontFamily: family.medium,
    fontSize: 12.5,
    color: colors.accentDeep
  },
  agendaBody: {
    paddingVertical: 4
  },
  agendaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 22,
    paddingVertical: 14
  },
  agendaRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.rule3
  },
  agendaRowNext: {
    backgroundColor: colors.paper3
  },
  dimmedDone: {
    opacity: 0.45
  },
  agendaTime: {
    width: 64,
    fontFamily: family.monoMedium,
    fontSize: 13,
    color: colors.ink2
  },
  agendaDot: {
    width: 6,
    height: 6,
    borderRadius: 99
  },
  agendaName: {
    fontFamily: family.regular,
    fontSize: 14.5,
    color: colors.ink
  },
  agendaNameNext: {
    fontFamily: family.medium
  },
  agendaTag: {
    fontFamily: family.regular,
    fontSize: 12,
    color: colors.ink3,
    marginTop: 2
  },
  agendaSiguePill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.accent
  },
  agendaSiguePillText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: "#FFFFFF",
    letterSpacing: 0.88
  },
  pendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 22,
    paddingVertical: 14
  },
  pendRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.rule3
  },
  pendBar: {
    width: 3,
    height: 28,
    borderRadius: 99
  },
  pendTitle: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink
  },
  pendSub: {
    fontFamily: family.regular,
    fontSize: 11.5,
    color: colors.ink3,
    marginTop: 2
  },
  pendChev: {
    fontFamily: family.regular,
    fontSize: 16,
    color: colors.ink3
  },
  emptyBox: {
    paddingHorizontal: 22,
    paddingVertical: 28,
    alignItems: "center"
  },
  emptyText: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink3
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 48,
    marginTop: 24,
    padding: 24,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg
  },
  loadingText: {
    fontFamily: family.regular,
    fontSize: 13.5,
    color: colors.ink2
  },
  errorBox: {
    marginHorizontal: 48,
    marginTop: 24,
    padding: 18,
    borderRadius: radii.md,
    backgroundColor: colors.alertSoft,
    borderWidth: 1,
    borderColor: colors.alertRule
  },
  errorText: {
    fontFamily: family.regular,
    fontSize: 13.5,
    color: colors.alert
  }
});
