import { ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { superadminNav } from "@/navigation/desktopNavConfigs";
import { goToScreen } from "@/navigation/screenRouter";
import { fetchInstitutions, Institution } from "@/services/api/institutionsApi";
import { AdminStats, AuditEvent, fetchAdminStats, fetchAuditEvents } from "@/services/api/adminApi";
import { silentOrNull } from "@/services/api/silent";
import { setSelectedInstitutionId } from "@/state/selectedInstitution";
import { colors, radii, shadow } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

function StatCard({
  k,
  n,
  sub,
  alert
}: {
  k: string;
  n: string;
  sub: string;
  alert?: boolean;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.eyebrow}>{k}</Text>
      <Text style={[styles.statValue, alert ? { color: colors.mid } : null]}>{n}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );
}

function Card({
  title,
  action,
  children
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.cardTitle}>{title}</Text>
        {action}
      </View>
      {children}
    </View>
  );
}

export function SADashDesktopPage() {
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
          silentOrNull(fetchAdminStats(), "SADashDesktopPage.stats"),
          silentOrNull(fetchAuditEvents(6), "SADashDesktopPage.audit")
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

  function openDetail(id: number): void {
    setSelectedInstitutionId(id);
    goToScreen("sa-inst-detail");
  }

  const totalInst = institutions.length;
  const activeInst = institutions.filter((i) => i.is_active !== false).length;
  const docsLabel = stats ? String(stats.doctors) : "—";
  const patientsLabel = stats ? String(stats.patients) : "—";

  const STAT_BAND: [string, string, string, boolean][] = [
    ["Instituciones", String(totalInst), `${activeInst} activas`, false],
    ["Médicos", docsLabel, "en la plataforma", false],
    ["Pacientes", patientsLabel, "en la plataforma", false],
    ["Eventos · 24 h", stats ? String(stats.events_24h) : "—", "bitácora del sistema", false]
  ];

  return (
    <DesktopShell
      nav={superadminNav}
      activeScreen="sa-dash"
      role="superadmin · root"
      roleBadge="Superadmin"
      title="Tablero global"
      eyebrow={`${totalInst} instituciones · datos en vivo`}
      searchPlaceholder="Buscar institución, evento, usuario…"
      topBarRight={
        <Button
          label="Nueva institución"
          variant="accent"
          size="sm"
          block={false}
          height={42}
          radius={radii.md}
          iconLeft="plus"
          onPress={() => goToScreen("sa-inst")}
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
        <View style={styles.heroBand}>
          <View style={styles.heroDark}>
            <RadialBlob
              size={360}
              color="rgba(0,180,216,0.32)"
              opacity={1}
              edge={70}
              style={{ top: -120, right: -80 }}
            />
            <View style={styles.heroInner}>
              <Text style={[styles.eyebrow, styles.heroEyebrow]}>Estado de la red · ahora</Text>
              <Text
                style={styles.heroTitle}
                numberOfLines={3}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {totalInst} instituciones{"\n"}{docsLabel} médicos{"\n"}{patientsLabel} pacientes
              </Text>
              <Text style={styles.heroMeta}>{activeInst} instituciones activas</Text>
            </View>
          </View>
          <View style={styles.heroSideCol}>
            <StatCard k="Instituciones activas" n={String(activeInst)} sub="estado is_active" />
          </View>
          <View style={styles.heroSideCol}>
            <StatCard
              k="Médicos totales"
              n={docsLabel}
              sub="agregado de /doctors"
            />
          </View>
        </View>
      </FadeIn>

      <FadeIn delay={80}>
        <View style={styles.statRow}>
          {STAT_BAND.map(([k, n, sub, alert]) => (
            <View key={k} style={styles.statBandItem}>
              <StatCard k={k} n={n} sub={sub} alert={alert} />
            </View>
          ))}
        </View>
      </FadeIn>

      <FadeIn delay={160}>
        <View style={styles.twoColAlerts}>
          <View style={styles.alertsCol}>
            <Card
              title="Auditoría"
              action={
                <Tappable onPress={() => goToScreen("sa-audit")}>
                  <Text style={styles.cardLink}>Ver bitácora →</Text>
                </Tappable>
              }
            >
              <View style={styles.auditBox}>
                <Text style={styles.auditBig}>{stats ? stats.events_24h : "—"}</Text>
                <Text style={styles.auditSub}>
                  eventos en 24 h · {stats ? stats.events_total : "—"} en total
                </Text>
              </View>
            </Card>
          </View>

          <View style={styles.topInstCol}>
            <Card
              title="Instituciones · listado"
              action={
                <Tappable onPress={() => goToScreen("sa-inst")}>
                  <Text style={styles.cardLink}>Ver tabla completa →</Text>
                </Tappable>
              }
            >
              <View style={styles.instHead}>
                <Text style={[styles.instHeadCell, styles.colRank]}>#</Text>
                <Text style={[styles.instHeadCell, styles.colName]}>Institución</Text>
                <Text style={[styles.instHeadCell, styles.colNum]}>Ciudad</Text>
                <Text style={[styles.instHeadCell, styles.colNum]}>Estado</Text>
                <View style={styles.colChev} />
              </View>
              {institutions.length === 0 && !loading ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyTitle}>No hay instituciones</Text>
                  <Text style={styles.emptySub}>Crea la primera con el botón.</Text>
                </View>
              ) : (
                institutions.slice(0, 8).map((it, i) => (
                  <Tappable key={it.id} onPress={() => openDetail(it.id)} scaleTo={0.995}>
                    <View
                      style={[
                        styles.instRow,
                        { borderBottomWidth: i < Math.min(institutions.length, 8) - 1 ? 1 : 0 }
                      ]}
                    >
                      <Text style={[styles.colRank, styles.rankText]}>{i + 1}</Text>
                      <View style={[styles.colName, styles.instNameCell]}>
                        <View
                          style={[
                            styles.instAvatar,
                            { backgroundColor: colors.ink }
                          ]}
                        >
                          <Text style={[styles.instAvatarText, { color: colors.paper }]}>
                            {it.name.slice(0, 1).toUpperCase()}
                          </Text>
                        </View>
                        <Text style={styles.instName} numberOfLines={1}>
                          {it.name}
                        </Text>
                      </View>
                      <Text style={[styles.colNum, styles.instNum]}>{it.city ?? "—"}</Text>
                      <Text
                        style={[
                          styles.colNum,
                          styles.instGrowth,
                          { color: it.is_active === false ? colors.alert : colors.ok }
                        ]}
                      >
                        {it.is_active === false ? "inactiva" : "activa"}
                      </Text>
                      <View style={styles.colChev}>
                        <Icon kind="chev" size={14} color={colors.ink3} />
                      </View>
                    </View>
                  </Tappable>
                ))
              )}
            </Card>
          </View>
        </View>
      </FadeIn>

      <FadeIn delay={240}>
        <View style={styles.twoColBottom}>
          <View style={styles.distCol}>
            <Card title="Distribución de usuarios">
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
          </View>

          <View style={styles.endpointsCol}>
            <Card title="Actividad reciente">
              {recent.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptySub}>Sin eventos recientes.</Text>
                </View>
              ) : (
                <View style={styles.recentList}>
                  {recent.map((e, i) => (
                    <Text key={i} style={styles.recentRow} numberOfLines={1}>
                      {e.operation} · {e.table_name} · {e.app_user_role ?? "sistema"}
                    </Text>
                  ))}
                </View>
              )}
            </Card>
          </View>
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
  eyebrow: {
    ...text.eyebrow,
    color: colors.ink3
  },
  heroBand: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  heroDark: {
    flexGrow: 1.4,
    flexBasis: 360,
    backgroundColor: colors.ink,
    borderRadius: radii.xl,
    paddingHorizontal: 26,
    paddingVertical: 24,
    overflow: "hidden",
    ...shadow.hero
  },
  heroInner: {
    position: "relative"
  },
  heroEyebrow: {
    color: "rgba(255,255,255,0.6)"
  },
  heroTitle: {
    fontFamily: family.serif,
    fontSize: 56,
    lineHeight: 64,
    letterSpacing: -1.12,
    color: colors.paper,
    marginTop: 10
  },
  heroMeta: {
    fontFamily: family.mono,
    fontSize: 11.5,
    color: "rgba(255,255,255,0.6)",
    marginTop: 14
  },
  heroSideCol: {
    flexGrow: 1,
    flexBasis: 220
  },
  statCard: {
    flex: 1,
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
  statRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12
  },
  statBandItem: {
    flexGrow: 1,
    flexBasis: 200,
    flexDirection: "row"
  },
  twoColAlerts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 18
  },
  alertsCol: {
    flexGrow: 1,
    flexBasis: 320
  },
  topInstCol: {
    flexGrow: 1.4,
    flexBasis: 420
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  cardHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  cardTitle: {
    fontFamily: family.medium,
    fontSize: 14,
    letterSpacing: -0.28,
    color: colors.ink
  },
  cardLink: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.accentDeep
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
  instHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  instHeadCell: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    letterSpacing: 1.05,
    textTransform: "uppercase"
  },
  colRank: {
    width: 34
  },
  colName: {
    flexGrow: 1.4,
    flexBasis: 0,
    minWidth: 0
  },
  colNum: {
    flexGrow: 0.7,
    flexBasis: 0,
    minWidth: 0
  },
  colChev: {
    width: 50,
    alignItems: "flex-start"
  },
  instRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomColor: colors.rule3
  },
  rankText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  instNameCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  instAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  instAvatarText: {
    fontFamily: family.serif,
    fontSize: 12
  },
  instName: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink,
    flexShrink: 1
  },
  instNum: {
    fontFamily: family.mono,
    fontSize: 12,
    color: colors.ink2
  },
  instGrowth: {
    fontFamily: family.mono,
    fontSize: 12
  },
  twoColBottom: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 18
  },
  distCol: {
    flexGrow: 1.2,
    flexBasis: 360
  },
  endpointsCol: {
    flexGrow: 1,
    flexBasis: 320
  },
  auditBox: {
    paddingHorizontal: 20,
    paddingVertical: 24
  },
  auditBig: {
    fontFamily: family.medium,
    fontSize: 40,
    letterSpacing: -1.2,
    lineHeight: 42,
    color: colors.ink
  },
  auditSub: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    marginTop: 8
  },
  distList: {
    paddingHorizontal: 20,
    paddingVertical: 14
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
  recentList: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8
  },
  recentRow: {
    fontFamily: family.mono,
    fontSize: 11.5,
    color: colors.ink2
  }
});
