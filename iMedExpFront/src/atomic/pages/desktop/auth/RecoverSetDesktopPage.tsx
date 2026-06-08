import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Tappable } from "@/atomic/atoms/Tappable";
import { FormField } from "@/atomic/molecules/FormField";
import { PasswordChecklist } from "@/atomic/molecules/PasswordChecklist";
import { Stepper } from "@/atomic/molecules/Stepper";
import { AuthSplitLayout } from "@/atomic/templates/AuthSplitLayout";
import { goBack, replaceScreen } from "@/navigation/screenRouter";
import { resetPassword } from "@/services/auth/authApi";
import {
  clearPendingRecoveryEmail,
  getPendingRecoveryEmail
} from "@/state/recoverContext";
import { validatePassword } from "@/utils/validators";
import { colors } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

export function RecoverSetDesktopPage() {
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
      setTimeout(() => replaceScreen("login"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos actualizar la contraseña.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthSplitLayout
      eyebrow="Nueva contraseña"
      headline="Define una"
      headlineAccent="contraseña nueva."
      sub="Escribe el código que te enviamos por correo y tu nueva contraseña. Después podrás iniciar sesión normalmente."
      bullets={[
        "Mínimo 8 caracteres",
        "Una mayúscula, un número y un símbolo",
        "No la reutilices en otros sitios"
      ]}
      onBack={() => goBack("recover")}
    >
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.topLink} onPress={() => goBack("recover")}>
            ← Volver
          </Text>
        </View>

        <FadeIn style={styles.form}>
          <Stepper steps={["Correo", "Nueva contraseña"]} current={1} />
          <Text style={styles.eyebrow}>Restablece tu acceso</Text>
          <Text style={styles.h2}>
            {done ? "Listo." : "Una contraseña nueva."}
          </Text>
          <Text style={styles.lead}>
            {done
              ? "Tu contraseña está actualizada. Te llevamos a iniciar sesión."
              : "Pega el código que llegó a tu correo y elige una contraseña que solo tú conozcas."}
          </Text>

          {!done ? (
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
                height={56}
                disabled={!canSubmit}
                onPress={handleSubmit}
              />
            </View>
          ) : null}
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
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  topLink: { fontFamily: family.regular, fontSize: 13, color: colors.ink2 },
  form: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 460,
    width: "100%",
    alignSelf: "center",
    paddingVertical: 28
  },
  eyebrow: { ...text.eyebrow, color: colors.ink3, marginTop: 18 },
  h2: {
    fontFamily: family.medium,
    fontSize: 36,
    letterSpacing: -1.1,
    lineHeight: 38,
    color: colors.ink,
    marginTop: 10
  },
  lead: {
    fontFamily: family.regular,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.ink3,
    marginTop: 10
  },
  block: { marginTop: 24, gap: 14 },
  reveal: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    paddingHorizontal: 8,
    paddingVertical: 4
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
