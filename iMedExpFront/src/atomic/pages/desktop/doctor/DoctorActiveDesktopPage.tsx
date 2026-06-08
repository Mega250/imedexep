import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, StyleSheet, Text, View } from "react-native";
import { USE_NATIVE_DRIVER } from "@/utils/nativeDriver";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon, IconKind } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { doctorNavActive } from "@/navigation/desktopNavConfigs";
import { goToScreen } from "@/navigation/screenRouter";
import { Appointment, fetchAppointments, patchAppointment } from "@/services/api/appointmentsApi";
import { getCurrentDoctorId } from "@/services/api/currentDoctor";
import { fetchDoctor } from "@/services/api/doctorsApi";
import { fetchPatient, fetchPatientFull, PatientFull } from "@/services/api/patientsApi";
import { getSelectedPatientId, setSelectedPatientId } from "@/services/api/selectedPatient";
import { loadSession } from "@/state/sessionStore";
import { colors, radii, shadow } from "@/theme/tokens";
import { family, text } from "@/theme/typography";
import { formatApptTime, parseDateLocal } from "@/utils/dates";

type AgendaItem = {
  id: number;
  patient_id: number;
  time: string;
  name: string;
  tag: string;
  state: "done" | "now" | "next" | "free";
};

type State = {
  loading: boolean;
  error: string | null;
  doctorName: string;
  doctorRole: string;
  agenda: AgendaItem[];
  totalToday: number;
  doneToday: number;
  current: PatientFull | null;
  vinculoDays: number | null;
  activeAppointmentId: number | null;
};

const initialState: State = {
  loading: true,
  error: null,
  doctorName: "Doctor",
  doctorRole: "",
  agenda: [],
  totalToday: 0,
  doneToday: 0,
  current: null,
  vinculoDays: null,
  activeAppointmentId: null
};

function vinculoDaysFrom(value: string | null | undefined): number | null {
  const d = parseDateLocal(value);
  if (!d || d.getFullYear() <= 1970) {
    return null;
  }
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  return days >= 0 ? days : null;
}

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
  const opacity = v.interpolate({ inputRange: [0, 1], outputRange: [dark ? 0.6 : 0.55, 0] });
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

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function computeAge(dob: string): number {
  const d = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) {
    age -= 1;
  }
  return age;
}

function genderSym(g: string | null): string {
  if (!g) {
    return "";
  }
  const l = g.toLowerCase();
  if (l.startsWith("f") || l.startsWith("muj")) {
    return "♀";
  }
  if (l.startsWith("m") || l.startsWith("h") || l.startsWith("hom")) {
    return "♂";
  }
  return "";
}

function todayDateLabel(): string {
  const d = new Date();
  const dow = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][d.getDay()];
  const mon = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"][d.getMonth()];
  return `${dow} · ${d.getDate()} ${mon}`;
}

function AgendaAside({ agenda, totalToday, doneToday }: { agenda: AgendaItem[]; totalToday: number; doneToday: number }) {
  return (
    <View style={styles.agendaAside}>
      <View style={styles.agendaHeader}>
        <Text style={styles.eyebrow}>Agenda de hoy</Text>
        <Text style={styles.agendaHeaderMeta}>
          {todayDateLabel()} · {doneToday}/{totalToday}
        </Text>
      </View>
      <View style={styles.agendaList}>
        {agenda.length === 0 ? (
          <Text style={styles.emptyText}>Sin citas para hoy</Text>
        ) : null}
        {agenda.map((item) => {
          const now = item.state === "now";
          const done = item.state === "done";
          const free = item.state === "free";
          return (
            <Tappable
              key={item.id}
              scaleTo={0.98}
              onPress={() => goToScreen("doctor-active")}
              style={[
                styles.agendaItem,
                now && styles.agendaItemNow,
                done && styles.dimmedDone,
                free && styles.dimmedFree
              ]}
            >
              <View style={styles.agendaItemTop}>
                <Text style={[styles.agendaItemTime, now && styles.agendaItemTimeNow]}>
                  {item.time}
                </Text>
                {now ? <Pulse color={colors.accentBright} dark /> : null}
                {done ? <Icon kind="check" size={12} color={colors.ok} /> : null}
              </View>
              <Text style={[styles.agendaItemName, now && styles.agendaItemNameNow]}>
                {item.name}
              </Text>
              {item.tag ? (
                <Text style={[styles.agendaItemTag, now && styles.agendaItemTagNow]}>
                  {item.tag}
                  {now ? " · ahora" : ""}
                </Text>
              ) : null}
            </Tappable>
          );
        })}
      </View>
    </View>
  );
}

