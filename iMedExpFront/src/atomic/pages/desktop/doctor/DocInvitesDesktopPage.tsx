import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { doctorNav } from "@/navigation/desktopNavConfigs";
import { fetchInvitations, Invitation, respondInvitation } from "@/services/api/invitationsApi";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";
import { statusLabel } from "@/utils/status";

function instInitials(name: string) {
  return name
    .split(/\s+/)
    .filter((s) => /[A-ZÁÉÍÓÚÑ]/.test(s[0] ?? ""))
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase() || name.slice(0, 2).toUpperCase();
}

function daysAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) {
    return "hoy";
  }
  if (days === 1) {
    return "ayer";
  }
  if (days < 30) {
    return `hace ${days} d`;
  }
  return `hace ${Math.floor(days / 30)} m`;
}

function expiresLabel(iso: string | null): string {
  if (!iso) {
    return "sin vencimiento";
  }
  const diff = new Date(iso).getTime() - Date.now();
  if (diff < 0) {
    return "vencida";
  }
  const days = Math.ceil(diff / 86400000);
  return `en ${days} d`;
}

export function DocInvitesDesktopPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Invitation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [actingId, setActingId] = useState<number | null>(null);

  async function load() {
    try {
      const list = await fetchInvitations();
      setItems(list);
      if (list.length > 0) {
        setSelectedId((curr) => curr ?? list[0].id);
      }
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos cargar tus invitaciones.");
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function respond(id: number, status: "accepted" | "rejected") {
    setActingId(id);
    try {
      await respondInvitation(id, status === "accepted");
      const fresh = await fetchInvitations();
      setItems(fresh);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos responder a la invitación.");
    } finally {
      setActingId(null);
    }
  }

  const sel = items.find((i) => i.id === selectedId) ?? items[0] ?? null;
  const pendingCount = items.filter((i) => i.status === "pending").length;
  const acceptedCount = items.filter((i) => i.status === "accepted").length;
  const rejectedCount = items.filter((i) => i.status === "rejected").length;

  const stats: [string, string, string, boolean][] = [
    ["Pendientes", String(pendingCount), "responde a tiempo", pendingCount > 0],
    ["Aceptadas", String(acceptedCount), "instituciones activas", false],
    ["Rechazadas", String(rejectedCount), "histórico", false],
    ["Total", String(items.length), "en tu bandeja", false]
  ];

  return (
    <DesktopShell
      nav={doctorNav}
      activeScreen="doc-invites"
      role="médico"
      roleBadge="Médico"
      title="Invitaciones a clínicas"
      eyebrow={`${pendingCount} pendientes`}
      searchPlaceholder="Buscar clínica…"
    >
      <FadeIn>
        <View style={styles.statRow}>
          {stats.map(([k, n, sub, alert]) => (
            <View key={k} style={styles.statCard}>
              <Text style={styles.eyebrow}>{k}</Text>
              <Text style={[styles.statValue, alert && { color: colors.alert }]}>{n}</Text>
              <Text style={styles.statSub}>{sub}</Text>
            </View>
          ))}
        </View>
      </FadeIn>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.accentDeep} />
          <Text style={styles.loadingText}>Cargando invitaciones…</Text>
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyPanel}>
          <Text style={styles.emptyTitle}>Sin invitaciones</Text>
          <Text style={styles.emptySub}>No tienes invitaciones a clínicas en este momento.</Text>
        </View>
      ) : (
        <View style={styles.mainCols}>
          <View style={styles.listCol}>
            {items.map((q) => {
              const isSel = sel?.id === q.id;
              const instName = q.institution_name || `Institución #${q.institution_id}`;
              return (
                <Tappable key={q.id} scaleTo={0.995} onPress={() => setSelectedId(q.id)}>
                  <View
                    style={[
                      styles.inviteCard,
                      { borderColor: isSel ? colors.accent : colors.rule },
                      isSel && shadowStyle
                    ]}
                  >
                    <View style={styles.inviteTop}>
                      <View
                        style={[
                          styles.instLogo,
                          { backgroundColor: q.status === "pending" ? colors.accentBright : colors.ink }
                        ]}
                      >
                        <Text
                          style={[
                            styles.instLogoText,
                            { color: q.status === "pending" ? colors.ink : colors.paper }
                          ]}
                        >
                          {instInitials(instName)}
                        </Text>
                      </View>
                      <View style={styles.inviteInfo}>
                        <Text style={styles.inviteName}>{instName}</Text>
                        <Text style={styles.inviteMeta}>{daysAgo(q.created_at)}</Text>
                      </View>
                    </View>
                    <View style={styles.inviteFoot}>
                      <View
                        style={[
                          styles.stateChip,
                          { backgroundColor: q.status === "pending" ? colors.alertSoft : colors.paper3 }
                        ]}
                      >
                        <Text
                          style={[
                            styles.stateChipText,
                            { color: q.status === "pending" ? colors.alert : colors.ink3 }
                          ]}
                        >
                          {statusLabel(q.status)}
                        </Text>
                      </View>
                      <Text style={styles.expiresText}>vence {expiresLabel(q.expires_at)}</Text>
                    </View>
                  </View>
                </Tappable>
              );
            })}
          </View>

          {sel ? (
            <View style={styles.detailCol}>
              <View style={styles.detailHead}>
                <View style={styles.detailBlob} />
                <View>
                  <Text style={styles.detailEyebrow}>Invitación · {daysAgo(sel.created_at)}</Text>
                  <Text style={styles.detailTitle}>{sel.institution_name || `Institución #${sel.institution_id}`}</Text>
                  <Text style={styles.detailHeadMeta}>id {sel.id}</Text>
                </View>
              </View>

              <View style={styles.detailBody}>

                {sel.status === "pending" ? (
                  <View style={styles.noticePanel}>
                    <Icon kind="shield-2" size={16} color={colors.accentDeep} />
                    <Text style={styles.noticeText}>
                      Aceptar te vincula a la institución para consultas y registros bajo su contexto.
                    </Text>
                  </View>
                ) : null}

                {sel.status === "pending" ? (
                  <View style={styles.actionRow}>
                    <Tappable
                      scaleTo={0.98}
                      style={styles.actionFlex}
                      onPress={() => respond(sel.id, "accepted")}
                      disabled={actingId === sel.id}
                    >
                      <View style={styles.acceptBtn}>
                        {actingId === sel.id ? (
                          <ActivityIndicator color={colors.white} size="small" />
                        ) : (
                          <Icon kind="check" size={14} color={colors.white} />
                        )}
                        <Text style={styles.acceptBtnText}>Aceptar invitación</Text>
                      </View>
                    </Tappable>
                    <Tappable
                      scaleTo={0.98}
                      style={styles.actionFlex}
                      onPress={() => respond(sel.id, "rejected")}
                      disabled={actingId === sel.id}
                    >
                      <View style={styles.rejectBtn}>
                        <Icon kind="x" size={14} color={colors.alert} />
                        <Text style={styles.rejectBtnText}>Rechazar</Text>
                      </View>
                    </Tappable>
                  </View>
                ) : (
                  <View style={styles.statusBox}>
                    <Text style={styles.statusBoxText}>Estado: {statusLabel(sel.status)}</Text>
                  </View>
                )}
                {sel.status === "pending" ? (
                  <Text style={styles.endpointText}>vence {expiresLabel(sel.expires_at)}</Text>
                ) : null}
              </View>
            </View>
          ) : null}
        </View>
      )}
    </DesktopShell>
  );
}

