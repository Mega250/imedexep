import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { Card } from "@/atomic/atoms/Card";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { SectionLabel } from "@/atomic/atoms/SectionLabel";
import { FAB } from "@/atomic/molecules/FAB";
import { FormField } from "@/atomic/molecules/FormField";
import { Section } from "@/atomic/molecules/Section";
import { IconTabBar } from "@/atomic/organisms/IconTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { directorTabs } from "@/navigation/tabConfigs";
import { ApiError } from "@/services/api/client";
import { InvitationResponse, createInvitation } from "@/services/api/institutionsApi";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

export function DirInvitesMobilePage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<InvitationResponse[]>([]);

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
    <MobileScreen
      tabBar={<IconTabBar tabs={directorTabs} active={3} />}
      header={<ScreenTopBar sub="Invita médicos a tu clínica" title="Invitaciones" />}
      floating={<FAB icon="send" label="Nueva" onPress={handleSend} />}
      contentStyle={styles.content}
    >
      <FadeIn>
        <Card radius={radii.lg} style={styles.compose}>
          <SectionLabel label="Invitar médico" />
          <Text style={styles.composeTitle}>Enviar nueva invitación</Text>
          <View style={styles.fields}>
            <FormField
              label="Correo del médico"
              placeholder="medico@correo.com"
              icon="mail"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button
            label={sending ? "Enviando…" : "Enviar invitación"}
            size="sm"
            iconLeft="send"
            style={styles.sendBtn}
            onPress={handleSend}
            disabled={sending}
          />
        </Card>
      </FadeIn>

      <FadeIn delay={80}>
        <Section title="Enviadas en esta sesión">
          {sent.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Aún no enviaste invitaciones en esta sesión.</Text>
            </View>
          ) : (
            sent.map((q) => (
              <View key={q.id} style={styles.inviteCard}>
                <View style={styles.inviteTop}>
                  <Text style={styles.inviteMail}>doctor #{q.doctor_id}</Text>
                  <View style={[styles.stateTag, { backgroundColor: colors.alertSoft }]}>
                    <Text style={[styles.stateText, { color: colors.alert }]}>{q.status}</Text>
                  </View>
                </View>
                <Text style={styles.inviteSub}>
                  expira {new Date(q.expires_at).toLocaleDateString()}
                </Text>
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
    paddingBottom: 130
  },
  compose: {
    padding: 16
  },
  composeTitle: {
    fontFamily: family.medium,
    fontSize: 14,
    color: colors.ink,
    marginTop: 4
  },
  fields: {
    marginTop: 10,
    gap: 8
  },
  sendBtn: {
    marginTop: 12
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginTop: 10
  },
  inviteCard: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    marginBottom: 6
  },
  inviteTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  inviteMail: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink
  },
  stateTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999
  },
  stateText: {
    fontFamily: family.mono,
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: "uppercase"
  },
  inviteSub: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.ink3,
    marginTop: 4
  },
  emptyBox: {
    paddingHorizontal: 14,
    paddingVertical: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    alignItems: "center"
  },
  emptyText: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    textAlign: "center"
  }
});
