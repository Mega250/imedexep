import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { superadminNav } from "@/navigation/desktopNavConfigs";
import { goToScreen } from "@/navigation/screenRouter";
import {
  fetchInstitutions,
  fetchInstitutionAdmins,
  Institution,
  InstitutionAdmin
} from "@/services/api/institutionsApi";
import { getSelectedInstitutionId, setSelectedInstitutionId } from "@/state/selectedInstitution";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

type AdminRow = {
  key: string;
  name: string;
  email: string;
  inst: string;
  institutionId: number;
  role: string;
  active: boolean;
};

function lastTwoInitials(name: string): string {
  if (!name) {
    return "··";
  }
  return name
    .split(" ")
    .slice(-2)
    .map((s) => s[0] ?? "")
    .join("") || name.slice(0, 2).toUpperCase();
}

function stateColors(active: boolean) {
  if (active) {
    return { bg: colors.okSoft, fg: colors.ok };
  }
  return { bg: colors.alertSoft, fg: colors.alert };
}

function FilterPill({
  label,
  count,
  on
}: {
  label: string;
  count: number;
  on: boolean;
}) {
  const bg = on ? colors.ink : colors.white;
  const border = on ? colors.ink : colors.rule;
  const fg = on ? colors.paper : colors.ink2;
  return (
    <View style={[styles.pill, { borderColor: border, backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color: fg }]}>{label}</Text>
      <Text style={[styles.pillCount, { color: fg, opacity: 0.65 }]}>{count}</Text>
    </View>
  );
}

