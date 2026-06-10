import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Pill } from "@/atomic/atoms/Pill";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DatePickerField } from "@/atomic/molecules/DatePickerField";
import { FormField } from "@/atomic/molecules/FormField";
import { PasswordChecklist } from "@/atomic/molecules/PasswordChecklist";
import { Stepper } from "@/atomic/molecules/Stepper";
import { AuthSplitLayout } from "@/atomic/templates/AuthSplitLayout";
import { PatientHistoryStep } from "@/atomic/pages/auth/PatientHistoryStep";
import {
  buildHealthQuestionnaire,
  emptyPatientForm,
  GENDER_OPTIONS,
  normalizePatientForm,
  PATIENT_STEPS,
  PatientRegisterForm
} from "@/atomic/pages/auth/patientRegistration";
import { goBack, goToScreen } from "@/navigation/screenRouter";
import { checkCurpAvailability, registerPatient } from "@/services/auth/authApi";
import {
  clearPatientRegistrationDraft,
  loadPatientRegistrationDraft,
  PatientRegistrationStep,
  savePatientRegistrationDraft
} from "@/state/registrationDraftStore";
import { setPendingVerifyEmail, setPendingVerifyStatus } from "@/state/verifyContext";
import {
  validateCurp,
  validateEmail,
  validateName,
  validatePassword,
  validatePhoneMx,
  validatePostalCodeMx
} from "@/utils/validators";
import { colors } from "@/theme/tokens";
import { family } from "@/theme/typography";

