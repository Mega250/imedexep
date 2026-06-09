import { ReactNode, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/atomic/atoms/Avatar";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Pill } from "@/atomic/atoms/Pill";
import { Tappable } from "@/atomic/atoms/Tappable";
import { FAB } from "@/atomic/molecules/FAB";
import { StatTile } from "@/atomic/molecules/StatTile";
import { IconTabBar } from "@/atomic/organisms/IconTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goToScreen } from "@/navigation/screenRouter";
import { secretaryTabs } from "@/navigation/tabConfigs";
import { Appointment, fetchAppointments } from "@/services/api/appointmentsApi";
import { Doctor } from "@/services/api/doctorsApi";
import { Patient, fetchPatientsList } from "@/services/api/patientsApi";
import { Pagination } from "@/atomic/molecules/Pagination";

const PAGE_SIZE = 20;
import { fetchInstitutionDoctors } from "@/services/api/secretaryApi";
import { silentOrEmpty } from "@/services/api/silent";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";
import { formatApptDateTime, formatApptTime } from "@/utils/dates";

function initials(name: string): string {
  return name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatNext(value: string | null): string {
  if (!value) return "—";
  if (isSameDay(new Date(value), new Date())) {
    return `hoy ${formatApptTime(value)}`;
  }
  return formatApptDateTime(value, { day: "numeric", month: "short" });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

type Header = {
  total: number;
  todayCount: number;
};

function HeaderBlock({
  header,
  filters,
  activeFilter,
  onFilter
}: {
  header: Header;
  filters: { id: string; label: string; count: number; tone?: "alert" }[];
  activeFilter: string;
  onFilter: (id: string) => void;
}): ReactNode {
  return (
    <>
      <ScreenTopBar
        sub={`${header.total} expedientes · ${header.todayCount} con cita hoy`}
        title="Pacientes"
      />
      <View style={styles.tools}>
        <View style={styles.statRow}>
          <StatTile label="Con cita hoy" value={String(header.todayCount)} sub="agenda del día" />
          <StatTile
            label="Total"
            value={String(header.total)}
            sub="vinculados a la clínica"
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {filters.map((f) => (
            <Tappable key={f.id} onPress={() => onFilter(f.id)} scaleTo={0.96}>
              <Pill label={f.label} on={activeFilter === f.id} count={f.count} tone={f.tone} />
            </Tappable>
          ))}
        </ScrollView>
      </View>
    </>
  );
}

export function SecPatientsMobilePage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [page, setPage] = useState(1);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");

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
          silentOrEmpty(fetchInstitutionDoctors(), "SecPatientsMobilePage.fetchInstitutionDoctors")
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

  const doctorMap = useMemo(() => {
    const m = new Map<number, Doctor>();
    doctors.forEach((d) => m.set(d.id, d));
    return m;
  }, [doctors]);

  const today = new Date();

  const enriched = useMemo(() => {
    return patients.map((p) => {
      const patientAppts = appointments
        .filter((a) => a.patient_id === p.id)
        .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
      const upcoming = patientAppts
        .filter((a) => new Date(a.scheduled_at).getTime() >= Date.now() && a.status !== "cancelled")
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
      const latest = patientAppts[0] ?? null;
      const treating = latest ? doctorMap.get(latest.doctor_id) : null;
      const drLabel = treating ? `Dr. ${treating.last_name}` : "—";
      const next = upcoming[0] ?? null;
      return { p, drLabel, next };
    });
  }, [patients, appointments, doctorMap]);

  const todayAppointments = appointments.filter((a) => isSameDay(new Date(a.scheduled_at), today));
  const todayPatientIds = useMemo(
    () => new Set(todayAppointments.map((a) => a.patient_id)),
    [todayAppointments]
  );
  const todayCount = todayAppointments.length;

  const filters: { id: string; label: string; count: number; tone?: "alert" }[] = [
    { id: "all", label: "Todos", count: patients.length },
    { id: "today", label: "Con cita hoy", count: todayPatientIds.size },
    ...doctors.slice(0, 3).map((d) => ({
      id: `doctor:${d.id}`,
      label: `Dr. ${d.last_name}`,
      count: enriched.filter((row) => row.drLabel === `Dr. ${d.last_name}`).length
    }))
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

  return (
    <MobileScreen
      tabBar={<IconTabBar tabs={secretaryTabs} active={1} />}
      header={
        <HeaderBlock
          header={{ total: patients.length, todayCount }}
          filters={filters}
          activeFilter={activeFilter}
          onFilter={setActiveFilter}
        />
      }
      floating={<FAB icon="plus" label="Vincular" onPress={() => goToScreen("sec-link-mob")} />}
      contentStyle={styles.content}
    >
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.list}>
        {filtered.length === 0 && !loading ? (
          <Text style={styles.empty}>Aún no tienes pacientes vinculados.</Text>
        ) : null}
        {filtered.map((row, index) => {
          const fullName = `${row.p.first_name} ${row.p.last_name}`.trim();
          return (
            <FadeIn key={row.p.id} delay={index * 40}>
              <View style={styles.row}>
                <Avatar
                  initials={initials(fullName)}
                  size={30}
                  radius={9}
                  bg={colors.paper4}
                  fg={colors.ink}
                  fontSize={11}
                />
                <View style={styles.flex}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{fullName}</Text>
                  </View>
                  <Text style={styles.sub}>{row.drLabel}</Text>
                </View>
                <Text style={styles.next}>{formatNext(row.next?.scheduled_at ?? null)}</Text>
              </View>
            </FadeIn>
          );
        })}
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
  empty: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    paddingVertical: 16,
    textAlign: "center"
  },
  tools: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.paper
  },
  statRow: {
    flexDirection: "row",
    gap: 8
  },
  filters: {
    gap: 6,
    paddingVertical: 12
  },
  list: {
    gap: 6
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md
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
    marginTop: 1
  },
  next: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3
  }
});
