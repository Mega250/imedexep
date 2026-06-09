import { ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/atomic/atoms/Avatar";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Pill } from "@/atomic/atoms/Pill";
import { FAB } from "@/atomic/molecules/FAB";
import { IconTabBar } from "@/atomic/organisms/IconTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { superadminTabs } from "@/navigation/tabConfigs";
import { goToScreen } from "@/navigation/screenRouter";
import {
  fetchInstitutions,
  fetchInstitutionAdmins,
  Institution,
  InstitutionAdmin
} from "@/services/api/institutionsApi";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

type AdminRow = {
  key: string;
  fullName: string;
  email: string;
  institution: string;
  role: string;
  active: boolean;
};

function initials(name: string): string {
  if (!name) {
    return "··";
  }
  return name
    .split(" ")
    .slice(-2)
    .map((s) => s[0] ?? "")
    .join("") || name.slice(0, 2).toUpperCase();
}

function Header({ total, instCount }: { total: number; instCount: number }): ReactNode {
  const filters: { label: string; count: number }[] = [
    { label: "Todos", count: total },
    { label: "Instituciones", count: instCount }
  ];
  return (
    <>
      <ScreenTopBar sub={`${total} cuentas · ${instCount} instituciones`} title="Administradores" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        style={styles.filterBar}
      >
        {filters.map((f, i) => (
          <Pill key={f.label} label={f.label} on={i === 0} count={f.count} />
        ))}
      </ScrollView>
    </>
  );
}

export function SAAdminsMobilePage() {
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [instCount, setInstCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const insts: Institution[] = await fetchInstitutions();
        if (!cancelled) {
          setInstCount(insts.length);
        }
        const slice = insts.slice(0, 10);
        const results = await Promise.all(
          slice.map((i) =>
            fetchInstitutionAdmins(i.id)
              .then((adm: InstitutionAdmin[]) => ({ inst: i, admins: adm }))
              .catch(() => ({ inst: i, admins: [] as InstitutionAdmin[] }))
          )
        );
        const merged: AdminRow[] = [];
        for (const r of results) {
          for (const a of r.admins) {
            const full =
              a.admin_name?.trim() ||
              `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim() ||
              a.email ||
              "Sin nombre";
            merged.push({
              key: `${r.inst.id}-${a.id}`,
              fullName: full,
              email: a.email ?? "",
              institution: r.inst.name,
              role: a.role ?? "admin",
              active: a.is_active !== false
            });
          }
        }
        if (!cancelled) {
          setRows(merged);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar administradores.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <MobileScreen
      tabBar={<IconTabBar tabs={superadminTabs} active={2} />}
      header={<Header total={rows.length} instCount={instCount} />}
      floating={<FAB icon="plus" label="Crear" onPress={() => goToScreen("sa-inst")} />}
      contentStyle={styles.content}
    >
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!loading && rows.length === 0 && !error ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Sin administradores</Text>
          <Text style={styles.emptySub}>
            Asigna administradores desde el detalle de cada institución.
          </Text>
        </View>
      ) : null}

      <View style={styles.list}>
        {rows.map((a, index) => (
          <FadeIn key={a.key} delay={index * 45}>
            <View style={styles.row}>
              <Avatar
                initials={initials(a.fullName)}
                size={34}
                radius={9}
                bg={colors.paper4}
                fg={colors.ink}
                fontSize={11}
              />
              <View style={styles.flex}>
                <Text style={styles.name} numberOfLines={1}>
                  {a.fullName}
                </Text>
                <Text style={styles.sub} numberOfLines={1}>
                  {a.institution} · {a.role}
                </Text>
              </View>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: a.active ? colors.ok : colors.alert }
                ]}
              />
            </View>
          </FadeIn>
        ))}
      </View>
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 130
  },
  flex: {
    flex: 1
  },
  loading: {
    paddingVertical: 12,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginBottom: 10
  },
  emptyBox: {
    paddingHorizontal: 14,
    paddingVertical: 24,
    alignItems: "center"
  },
  emptyTitle: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink2
  },
  emptySub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 4,
    textAlign: "center"
  },
  filterBar: {
    backgroundColor: colors.paper
  },
  filters: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 2,
    gap: 6
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
    marginTop: 2
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 99
  }
});
