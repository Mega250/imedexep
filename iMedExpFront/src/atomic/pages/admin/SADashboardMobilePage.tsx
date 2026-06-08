import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Card } from "@/atomic/atoms/Card";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { DarkPanel } from "@/atomic/molecules/DarkPanel";
import { Section } from "@/atomic/molecules/Section";
import { StatTile } from "@/atomic/molecules/StatTile";
import { IconTabBar } from "@/atomic/organisms/IconTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { superadminTabs } from "@/navigation/tabConfigs";
import { fetchInstitutions, Institution } from "@/services/api/institutionsApi";
import { AdminStats, AuditEvent, fetchAdminStats, fetchAuditEvents } from "@/services/api/adminApi";
import { silentOrNull } from "@/services/api/silent";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

export function SADashboardMobilePage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recent, setRecent] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [inst, st, ev] = await Promise.all([
          fetchInstitutions(),
          silentOrNull(fetchAdminStats(), "SADashboardMobilePage.stats"),
          silentOrNull(fetchAuditEvents(6), "SADashboardMobilePage.audit")
        ]);
        if (!cancelled) {
          setInstitutions(Array.isArray(inst) ? inst : []);
          setStats(st);
          setRecent(Array.isArray(ev) ? ev : []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar el tablero.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalInst = institutions.length;
  const activeInst = institutions.filter((i) => i.is_active !== false).length;
  const docsLabel = stats ? String(stats.doctors) : "—";
  const patientsLabel = stats ? String(stats.patients) : "—";

  const STATS: [string, string, string, boolean][] = [
    ["Instituciones", String(totalInst), `${activeInst} activas`, false],
    ["Médicos", docsLabel, "en la plataforma", false],
    ["Pacientes", patientsLabel, "en la plataforma", false],
    ["Eventos · 24 h", stats ? String(stats.events_24h) : "—", "bitácora del sistema", false]
  ];

  return (
    <MobileScreen
      tabBar={<IconTabBar tabs={superadminTabs} active={0} />}
      header={<ScreenTopBar sub="Tablero superadmin" title="Tablero global" accent />}
      contentStyle={styles.content}
    >
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FadeIn>
        <DarkPanel radius={radii.lg} padding={18} blobSize={220} blobTop={-80} blobRight={-60}>
          <Text style={styles.heroEyebrow}>Estado de la red</Text>
          <Text style={styles.heroTitle}>
            {totalInst} clínicas{"\n"}{docsLabel} médicos{"\n"}{patientsLabel} pacientes
          </Text>
          <Text style={styles.heroMeta}>{activeInst} activas · datos en vivo</Text>
        </DarkPanel>
      </FadeIn>

      <FadeIn delay={70}>
        <View style={styles.statGrid}>
          {STATS.map(([k, n, s, alert]) => (
            <StatTile
              key={k}
              label={k}
              value={n}
              sub={s}
              valueColor={alert ? colors.alert : colors.ink}
              style={styles.statCell}
            />
          ))}
        </View>
      </FadeIn>

      <FadeIn delay={120}>
        <Section title="Auditoría">
          <Card radius={radii.lg}>
            <View style={styles.auditBox}>
              <Text style={styles.auditBig}>{stats ? stats.events_24h : "—"}</Text>
              <Text style={styles.auditSub}>
                eventos en 24 h · {stats ? stats.events_total : "—"} en total
              </Text>
              {recent.length > 0 ? (
                <View style={styles.recentList}>
                  {recent.map((e, i) => (
                    <Text key={i} style={styles.recentRow} numberOfLines={1}>
                      {e.operation} · {e.table_name} · {e.app_user_role ?? "sistema"}
                    </Text>
                  ))}
                </View>
              ) : null}
            </View>
          </Card>
        </Section>
      </FadeIn>

      <FadeIn delay={170}>
        <Section title="Distribución de usuarios">
          <Card radius={radii.lg}>
            <View style={styles.distList}>
              {([
                ["Pacientes", stats?.patients],
                ["Médicos", stats?.doctors],
                ["Secretarias", stats?.secretaries],
                ["Directores", stats?.institution_admins],
                ["Superadmins", stats?.superadmins]
              ] as [string, number | undefined][]).map(([k, n]) => (
                <View key={k} style={styles.distRow}>
                  <Text style={styles.distLabel}>{k}</Text>
                  <Text style={styles.distCount}>{n ?? "—"}</Text>
                </View>
              ))}
            </View>
          </Card>
        </Section>
      </FadeIn>

      <FadeIn delay={210}>
        <Section title="Instituciones · listado">
          {totalInst === 0 && !loading ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No hay instituciones registradas</Text>
              <Text style={styles.emptySub}>Crea la primera desde el listado.</Text>
            </View>
          ) : (
            institutions.slice(0, 5).map((it, index) => (
              <View key={it.id} style={styles.topRow}>
                <View style={styles.rank}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <Text style={styles.topName} numberOfLines={1}>
                  {it.name}
                </Text>
                <Text style={styles.topDrs}>{it.city ?? "—"}</Text>
              </View>
            ))
          )}
        </Section>
      </FadeIn>
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 120
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
  heroEyebrow: {
    fontFamily: family.mono,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.6)"
  },
  heroTitle: {
    fontFamily: family.serifItalic,
    fontSize: 30,
    lineHeight: 32,
    color: colors.paper,
    marginTop: 6
  },
  heroMeta: {
    fontFamily: family.mono,
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    marginTop: 8
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14
  },
  statCell: {
    width: "48%",
    maxWidth: "48%",
    flexBasis: "48%",
    flexGrow: 0,
    flexShrink: 0
  },
  auditBox: {
    paddingHorizontal: 16,
    paddingVertical: 18
  },
  auditBig: {
    fontFamily: family.medium,
    fontSize: 36,
    letterSpacing: -1,
    lineHeight: 38,
    color: colors.ink
  },
  auditSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 6
  },
  recentList: {
    marginTop: 12,
    gap: 6
  },
  recentRow: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink2
  },
  distList: {
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  distRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  distLabel: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink2
  },
  distCount: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  emptyBox: {
    paddingHorizontal: 14,
    paddingVertical: 18,
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
    marginTop: 4
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    marginBottom: 6
  },
  rank: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center"
  },
  rankText: {
    fontFamily: family.serifItalic,
    fontSize: 12,
    color: colors.paper
  },
  topName: {
    flex: 1,
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  topDrs: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  }
});
