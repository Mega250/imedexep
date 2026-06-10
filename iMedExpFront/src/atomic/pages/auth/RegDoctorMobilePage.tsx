import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Tappable } from "@/atomic/atoms/Tappable";
import { AuthHeader } from "@/atomic/molecules/AuthHeader";
import { FormField } from "@/atomic/molecules/FormField";
import { PasswordChecklist } from "@/atomic/molecules/PasswordChecklist";
import { SelectField } from "@/atomic/molecules/SelectField";
import { Stepper } from "@/atomic/molecules/Stepper";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goBack, goToScreen } from "@/navigation/screenRouter";
import { registerDoctor } from "@/services/auth/authApi";
import { setPendingVerifyEmail, setPendingVerifyStatus } from "@/state/verifyContext";
import {
  validateEmail,
  validateName,
  validatePassword,
  validateProfessionalLicense,
  validateRequired
} from "@/utils/validators";
import { colors } from "@/theme/tokens";
import { family } from "@/theme/typography";

function liveError(value: string, validator: (v: string) => string | null): string | null {
  if (!value.trim()) return null;
  return validator(value);
}

const SPECIALTIES: { id: number; label: string }[] = [
  { id: 1, label: "Medicina general" },
  { id: 2, label: "Cardiología" },
  { id: 3, label: "Endocrinología" },
  { id: 4, label: "Ginecología" },
  { id: 5, label: "Pediatría" },
  { id: 6, label: "Psiquiatría" }
];

const SPECIALTY_LABELS = SPECIALTIES.map((s) => s.label);

export function RegDoctorMobilePage() {
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [cedula, setCedula] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reveal, setReveal] = useState(false);

  const nombreError = useMemo(() => liveError(nombre, (v) => validateName(v, "Nombre")), [nombre]);
  const apellidosError = useMemo(
    () => liveError(apellidos, (v) => validateName(v, "Apellidos")),
    [apellidos]
  );
  const cedulaError = useMemo(() => liveError(cedula, validateProfessionalLicense), [cedula]);
  const emailError = useMemo(() => liveError(email, validateEmail), [email]);

  const nombreValid = !!nombre.trim() && !nombreError;
  const apellidosValid = !!apellidos.trim() && !apellidosError;
  const cedulaValid = !!cedula.trim() && !cedulaError;
  const emailValid = !!email.trim() && !emailError;

  async function handleSubmit() {
    if (busy) return;
    setError(null);

    const trimmedNombre = nombre.trim();
    const trimmedApellidos = apellidos.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedLicense = cedula.trim();

    const firstError =
      validateName(trimmedNombre, "Nombre") ??
      validateName(trimmedApellidos, "Apellidos") ??
      validateProfessionalLicense(trimmedLicense) ??
      validateRequired(especialidad, "Especialidad") ??
      validateEmail(trimmedEmail) ??
      validatePassword(password);

    if (firstError) {
      const inlineErrors = [nombreError, apellidosError, cedulaError, emailError];
      setError(inlineErrors.includes(firstError) ? null : firstError);
      return;
    }

    const specialty = SPECIALTIES.find((s) => s.label === especialidad);
    if (!specialty) {
      setError("Selecciona una especialidad válida.");
      return;
    }

    setBusy(true);
    try {
      const status = await registerDoctor({
        email: trimmedEmail,
        password,
        first_name: trimmedNombre,
        last_name: trimmedApellidos,
        general_license: trimmedLicense,
        specialty_id: specialty.id
      });
      await setPendingVerifyEmail(trimmedEmail);
      await setPendingVerifyStatus({
        email: trimmedEmail,
        expiresAt: status.expires_at,
        nextResendAt: status.next_resend_at,
        attemptsInWindow: status.attempts_in_window,
        debugCode: status.debug_code ?? null
      });
      goToScreen("verify-email-mob");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos crear la cuenta.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <MobileScreen keyboardAware contentStyle={styles.content}>
      <AuthHeader back="← Tipo de cuenta" onBack={() => goBack("reg-role-mob")} />
      <View style={styles.body}>
        <FadeIn>
          <Stepper steps={["Datos", "Cédula", "Activación"]} current={0} />
          <Text style={styles.title}>Datos{"\n"}profesionales.</Text>
          <Text style={styles.lead}>
            Captura tus datos tal como aparecen en tu cédula. Al activar tu cuenta podrás
            recibir invitaciones de clínicas.
          </Text>
        </FadeIn>

        <FadeIn delay={90} style={styles.form}>
          <FormField
            label="Cédula profesional"
            placeholder="Ej. 8842711"
            icon="doc"
            keyboardType="number-pad"
            hint="7 u 8 dígitos"
            value={cedula}
            onChangeText={(v) => setCedula(v.replace(/\D/g, "").slice(0, 8))}
            valid={cedulaValid}
            errorText={cedulaError}
          />
          <FormField
            label="Nombre(s)"
            placeholder="Como en tu cédula"
            value={nombre}
            onChangeText={setNombre}
            valid={nombreValid}
            errorText={nombreError}
          />
          <FormField
            label="Apellidos"
            placeholder="Paterno y materno"
            value={apellidos}
            onChangeText={setApellidos}
            valid={apellidosValid}
            errorText={apellidosError}
          />
          <SelectField
            label="Especialidad"
            placeholder="Selecciona…"
            options={SPECIALTY_LABELS}
            value={especialidad}
            onValueChange={setEspecialidad}
          />
          <FormField
            label="Correo institucional"
            placeholder="tu@correo.com"
            icon="mail"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            valid={emailValid}
            errorText={emailError}
          />
          <FormField
            label="Contraseña"
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
          />
          <PasswordChecklist value={password} />
        </FadeIn>

        <FadeIn delay={150}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button
            label={busy ? "Procesando…" : "Continuar con verificación  →"}
            onPress={handleSubmit}
            disabled={busy}
            style={styles.submit}
          />
          <Text style={styles.terms}>
            Al continuar aceptas los <Text style={styles.link}>términos</Text>,{" "}
            <Text style={styles.link}>privacidad</Text> y la{" "}
            <Text style={styles.link}>política clínica</Text>.
          </Text>
        </FadeIn>
      </View>
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 22
  },
  body: {
    paddingHorizontal: 22,
    paddingTop: 4
  },
  title: {
    fontFamily: family.medium,
    fontSize: 28,
    letterSpacing: -0.84,
    lineHeight: 29,
    color: colors.ink,
    marginTop: 16
  },
  lead: {
    fontFamily: family.regular,
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.ink3,
    marginTop: 6
  },
  form: {
    marginTop: 18,
    gap: 12
  },
  submit: {
    marginTop: 16
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginTop: 8
  },
  terms: {
    fontFamily: family.regular,
    fontSize: 10.5,
    lineHeight: 16,
    color: colors.ink3,
    textAlign: "center",
    marginTop: 14
  },
  link: {
    fontFamily: family.regular,
    color: colors.ink
  },
  reveal: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    paddingHorizontal: 8,
    paddingVertical: 4
  }
});
