import { useState } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { FormField } from "@/atomic/molecules/FormField";
import { AuthSplitLayout } from "@/atomic/templates/AuthSplitLayout";
import { goToScreen } from "@/navigation/screenRouter";
import { requestPasswordRecovery } from "@/services/auth/authApi";
import { setPendingRecoveryEmail } from "@/state/recoverContext";
import { validateEmail } from "@/utils/validators";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

export function RecoverDesktopPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <AuthSplitLayout
      eyebrow="Recuperar acceso"
      headline="Olvidaste tu"
      headlineAccent="contraseña."
      sub="Te mandamos un código a tu correo para crear una nueva contraseña. El código vive 15 minutos y es de un solo uso."
      bullets={[
        "Tu expediente nunca queda bloqueado",
        "El código solo funciona una vez",
        "Cifrado de extremo a extremo"
      ]}
      onBack={() => goToScreen("login")}
    >
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.topLink} onPress={() => goToScreen("login")}>
            ← Volver a iniciar sesión
          </Text>
          <Text style={styles.topText}>
            ¿No tienes cuenta?{" "}
            <Text style={styles.topStrong} onPress={() => goToScreen("reg-role")}>
              Crear cuenta
            </Text>
          </Text>
        </View>

        <FadeIn style={styles.form}>
          <Text style={styles.eyebrow}>Recuperar contraseña</Text>
          <Text style={styles.h2}>
            {sent ? "Revisa tu correo." : "Te mandamos un código."}
          </Text>
          <Text style={styles.lead}>
            {sent
              ? `Si la cuenta existe, te llegará un mensaje a ${email || "tu correo"} con un código de 8 caracteres. Úsalo en la siguiente pantalla para crear una nueva contraseña.`
              : "Escribe el correo asociado a tu cuenta. Si existe, te llega un mensaje en menos de 30 segundos."}
          </Text>

          {!sent ? (
            <View style={styles.block}>
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
                label={busy ? "Enviando…" : "Enviar código de recuperación"}
                iconLeft="send"
                height={56}
                disabled={busy}
                onPress={handleSubmit}
              />
            </View>
          ) : (
            <View style={styles.block}>
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
                height={56}
                onPress={() => goToScreen("recover-set")}
              />
              <Button
                label="Abrir mi correo"
                variant="ghost"
                iconLeft="mail"
                height={52}
                onPress={() => Linking.openURL("mailto:").catch(() => {})}
              />
              <Text
                style={styles.resend}
                onPress={() => {
                  setSent(false);
                  setError(null);
                }}
              >
                ¿No te llegó? Solicitar otro
              </Text>
            </View>
          )}
        </FadeIn>

        <Text style={styles.terms}>
          ¿Necesitas ayuda? <Text style={styles.termsLink}>soporte@imedexp.mx</Text>
        </Text>
      </View>
    </AuthSplitLayout>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1 },
  flex: { flex: 1 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  topLink: { fontFamily: family.regular, fontSize: 13, color: colors.ink2 },
  topText: { fontFamily: family.regular, fontSize: 13, color: colors.ink3 },
  topStrong: { fontFamily: family.medium, color: colors.ink },
  form: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 440,
    width: "100%",
    alignSelf: "center",
    paddingVertical: 28
  },
  eyebrow: { ...text.eyebrow, color: colors.ink3 },
  h2: {
    fontFamily: family.medium,
    fontSize: 40,
    letterSpacing: -1.2,
    lineHeight: 42,
    color: colors.ink,
    marginTop: 10
  },
  lead: {
    fontFamily: family.regular,
    fontSize: 14.5,
    lineHeight: 22,
    color: colors.ink3,
    marginTop: 10
  },
  block: { marginTop: 32, gap: 16 },
  sentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 22,
    paddingVertical: 20,
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.lg
  },
  sentIcon: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center"
  },
  sentTitle: { fontFamily: family.medium, fontSize: 14, color: colors.ink },
  sentMeta: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    marginTop: 3
  },
  resend: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink3,
    textAlign: "center",
    paddingVertical: 8
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11.5,
    color: colors.alert
  },
  terms: {
    fontFamily: family.regular,
    fontSize: 11.5,
    lineHeight: 18,
    color: colors.ink3,
    textAlign: "center"
  },
  termsLink: { color: colors.ink }
});