function toIsoDate(value: string): string | null {
  const trimmed = value.trim().replace(/\s+/g, "");
  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`;
}

function validateDob(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Fecha de nacimiento inválida.";
  const now = new Date();
  if (d >= now) return "La fecha de nacimiento debe ser en el pasado.";
  if (d.getFullYear() < 1900) return "Fecha de nacimiento fuera de rango.";
  return null;
}

function liveError(value: string, validator: (v: string) => string | null): string | null {
  if (!value.trim()) return null;
  return validator(value);
}

const STEP_TITLES = [
  "Datos personales.",
  "Dirección · opcional.",
  "Historia inicial.",
  "Correo y contraseña.",
  "Revisa y confirma."
];

export function RegPatientDesktopPage() {
  const [step, setStep] = useState<PatientRegistrationStep>(0);
  const [form, setForm] = useState<PatientRegisterForm>(emptyPatientForm);
  const [draftReady, setDraftReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof PatientRegisterForm) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const draft = await loadPatientRegistrationDraft<PatientRegisterForm>();
      if (cancelled) return;
      if (draft) {
        setForm(normalizePatientForm(draft.form));
        setStep(draft.step);
      }
      setDraftReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!draftReady || busy) return;
    const timer = setTimeout(() => {
      savePatientRegistrationDraft(step, form).catch(() => {});
    }, 250);
    return () => clearTimeout(timer);
  }, [draftReady, busy, step, form]);

  const nombreError = useMemo(() => liveError(form.nombre, (v) => validateName(v, "Nombre")), [form.nombre]);
  const apellidosError = useMemo(() => liveError(form.apellidos, (v) => validateName(v, "Apellidos")), [form.apellidos]);
  const curpError = useMemo(() => liveError(form.curp, validateCurp), [form.curp]);
  const emailError = useMemo(() => liveError(form.email, validateEmail), [form.email]);
  const passwordError = useMemo(() => liveError(form.pwd, validatePassword), [form.pwd]);
  const phoneError = useMemo(() => liveError(form.phone, validatePhoneMx), [form.phone]);
  const postalCodeError = useMemo(() => liveError(form.postalCode, validatePostalCodeMx), [form.postalCode]);
  const fechaError = useMemo(() => {
    if (!form.fecha.trim()) return null;
    const iso = toIsoDate(form.fecha);
    return iso ? validateDob(iso) : "Usa el formato dd/mm/aaaa.";
  }, [form.fecha]);

  const nombreValid = !!form.nombre.trim() && !nombreError;
  const apellidosValid = !!form.apellidos.trim() && !apellidosError;
  const curpValid = !!form.curp.trim() && !curpError;
  const emailValid = !!form.email.trim() && !emailError;
  const passwordValid = !!form.pwd && !passwordError;
  const fechaValid = !!form.fecha.trim() && !fechaError;
  const phoneValid = !!form.phone.trim() && !phoneError;
  const postalCodeValid = !!form.postalCode.trim() && !postalCodeError;

  function validateCurrentStep(targetStep = step): string | null {
    if (targetStep === 0) {
      const dob = toIsoDate(form.fecha);
      return (
        validateName(form.nombre.trim(), "Nombre") ??
        validateName(form.apellidos.trim(), "Apellidos") ??
        (dob ? validateDob(dob) : "Fecha de nacimiento inválida. Usa dd/mm/aaaa.") ??
        (!form.gender ? "Selecciona el sexo del paciente." : null) ??
        validateCurp(form.curp.trim().toUpperCase())
      );
    }
    if (targetStep === 1) {
      return (
        (form.phone.trim() ? validatePhoneMx(form.phone) : null) ??
        (form.postalCode.trim() ? validatePostalCodeMx(form.postalCode) : null) ??
        null
      );
    }
    if (targetStep === 3) {
      return (
        validateEmail(form.email.trim().toLowerCase()) ??
        validatePassword(form.pwd)
      );
    }
    return null;
  }

  async function handleNext() {
    const validationError = validateCurrentStep();
    if (validationError) {
      const inlineErrors = [nombreError, apellidosError, fechaError, curpError, emailError, passwordError, phoneError, postalCodeError];
      setError(inlineErrors.includes(validationError) ? null : validationError);
      return;
    }
    if (step === 0) {
      setBusy(true);
      try {
        const result = await checkCurpAvailability(form.curp.trim().toUpperCase());
        if (!result.available) {
          setError("Ya existe un paciente registrado con esa CURP.");
          return;
        }
      } catch {
        // Si la verificación falla por red, no bloqueamos el registro
      } finally {
        setBusy(false);
      }
    }
    setError(null);
    setStep((curr) => Math.min(curr + 1, 4) as PatientRegistrationStep);
  }

  function handlePrev() {
    setError(null);
    setStep((curr) => Math.max(curr - 1, 0) as PatientRegistrationStep);
  }

  async function handleSubmit() {
    if (busy) return;
    setError(null);

    const step0Error = validateCurrentStep(0);
    if (step0Error) { setError(step0Error); setStep(0); return; }
    const step3Error = validateCurrentStep(3);
    if (step3Error) { setError(step3Error); setStep(3); return; }
    const step1Error = validateCurrentStep(1);
    if (step1Error) { setError(step1Error); setStep(1); return; }

    const dob = toIsoDate(form.fecha);
    if (!dob) {
      setError("Fecha de nacimiento inválida. Usa dd/mm/aaaa.");
      return;
    }

    setBusy(true);
    try {
      const email = form.email.trim().toLowerCase();
      const curp = form.curp.trim().toUpperCase();
      // Safety net: re-verificar CURP antes de registrar
      try {
        const curpCheck = await checkCurpAvailability(curp);
        if (!curpCheck.available) {
          setError("Ya existe un paciente registrado con esa CURP.");
          setStep(0);
          return;
        }
      } catch {
        // Si la verificación falla por red, el servidor lo rechazará
      }
      const status = await registerPatient({
        email,
        password: form.pwd,
        registrado: true,
        curp,
        first_name: form.nombre.trim(),
        last_name: form.apellidos.trim(),
        date_of_birth: dob,
        gender: form.gender,
        phone: form.phone.replace(/\D/g, "") || null,
        street_address: form.street.trim() || null,
        neighborhood: form.neighborhood.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        postal_code: form.postalCode.replace(/\D/g, "") || null,
        health_questionnaire: buildHealthQuestionnaire(form)
      });
      await clearPatientRegistrationDraft();
      await setPendingVerifyEmail(email);
      await setPendingVerifyStatus({
        email,
        expiresAt: status.expires_at,
        nextResendAt: status.next_resend_at,
        attemptsInWindow: status.attempts_in_window,
        debugCode: status.debug_code ?? null
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
      eyebrow="Crear cuenta · paciente"
      headline="Tu salud,"
      headlineAccent="siempre contigo."
      sub="Captura tu historial una vez. Compártelo con cualquier médico con un vínculo seguro. Sin recordar fechas ni dosis."
      bullets={[
        "Historial clínico siempre disponible",
        "Vínculos seguros con vencimiento",
        "Recordatorios de medicación y citas",
        "Modo sin conexión disponible"
      ]}
      testimonial={{
        quote: "Llegué a mi cita y no tuve que llenar nada. El doctor ya sabía mi historia.",
        name: "Maria Fernanda Arellano",
        role: "paciente · CDMX"
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
          <Stepper
            steps={PATIENT_STEPS}
            current={step}
            onStepPress={(i) => {
              // Navegación libre entre pestañas (aunque el paso actual no esté lleno).
              setError(null);
              setStep(i as PatientRegistrationStep);
            }}
          />
          <Text style={styles.h2}>{STEP_TITLES[step]}</Text>
          <Text style={styles.lead}>
            Estos datos aparecerán en tu expediente y se reanudan si sales antes de terminar.
          </Text>

          <View style={styles.fields}>
            {step === 0 ? (
              <>
                <View style={styles.row}>
                  <FormField label="Nombre(s)" placeholder="Como aparece en tu INE" value={form.nombre} onChangeText={set("nombre")} style={styles.col} valid={nombreValid} errorText={nombreError} />
                  <FormField label="Apellidos" placeholder="Paterno y materno" value={form.apellidos} onChangeText={set("apellidos")} style={styles.col} valid={apellidosValid} errorText={apellidosError} />
                </View>
                <View style={styles.row}>
                  <DatePickerField label="Fecha de nacimiento" placeholder="dd / mm / aaaa" value={form.fecha} onChange={set("fecha")} style={styles.col} valid={fechaValid} errorText={fechaError} />
                  <FormField label="CURP" placeholder="ARRM920318MDFLLR06" hint="formato oficial · 18 caracteres" autoCapitalize="characters" value={form.curp} onChangeText={(v) => set("curp")(v.toUpperCase().slice(0, 18))} style={styles.col} valid={curpValid} errorText={curpError} />
                </View>
                <View style={styles.genderGroup}>
                  <Text style={styles.genderLabel}>Sexo</Text>
                  <View style={styles.genderOptions}>
                    {GENDER_OPTIONS.map((option) => (
                      <Tappable key={option.value} onPress={() => setForm((f) => ({ ...f, gender: option.value }))} scaleTo={0.95}>
                        <Pill label={option.label} on={form.gender === option.value} />
                      </Tappable>
                    ))}
                  </View>
                </View>
              </>
            ) : step === 1 ? (
              <>
                <FormField label="Calle y número" placeholder="Av. Universidad 123" value={form.street} onChangeText={set("street")} />
                <View style={styles.row}>
                  <FormField label="Colonia / comunidad" placeholder="Centro" value={form.neighborhood} onChangeText={set("neighborhood")} style={styles.col} />
                  <FormField label="Código postal" placeholder="00000" keyboardType="number-pad" value={form.postalCode} onChangeText={(v) => set("postalCode")(v.replace(/\D/g, "").slice(0, 5))} style={styles.col} valid={postalCodeValid} errorText={postalCodeError} />
                </View>
                <View style={styles.row}>
                  <FormField label="Municipio / ciudad" placeholder="Puebla" value={form.city} onChangeText={set("city")} style={styles.col} />
                  <FormField label="Estado" placeholder="Puebla" value={form.state} onChangeText={set("state")} style={styles.col} />
                </View>
                <FormField label="Teléfono celular" placeholder="10 dígitos" icon="phone" keyboardType="phone-pad" value={form.phone} onChangeText={(v) => set("phone")(v.replace(/\D/g, "").slice(0, 10))} valid={phoneValid} errorText={phoneError} />
              </>
            ) : step === 2 ? (
              <PatientHistoryStep form={form} setForm={setForm} />
            ) : step === 3 ? (
              <>
                <FormField label="Correo electrónico" placeholder="tu@correo.com" icon="mail" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={set("email")} valid={emailValid} errorText={emailError} />
                <FormField
                  label="Contraseña"
                  placeholder="Mínimo 8 caracteres"
                  icon="lock"
                  secureTextEntry={!reveal}
                  autoCapitalize="none"
                  value={form.pwd}
                  onChangeText={set("pwd")}
                  rightSlot={
                    <Tappable onPress={() => setReveal((v) => !v)} hitSlop={8} scaleTo={0.9}>
                      <Text style={styles.reveal}>{reveal ? "ocultar" : "ver"}</Text>
                    </Tappable>
                  }
                />
                <PasswordChecklist value={form.pwd} />
              </>
            ) : (
              <View style={styles.summary}>
                {([
                  ["Nombre", `${form.nombre} ${form.apellidos}`.trim() || "—"],
                  ["Nacimiento", form.fecha || "—"],
                  ["Sexo", form.gender ? GENDER_OPTIONS.find((o) => o.value === form.gender)?.label ?? form.gender : "—"],
                  ["CURP", form.curp || "—"],
                  ["Correo", form.email || "—"],
                  ["Teléfono", form.phone || "—"],
                  ["Ciudad", [form.city, form.state].filter(Boolean).join(", ") || "—"]
                ] as [string, string][]).map(([k, v]) => (
                  <View key={k} style={styles.sumRow}>
                    <Text style={styles.sumKey}>{k}</Text>
                    <Text style={styles.sumVal} numberOfLines={1}>{v}</Text>
                  </View>
                ))}
                <Text style={styles.sumNote}>
                  Revisa que todo esté correcto. Al crear la cuenta te enviaremos un código para verificar tu correo.
                </Text>
              </View>
            )}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actionRow}>
            {step > 0 ? (
              <Button label="Atrás" variant="ghost" height={48} block={false} style={styles.secondaryAction} disabled={busy} onPress={handlePrev} />
            ) : null}
            <Button
              label={busy ? "Procesando..." : step < 4 ? "Continuar" : "Crear cuenta"}
              height={48}
              style={styles.primaryAction}
              disabled={busy || !draftReady}
              onPress={step < 4 ? handleNext : handleSubmit}
            />
          </View>
        </FadeIn>

        <Text style={styles.terms}>
          Al crear cuenta aceptas los <Text style={styles.termsLink}>términos</Text> y la{" "}
          <Text style={styles.termsLink}>política de privacidad</Text>.
        </Text>
      </View>
    </AuthSplitLayout>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1 },
  summary: {
    gap: 2,
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 16,
    padding: 18
  },
  sumRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule
  },
  sumKey: {
    width: 110,
    fontFamily: family.mono,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.ink3
  },
  sumVal: {
    flex: 1,
    fontFamily: family.regular,
    fontSize: 14,
    color: colors.ink
  },
  sumNote: {
    fontFamily: family.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.ink3,
    marginTop: 12
  },
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
    maxWidth: 520,
    width: "100%",
    alignSelf: "center",
    paddingVertical: 24
  },
  h2: {
    fontFamily: family.medium,
    fontSize: 34,
    letterSpacing: -1,
    lineHeight: 36,
    color: colors.ink,
    marginTop: 18
  },
  lead: {
    fontFamily: family.regular,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.ink3,
    marginTop: 8
  },
  fields: { marginTop: 22, gap: 14 },
  row: { flexDirection: "row", gap: 12 },
  col: { flex: 1, minWidth: 0 },
  genderGroup: { gap: 8 },
  genderLabel: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  genderOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16
  },
  secondaryAction: {
    minWidth: 120
  },
  primaryAction: {
    flex: 1
  },
  reveal: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
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