export function SAAdminsDesktopPage() {
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [instCount, setInstCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

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
              name: full,
              email: a.email ?? "",
              inst: r.inst.name,
              institutionId: r.inst.id,
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

  const activeCount = rows.filter((r) => r.active).length;
  const inactiveCount = rows.length - activeCount;

  const displayedRows = rows.filter((r) => {
    if (filter === "active") {
      return r.active;
    }
    if (filter === "inactive") {
      return !r.active;
    }
    return true;
  });

  const STATS: [string, string, string][] = [
    ["Total administradores", String(rows.length), `${instCount} instituciones consultadas`],
    ["Activos", String(activeCount), "is_active = true"],
    ["Inactivos", String(inactiveCount), "deshabilitados"],
    ["Cobertura", `${Math.min(instCount, 10)} / ${instCount}`, "instituciones consultadas"]
  ];

  const FILTERS: [string, number, "all" | "active" | "inactive"][] = [
    ["Todos", rows.length, "all"],
    ["Activos", activeCount, "active"],
    ["Inactivos", inactiveCount, "inactive"]
  ];

  return (
    <DesktopShell
      nav={superadminNav}
      activeScreen="sa-admins"
      role="superadmin · root"
      roleBadge="Superadmin"
      title="Administradores de institución"
      eyebrow={`${rows.length} cuentas · ${instCount} instituciones`}
      topBarRight={
        <Button
          label="Crear administrador"
          variant="accent"
          size="sm"
          block={false}
          height={42}
          radius={radii.md}
          iconLeft="plus"
          onPress={() => {
            if (getSelectedInstitutionId() !== null) {
              goToScreen("sa-inst-detail", { openAdminForm: 1 });
            } else {
              goToScreen("sa-inst");
            }
          }}
        />
      }
    >
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FadeIn>
        <View style={styles.statRow}>
          {STATS.map(([k, n, sub]) => (
            <View key={k} style={styles.statCard}>
              <Text style={styles.eyebrow}>{k}</Text>
              <Text style={styles.statValue}>{n}</Text>
              <Text style={styles.statSub}>{sub}</Text>
            </View>
          ))}
        </View>
      </FadeIn>

      <View style={styles.filterRow}>
        <View style={styles.filterPills}>
          {FILTERS.map(([k, n, key]) => (
            <Tappable key={k} onPress={() => setFilter(key)} scaleTo={0.97}>
              <FilterPill label={k} count={n} on={filter === key} />
            </Tappable>
          ))}
        </View>
      </View>

      <FadeIn delay={80}>
        <View style={styles.tableCard}>
          <View style={styles.tableHead}>
            <Text style={[styles.headCell, styles.colAdmin]}>Administrador</Text>
            <Text style={[styles.headCell, styles.colInst]}>Institución</Text>
            <Text style={[styles.headCell, styles.colRole]}>Rol</Text>
            <Text style={[styles.headCell, styles.colLast]}>Estado</Text>
            <Text style={[styles.headCell, styles.colState]}>Activa</Text>
            <View style={styles.colMore} />
          </View>
          {displayedRows.length === 0 && !loading ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>
                {rows.length === 0 ? "Sin administradores" : "Sin resultados"}
              </Text>
              <Text style={styles.emptySub}>
                {rows.length === 0
                  ? "Asigna administradores desde el detalle de cada institución."
                  : "Ajusta el filtro para ver más."}
              </Text>
            </View>
          ) : (
            displayedRows.map((a, i) => {
              const stc = stateColors(a.active);
              return (
                <Tappable
                  key={a.key}
                  onPress={() => {
                    setSelectedInstitutionId(a.institutionId);
                    goToScreen("sa-inst-detail");
                  }}
                  scaleTo={0.995}
                >
                  <View
                    style={[
                      styles.tableRow,
                      { borderBottomWidth: i < displayedRows.length - 1 ? 1 : 0 }
                    ]}
                  >
                    <View style={[styles.colAdmin, styles.adminCell]}>
                      <View style={styles.rowAvatar}>
                        <Text style={styles.rowAvatarText}>{lastTwoInitials(a.name)}</Text>
                      </View>
                      <View style={styles.flexShrink}>
                        <Text style={styles.adminName} numberOfLines={1} ellipsizeMode="tail">{a.name}</Text>
                        <Text style={styles.adminEmail} numberOfLines={1} ellipsizeMode="tail">{a.email}</Text>
                      </View>
                    </View>
                    <Text style={[styles.colInst, styles.instText]} numberOfLines={1} ellipsizeMode="tail">
                      {a.inst}
                    </Text>
                    <Text style={[styles.colRole, styles.roleText]} numberOfLines={1} ellipsizeMode="tail">{a.role}</Text>
                    <Text style={[styles.colLast, styles.lastText]} numberOfLines={1} ellipsizeMode="tail">
                      {a.active ? "activo" : "inactivo"}
                    </Text>
                    <View style={styles.colState}>
                      <View style={[styles.statePill, { backgroundColor: stc.bg }]}>
                        <Text style={[styles.statePillText, { color: stc.fg }]}>
                          {a.active ? "activo" : "inactivo"}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.colMore}>
                      <Icon kind="chev" size={14} color={colors.ink3} />
                    </View>
                  </View>
                </Tappable>
              );
            })
          )}
        </View>
      </FadeIn>
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
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
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",
    gap: 6
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
    textAlign: "center"
  },
  eyebrow: {
    ...text.eyebrow,
    color: colors.ink3
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
    marginTop: 18,
    flexWrap: "wrap"
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
  tableCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden",
    marginTop: 14
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
    paddingVertical: 12,
    borderBottomColor: colors.rule3
  },
  colAdmin: {
    flexGrow: 1.8,
    flexBasis: 0,
    minWidth: 0
  },
  colInst: {
    flexGrow: 1.6,
    flexBasis: 0,
    minWidth: 0
  },
  colRole: {
    flexGrow: 1.4,
    flexBasis: 0,
    minWidth: 0
  },
  colLast: {
    flexGrow: 0.8,
    flexBasis: 0,
    minWidth: 0
  },
  colState: {
    flexGrow: 0.8,
    flexBasis: 0,
    minWidth: 0
  },
  colMore: {
    width: 40,
    alignItems: "flex-end"
  },
  adminCell: {
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
    borderRadius: 9,
    backgroundColor: colors.paper4,
    alignItems: "center",
    justifyContent: "center"
  },
  rowAvatarText: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.ink
  },
  adminName: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink
  },
  adminEmail: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3
  },
  instText: {
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.ink2
  },
  roleText: {
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.ink2
  },
  lastText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  statePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: "flex-start"
  },
  statePillText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    letterSpacing: 0.57,
    textTransform: "uppercase"
  }
});
