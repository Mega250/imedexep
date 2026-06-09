import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/atomic/atoms/Avatar";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { SectionLabel } from "@/atomic/atoms/SectionLabel";
import { Section } from "@/atomic/molecules/Section";
import { StatTile } from "@/atomic/molecules/StatTile";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goBack } from "@/navigation/screenRouter";
import { fetchInvitations, Invitation, respondInvitation } from "@/services/api/invitationsApi";
import { ApiError } from "@/services/api/client";
import { refreshCurrentSession } from "@/state/sessionStore";
import { colors, radii, shadow } from "@/theme/tokens";
import { family } from "@/theme/typography";

function isExpiringSoon(iso: string): boolean {
  const diffMs = new Date(iso).getTime() - Date.now();
  return diffMs > 0 && diffMs < 1000 * 60 * 60 * 48;
}

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function DocInvitesMobilePage() {
  const [invitations, setInvitations] = useState<Invitation[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const reload = async () => {
    try {
      const list = await fetchInvitations();
      setInvitations(list);
      setLoadError(null);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "No pudimos cargar tus invitaciones."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  async function respond(id: number, accept: boolean) {
    if (busyId !== null) return;
    setActionError(null);
    setFeedback(null);
    setBusyId(id);
    try {
      await respondInvitation(id, accept);
      if (accept) await refreshCurrentSession();
      setFeedback(accept ? "Invitación aceptada." : "Invitación rechazada.");
      await reload();
    } catch (err) {
      const detail =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "No pudimos enviar tu respuesta.";
      setActionError(detail);
    } finally {
      setBusyId(null);
    }
  }

  const pending = (invitations ?? []).filter((i) => i.status === "pending");
  const expiringSoon = pending.filter((i) => isExpiringSoon(i.expires_at)).length;
  const featured = pending[0];
  const others = pending.slice(1);

  return (
    <MobileScreen
      header={
        <ScreenTopBar
          back="Más opciones"
          onBack={() => goBack("mob-profile")}
          sub="Responde tus invitaciones a clínicas"
          title="Invitaciones a clínicas"
        />
      }
      contentStyle={styles.content}
    >
      <FadeIn>
        <View style={styles.statRow}>
          <StatTile
            label="Pendientes"
            value={String(pending.length)}
            sub={pending.length ? "responde pronto" : "sin pendientes"}
            valueColor={pending.length ? colors.alert : colors.ok}
          />
          <StatTile
            label="Vencen pronto"
            value={String(expiringSoon)}
            sub="próximas 48 h"
          />
        </View>
      </FadeIn>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.accentDeep} />
          <Text style={styles.loadingText}>Cargando invitaciones…</Text>
        </View>
      ) : loadError ? (
        <Text style={styles.error}>{loadError}</Text>
      ) : !featured ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Sin invitaciones pendientes</Text>
          <Text style={styles.emptySub}>
            Te avisaremos aquí cuando una clínica te invite a unirte.
          </Text>
        </View>
      ) : (
        <>
          <FadeIn delay={80}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <RadialBlob
                  size={200}
                  color="rgba(0,180,216,0.3)"
                  style={{ top: -80, right: -50 }}
                />
                <Text style={styles.headEyebrow}>Invitación pendiente</Text>
                <Text style={styles.headTitle}>{featured.institution_name}</Text>
                <Text style={styles.headMeta}>
                  Vence {new Date(featured.expires_at).toLocaleDateString("es-MX")}
                </Text>
              </View>
              <View style={styles.cardBody}>
                <SectionLabel label="Te invita" />
                <View style={styles.fromRow}>
                  <Avatar
                    initials={initialsFor(featured.institution_name)}
                    size={30}
                    radius={8}
                    bg={colors.paper3}
                    fg={colors.accentDeep}
                    serif
                    fontSize={12}
                  />
                  <Text style={styles.fromText}>{featured.institution_name}</Text>
                </View>
                {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
                {actionError ? <Text style={styles.error}>{actionError}</Text> : null}
                <View style={styles.actions}>
                  <View style={styles.flex}>
                    <Button
                      label={busyId === featured.id ? "Enviando…" : "Aceptar"}
                      iconLeft="check"
                      height={44}
                      disabled={busyId !== null}
                      onPress={() => respond(featured.id, true)}
                    />
                  </View>
                  <View style={styles.flex}>
                    <Button
                      label={busyId === featured.id ? "Enviando…" : "Rechazar"}
                      variant="ghost"
                      iconLeft="x"
                      height={44}
                      disabled={busyId !== null}
                      onPress={() => respond(featured.id, false)}
                    />
                  </View>
                </View>
                <Text style={styles.note}>
                  Tras aceptar te vincularemos automáticamente a la clínica.
                </Text>
              </View>
            </View>
          </FadeIn>

          {others.length > 0 ? (
            <FadeIn delay={140}>
              <Section title="Otras invitaciones">
                {others.map((inv) => (
                  <View key={inv.id} style={styles.otherCard}>
                    <View style={styles.flex}>
                      <Text style={styles.otherInst}>{inv.institution_name}</Text>
                      <Text style={styles.otherMeta}>
                        Vence {new Date(inv.expires_at).toLocaleDateString("es-MX")}
                      </Text>
                    </View>
                    <Button
                      label="Aceptar"
                      size="sm"
                      block={false}
                      height={32}
                      disabled={busyId !== null}
                      onPress={() => respond(inv.id, true)}
                    />
                  </View>
                ))}
              </Section>
            </FadeIn>
          ) : null}
        </>
      )}
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28
  },
  flex: {
    flex: 1
  },
  statRow: {
    flexDirection: "row",
    gap: 8
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 18,
    padding: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md
  },
  loadingText: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink2
  },
  emptyBox: {
    marginTop: 18,
    padding: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    alignItems: "center",
    gap: 6
  },
  emptyTitle: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  emptySub: {
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.ink3,
    textAlign: "center"
  },
  card: {
    marginTop: 14,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: radii.lg,
    overflow: "hidden",
    ...shadow.soft
  },
  cardHeader: {
    backgroundColor: colors.ink,
    paddingHorizontal: 16,
    paddingVertical: 14,
    overflow: "hidden"
  },
  headEyebrow: {
    fontFamily: family.mono,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.6)"
  },
  headTitle: {
    fontFamily: family.serifItalic,
    fontSize: 22,
    color: colors.paper,
    marginTop: 4
  },
  headMeta: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: "rgba(255,255,255,0.6)",
    marginTop: 6
  },
  cardBody: {
    padding: 16
  },
  fromRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.paper,
    borderRadius: radii.md
  },
  fromText: {
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.ink
  },
  feedback: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ok,
    marginTop: 12
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginTop: 12
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16
  },
  note: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    textAlign: "center",
    marginTop: 8
  },
  otherCard: {
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
  otherInst: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  otherMeta: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 3
  }
});
