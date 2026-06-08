import { useState } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { AuthHeader } from "@/atomic/molecules/AuthHeader";
import { FormField } from "@/atomic/molecules/FormField";
import { Headline } from "@/atomic/molecules/Headline";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goBack, goToScreen } from "@/navigation/screenRouter";
import { requestPasswordRecovery } from "@/services/auth/authApi";
import { setPendingRecoveryEmail } from "@/state/recoverContext";
import { validateEmail } from "@/utils/validators";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

export function RecoverMobilePage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (busy) return;
    setError(null);
    const trimmed = email.trim().toLowerCase();
    const emailErr = validateEmail(trimmed);
    if (emailErr) {
      setError(emailErr);
      return;
    }
    setBusy(true);
    try {
      await requestPasswordRecovery({ email: trimmed });
      await setPendingRecoveryEmail(trimmed);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos procesar la solicitud.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <MobileScreen keyboardAware contentStyle={styles.content}>
      <AuthHeader back="← Iniciar sesión" onBack={() => goBack("login-mob")} />

      <View style={styles.body}>
        <RadialBlob
          size={320}
          color={colors.paper3}
          opacity={0.7}
          style={{ top: -150, right: -120 }}
        />

        <FadeIn>
          <Text style={styles.eyebrow}>Recuperar acceso</Text>
          <Headline
            lines={sent ? ["Código", "enviado."] : ["Olvidaste tu", "contraseña."]}
            accent
            style={{ marginTop: 2 }}
          />
          <Text style={styles.lead}>
            {sent
              ? `Si la cuenta existe, te llegará un mensaje a ${email || "tu correo"} con un código de 8 caracteres.`
              : "Te mandamos un código de 8 caracteres a tu correo. Vive 15 minutos y solo se usa una vez."}
          </Text>
        </FadeIn>

        {!sent ? (
          <FadeIn delay={90} style={styles.form}>
            <FormField
              label="Correo electrónico"
              placeholder="tu@correo.com"
              icon="mail"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button
              label={busy ? "Enviando…" : "Enviar código"}
              iconLeft="send"
              disabled={busy}
              onPress={handleSubmit}
            />
          </FadeIn>
        ) : (
          <FadeIn delay={90} style={styles.form}>
            <View style={styles.sentCard}>
              <View style={styles.sentIcon}>
                <Icon kind="mail" size={18} color={colors.white} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.sentTitle}>Código enviado</Text>
                <Text style={styles.sentMeta}>vigente 15 min · uso único</Text>
              </View>
            </View>
            <Button
              label="Continuar  →"
              onPress={() => goToScreen("recover-set-mob")}
            />
            <Button
              label="Abrir mi correo"
              variant="ghost"
              iconLeft="mail"
              height={48}
              onPress={() => Linking.openURL("mailto:").catch(() => {})}
            />
            <Text style={styles.resend} onPress={() => setSent(false)}>
              ¿No te llegó? Solicitar otro
            </Text>
          </FadeIn>
        )}

        <View style={styles.spacer} />

        <FadeIn delay={150}>
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Icon kind="lock" size={15} color={colors.accentDeep} />
            </View>
            <Text style={styles.infoText}>
              <Text style={styles.infoStrong}>Tu expediente nunca se bloquea.</Text> Toda la
              información sigue protegida en nuestros servidores.
            </Text>
          </View>
          <Text style={styles.help}>
            ¿Necesitas ayuda? <Text style={styles.link}>soporte@imedexp.mx</Text>
          </Text>
        </FadeIn>
      </View>
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 20 },
  body: { flex: 1, paddingHorizontal: 22, paddingTop: 4, overflow: "hidden" },
  eyebrow: { ...text.eyebrow, color: colors.ink3 },
  lead: {
    fontFamily: family.regular,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.ink2,
    marginTop: 14
  },
  form: { marginTop: 24, gap: 14 },
  flex: { flex: 1 },
  sentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.md
  },
  sentIcon: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center"
  },
  sentTitle: { fontFamily: family.medium, fontSize: 13.5, color: colors.ink },
  sentMeta: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 3
  },
  resend: {
    fontFamily: family.regular,
    fontSize: 12,
    color: colors.ink3,
    textAlign: "center",
    paddingVertical: 8
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert
  },
  spacer: { flex: 1, minHeight: 18 },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 13,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 99,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  infoText: {
    flex: 1,
    fontFamily: family.regular,
    fontSize: 11.5,
    lineHeight: 16,
    color: colors.ink2
  },
  infoStrong: { fontFamily: family.semibold, color: colors.ink },
  help: {
    fontFamily: family.regular,
    fontSize: 11,
    color: colors.ink3,
    textAlign: "center",
    marginTop: 12
  },
  link: { fontFamily: family.regular, color: colors.ink }
});
