import { ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/atomic/atoms/Avatar";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { StatTile } from "@/atomic/molecules/StatTile";
import { IconTabBar } from "@/atomic/organisms/IconTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { directorTabs } from "@/navigation/tabConfigs";
import { Patient, fetchPatientsList } from "@/services/api/patientsApi";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

function initials(first: string, last: string): string {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

function Header({ total }: { total: number }): ReactNode {
  return (
    <>
      <ScreenTopBar sub={`${total} expediente${total === 1 ? "" : "s"} vinculado${total === 1 ? "" : "s"}`} title="Pacientes" />
      <View style={styles.tools}>
        <View style={styles.statRow}>
          <StatTile label="Total" value={String(total)} sub="institución" />
          <StatTile label="Cartera" value={String(total)} sub="activos" />
        </View>
      </View>
    </>
  );
}

export function DirPatientsMobilePage() {
  const [patients, setPatients] = useState<Patient[] | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fetchPatientsList({ limit: 100 })
      .then((res) => {
        if (!alive) return;
        setPatients(res.items);
        setTotal(res.total);
      })
      .catch(() => {
        if (alive) setError("No pudimos cargar los pacientes.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <MobileScreen
      tabBar={<IconTabBar tabs={directorTabs} active={4} />}
      header={<Header total={total} />}
      contentStyle={styles.content}
    >
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : !patients || patients.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Sin pacientes vinculados</Text>
          <Text style={styles.emptyText}>Aparecerán cuando se registren en la institución.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {patients.map((p, index) => (
            <FadeIn key={p.id} delay={index * 30}>
              <View style={styles.row}>
                <Avatar
                  initials={initials(p.first_name, p.last_name)}
                  size={30}
                  radius={9}
                  bg={colors.paper4}
                  fg={colors.ink}
                  fontSize={11}
                />
                <View style={styles.flex}>
                  <Text style={styles.name}>{`${p.first_name} ${p.last_name}`}</Text>
                  <Text style={styles.sub}>
                    {p.gender ?? "·"} · {p.blood_type ?? "—"} · {p.city ?? "—"}
                  </Text>
                </View>
                <Text style={styles.last}>{new Date(p.created_at).toLocaleDateString()}</Text>
              </View>
            </FadeIn>
          ))}
        </View>
      )}
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
    paddingBottom: 12,
    backgroundColor: colors.paper
  },
  statRow: {
    flexDirection: "row",
    gap: 8
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
  last: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3
  },
  center: {
    paddingVertical: 40,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    paddingVertical: 18,
    textAlign: "center"
  },
  emptyBox: {
    paddingHorizontal: 14,
    paddingVertical: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    alignItems: "center",
    gap: 4
  },
  emptyTitle: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  emptyText: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    textAlign: "center"
  }
});
