import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { secretaryNav } from "@/navigation/desktopNavConfigs";
import { goToScreen } from "@/navigation/screenRouter";
import { Appointment, fetchAppointments } from "@/services/api/appointmentsApi";
import { Doctor } from "@/services/api/doctorsApi";
import { Patient, fetchPatientsList } from "@/services/api/patientsApi";
import { Pagination } from "@/atomic/molecules/Pagination";

const PAGE_SIZE = 25;
import { fetchInstitutionDoctors } from "@/services/api/secretaryApi";
import { silentOrEmpty } from "@/services/api/silent";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";
import { formatApptDateTime, formatApptTime, formatDateLocal } from "@/utils/dates";
import { statusLabel } from "@/utils/status";

function ageFrom(dob: string): number {
  const d = new Date(dob);
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000)));
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatNext(value: string | null): string {
  if (!value) return "—";
  if (isSameDay(new Date(value), new Date())) {
    return `hoy ${formatApptTime(value)}`;
  }
  return formatApptDateTime(value, { day: "numeric", month: "short" });
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

type EnrichedPatient = {
  p: Patient;
  drLabel: string;
  next: Appointment | null;
};

export function SecPatientsDesktopPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [page, setPage] = useState(1);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [sortMode, setSortMode] = useState<"next" | "name">("next");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [patList, apptList, docList] = await Promise.all([
          fetchPatientsList({ page, limit: PAGE_SIZE }).catch(() => ({
            items: [],
            total: 0,
            page,
            limit: PAGE_SIZE
          })),
          fetchAppointments({ limit: 100 }).catch(() => ({ items: [], total: 0, page: 1, limit: 100 })),
          silentOrEmpty(fetchInstitutionDoctors(), "SecPatientsDesktopPage.fetchInstitutionDoctors")
        ]);
        if (!cancelled) {
          setPatients(patList.items ?? []);
          setTotalPatients(patList.total ?? 0);
          setAppointments(apptList.items ?? []);
          setDoctors(docList ?? []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar pacientes.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const doctorMap = useMemo(() => new Map(doctors.map((d) => [d.id, d] as const)), [doctors]);

  const enriched: EnrichedPatient[] = useMemo(() => {
    return patients.map((p) => {
      const patientAppts = appointments
        .filter((a) => a.patient_id === p.id)
        .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
      const latest = patientAppts[0] ?? null;
      const treating = latest ? doctorMap.get(latest.doctor_id) : null;
      const drLabel = treating ? `Dr. ${treating.last_name}` : "—";
      const upcoming = patientAppts
        .filter((a) => new Date(a.scheduled_at).getTime() >= Date.now() && a.status !== "cancelled")
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
      return { p, drLabel, next: upcoming[0] ?? null };
    });
  }, [patients, appointments, doctorMap]);

  const today = new Date();
  const todayAppointments = appointments.filter((a) => isSameDay(new Date(a.scheduled_at), today));
  const todayPatientIds = useMemo(
    () => new Set(todayAppointments.map((a) => a.patient_id)),
    [todayAppointments]
  );
  const todayCount = todayAppointments.length;

  const STATS = [
    { k: "Vinculados", n: String(patients.length), sub: "expedientes activos", alert: false },
    { k: "Con cita hoy", n: String(todayCount), sub: "agenda de hoy", alert: false },
    { k: "Médicos clínica", n: String(doctors.length), sub: "atienden hoy", alert: false }
  ];

  const FILTERS = [
    { id: "all", k: "Todos", n: String(patients.length), on: activeFilter === "all" },
    { id: "today", k: "Con cita hoy", n: String(todayPatientIds.size), on: activeFilter === "today" },
    ...doctors.slice(0, 3).map((d) => {
      const c = enriched.filter((row) => row.drLabel === `Dr. ${d.last_name}`).length;
      return { id: `doctor:${d.id}`, k: `Dr. ${d.last_name}`, n: String(c), on: activeFilter === `doctor:${d.id}` } as { id: string; k: string; n: string; on?: boolean; alert?: boolean };
    })
  ];

  const filtered = useMemo(() => {
    if (activeFilter === "today") {
      return enriched.filter((row) => todayPatientIds.has(row.p.id));
    }
    if (activeFilter.startsWith("doctor:")) {
      const doctorId = Number(activeFilter.split(":")[1]);
      const doctor = doctorMap.get(doctorId);
      return doctor ? enriched.filter((row) => row.drLabel === `Dr. ${doctor.last_name}`) : enriched;
    }
    return enriched;
  }, [activeFilter, doctorMap, enriched, todayPatientIds]);

  const sortedFiltered = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortMode === "name") {
        const aName = `${a.p.first_name} ${a.p.last_name}`.trim();
        const bName = `${b.p.first_name} ${b.p.last_name}`.trim();
        return aName.localeCompare(bName, "es");
      }
      if (!a.next && !b.next) return 0;
      if (!a.next) return 1;
      if (!b.next) return -1;
      return new Date(a.next.scheduled_at).getTime() - new Date(b.next.scheduled_at).getTime();
    });
  }, [filtered, sortMode]);

  const sel = sortedFiltered.find((row) => row.p.id === selectedPatientId) ?? sortedFiltered[0] ?? null;

  return (
    <DesktopShell
      nav={secretaryNav}
      activeScreen="sec-patients"
      role="secretaria · clínica"
      roleBadge="Secretaria"
      title="Pacientes de la clínica"
      eyebrow={`${patients.length} expedientes · ${todayCount} con cita hoy`}
      searchPlaceholder="Buscar paciente, CURP, teléfono…"
      topBarRight={
        <Button
          label="Vincular nuevo"
          variant="accent"
          size="sm"
          block={false}
          height={42}
          radius={radii.md}
          iconLeft="plus"
          onPress={() => goToScreen("sec-link")}
        />
      }
    >
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FadeIn>
        <View style={styles.statRow}>
          {STATS.map((s) => (
            <View key={s.k} style={styles.statCard}>
              <Text style={styles.eyebrow}>{s.k}</Text>
              <Text style={styles.statValue}>{s.n}</Text>
              <Text style={[styles.statSub, s.alert && { color: colors.alert }]}>{s.sub}</Text>
            </View>
          ))}
        </View>
      </FadeIn>

      <View style={styles.filterRow}>
        <View style={styles.filterPills}>
          {FILTERS.map((f) => (
            <Tappable
              key={f.k}
              onPress={() => setActiveFilter(f.id)}
              scaleTo={0.96}
              style={[
                styles.pill,
                { borderColor: f.on ? colors.ink : colors.rule, backgroundColor: f.on ? colors.ink : colors.white }
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: f.on ? colors.paper : f.alert ? colors.alert : colors.ink2 }
                ]}
              >
                {f.k}
              </Text>
              <Text
                style={[
                  styles.pillCount,
                  { color: f.on ? colors.paper : f.alert ? colors.alert : colors.ink2, opacity: 0.65 }
                ]}
              >
                {f.n}
              </Text>
            </Tappable>
          ))}
        </View>
        <Tappable
          onPress={() => setSortMode((current) => (current === "next" ? "name" : "next"))}
          scaleTo={0.96}
          accessibilityLabel={`Ordenar por ${sortMode === "next" ? "nombre" : "próxima cita"}`}
          style={styles.sortButton}
        >
          <Text style={styles.sortText}>
            Ordenar: {sortMode === "next" ? "próxima cita" : "nombre"} ↕
          </Text>
        </Tappable>
      </View>

      <View style={styles.mainCols}>
        <View style={styles.tableCard}>
          <View style={styles.tableHead}>
            <Text style={[styles.headCell, styles.colPatient]}>Paciente</Text>
            <Text style={[styles.headCell, styles.colPhone]}>Ubicación</Text>
            <Text style={[styles.headCell, styles.colDr]}>Médico</Text>
            <Text style={[styles.headCell, styles.colNext]}>Próxima</Text>
            <View style={styles.colMore} />
          </View>
          {sortedFiltered.length === 0 && !loading ? (
            <Text style={styles.empty}>Sin pacientes vinculados aún.</Text>
          ) : null}
          {sortedFiltered.map((row, i) => {
            const fullName = `${row.p.first_name} ${row.p.last_name}`.trim();
            const isSel = row.p.id === sel?.p.id;
            return (
              <Tappable
                key={row.p.id}
                onPress={() => setSelectedPatientId(row.p.id)}
                scaleTo={0.995}
                accessibilityLabel={`Seleccionar a ${fullName}`}
                accessibilityState={{ selected: isSel }}
                style={[
                  styles.tableRow,
                  { borderBottomWidth: i < sortedFiltered.length - 1 ? 1 : 0 },
                  isSel && styles.tableRowSelected
                ]}
              >
                <View style={[styles.colPatient, styles.patientCell]}>
                  <View style={styles.rowAvatar}>
                    <Text style={styles.rowAvatarText}>{initialsFromName(fullName)}</Text>
                  </View>
                  <View style={styles.flexShrink}>
                    <View style={styles.nameLine}>
                      <Text style={styles.patientName} numberOfLines={1} ellipsizeMode="tail">{fullName}</Text>
                    </View>
                    <Text style={styles.patientMeta} numberOfLines={1} ellipsizeMode="tail">
                      {row.p.gender ?? "—"} {ageFrom(row.p.date_of_birth)}a
                    </Text>
                  </View>
                </View>
                <Text style={[styles.colPhone, styles.cellMono]} numberOfLines={1} ellipsizeMode="tail">
                  {row.p.city ? `${row.p.city}${row.p.state ? `, ${row.p.state}` : ""}` : "—"}
                </Text>
                <Text style={[styles.colDr, styles.cellMono]} numberOfLines={1} ellipsizeMode="tail">{row.drLabel}</Text>
                <Text style={[styles.colNext, styles.cellMonoLight]} numberOfLines={1} ellipsizeMode="tail">{formatNext(row.next?.scheduled_at ?? null)}</Text>
                <View style={styles.colMore}>
                  <Icon kind="chev" size={14} color={colors.ink3} />
                </View>
              </Tappable>
            );
          })}
        </View>

        {sel ? (
          <View style={styles.asideCard}>
            <View style={styles.asideHead}>
              <RadialBlob
                size={200}
                color={colors.accentBright}
                opacity={0.3}
                edge={70}
                style={{ top: -60, right: -50 }}
              />
              <View style={styles.asideHeadRow}>
                <View style={styles.asideAvatar}>
                  <Text style={styles.asideAvatarText}>
                    {initialsFromName(`${sel.p.first_name} ${sel.p.last_name}`)}
                  </Text>
                </View>
                <View style={styles.flexShrink}>
                  <Text
                    style={styles.asideName}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                  >
                    {sel.p.first_name} {sel.p.last_name}
                  </Text>
                  <Text style={styles.asideMeta}>
                    {sel.p.gender ?? "—"} {ageFrom(sel.p.date_of_birth)}a · expediente #{sel.p.id}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.asideBody}>
              <Text style={[styles.eyebrow, styles.asideSection]}>Próxima cita</Text>
              {sel.next ? (
                <View style={styles.apptNext}>
                  <View style={styles.apptNextRow}>
                    <View style={styles.flexShrink}>
                      <Text style={styles.apptTitle}>
                        {sel.next.reason ?? "Consulta"} · {sel.drLabel}
                      </Text>
                      <Text style={styles.apptMeta}>
                        {formatNext(sel.next.scheduled_at)} · estado {statusLabel(sel.next.status)}
                      </Text>
                    </View>
                    <View style={styles.followBadge}>
                      <Text style={styles.followBadgeText}>SIGUE</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.apptPlain}>
                  <Text style={styles.apptPlainTitle}>Sin próxima cita</Text>
                  <Text style={styles.apptMeta}>agenda una nueva consulta</Text>
                </View>
              )}

              <Text style={[styles.eyebrow, styles.asideSectionTop]}>Datos</Text>
              <View style={styles.apptPlain}>
                <View style={styles.emergRow}>
                  <View style={styles.flexShrink}>
                    <Text style={styles.apptTitle}>
                      Nacido {formatDateLocal(sel.p.date_of_birth)}
                    </Text>
                    <Text style={styles.apptMeta}>
                      tipo {sel.p.blood_type ?? "—"} · sensibilidad {sel.p.sensitivity_level}
                    </Text>
                  </View>
                  <Tappable
                    onPress={() => goToScreen("sec-link")}
                    scaleTo={0.94}
                    style={styles.callBtn}
                  >
                    <Icon kind="link" size={13} color={colors.accentDeep} />
                  </Tappable>
                </View>
              </View>

              <View style={styles.asideActions}>
                <Button
                  label="Agendar"
                  variant="ghost"
                  size="sm"
                  onPress={() => goToScreen("sec-agenda", sel.next ? { doctorId: sel.next.doctor_id } : undefined)}
                  style={styles.asideBtn}
                />
                <Button
                  label="Vincular"
                  variant="ghost"
                  size="sm"
                  onPress={() => goToScreen("sec-link")}
                  style={styles.asideBtn}
                />
              </View>
            </View>
          </View>
        ) : null}
      </View>

      {!error && totalPatients > 0 ? (
        <Pagination
          page={page}
          limit={PAGE_SIZE}
          total={totalPatients}
          onChange={setPage}
          disabled={loading}
        />
      ) : null}
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
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
  empty: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    textAlign: "center",
    padding: 22
  },
  statRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 180,
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
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 18
  },
  filterPills: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center"
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1
  },
  pillText: {
    fontFamily: family.medium,
    fontSize: 12.5
  },
  pillCount: {
    fontFamily: family.mono,
    fontSize: 10
  },
  sortText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  sortButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 9,
    backgroundColor: colors.white
  },
  mainCols: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 14
  },
  tableCard: {
    flexGrow: 1.6,
    flexBasis: 460,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  tableHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
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
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderBottomColor: colors.rule3,
    borderLeftWidth: 3,
    borderLeftColor: "transparent"
  },
  tableRowSelected: {
    backgroundColor: colors.paper3,
    borderLeftColor: colors.accent
  },
  colPatient: {
    flexGrow: 2,
    flexBasis: 0,
    minWidth: 0
  },
  colPhone: {
    flexGrow: 1.2,
    flexBasis: 0,
    minWidth: 0
  },
  colDr: {
    flexGrow: 1.2,
    flexBasis: 0,
    minWidth: 0
  },
  colNext: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 0
  },
  colMore: {
    width: 40,
    alignItems: "flex-end"
  },
  patientCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  flexShrink: {
    flexShrink: 1,
    minWidth: 0
  },
  rowAvatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.paper4,
    alignItems: "center",
    justifyContent: "center"
  },
  rowAvatarText: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.ink
  },
  nameLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  patientName: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink
  },
  patientMeta: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3
  },
  cellMono: {
    fontFamily: family.mono,
    fontSize: 11.5,
    color: colors.ink2
  },
  cellMonoLight: {
    fontFamily: family.mono,
    fontSize: 11.5,
    color: colors.ink3
  },
  asideCard: {
    flexGrow: 1,
    flexBasis: 320,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden",
    alignSelf: "flex-start"
  },
  asideHead: {
    paddingHorizontal: 22,
    paddingVertical: 20,
    backgroundColor: colors.ink,
    overflow: "hidden"
  },
  asideHeadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  asideAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.accentBright,
    alignItems: "center",
    justifyContent: "center"
  },
  asideAvatarText: {
    fontFamily: family.serifItalic,
    fontSize: 20,
    color: colors.ink
  },
  asideName: {
    fontFamily: family.serifItalic,
    fontSize: 22,
    lineHeight: 25,
    letterSpacing: -0.44,
    color: colors.paper
  },
  asideMeta: {
    fontFamily: family.mono,
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4
  },
  asideBody: {
    padding: 16
  },
  asideSection: {
    marginBottom: 4
  },
  asideSectionTop: {
    marginTop: 14,
    marginBottom: 4
  },
  apptNext: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.md,
    marginBottom: 6
  },
  apptNextRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  apptTitle: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  apptMeta: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 2
  },
  followBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.accentBright,
    alignSelf: "flex-start"
  },
  followBadgeText: {
    fontFamily: family.mono,
    fontSize: 9,
    letterSpacing: 0.54,
    color: colors.ink
  },
  apptPlain: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.paper,
    borderRadius: radii.md,
    marginBottom: 6
  },
  apptPlainTitle: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink
  },
  emergRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  callBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  asideActions: {
    flexDirection: "row",
    gap: 6,
    marginTop: 14
  },
  asideBtn: {
    flex: 1
  }
});
