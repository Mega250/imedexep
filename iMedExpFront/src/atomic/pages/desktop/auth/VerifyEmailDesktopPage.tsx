import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { USE_NATIVE_DRIVER } from "@/utils/nativeDriver";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { Logo } from "@/atomic/atoms/Logo";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DESKTOP_BREAKPOINT } from "@/navigation/desktopVariants";
import { goBack, replaceScreen } from "@/navigation/screenRouter";
import { routeAfterLogin } from "@/navigation/roleRoutes";
import { getCurrentUser, resendCode, verifyEmail } from "@/services/auth/authApi";
import { saveSession } from "@/state/sessionStore";
import {
  clearPendingVerifyEmail,
  getPendingVerifyEmail,
  getPendingVerifyStatus,
  setPendingVerifyStatus,
  VerifyStatus
} from "@/state/verifyContext";
import { formatRemaining, useCountdown } from "@/utils/useCountdown";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

function Caret() {
  const blink = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 0, duration: 0, delay: 500, useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.timing(blink, { toValue: 1, duration: 0, delay: 500, useNativeDriver: USE_NATIVE_DRIVER })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [blink]);
  return <Animated.View style={[styles.caret, { opacity: blink }]} />;
}

export function VerifyEmailDesktopPage() {
  const params = useLocalSearchParams<{ next?: string }>();
  const { width } = useWindowDimensions();
  const scale = width < 1100 ? 0.6 : width < 1280 ? 0.78 : 1;
  const inputRef = useRef<TextInput | null>(null);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<VerifyStatus | null>(null);

  useEffect(() => {
    let mounted = true;
    getPendingVerifyEmail().then((stored) => {
      if (mounted && stored) setEmail(stored);
    });
    getPendingVerifyStatus().then((stored) => {
      if (mounted && stored) setStatus(stored);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const codeRemainingMs = useCountdown(status?.expiresAt);
  const cooldownRemainingMs = useCountdown(status?.nextResendAt);
  const codeExpired = !!status && codeRemainingMs === 0;
  const canResend = !resending && !!email && cooldownRemainingMs === 0;
  const usingLocalCode = !!status?.debugCode;

  const digits = code.padEnd(6, " ").slice(0, 6).split("");
  const activeIndex = Math.min(code.length, 5);

  async function handleSubmit() {
    if (busy) {
      return;
    }
    if (code.length !== 6) {
      setError("Ingresa los 6 dígitos del código.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const tokens = await verifyEmail({ email, code });
      const user = await getCurrentUser(tokens.access_token);
      await saveSession(tokens, user);
      await clearPendingVerifyEmail();
      replaceScreen(
        routeAfterLogin(user.role, width < DESKTOP_BREAKPOINT, params.next)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos verificar el código.");
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    if (!canResend) return;
    setResending(true);
    setResent(false);
    setError(null);
    try {
      const fresh = await resendCode({ email });
      const next: VerifyStatus = {
        email,
        expiresAt: fresh.expires_at,
        nextResendAt: fresh.next_resend_at,
        attemptsInWindow: fresh.attempts_in_window,
        debugCode: fresh.debug_code ?? null
      };
      setStatus(next);
      await setPendingVerifyStatus(next);
      setResent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos reenviar el código.");
    } finally {
      setResending(false);
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.left}>
        <RadialBlob size={480} color={colors.paper3} opacity={0.7} style={{ top: -80, right: -120 }} />
        <RadialBlob size={360} color={colors.accentRule} opacity={0.5} style={{ bottom: -120, left: -80 }} />

        <View style={styles.leftHeader}>
          <Logo height={22} />
          <Tappable onPress={() => goBack("reg-role")} hitSlop={8} scaleTo={0.96}>
            <Text style={styles.backLink}>← Volver al registro</Text>
          </Tappable>
        </View>

        <View style={styles.leftBody}>
          <FadeIn delay={120}>
            <Text
              style={[
                styles.h1,
                {
                  fontSize: 80 * scale,
                  lineHeight: Math.max(80 * scale * 1.05, 56),
                  letterSpacing: -3.2 * scale
                }
              ]}
            >
              Confirmamos{"\n"}
              <Text
                style={[
                  styles.h1Serif,
                  { fontSize: 82 * scale, lineHeight: Math.max(82 * scale * 1.1, 60) }
                ]}
              >
                tu correo.
              </Text>
            </Text>
          </FadeIn>
          <FadeIn delay={220}>
            <Text style={styles.lead}>
              Tu cuenta es la llave de un expediente clínico que se comparte entre médicos.
              Verificamos tu correo una vez antes de soltar acceso.
            </Text>
          </FadeIn>
          <FadeIn delay={320}>
            <View style={styles.emailCard}>
              <View style={styles.emailIcon}>
                <Icon kind="mail" size={18} color={colors.accentDeep} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.emailLabel}>{usingLocalCode ? "Correo apagado · código local para" : "Te enviamos un código a"}</Text>
                <Text style={styles.emailValue}>{email || "tu correo"}</Text>
              </View>
            </View>
          </FadeIn>
          <FadeIn delay={400}>
            <View style={styles.shieldRow}>
              <View style={styles.shieldIcon}>
                <Icon kind="shield-2" size={14} color={colors.accentDeep} />
              </View>
              <Text style={styles.shieldText}>
                Si no te llega el correo, revisa la carpeta de promociones o pide que lo
                enviemos otra vez.
              </Text>
            </View>
          </FadeIn>
        </View>

        <Text style={styles.footer}>
          Cumple con HIPAA y NOM-024-SSA3
        </Text>
      </View>

      <View style={styles.right}>
        <ScrollView contentContainerStyle={styles.rightScroll} showsVerticalScrollIndicator={false}>
          <FadeIn style={styles.form}>
            <Text style={styles.eyebrow}>Verificación</Text>
            <Text style={styles.h2}>Pega tu código de 6 dígitos</Text>
            <Text style={styles.formLead}>
              El código se autocompleta si lo copias del correo. También puedes escribir cada
              dígito.
            </Text>

            <Pressable
              style={styles.codeRow}
              onPress={() => inputRef.current?.focus()}
            >
              {digits.map((digit, index) => {
                const active = index === activeIndex;
                const filled = digit.trim().length > 0;
                return (
                  <View
                    key={index}
                    style={[
                      styles.codeBox,
                      {
                        borderColor: filled ? colors.ink : active ? colors.accent : colors.rule,
                        backgroundColor: active ? colors.paper : colors.white
                      }
                    ]}
                  >
                    <Text style={styles.codeDigit}>{digit.trim()}</Text>
                    {active ? <Caret /> : null}
                  </View>
                );
              })}
            </Pressable>
            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              value={code}
              onChangeText={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              caretHidden
            />

            <View style={styles.helperRow}>
              <Text style={[styles.helperMono, { color: code.length === 6 ? colors.ok : colors.ink3 }]}>
                ● {code.length} / 6 dígitos
              </Text>
              {status ? (
                <Text style={[styles.helperMono, { color: codeExpired ? colors.alert : colors.ink3 }]}>
                  {codeExpired ? "Código vencido" : `Vence en ${formatRemaining(codeRemainingMs)}`}
                </Text>
              ) : (
                <Text style={[styles.helperMono, { color: colors.ink3 }]}>Confirma tu correo</Text>
              )}
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {status?.debugCode ? (
              <View style={styles.devCodeCard}>
                <Text style={styles.devCodeLabel}>Código local</Text>
                <Text style={styles.devCodeValue}>{status.debugCode}</Text>
              </View>
            ) : null}

            <Button
              label={busy ? "Procesando…" : "Verificar y entrar  →"}
              height={52}
              style={styles.submit}
              disabled={busy}
              onPress={handleSubmit}
            />

            <View style={styles.resendCard}>
              <View style={styles.flex}>
                <Text style={styles.resendTitle}>{usingLocalCode ? "Modo desarrollo" : "¿No te llegó el correo?"}</Text>
                <Text style={styles.resendMeta}>
                  {resending
                    ? "Reenviando…"
                    : !canResend && status
                    ? `Espera ${formatRemaining(cooldownRemainingMs)} para reenviar`
                    : resent
                    ? "Código reenviado"
                    : usingLocalCode
                    ? "Genera otro código local"
                    : "Podemos reenviarlo"}
                </Text>
              </View>
              <Button
                label={
                  resending
                    ? "Enviando…"
                    : !canResend && status
                    ? formatRemaining(cooldownRemainingMs)
                    : "Reenviar"
                }
                variant="ghost"
                size="sm"
                block={false}
                iconLeft="send"
                disabled={!canResend}
                onPress={handleResend}
              />
            </View>

            <Text style={styles.alt}>
              ¿Pegaste el código mal varias veces?{" "}
              <Text style={styles.altLink}>contacta soporte</Text>.
            </Text>
          </FadeIn>
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
  flex: { flex: 1 },
  leftHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  backLink: { fontFamily: family.regular, fontSize: 13, color: colors.ink2 },
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
  badgeText: { fontFamily: family.medium, fontSize: 12, color: colors.accentDeep },
  h1: {
    fontFamily: family.extralight,
    fontSize: 80,
    lineHeight: 77,
    letterSpacing: -3.2,
    color: colors.ink,
    marginTop: 28
  },
  h1Serif: { fontFamily: family.serifItalic, fontSize: 82, color: colors.accentDeep },
  lead: {
    fontFamily: family.light,
    fontSize: 17,
    lineHeight: 25,
    color: colors.ink2,
    marginTop: 22,
    maxWidth: 460
  },
  emailCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 32,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    maxWidth: 480
  },
  emailIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  emailLabel: { ...text.eyebrow, fontSize: 10, color: colors.ink3 },
  emailValue: {
    fontFamily: family.mono,
    fontSize: 14,
    color: colors.ink,
    marginTop: 2
  },
  shieldRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 22,
    maxWidth: 480
  },
  shieldIcon: {
    width: 24,
    height: 24,
    borderRadius: 99,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  shieldText: {
    flex: 1,
    fontFamily: family.mono,
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.ink3
  },
  footer: {
    fontFamily: family.mono,
    fontSize: 12,
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
    justifyContent: "center",
    paddingHorizontal: 64,
    paddingVertical: 56
  },
  form: {
    maxWidth: 440,
    width: "100%"
  },
  eyebrow: { ...text.eyebrow, color: colors.ink3 },
  h2: {
    fontFamily: family.regular,
    fontSize: 36,
    letterSpacing: -0.7,
    lineHeight: 39,
    color: colors.ink,
    marginTop: 6
  },
  formLead: {
    fontFamily: family.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.ink3,
    marginTop: 10
  },
  codeRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 28
  },
  codeBox: {
    flex: 1,
    height: 64,
    borderRadius: radii.md,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center"
  },
  codeDigit: {
    fontFamily: family.monoMedium,
    fontSize: 28,
    color: colors.ink
  },
  caret: {
    position: "absolute",
    width: 2,
    height: 28,
    backgroundColor: colors.ink
  },
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0
  },
  helperRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16
  },
  helperMono: { fontFamily: family.mono, fontSize: 11 },
  submit: { marginTop: 14 },
  error: {
    fontFamily: family.mono,
    fontSize: 12,
    color: colors.alert,
    marginTop: 16
  },
  devCodeCard: {
    alignItems: "center",
    backgroundColor: colors.paper,
    borderColor: colors.accentRule,
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: 14,
    padding: 14
  },
  devCodeLabel: {
    ...text.eyebrow,
    color: colors.ink3,
    fontSize: 10
  },
  devCodeValue: {
    color: colors.accentDeep,
    fontFamily: family.mono,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 4,
    marginTop: 4
  },
  resendCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.paper,
    borderRadius: radii.md
  },
  resendTitle: { fontFamily: family.medium, fontSize: 13, color: colors.ink },
  resendMeta: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    marginTop: 2
  },
  alt: {
    fontFamily: family.regular,
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.ink3,
    textAlign: "center",
    marginTop: 18
  },
  altLink: { color: colors.accentDeep }
});
