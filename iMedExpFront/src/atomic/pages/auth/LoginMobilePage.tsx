import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Badge } from "@/atomic/atoms/Badge";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { Tappable } from "@/atomic/atoms/Tappable";
import { AuthHeader } from "@/atomic/molecules/AuthHeader";
import { FormField } from "@/atomic/molecules/FormField";
import { Headline } from "@/atomic/molecules/Headline";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goBack, goToScreen, replaceScreen } from "@/navigation/screenRouter";
import { routeAfterLogin } from "@/navigation/roleRoutes";
import { getCurrentUser, login, resendCode } from "@/services/auth/authApi";
import { saveSession } from "@/state/sessionStore";
import { setPendingVerifyEmail } from "@/state/verifyContext";
import { validateEmail } from "@/utils/validators";
import { colors } from "@/theme/tokens";
import { family } from "@/theme/typography";

export function LoginMobilePage() {
  const params = useLocalSearchParams<{ next?: string }>();
  const { width } = useWindowDimensions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  async function handleLogin() {
    if (busy) {
      return;
    }
    setError(null);
    setEmailError(null);
    const trimmedEmail = email.trim();
    const emailValidation = validateEmail(trimmedEmail);
    if (emailValidation) {
      setEmailError(emailValidation);
      return;
    }
    setBusy(true);
    try {
      const tokens = await login({ email: trimmedEmail, password });
      const user = await getCurrentUser(tokens.access_token);
      await saveSession(tokens, user);
      replaceScreen(routeAfterLogin(user.role, width < 720, params.next));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("email_not_verified")) {
        await setPendingVerifyEmail(trimmedEmail);
        try {
          await resendCode({ email: trimmedEmail });
        } catch {
          // ya hay un código vigente, lo ignoramos
        }
        replaceScreen("verify-email-mob", params.next ? { next: params.next } : undefined);
        return;
      }
      setError(err instanceof Error ? err.message : "No pudimos iniciar sesión.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <MobileScreen keyboardAware contentStyle={styles.content}>
      <AuthHeader back="← Sitio" onBack={() => goBack("home-mob")} />

      <View style={styles.body}>
        <RadialBlob
          size={320}
          color={colors.paper3}
          opacity={0.7}
          style={{ top: -150, right: -120 }}
        />

        <FadeIn>
          <Badge
            label="Plataforma médica · MX"
            bg={colors.white}
            fg={colors.accentDeep}
            border={colors.accentRule}
            dot={colors.accentBright}
            mono={false}
            fontSize={11}
          />
          <Headline lines={["Bienvenido", "de vuelta."]} accent style={{ marginTop: 14 }} />
          <Text style={styles.lead}>
            Una sola entrada para pacientes y médicos. Reconocemos tu rol automáticamente.
          </Text>
        </FadeIn>

        <FadeIn delay={90} style={styles.form}>
          <FormField
            label="Correo electrónico"
            placeholder="tu@correo.com"
            icon="mail"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              setEmailError(null);
            }}
            errorText={emailError}
          />
          <FormField
            label="Contraseña"
            placeholder="••••••••••••"
            icon="lock"
            secureTextEntry={!reveal}
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
            rightSlot={
              <Tappable onPress={() => setReveal((v) => !v)} hitSlop={8} scaleTo={0.9}>
                <Text style={styles.reveal}>{reveal ? "ocultar" : "ver"}</Text>
              </Tappable>
            }
          />

          <Tappable
            onPress={() => goToScreen("recover-mob")}
            hitSlop={8}
            scaleTo={0.96}
            style={styles.forgotRow}
          >
            <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
          </Tappable>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            label={busy ? "Entrando…" : "Iniciar sesión  →"}
            onPress={handleLogin}
            disabled={busy}
          />
        </FadeIn>

        <View style={styles.spacer} />

        <FadeIn delay={160}>
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ¿No tienes cuenta?{" "}
              <Text style={styles.footerLink} onPress={() => goToScreen("reg-role-mob")}>
                Crear cuenta
              </Text>
            </Text>
            <Text style={styles.compliance}>HIPAA · NOM-024-SSA3</Text>
          </View>
        </FadeIn>
      </View>
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 20
  },
  body: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 4,
    overflow: "hidden"
  },
  lead: {
    fontFamily: family.light,
    fontSize: 14,
    lineHeight: 21,
    color: colors.ink2,
    marginTop: 14
  },
  form: {
    marginTop: 26,
    gap: 14
  },
  reveal: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  forgotRow: {
    alignSelf: "flex-end",
    marginTop: -8
  },
  forgot: {
    fontFamily: family.regular,
    fontSize: 11.5,
    color: colors.ink3
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert
  },
  spacer: {
    flex: 1,
    minHeight: 18
  },
  footer: {
    alignItems: "center",
    marginTop: 14,
    gap: 10
  },
  footerText: {
    fontFamily: family.regular,
    fontSize: 11,
    color: colors.ink3
  },
  footerLink: {
    fontFamily: family.medium,
    color: colors.ink
  },
  compliance: {
    fontFamily: family.mono,
    fontSize: 9.5,
    letterSpacing: 0.8,
    color: colors.ink3
  }
});
