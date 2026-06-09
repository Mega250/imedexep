import { ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/atomic/atoms/Avatar";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { SectionLabel } from "@/atomic/atoms/SectionLabel";
import { Tappable } from "@/atomic/atoms/Tappable";
import { FAB } from "@/atomic/molecules/FAB";
import { DoctorTabBar } from "@/atomic/organisms/DoctorTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goToScreen } from "@/navigation/screenRouter";
import { Patient, fetchPatientsList } from "@/services/api/patientsApi";
import { setSelectedPatientId } from "@/services/api/selectedPatient";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

function initialsFor(p: Patient): string {
  return ((p.first_name?.[0] ?? "") + (p.last_name?.[0] ?? "")).toUpperCase() || "?";
}

function ageFrom(dob: string): number | null {
  if (!dob) {
    return null;
  }
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) {
    age--;
  }
  return age;
}

function sexSymbol(gender: string | null): string {
  if (!gender) {
    return "·";
  }
  const g = gender.toLowerCase();
  if (g.startsWith("f")) {
    return "♀";
  }
  if (g.startsWith("m")) {
    return "♂";
  }
  return "·";
}

function Header({ total }: { total: number }): ReactNode {
  return (
    <>
      <ScreenTopBar sub={`${total} pacientes vinculados`} title="Mis Pacientes" />
      <View style={styles.tools}>
        <View style={styles.search}>
          <Icon kind="search" size={16} color={colors.ink3} />
          <Text style={styles.searchText}>Nombre, CURP, código…</Text>
          <View style={styles.filterBtn}>
            <Icon kind="filter" size={13} color={colors.accentDeep} />
          </View>
        </View>
      </View>
    </>
  );
}

export function MPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPatientsList({ page: 1, limit: 100 });
        if (!cancelled) {
          setPatients(data.items ?? []);
          setTotal(data.total ?? 0);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar tus pacientes.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function openPatient(id: number) {
    await setSelectedPatientId(id);
    goToScreen("doc-full-mob");
  }

  return (
    <MobileScreen
      tabBar={<DoctorTabBar active={1} />}
      header={<Header total={total} />}
      floating={<FAB icon="qr" label="Vincular" onPress={() => goToScreen("doc-qr-mob")} />}
      contentStyle={styles.content}
    >
      <SectionLabel
        label={loading ? "Cargando…" : `${patients.length} pacientes`}
        style={styles.listLabel}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}

      {!loading && !error && patients.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Aún no tienes pacientes vinculados.</Text>
          <Text style={styles.emptyMeta}>Usa el botón "Vincular" para escanear un QR.</Text>
        </View>
      ) : null}

      <View style={styles.list}>
        {patients.map((p, index) => {
          const age = ageFrom(p.date_of_birth);
          const meta = `${sexSymbol(p.gender)} ${age !== null ? `${age}a` : "—"}${p.blood_type ? ` · ${p.blood_type}` : ""}${p.city ? ` · ${p.city}` : ""}`;
          return (
            <FadeIn key={p.id} delay={index * 30}>
              <Tappable scaleTo={0.98} onPress={() => openPatient(p.id)}>
                <View
                  style={[
                    styles.row,
                    { backgroundColor: colors.white, borderColor: colors.rule }
                  ]}
                >
                  <Avatar
                    initials={initialsFor(p)}
                    size={40}
                    radius={12}
                    bg={colors.paper4}
                    fg={colors.ink}
                    fontSize={13}
                  />
                  <View style={styles.flex}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                        {p.first_name} {p.last_name}
                      </Text>
                    </View>
                    <Text style={styles.meta} numberOfLines={1} ellipsizeMode="tail">{meta}</Text>
                  </View>
                  <Icon kind="chev" size={14} color={colors.ink3} />
                </View>
              </Tappable>
            </FadeIn>
          );
        })}
      </View>
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 130
  },
  flex: {
    flex: 1,
    minWidth: 0
  },
  tools: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: colors.paper
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 44,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white,
    borderRadius: radii.md
  },
  searchText: {
    flex: 1,
    fontFamily: family.regular,
    fontSize: 13.5,
    color: colors.ink3
  },
  filterBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  listLabel: {
    marginBottom: 10
  },
  loading: {
    paddingVertical: 16,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginBottom: 10
  },
  empty: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: colors.rule2,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    alignItems: "center",
    gap: 6
  },
  emptyTitle: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink
  },
  emptyMeta: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  list: {
    gap: 8
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: radii.md
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  name: {
    flexShrink: 1,
    minWidth: 0,
    fontFamily: family.medium,
    fontSize: 14,
    color: colors.ink
  },
  meta: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 2
  }
});
