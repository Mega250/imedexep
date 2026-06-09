import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { FormField } from "@/atomic/molecules/FormField";
import { PasswordChecklist } from "@/atomic/molecules/PasswordChecklist";
import { SelectField } from "@/atomic/molecules/SelectField";
import { Stepper } from "@/atomic/molecules/Stepper";
import { AuthSplitLayout } from "@/atomic/templates/AuthSplitLayout";
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

export function RegDoctorDesktopPage() {
  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    cedula: "",
    especialidad: "",
    email: "",
    pwd: ""
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const nombreError = useMemo(() => liveError(form.nombre, (v) => validateName(v, "Nombre")), [form.nombre]);
  const apellidosError = useMemo(
    () => liveError(form.apellidos, (v) => validateName(v, "Apellidos")),
    [form.apellidos]
  );
  const cedulaError = useMemo(() => liveError(form.cedula, validateProfessionalLicense), [form.cedula]);
  const emailError = useMemo(() => liveError(form.email, validateEmail), [form.email]);
  const passwordError = useMemo(() => liveError(form.pwd, validatePassword), [form.pwd]);

  const nombreValid = !!form.nombre.trim() && !nombreError;
  const apellidosValid = !!form.apellidos.trim() && !apellidosError;
  const cedulaValid = !!form.cedula.trim() && !cedulaError;
  const emailValid = !!form.email.trim() && !emailError;
  const passwordValid = !!form.pwd && !passwordError;

  async function handleSubmit() {
    if (busy) return;
    setError(null);

    const trimmedNombre = form.nombre.trim();
    const trimmedApellidos = form.apellidos.trim();
    const trimmedEmail = form.email.trim().toLowerCase();
    const trimmedLicense = form.cedula.trim();

    const firstError =
      validateName(trimmedNombre, "Nombre") ??
      validateName(trimmedApellidos, "Apellidos") ??
      validateProfessionalLicense(trimmedLicense) ??
      validateRequired(form.especialidad, "Especialidad") ??
      validateEmail(trimmedEmail) ??
      validatePassword(form.pwd);

    if (firstError) {
      const inlineErrors = [nombreError, apellidosError, cedulaError, emailError];
      setError(inlineErrors.includes(firstError) ? null : firstError);
      return;
    }

    const specialty = SPECIALTIES.find((s) => s.label === form.especialidad);
    if (!specialty) {
      setError("Selecciona una especialidad válida.");
      return;
    }

    setBusy(true);
    try {
      const status = await registerDoctor({
        email: trimmedEmail,
        password: form.pwd,
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
        attemptsInWindow: status.attempts_in_window
      });
      goToScreen("verify-email");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos crear la cuenta.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthSplitLayout
      eyebrow="Crear cuenta · médico"
      headline="Tu consultorio,"
      headlineAccent="en tu bolsillo."
      sub="Recibe a tus pacientes con su expediente ya leído. Captura tus datos profesionales y activa tu cuenta tras verificar el correo."
      bullets={[
        "Consola con agenda + expediente lado a lado",
        "Alergias y diagnósticos siempre en jerarquía 1",
        "Notas, recetas y estudios con autosave",
        "Invitaciones de clínicas en un solo lugar"
      ]}
      testimonial={{
        quote: "La paciente entró y yo ya sabía lo que tenía que ajustarle. 14 segundos.",
        name: "Dra. Patricia Galván",
        role: "endocrinología · CDMX"
      }}
      onBack={() => goBack("reg-role")}
    >
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.topLink} onPress={() => goToScreen("reg-role")}>
            ← Cambiar tipo de cuenta
          </Text>
          <Text style={styles.topText}>
            ¿Ya tienes cuenta?{" "}
            <Text style={styles.topStrong} onPress={() => goToScreen("login")}>
              Iniciar sesión
            </Text>
          </Text>
        </View>

        <FadeIn style={styles.form}>
          <Stepper steps={["Datos", "Verificar correo", "Activación"]} current={0} />
          <Text style={styles.h2}>Datos profesionales.</Text>
          <Text style={styles.lead}>
            Captura tus datos tal como aparecen en tu cédula. Tu cuenta queda activa al
            verificar el correo.
          </Text>

          <View style={styles.fields}>
            <FormField
              label="Cédula profesional"
              placeholder="Ej. 8842711"
              icon="doc"
              keyboardType="number-pad"
              hint="7 u 8 dígitos"
              value={form.cedula}
              onChangeText={(v) => set("cedula")(v.replace(/\D/g, "").slice(0, 8))}
              valid={cedulaValid}
              errorText={cedulaError}
            />
            <View style={styles.row}>
              <FormField
                label="Nombre(s)"
                placeholder="Como aparece en tu cédula"
                value={form.nombre}
                onChangeText={set("nombre")}
                style={styles.col}
                valid={nombreValid}
                errorText={nombreError}
              />
              <FormField
                label="Apellidos"
                placeholder="Paterno y materno"
                value={form.apellidos}
                onChangeText={set("apellidos")}
                style={styles.col}
                valid={apellidosValid}
                errorText={apellidosError}
              />
            </View>
            <SelectField
              label="Especialidad"
              options={SPECIALTY_LABELS}
              value={form.especialidad}
              onValueChange={set("especialidad")}
            />
            <FormField
              label="Correo electrónico"
              placeholder="tu@correo.com · institucional"
              icon="mail"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={set("email")}
              valid={emailValid}
              errorText={emailError}
            />
            <FormField
              label="Contraseña"
              placeholder="Mínimo 8 caracteres"
              icon="lock"
              secureTextEntry
              autoCapitalize="none"
              value={form.pwd}
              onChangeText={set("pwd")}
              valid={passwordValid}
            />
            <PasswordChecklist value={form.pwd} />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            label={busy ? "Procesando…" : "Continuar con verificación  →"}
            height={56}
            style={styles.submit}
            disabled={busy}
            onPress={handleSubmit}
          />
        </FadeIn>

        <Text style={styles.terms}>
          Al crear cuenta aceptas los <Text style={styles.termsLink}>términos</Text>,{" "}
          <Text style={styles.termsLink}>privacidad</Text> y la{" "}
          <Text style={styles.termsLink}>política de uso clínico</Text>.
        </Text>
      </View>
    </AuthSplitLayout>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1 },
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
    maxWidth: 460,
    width: "100%",
    alignSelf: "center",
    paddingVertical: 24
  },
  h2: {
    fontFamily: family.medium,
    fontSize: 36,
    letterSpacing: -1.1,
    lineHeight: 38,
    color: colors.ink,
    marginTop: 22
  },
  lead: {
    fontFamily: family.regular,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.ink3,
    marginTop: 8
  },
  fields: { marginTop: 28, gap: 16 },
  row: { flexDirection: "row", gap: 12 },
  col: { flex: 1, minWidth: 0 },
  submit: { marginTop: 14 },
  error: {
    fontFamily: family.mono,
    fontSize: 12,
    color: colors.alert,
    marginTop: 16
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
