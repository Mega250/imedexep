import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Logo } from "@/atomic/atoms/Logo";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { TextField } from "@/atomic/atoms/TextField";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DESKTOP_BREAKPOINT } from "@/navigation/desktopVariants";
import { goToScreen, replaceScreen } from "@/navigation/screenRouter";
import { routeAfterLogin } from "@/navigation/roleRoutes";
import { getCurrentUser, login, resendCode } from "@/services/auth/authApi";
import { saveSession } from "@/state/sessionStore";
import { setPendingVerifyEmail } from "@/state/verifyContext";
import { validateEmail } from "@/utils/validators";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

export function LoginDesktopPage() {
  const params = useLocalSearchParams<{ next?: string }>();
  const { width } = useWindowDimensions();
  const scale = width < 1100 ? 0.6 : width < 1280 ? 0.78 : 1;
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
      replaceScreen(
        routeAfterLogin(user.role, width < DESKTOP_BREAKPOINT, params.next)
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("email_not_verified")) {
        await setPendingVerifyEmail(trimmedEmail);
        try {
          await resendCode({ email: trimmedEmail });
        } catch {
          // ya hay un código vigente
        }
        replaceScreen("verify-email", params.next ? { next: params.next } : undefined);
        return;
      }
      setError(err instanceof Error ? err.message : "No pudimos iniciar sesión.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.left}>
        <RadialBlob
          size={480}
          color={colors.paper3}
          opacity={0.7}
          style={{ top: -80, right: -120 }}
        />
        <RadialBlob
          size={360}
          color={colors.accentRule}
          opacity={0.5}
          style={{ bottom: -120, left: -80 }}
        />

        <View style={styles.leftHeader}>
          <Logo height={36} />
          <Tappable onPress={() => goToScreen("home")} hitSlop={8} scaleTo={0.96}>
            <Text style={styles.backLink}>← Volver al sitio</Text>
          </Tappable>
        </View>

        <View style={styles.leftBody}>
          <FadeIn>
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>Plataforma médica · MX</Text>
            </View>
          </FadeIn>
          <FadeIn delay={120}>
            <Text
              style={[
                styles.h1,
                {
                  fontSize: 84 * scale,
                  lineHeight: Math.max(84 * scale * 1.05, 60),
                  letterSpacing: -3.3 * scale
                }
              ]}
            >
              Bienvenido{"\n"}
              <Text
                style={[
                  styles.h1Serif,
                  { fontSize: 86 * scale, lineHeight: Math.max(86 * scale * 1.1, 64) }
                ]}
              >
                de vuelta.
              </Text>
            </Text>
          </FadeIn>
          <FadeIn delay={220}>
            <Text style={styles.lead}>
              Tu expediente — o el de tus pacientes — está donde lo dejaste. Sin
              interrogatorios, sin formularios.
            </Text>
          </FadeIn>
          <FadeIn delay={340}>
            <View style={styles.testimonial}>
              <Text style={styles.quote}>
                &quot;La paciente entró y yo ya sabía lo que tenía que ajustarle. 14
                segundos.&quot;
              </Text>
              <View style={styles.author}>
                <View style={styles.authorAvatar} />
                <View>
                  <Text style={styles.authorName}>Dra. Patricia Galván</Text>
                  <Text style={styles.authorMeta}>endocrinología · CDMX</Text>
                </View>
              </View>
            </View>
          </FadeIn>
        </View>

        <View style={styles.leftFooter}>
          <Text style={styles.compliance}>HIPAA · NOM-024-SSA3 · CIFRADO DE GRADO MÉDICO</Text>
          <Text style={styles.version}>v1.0 · 26.05</Text>
        </View>
      </View>

      <View style={styles.right}>
        <ScrollView
          contentContainerStyle={styles.rightScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>
              ¿No tienes cuenta?{" "}
              <Text style={styles.signupLink} onPress={() => goToScreen("reg-role")}>
                Crear cuenta
              </Text>
            </Text>
          </View>

          <FadeIn style={styles.form}>
            <Text style={styles.eyebrow}>Iniciar sesión</Text>
            <Text style={styles.h2}>Entra a tu cuenta.</Text>
            <Text style={styles.formLead}>
              Una sola entrada para pacientes y médicos. Reconocemos tu rol
              automáticamente.
            </Text>

            <View style={styles.fields}>
              <View style={styles.field}>
                <Text style={styles.label}>Correo electrónico</Text>
                <TextField
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v);
                    setEmailError(null);
                  }}
                  placeholder="tu@correo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  height={56}
                />
                {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
              </View>

              <View style={styles.field}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Contraseña</Text>
                  <Text
                    style={styles.forgot}
                    onPress={() => goToScreen("recover")}
                  >
                    ¿Olvidaste tu contraseña?
                  </Text>
                </View>
                <TextField
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••••••"
                  secureTextEntry={!reveal}
                  autoCapitalize="none"
                  height={56}
                  rightSlot={
                    <Tappable onPress={() => setReveal((v) => !v)} hitSlop={8} scaleTo={0.9}>
                      <Text style={styles.reveal}>{reveal ? "oculta" : "ver"}</Text>
                    </Tappable>
                  }
                />
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Button
                label={busy ? "Entrando…" : "Iniciar sesión  →"}
                height={56}
                onPress={handleLogin}
                disabled={busy}
                style={styles.submit}
              />
            </View>
          </FadeIn>

          <Text style={styles.terms}>
            Al continuar aceptas los <Text style={styles.termsLink}>términos</Text> y la{" "}
            <Text style={styles.termsLink}>política de privacidad</Text>.{"\n"}
            Tu sesión expira tras 30 min de inactividad.
          </Text>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.paper
  },
  left: {
    flex: 1.15,
    paddingHorizontal: 56,
    paddingVertical: 40,
    overflow: "hidden"
  },
  leftHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  backLink: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink2
  },
  leftBody: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 580
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    alignSelf: "flex-start",
    paddingLeft: 8,
    paddingRight: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.accentRule
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: colors.accentBright
  },
  badgeText: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.accentDeep
  },
  h1: {
    fontFamily: family.extralight,
    fontSize: 84,
    lineHeight: 80,
    letterSpacing: -3.3,
    color: colors.ink,
    marginTop: 28
  },
  h1Serif: {
    fontFamily: family.serifItalic,
    fontSize: 86,
    color: colors.accentDeep
  },
  lead: {
    fontFamily: family.light,
    fontSize: 17,
    lineHeight: 25,
    color: colors.ink2,
    marginTop: 24,
    maxWidth: 460
  },
  testimonial: {
    marginTop: 56,
    maxWidth: 480,
    paddingHorizontal: 22,
    paddingVertical: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg
  },
  quote: {
    fontFamily: family.serifItalic,
    fontSize: 20,
    lineHeight: 25,
    color: colors.ink
  },
  author: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14
  },
  authorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: colors.accent
  },
  authorName: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  authorMeta: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3
  },
  leftFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  compliance: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    letterSpacing: 0.9
  },
  version: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  right: {
    flex: 1,
    backgroundColor: colors.white,
    borderLeftWidth: 1,
    borderLeftColor: colors.rule
  },
  rightScroll: {
    flexGrow: 1,
    paddingHorizontal: 80,
    paddingVertical: 40
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  signupText: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink3
  },
  signupLink: {
    fontFamily: family.medium,
    color: colors.ink
  },
  form: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 420,
    width: "100%",
    alignSelf: "center",
    paddingVertical: 32
  },
  eyebrow: {
    ...text.eyebrow,
    color: colors.ink3
  },
  h2: {
    fontFamily: family.medium,
    fontSize: 40,
    letterSpacing: -1.2,
    lineHeight: 42,
    color: colors.ink,
    marginTop: 10
  },
  formLead: {
    fontFamily: family.regular,
    fontSize: 14.5,
    lineHeight: 22,
    color: colors.ink3,
    marginTop: 10
  },
  fields: {
    marginTop: 36,
    gap: 18
  },
  field: {
    gap: 8
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline"
  },
  label: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink2
  },
  forgot: {
    fontFamily: family.regular,
    fontSize: 12,
    color: colors.ink3
  },
  reveal: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    paddingHorizontal: 8,
    paddingVertical: 6
  },
  submit: {
    marginTop: 8
  },
  error: {
    fontFamily: family.mono,
    fontSize: 12,
    color: colors.alert,
    marginTop: 4
  },
  terms: {
    fontFamily: family.regular,
    fontSize: 11.5,
    lineHeight: 18,
    color: colors.ink3,
    textAlign: "center"
  },
  termsLink: {
    color: colors.ink
  }
});
