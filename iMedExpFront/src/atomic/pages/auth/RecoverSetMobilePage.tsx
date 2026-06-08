import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { Tappable } from "@/atomic/atoms/Tappable";
import { AuthHeader } from "@/atomic/molecules/AuthHeader";
import { FormField } from "@/atomic/molecules/FormField";
import { Headline } from "@/atomic/molecules/Headline";
import { PasswordChecklist } from "@/atomic/molecules/PasswordChecklist";
import { Stepper } from "@/atomic/molecules/Stepper";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goBack, replaceScreen } from "@/navigation/screenRouter";
import { resetPassword } from "@/services/auth/authApi";
import {
  clearPendingRecoveryEmail,
  getPendingRecoveryEmail
} from "@/state/recoverContext";
import { validatePassword } from "@/utils/validators";
import { colors } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

export function RecoverSetMobilePage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [reveal, setReveal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let alive = true;
    getPendingRecoveryEmail().then((stored) => {
      if (alive && stored) {
        setEmail(stored);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const passwordError = useMemo(() => {
    if (!password) return null;
    return validatePassword(password);
  }, [password]);

  const confirmError = useMemo(() => {
    if (!confirm) return null;
    if (confirm !== password) return "Las contraseñas no coinciden.";
    return null;
  }, [confirm, password]);

  const canSubmit =
    email.trim().length > 0 &&
    code.trim().length === 8 &&
    !!password &&
    !passwordError &&
    confirm === password &&
    !busy;

  async function handleSubmit() {
    if (!canSubmit) return;
    setError(null);
    setBusy(true);
    try {
      await resetPassword({
        email: email.trim().toLowerCase(),
        code: code.trim().toUpperCase(),
        new_password: password
      });
      await clearPendingRecoveryEmail();
      setDone(true);
      setTimeout(() => replaceScreen("login-mob"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos actualizar la contraseña.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <MobileScreen keyboardAware contentStyle={styles.content}>
      <AuthHeader back="← Volver" onBack={() => goBack("recover-mob")} />

      <View style={styles.body}>
        <RadialBlob
          size={320}
          color={colors.paper3}
          opacity={0.7}
          style={{ top: -150, right: -120 }}
        />

        <FadeIn>
          <Stepper steps={["Correo", "Nueva contraseña"]} current={1} />
          <Text style={styles.eyebrow}>Restablece tu acceso</Text>
          <Headline
            lines={done ? ["Listo."] : ["Una contraseña", "nueva."]}
            accent
            style={{ marginTop: 2 }}
          />
          <Text style={styles.lead}>
            {done
              ? "Tu contraseña ya está actualizada. Te llevamos a iniciar sesión."
              : "Pega el código que llegó a tu correo y elige una contraseña que solo tú conozcas."}
          </Text>
        </FadeIn>

        {!done ? (
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
            <FormField
              label="Código de recuperación"
              placeholder="8 caracteres"
              icon="shield"
              autoCapitalize="characters"
              value={code}
              onChangeText={(v) => setCode(v.toUpperCase().slice(0, 8))}
              hint="te llegó por correo · vigente 15 min"
            />
            <FormField
              label="Nueva contraseña"
              placeholder="Mínimo 8 caracteres"
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
              errorText={passwordError}
            />
            <PasswordChecklist value={password} />
            <FormField
              label="Confirmar contraseña"
              placeholder="Repite la contraseña"
              icon="lock"
              secureTextEntry={!reveal}
              autoCapitalize="none"
              value={confirm}
              onChangeText={setConfirm}
              errorText={confirmError}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button
              label={busy ? "Actualizando…" : "Guardar contraseña  →"}
              disabled={!canSubmit}
              onPress={handleSubmit}
            />
          </FadeIn>
        ) : null}
      </View>
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 22 },
  body: { paddingHorizontal: 22, paddingTop: 4 },
  eyebrow: { ...text.eyebrow, color: colors.ink3, marginTop: 14 },
  lead: {
    fontFamily: family.regular,
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.ink2,
    marginTop: 10
  },
  form: { marginTop: 18, gap: 12 },
  reveal: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert
  }
});
