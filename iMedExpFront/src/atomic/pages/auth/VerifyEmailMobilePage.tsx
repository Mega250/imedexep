import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Animated, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { USE_NATIVE_DRIVER } from "@/utils/nativeDriver";
import { Badge } from "@/atomic/atoms/Badge";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { Logo } from "@/atomic/atoms/Logo";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { DESKTOP_BREAKPOINT } from "@/navigation/desktopVariants";
import { replaceScreen } from "@/navigation/screenRouter";
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

export function VerifyEmailMobilePage() {
  const params = useLocalSearchParams<{ next?: string }>();
  const { width } = useWindowDimensions();
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
        attemptsInWindow: fresh.attempts_in_window
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
    <MobileScreen contentStyle={styles.content}>
      <FadeIn>
        <View style={styles.hero}>
          <RadialBlob
            size={280}
            color={colors.paper3}
            style={{ top: -90, right: -100 }}
          />
          <View style={styles.heroTop}>
            <Logo height={18} />
            <Text style={styles.step}>3 / 3</Text>
          </View>
          <Badge
            label="Verificar correo"
            bg={colors.white}
            fg={colors.accentDeep}
            border={colors.accentRule}
            dot={colors.accentBright}
            mono={false}
            style={{ marginTop: 24 }}
          />
          <Text style={styles.title}>
            Confirmamos{"\n"}
            <Text style={styles.titleAccent}>tu correo.</Text>
          </Text>
        </View>
      </FadeIn>

      <View style={styles.body}>
        <FadeIn delay={80}>
          <View style={styles.emailCard}>
            <View style={styles.emailIcon}>
              <Icon kind="mail" size={16} color={colors.accentDeep} />
            </View>
            <View style={styles.emailInfo}>
              <Text style={styles.emailLabel}>Te enviamos un código a</Text>
              <Text style={styles.emailValue}>{email || "tu correo"}</Text>
            </View>
          </View>
        </FadeIn>

        <FadeIn delay={140} style={styles.codeSection}>
          <Text style={styles.eyebrow}>Código de 6 dígitos</Text>
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
          <View style={styles.codeMeta}>
            <Text style={[styles.metaMono, { color: code.length === 6 ? colors.ok : colors.ink3 }]}>● {code.length} / 6 dígitos</Text>
            {status ? (
              <Text style={[styles.metaMono, { color: codeExpired ? colors.alert : colors.ink3 }]}>
                {codeExpired ? "Código vencido" : `Vence en ${formatRemaining(codeRemainingMs)}`}
              </Text>
            ) : (
              <Text style={[styles.metaMono, { color: colors.ink3 }]}>Confirma tu correo</Text>
            )}
          </View>
        </FadeIn>

        <FadeIn delay={200}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button
            label={busy ? "Procesando…" : "Verificar y entrar  →"}
            onPress={handleSubmit}
            disabled={busy}
            height={50}
            style={{ marginTop: 14 }}
          />

          <View style={styles.resendCard}>
            <View>
              <Text style={styles.resendTitle}>¿No te llegó?</Text>
              <Text style={styles.resendSub}>
                {resending
                  ? "Reenviando…"
                  : !canResend && status
                  ? `Espera ${formatRemaining(cooldownRemainingMs)} para reenviar`
                  : resent
                  ? "Código reenviado"
                  : "Solicita un nuevo código"}
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
        </FadeIn>
      </View>
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24
  },
  hero: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 22,
    overflow: "hidden"
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  step: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  title: {
    fontFamily: family.extralight,
    fontSize: 56,
    lineHeight: 54,
    letterSpacing: -2.2,
    color: colors.ink,
    marginTop: 14
  },
  titleAccent: {
    fontFamily: family.serifItalic,
    color: colors.accentDeep,
    fontSize: 58
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 4
  },
  emailCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md
  },
  emailIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  emailInfo: {
    flex: 1
  },
  emailLabel: {
    ...text.eyebrow,
    fontSize: 9.5,
    color: colors.ink3
  },
  emailValue: {
    fontFamily: family.mono,
    fontSize: 12.5,
    color: colors.ink,
    marginTop: 2
  },
  codeSection: {
    marginTop: 22
  },
  eyebrow: {
    ...text.eyebrow,
    color: colors.ink3
  },
  codeRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10
  },
  codeBox: {
    flex: 1,
    height: 54,
    borderRadius: radii.md,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center"
  },
  codeDigit: {
    fontFamily: family.monoMedium,
    fontSize: 24,
    color: colors.ink
  },
  caret: {
    position: "absolute",
    width: 2,
    height: 24,
    backgroundColor: colors.ink
  },
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0
  },
  codeMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10
  },
  metaMono: {
    fontFamily: family.mono,
    fontSize: 10.5
  },
  resendCard: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  resendTitle: {
    fontFamily: family.medium,
    fontSize: 12.5,
    color: colors.ink
  },
  resendSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 2
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginTop: 12
  }
});