const shadowStyle = Platform.select({
  web: { boxShadow: "0px 14px 30px rgba(0,150,199,0.4)" },
  default: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 6
  }
});

const styles = StyleSheet.create({
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
  mainCols: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 18
  },
  listCol: {
    flexGrow: 1,
    flexBasis: 360,
    gap: 10
  },
  inviteCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  inviteTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 16
  },
  instLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  instLogoText: {
    fontFamily: family.serif,
    fontSize: 18
  },
  inviteInfo: {
    flex: 1,
    minWidth: 0
  },
  inviteName: {
    fontFamily: family.medium,
    fontSize: 14,
    color: colors.ink
  },
  inviteMeta: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 4
  },
  inviteRole: {
    fontFamily: family.regular,
    fontSize: 12,
    color: colors.ink2,
    marginTop: 8,
    lineHeight: 16.8
  },
  inviteFoot: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.rule3,
    backgroundColor: colors.paper
  },
  stateChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999
  },
  stateChipText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    letterSpacing: 0.76,
    textTransform: "uppercase"
  },
  expiresText: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3
  },
  detailCol: {
    flexGrow: 1.3,
    flexBasis: 420,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden",
    alignSelf: "flex-start"
  },
  detailHead: {
    paddingHorizontal: 26,
    paddingTop: 24,
    paddingBottom: 20,
    backgroundColor: colors.ink,
    overflow: "hidden"
  },
  detailBlob: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 999,
    backgroundColor: "rgba(0,180,216,0.3)",
    top: -120,
    right: -80
  },
  detailEyebrow: {
    ...text.eyebrow,
    color: "rgba(255,255,255,0.6)"
  },
  detailTitle: {
    fontFamily: family.serif,
    fontSize: 36,
    lineHeight: 37.8,
    letterSpacing: -0.72,
    color: colors.paper,
    marginTop: 8
  },
  detailHeadMeta: {
    fontFamily: family.mono,
    fontSize: 11.5,
    color: "rgba(255,255,255,0.6)",
    marginTop: 10
  },
  detailBody: {
    padding: 22
  },
  invitedByName: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink,
    marginTop: 6
  },
  sectionGap: {
    marginTop: 16,
    marginBottom: 6
  },
  rolePanel: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.paper,
    borderRadius: radii.md
  },
  roleText: {
    fontFamily: family.regular,
    fontSize: 13.5,
    color: colors.ink
  },
  noticePanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.md
  },
  noticeText: {
    flex: 1,
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.accentDeep,
    lineHeight: 16.5
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 22
  },
  actionFlex: {
    flex: 1
  },
  acceptBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.ink,
    backgroundColor: colors.ink
  },
  acceptBtnText: {
    fontFamily: family.medium,
    fontSize: 13,
    letterSpacing: -0.1,
    color: colors.white
  },
  rejectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.alertRule,
    backgroundColor: colors.white
  },
  rejectBtnText: {
    fontFamily: family.medium,
    fontSize: 13,
    letterSpacing: -0.1,
    color: colors.alert
  },
  statusBox: {
    marginTop: 22,
    padding: 14,
    borderRadius: radii.md,
    backgroundColor: colors.paper,
    alignItems: "center"
  },
  statusBoxText: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink2,
    textTransform: "uppercase",
    letterSpacing: 0.6
  },
  endpointText: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    textAlign: "center",
    marginTop: 10
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 18,
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
    marginTop: 18,
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
  },
  emptyPanel: {
    marginTop: 18,
    padding: 32,
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    alignItems: "center",
    gap: 8
  },
  emptyTitle: {
    fontFamily: family.medium,
    fontSize: 16,
    color: colors.ink
  },
  emptySub: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink3,
    textAlign: "center"
  }
});
