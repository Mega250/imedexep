import { ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { directorNav } from "@/navigation/desktopNavConfigs";
import { ApiError } from "@/services/api/client";
import { InvitationResponse, createInvitation, fetchSentInvitations } from "@/services/api/institutionsApi";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

type StepRow = {
  num: string;
  title: string;
  desc: string;
};

function statusMeta(status: string): { label: string; fg: string; soft: string } {
  switch (status) {
    case "accepted":
      return { label: "Aceptada", fg: colors.ok, soft: colors.okSoft };
    case "rejected":
      return { label: "Rechazada", fg: colors.alert, soft: colors.alertSoft };
    default:
      return { label: "Pendiente", fg: colors.accentDeep, soft: colors.accentSoft };
  }
}

const STEPS: StepRow[] = [
  { num: "1", title: "Envías la invitación", desc: "el médico recibe un correo con el enlace" },
  { num: "2", title: "Acepta desde su consola", desc: "el médico aprueba el vínculo desde su bandeja" },
  { num: "3", title: "Se vincula automáticamente", desc: "aparece en tu lista de médicos" }
];

export function DirInvitesDesktopPage(): ReactNode {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<InvitationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      try {
        const list = await fetchSentInvitations();
        if (alive) setSent(list);
      } catch {
        if (alive) setSent([]);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  async function handleSend() {
    if (sending) return;
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Escribe un correo válido.");
      return;
    }
    setError(null);
    setSending(true);
    try {
      const inv = await createInvitation({ doctor_email: trimmed });
      setSent((prev) => [inv, ...prev]);
      setEmail("");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("No pudimos enviar la invitación.");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <DesktopShell
      nav={directorNav}
      activeScreen="dir-invites"
      role="director"
      roleBadge="Director"
      title="Invitaciones a médicos"
      eyebrow="Envía invitaciones a doctores nuevos"
      searchPlaceholder="Buscar correo…"
      topBarRight={
        <Button
          label={sending ? "Enviando…" : "Enviar"}
          variant="accent"
          size="sm"
          block={false}
          height={42}
          radius={radii.md}
          iconLeft="send"
          onPress={handleSend}
          disabled={sending}
        />
      }
    >
      <FadeIn>
        <View style={styles.topCols}>
          <View style={styles.composeCard}>
            <View style={styles.composeHead}>
              <Text style={styles.composeTitle}>Invitar médico</Text>
              <Text style={styles.composeSub}>El médico recibirá un correo con el enlace de aceptación</Text>
            </View>
            <View style={styles.composeBody}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>CORREO DEL MÉDICO</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="medico@correo.com"
                  placeholderTextColor={colors.ink3}
                  style={styles.fieldInput}
                />
              </View>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <View style={styles.composeFooter}>
                <Text style={styles.composeNote}>La invitación caduca a los 7 días</Text>
                <View style={styles.composeActions}>
                  <Button
                    label="Cancelar"
                    variant="ghost"
                    size="sm"
                    block={false}
                    onPress={() => {
                      setEmail("");
                      setError(null);
                    }}
                  />
                  <Button
                    label={sending ? "Enviando…" : "Enviar invitación"}
                    variant="accent"
                    size="sm"
                    block={false}
                    iconLeft="send"
                    onPress={handleSend}
                    disabled={sending}
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.tipsCard}>
            <RadialBlob
              size={280}
              color={colors.accentBright}
              opacity={0.28}
              edge={70}
              style={styles.tipsBlob}
            />
            <View style={styles.tipsInner}>
              <Text style={styles.tipsEyebrow}>Cómo funciona</Text>
              <Text style={styles.tipsTitle}>Tres pasos{"\n"}y entra al equipo.</Text>
              <View style={styles.steps}>
                {STEPS.map((s) => (
                  <View key={s.num} style={styles.step}>
                    <View style={styles.stepNum}>
                      <Text style={styles.stepNumText}>{s.num}</Text>
                    </View>
                    <View style={styles.flexShrink}>
                      <Text style={styles.stepTitle}>{s.title}</Text>
                      <Text style={styles.stepDesc}>{s.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </FadeIn>

      <View style={styles.queueCard}>
        <View style={styles.queueHead}>
          <Text style={styles.queueTitle}>Invitaciones enviadas</Text>
        </View>
        {loading ? (
          <View style={styles.emptyBlock}>
            <ActivityIndicator color={colors.accentDeep} />
          </View>
        ) : sent.length === 0 ? (
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyText}>Aún no has enviado invitaciones.</Text>
          </View>
        ) : (
          <>
            <View style={styles.tableHead}>
              <Text style={[styles.headCell, styles.colId]}>ID</Text>
              <Text style={[styles.headCell, styles.colDoctor]}>Doctor</Text>
              <Text style={[styles.headCell, styles.colExp]}>Expira</Text>
              <Text style={[styles.headCell, styles.colState]}>Estado</Text>
            </View>
            {sent.map((q, i) => {
              const meta = statusMeta(q.status);
              return (
                <View
                  key={q.id}
                  style={[styles.tableRow, { borderBottomWidth: i < sent.length - 1 ? 1 : 0 }]}
                >
                  <Text style={[styles.colId, styles.rowMail]} numberOfLines={1}>#{q.id}</Text>
                  <View style={styles.colDoctor}>
                    <Text style={styles.rowName} numberOfLines={1} ellipsizeMode="tail">
                      {q.doctor_name ?? `doctor #${q.doctor_id}`}
                    </Text>
                    {q.doctor_email ? (
                      <Text style={styles.rowEmail} numberOfLines={1} ellipsizeMode="tail">
                        {q.doctor_email}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={[styles.colExp, styles.rowSent]} numberOfLines={1} ellipsizeMode="tail">
                    {new Date(q.expires_at).toLocaleDateString()}
                  </Text>
                  <View style={styles.colState}>
                    <View style={[styles.stateBadge, { backgroundColor: meta.soft }]}>
                      <Text style={[styles.stateBadgeText, { color: meta.fg }]}>{meta.label}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </View>
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  topCols: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14
  },
  composeCard: {
    flexGrow: 1.2,
    flexBasis: 380,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  composeHead: {
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  composeTitle: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  composeSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 2
  },
  composeBody: {
    paddingHorizontal: 22,
    paddingVertical: 20
  },
  field: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    backgroundColor: colors.paper
  },
  fieldLabel: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    letterSpacing: 0.8
  },
  fieldInput: {
    fontFamily: family.mono,
    fontSize: 13.5,
    color: colors.ink,
    marginTop: 6,
    paddingVertical: 0
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginTop: 10
  },
  composeFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18
  },
  composeNote: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  composeActions: {
    flexDirection: "row",
    gap: 6
  },
  tipsCard: {
    flexGrow: 1,
    flexBasis: 300,
    backgroundColor: colors.ink,
    borderRadius: radii.xl,
    paddingHorizontal: 24,
    paddingVertical: 22,
    overflow: "hidden"
  },
  tipsBlob: {
    top: -100,
    right: -80
  },
  tipsInner: {
    position: "relative"
  },
  tipsEyebrow: {
    fontFamily: family.mono,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.6)"
  },
  tipsTitle: {
    fontFamily: family.serif,
    fontSize: 28,
    lineHeight: 29.4,
    letterSpacing: -0.56,
    color: colors.paper,
    marginTop: 8
  },
  steps: {
    marginTop: 18,
    gap: 12
  },
  step: {
    flexDirection: "row",
    gap: 12
  },
  stepNum: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.accentBright,
    alignItems: "center",
    justifyContent: "center"
  },
  stepNumText: {
    fontFamily: family.serif,
    fontSize: 16,
    color: colors.ink
  },
  flexShrink: {
    flexShrink: 1,
    minWidth: 0
  },
  stepTitle: {
    fontFamily: family.medium,
    fontSize: 14,
    color: colors.paper
  },
  stepDesc: {
    fontFamily: family.mono,
    fontSize: 11,
    color: "rgba(255,255,255,0.65)",
    marginTop: 2
  },
  queueCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden",
    marginTop: 18
  },
  queueHead: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  queueTitle: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  tableHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomColor: colors.rule3
  },
  colId: {
    flexGrow: 0.6,
    flexBasis: 0,
    minWidth: 0
  },
  colDoctor: {
    flexGrow: 1.4,
    flexBasis: 0,
    minWidth: 0
  },
  colExp: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 0
  },
  colState: {
    flexGrow: 0.8,
    flexBasis: 0,
    minWidth: 0
  },
  rowMail: {
    fontFamily: family.mono,
    fontSize: 11.5,
    color: colors.ink2
  },
  rowName: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  rowEmail: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    marginTop: 2
  },
  rowSent: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  stateBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999
  },
  stateBadgeText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    letterSpacing: 0.76
  },
  emptyBlock: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: "center"
  },
  emptyText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    textAlign: "center"
  }
});