function PatientHero({ patient, vinculoDays }: { patient: PatientFull; vinculoDays: number | null }) {
  const [noteHint, setNoteHint] = useState(false);
  const fullName = `${patient.first_name} ${patient.last_name}`.trim();
  const age = computeAge(patient.date_of_birth);
  const sym = genderSym(patient.gender);
  const physical: string[] = [];
  if (patient.blood_type) {
    physical.push(patient.blood_type);
  }
  if (patient.height_cm) {
    physical.push(`${(patient.height_cm / 100).toFixed(2)} m`);
  }
  if (patient.weight_kg) {
    physical.push(`${patient.weight_kg} kg`);
  }
  return (
    <View style={styles.heroCard}>
      <View style={styles.heroEyebrowBar}>
        <View style={styles.heroEyebrowLeft}>
          <Pulse color={colors.accent} />
          <Text style={styles.eyebrow}>Paciente en consulta · ahora</Text>
        </View>
        <Text style={styles.heroVinculo}>vínculo · {vinculoDays !== null ? `hace ${vinculoDays}d` : "—"}</Text>
      </View>
      <View style={styles.heroBody}>
        <View style={styles.heroIdentityRow}>
          <View style={styles.heroAvatar}>
            <Text style={styles.heroAvatarText}>{initials(fullName)}</Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.eyebrow}>Consulta · {formatTime(new Date().toISOString())}</Text>
            <Text style={styles.heroName} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{fullName}</Text>
            <View style={styles.heroMetaRow}>
              <Text style={styles.heroMeta}>
                {sym} <Text style={styles.heroMetaStrong}>{age} años</Text>
              </Text>
              {physical.length > 0 ? (
                <>
                  <View style={styles.heroDivider} />
                  <Text style={styles.heroMeta}>{physical.join(" · ")}</Text>
                </>
              ) : null}
              {patient.city ? (
                <>
                  <View style={styles.heroDivider} />
                  <Text style={styles.heroMeta}>{patient.city}</Text>
                </>
              ) : null}
              <View style={styles.heroDivider} />
              <Text style={styles.heroMetaMono}>imx_{String(patient.id).padStart(6, "0")}</Text>
            </View>
          </View>
          <View style={styles.heroActions}>
            <Tappable
              scaleTo={0.97}
              onPress={() => goToScreen("doc-full")}
              style={styles.heroGhostBtn}
            >
              <Text style={styles.heroGhostBtnText}>Ver expediente</Text>
            </Tappable>
            <Tappable
              scaleTo={0.97}
              onPress={() => setNoteHint(true)}
              style={[styles.heroAccentBtn, styles.heroAccentBtnDisabled]}
            >
              <Icon kind="plus" size={16} color="rgba(255,255,255,0.7)" />
              <Text style={styles.heroAccentBtnText}>Nota</Text>
            </Tappable>
            {noteHint ? <Text style={styles.heroHint}>Próximamente</Text> : null}
          </View>
        </View>
      </View>
    </View>
  );
}

function FocusColumn({ icon, title, count, accent, items, empty }: { icon: IconKind; title: string; count: string; accent?: boolean; items: { name: string; sub: string; meta: string }[]; empty: string }) {
  return (
    <View style={styles.focusColumn}>
      <View style={styles.focusHeader}>
        <View style={styles.focusHeaderLeft}>
          <View style={[styles.focusIcon, accent && styles.focusIconAccent]}>
            <Icon
              kind={icon}
              size={16}
              color={accent ? "#FFFFFF" : colors.accentDeep}
            />
          </View>
          <Text style={styles.focusTitle}>{title}</Text>
        </View>
        <View style={styles.focusCount}>
          <Text style={styles.focusCountText}>{count}</Text>
        </View>
      </View>
      <View style={styles.focusList}>
        {items.length === 0 ? (
          <View style={styles.focusEmpty}>
            <Text style={styles.emptyText}>{empty}</Text>
          </View>
        ) : null}
        {items.map((it, i) => (
          <View
            key={i}
            style={[styles.focusItem, i < items.length - 1 && styles.focusItemBorder]}
          >
            <View style={styles.focusItemTop}>
              <Text style={styles.focusItemName} numberOfLines={1} ellipsizeMode="tail">{it.name}</Text>
              <Text style={styles.focusItemMeta}>{it.meta}</Text>
            </View>
            <Text style={styles.focusItemSub}>{it.sub}</Text>
          </View>
        ))}
      </View>
      <Tappable scaleTo={0.98} style={styles.focusFooter} onPress={() => goToScreen("doc-full")}>
        <Text style={styles.focusFooterText}>Ver expediente →</Text>
      </Tappable>
    </View>
  );
}

function QuickBar({ onClose }: { onClose: () => void }) {
  const actions = ["Nota clínica", "Receta digital", "Solicitar estudio", "Programar seguimiento"];
  const [hint, setHint] = useState(false);
  return (
    <View style={styles.quickBar}>
      <Text style={styles.quickBarLabel}>ACCIONES DE CONSULTA</Text>
      <View style={styles.quickBarDivider} />
      <View style={styles.quickBarActions}>
        {actions.map((label) => (
          <Tappable
            key={label}
            scaleTo={0.97}
            onPress={() => setHint(true)}
            style={[styles.quickChip, styles.quickChipDisabled]}
          >
            <Icon kind="plus" size={13} color="rgba(255,255,255,0.4)" />
            <Text style={[styles.quickChipText, styles.quickChipTextDisabled]}>{label}</Text>
          </Tappable>
        ))}
      </View>
      {hint ? <Text style={styles.quickHint}>Próximamente · acción en desarrollo</Text> : null}
      <Tappable
        scaleTo={0.97}
        onPress={onClose}
        style={styles.quickCloseBtn}
      >
        <Text style={styles.quickCloseBtnText}>Cerrar consulta</Text>
        <Icon kind="arrow" size={14} color={colors.ink} />
      </Tappable>
    </View>
  );
}

export function DoctorActiveDesktopPage() {
  const [state, setState] = useState<State>(initialState);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const session = await loadSession();
        const fallbackName = session.user?.email ?? "Doctor";
        const doctorId = await getCurrentDoctorId();
        const [doctor, apptsAll] = await Promise.all([
          fetchDoctor(doctorId),
          fetchAppointments({ doctor_id: doctorId, page: 1, limit: 100 })
        ]);
        if (cancelled) {
          return;
        }
        const doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`.trim() || fallbackName;
        const today = new Date();
        const todayAppts = apptsAll.items
          .filter((a) => isSameDay(new Date(a.scheduled_at), today))
          .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
        const now = new Date();

        const nameMap: Record<number, string> = {};
        await Promise.all(
          Array.from(new Set(todayAppts.map((a) => a.patient_id))).map(async (pid) => {
            try {
              const p = await fetchPatient(pid);
              nameMap[pid] = `${p.first_name} ${p.last_name}`.trim();
            } catch {
              nameMap[pid] = `Paciente #${pid}`;
            }
          })
        );

        const agenda: AgendaItem[] = todayAppts.map((a: Appointment) => {
          let state: AgendaItem["state"] = "next";
          if (a.status === "completed" || a.status === "no_show") {
            state = "done";
          } else if (a.status === "in_progress") {
            state = "now";
          } else {
            const t = new Date(a.scheduled_at).getTime();
            if (t < now.getTime() - 30 * 60 * 1000) {
              state = "done";
            }
          }
          return {
            id: a.id,
            patient_id: a.patient_id,
            time: formatApptTime(a.scheduled_at),
            name: nameMap[a.patient_id] ?? `Paciente #${a.patient_id}`,
            tag: a.reason ?? "Consulta",
            state
          };
        });

        const doneToday = agenda.filter((a) => a.state === "done").length;
        const inProgress = agenda.filter((a) => a.state === "now").length;

        const focus = agenda.find((a) => a.state === "now") ?? agenda.find((a) => a.state === "next") ?? agenda[0];
        let patient: PatientFull | null = null;
        let activeAppointmentId: number | null = null;
        if (focus) {
          try {
            patient = await fetchPatientFull(focus.patient_id);
            activeAppointmentId = focus.id;
          } catch {
            patient = null;
            activeAppointmentId = null;
          }
        }
        if (!patient) {
          const selectedId = await getSelectedPatientId();
          if (selectedId !== null) {
            try {
              patient = await fetchPatientFull(selectedId);
            } catch {
              patient = null;
            }
          }
        }

        if (cancelled) {
          return;
        }
        if (patient) {
          setSelectedPatientId(patient.id).catch(() => undefined);
        }
        setState({
          loading: false,
          error: null,
          doctorName,
          doctorRole: doctor.office_location ?? "",
          agenda,
          totalToday: agenda.length,
          doneToday,
          current: patient,
          vinculoDays: patient ? vinculoDaysFrom(patient.created_at) : null,
          activeAppointmentId
        });
      } catch (err) {
        if (cancelled) {
          return;
        }
        setState({
          ...initialState,
          loading: false,
          error: err instanceof Error ? err.message : "No pudimos cargar la consulta."
        });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  async function closeConsult() {
    const apptId = state.activeAppointmentId;
    if (apptId !== null) {
      try {
        await patchAppointment(apptId, { status: "completed" });
      } catch (err) {
        void err;
      }
    }
    setReloadKey((k) => k + 1);
    goToScreen("doctor-dash");
  }

  const diagnoses: { name: string; sub: string; meta: string }[] = state.current?.glucose_risk
    ? [{ name: `Glucosa: ${state.current.glucose_risk}`, sub: `${state.current.glucose_mg_dl ?? "—"} mg/dL`, meta: "lectura" }]
    : [];

  const meds: { name: string; sub: string; meta: string }[] = [];

  const studies: { name: string; sub: string; meta: string }[] = [];
  if (state.current?.systolic_bp && state.current.diastolic_bp) {
    studies.push({ name: "T/A", sub: `${state.current.systolic_bp}/${state.current.diastolic_bp} mmHg`, meta: "último" });
  }
  if (state.current?.heart_rate) {
    studies.push({ name: "FC", sub: `${state.current.heart_rate} lpm`, meta: "último" });
  }
  if (state.current?.oxygen_saturation) {
    studies.push({ name: "SpO₂", sub: `${state.current.oxygen_saturation}%`, meta: "último" });
  }
  if (state.current?.temperature_celsius) {
    studies.push({ name: "Temperatura", sub: `${state.current.temperature_celsius}°C`, meta: "último" });
  }

  return (
    <DesktopShell
      nav={doctorNavActive}
      activeScreen="doctor-active"
      role="médico"
      roleBadge="Médico"
      title={`Consulta activa · ${state.doctorName}`}
      eyebrow={todayDateLabel()}
      searchPlaceholder="Buscar paciente, diagnóstico…"
    >
      <View style={styles.activeLayout}>
        <View style={styles.activeMain}>
          {state.loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={colors.accentDeep} />
              <Text style={styles.loadingText}>Cargando consulta…</Text>
            </View>
          ) : state.error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{state.error}</Text>
            </View>
          ) : !state.current ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>No hay paciente activo en este momento.</Text>
            </View>
          ) : (
            <>
              <FadeIn delay={60}>
                <PatientHero patient={state.current} vinculoDays={state.vinculoDays} />
              </FadeIn>
              <FadeIn delay={120}>
                <View style={styles.focusGrid}>
                  <FocusColumn
                    icon="plus"
                    title="Diagnósticos activos"
                    count={String(diagnoses.length)}
                    accent
                    items={diagnoses}
                    empty="Sin diagnósticos registrados"
                  />
                  <FocusColumn
                    icon="pill"
                    title="Medicación actual"
                    count={String(meds.length)}
                    items={meds}
                    empty="Sin medicación registrada"
                  />
                  <FocusColumn
                    icon="chart"
                    title="Signos vitales"
                    count={String(studies.length)}
                    items={studies}
                    empty="Sin tomas recientes"
                  />
                </View>
              </FadeIn>
            </>
          )}
          <FadeIn delay={180}>
            <QuickBar onClose={closeConsult} />
          </FadeIn>
        </View>
        <AgendaAside
          agenda={state.agenda}
          totalToday={state.totalToday}
          doneToday={state.doneToday}
        />
      </View>
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  activeLayout: {
    flexDirection: "row",
    gap: 20,
    alignItems: "flex-start",
    flex: 1
  },
  activeMain: {
    flex: 1,
    minWidth: 0,
    gap: 20
  },
  agendaAside: {
    minWidth: 280,
    maxWidth: 320,
    flexShrink: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    paddingVertical: 8
  },
  flex: {
    flex: 1
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
  agendaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12
  },
  eyebrow: {
    ...text.eyebrow,
    color: colors.ink3
  },
  agendaHeaderMeta: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  agendaList: {
    paddingHorizontal: 8
  },
  emptyText: {
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.ink3,
    paddingHorizontal: 12,
    paddingVertical: 18
  },
  agendaItem: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 13,
    borderRadius: radii.md,
    marginBottom: 2
  },
  agendaItemNow: {
    backgroundColor: colors.ink
  },
  dimmedDone: {
    opacity: 0.4
  },
  dimmedFree: {
    opacity: 0.45
  },
  agendaItemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  agendaItemTime: {
    fontFamily: family.mono,
    fontSize: 12,
    color: colors.ink3
  },
  agendaItemTimeNow: {
    color: "rgba(255,255,255,0.7)"
  },
  agendaItemName: {
    fontFamily: family.regular,
    fontSize: 14,
    lineHeight: 18,
    color: colors.ink,
    marginTop: 2
  },
  agendaItemNameNow: {
    fontFamily: family.medium,
    color: colors.paper
  },
  agendaItemTag: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 2,
    letterSpacing: 0.6
  },
  agendaItemTagNow: {
    color: "rgba(255,255,255,0.6)"
  },
  heroCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  heroEyebrowBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2,
    backgroundColor: colors.paper
  },
  heroEyebrowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  heroVinculo: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  heroBody: {
    paddingHorizontal: 32,
    paddingTop: 28,
    paddingBottom: 26
  },
  heroIdentityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24
  },
  heroAvatar: {
    width: 96,
    height: 96,
    borderRadius: 999,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  heroAvatarText: {
    fontFamily: family.serif,
    fontSize: 38,
    color: colors.accentDeep
  },
  heroName: {
    fontFamily: family.serif,
    fontSize: 56,
    letterSpacing: -1.4,
    lineHeight: 60,
    color: colors.ink,
    marginTop: 4
  },
  heroMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 18,
    marginTop: 12
  },
  heroMeta: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink2
  },
  heroMetaStrong: {
    fontFamily: family.medium
  },
  heroMetaMono: {
    fontFamily: family.mono,
    fontSize: 11.5,
    color: colors.ink3
  },
  heroDivider: {
    width: 1,
    height: 11,
    backgroundColor: colors.rule
  },
  heroActions: {
    flexDirection: "row",
    gap: 8
  },
  heroGhostBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white
  },
  heroGhostBtnText: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.ink
  },
  heroAccentBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accent
  },
  heroAccentBtnText: {
    fontFamily: family.medium,
    fontSize: 12,
    color: "#FFFFFF"
  },
  heroAccentBtnDisabled: {
    opacity: 0.5
  },
  heroHint: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    alignSelf: "center"
  },
  focusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16
  },
  focusColumn: {
    flexBasis: "30%",
    flexGrow: 1,
    minWidth: 280,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  focusHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  focusHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  focusIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  focusIconAccent: {
    backgroundColor: colors.accent
  },
  focusTitle: {
    fontFamily: family.medium,
    fontSize: 16,
    letterSpacing: -0.16,
    color: colors.ink
  },
  focusCount: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.paper2
  },
  focusCountText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink2
  },
  focusList: {
    flex: 1,
    paddingVertical: 10
  },
  focusEmpty: {
    paddingHorizontal: 22,
    paddingVertical: 24
  },
  focusItem: {
    paddingHorizontal: 22,
    paddingVertical: 14
  },
  focusItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.rule3
  },
  focusItemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline"
  },
  focusItemName: {
    flex: 1,
    minWidth: 0,
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  focusItemMeta: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  focusItemSub: {
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.ink3,
    marginTop: 4,
    lineHeight: 17.5
  },
  focusFooter: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.rule2,
    backgroundColor: colors.paper
  },
  focusFooterText: {
    fontFamily: family.medium,
    fontSize: 12.5,
    color: colors.accentDeep
  },
  quickBar: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: colors.ink,
    borderRadius: radii.xl,
    ...shadow.hero
  },
  quickBarLabel: {
    fontFamily: family.mono,
    fontSize: 11,
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 1.32
  },
  quickBarDivider: {
    width: 1,
    height: 18,
    backgroundColor: "rgba(255,255,255,0.16)"
  },
  quickBarActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    flex: 1
  },
  quickChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)"
  },
  quickChipText: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.paper
  },
  quickChipDisabled: {
    opacity: 0.45
  },
  quickChipTextDisabled: {
    color: "rgba(255,255,255,0.6)"
  },
  quickHint: {
    fontFamily: family.mono,
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    alignSelf: "center"
  },
  quickCloseBtn: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radii.md,
    backgroundColor: colors.accentBright
  },
  quickCloseBtnText: {
    fontFamily: family.semibold,
    fontSize: 14,
    color: colors.ink
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
