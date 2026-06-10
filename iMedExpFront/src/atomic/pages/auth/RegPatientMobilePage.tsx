import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Pill } from "@/atomic/atoms/Pill";
import { Tappable } from "@/atomic/atoms/Tappable";
import { AuthHeader } from "@/atomic/molecules/AuthHeader";
import { DatePickerField } from "@/atomic/molecules/DatePickerField";
import { FormField } from "@/atomic/molecules/FormField";
import { PasswordChecklist } from "@/atomic/molecules/PasswordChecklist";
import { Stepper } from "@/atomic/molecules/Stepper";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
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
  const match = value.trim().replace(/\s+/g, "").match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
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
  return value.trim() ? validator(value) : null;
}

const STEP_TITLES = [
  "Datos personales.",
  "Dirección · opcional.",
  "Historia inicial.",
  "Correo y contraseña.",
  "Revisa y confirma."
];

export function RegPatientMobilePage() {
  const [step, setStep] = useState<PatientRegistrationStep>(0);
  const [form, setForm] = useState<PatientRegisterForm>(emptyPatientForm);
  const [draftReady, setDraftReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof PatientRegisterForm) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

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
      // Safety net: re-verify CURP uniqueness in case step-0 check was bypassed
      try {
        const curpCheck = await checkCurpAvailability(curp);
        if (!curpCheck.available) {
          setError("Ya existe un paciente registrado con esa CURP.");
          setStep(0);
          return;
        }
      } catch {
        // Si la verificación falla por red, continuamos y dejamos que el servidor lo rechace
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
        <Text style={styles.loginHint}>
          ¿Ya tienes cuenta?{" "}
          <Text style={styles.loginLink} onPress={() => goToScreen("login-mob")}>Iniciar sesión</Text>
        </Text>
        <FadeIn>
          <Stepper
            steps={PATIENT_STEPS}
            current={step}
            onStepPress={(i) => {
              // Navegación libre entre pestañas (aunque el paso actual no esté lleno).
              setError(null);
              setStep(i as PatientRegistrationStep);
            }}
          />
          <Text style={styles.lead}>
            Estos datos aparecerán en tu expediente y se reanudan si sales antes de terminar.
          </Text>
          <Text style={styles.title}>{STEP_TITLES[step]}</Text>
        </FadeIn>

        <FadeIn delay={90} style={styles.form}>
          {step === 0 ? (
            <>
              <FormField label="Nombre(s)" placeholder="Como en tu INE" value={form.nombre} onChangeText={set("nombre")} valid={!!form.nombre.trim() && !nombreError} errorText={nombreError} />
              <FormField label="Apellidos" placeholder="Paterno y materno" value={form.apellidos} onChangeText={set("apellidos")} valid={!!form.apellidos.trim() && !apellidosError} errorText={apellidosError} />
              <View style={styles.row}>
                <DatePickerField label="Nacimiento" placeholder="dd/mm/aaaa" value={form.fecha} onChange={set("fecha")} style={styles.col} valid={!!form.fecha.trim() && !fechaError} errorText={fechaError} />
                <FormField label="CURP" placeholder="18 caracteres" hint="formato oficial" autoCapitalize="characters" value={form.curp} onChangeText={(v) => set("curp")(v.toUpperCase().slice(0, 18))} style={styles.col} valid={!!form.curp.trim() && !curpError} errorText={curpError} />
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
                <FormField label="Colonia" placeholder="Centro" value={form.neighborhood} onChangeText={set("neighborhood")} style={styles.col} />
                <FormField label="CP" placeholder="00000" keyboardType="number-pad" value={form.postalCode} onChangeText={(v) => set("postalCode")(v.replace(/\D/g, "").slice(0, 5))} style={styles.col} valid={!!form.postalCode.trim() && !postalCodeError} errorText={postalCodeError} />
              </View>
              <View style={styles.row}>
                <FormField label="Ciudad" placeholder="Puebla" value={form.city} onChangeText={set("city")} style={styles.col} />
                <FormField label="Estado" placeholder="Puebla" value={form.state} onChangeText={set("state")} style={styles.col} />
              </View>
              <FormField label="Teléfono" placeholder="10 dígitos" icon="phone" keyboardType="phone-pad" value={form.phone} onChangeText={(v) => set("phone")(v.replace(/\D/g, "").slice(0, 10))} valid={!!form.phone.trim() && !phoneError} errorText={phoneError} />
            </>
          ) : step === 2 ? (
            <PatientHistoryStep form={form} setForm={setForm} />
          ) : step === 3 ? (
            <>
              <FormField label="Correo" placeholder="tu@correo.com" icon="mail" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={set("email")} valid={!!form.email.trim() && !emailError} errorText={emailError} />
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
        </FadeIn>

        <FadeIn delay={150}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}>
            {step > 0 ? <Button label="Atrás" variant="ghost" height={44} block={false} style={styles.backAction} disabled={busy} onPress={handlePrev} /> : null}
            <Button label={busy ? "Procesando..." : step < 4 ? "Continuar" : "Crear cuenta"} onPress={step < 4 ? handleNext : handleSubmit} disabled={busy || !draftReady} style={styles.submit} />
          </View>
          <Text style={styles.terms}>
            Al continuar aceptas los <Text style={styles.link}>términos</Text> y la{" "}
            <Text style={styles.link}>privacidad</Text>.
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
  loginHint: {
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.ink3,
    textAlign: "right",
    marginBottom: 8
  },
  loginLink: {
    fontFamily: family.medium,
    color: colors.ink
  },
  summary: {
    gap: 2,
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 14,
    padding: 14
  },
  sumRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule
  },
  sumKey: {
    width: 92,
    fontFamily: family.mono,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.ink3
  },
  sumVal: {
    flex: 1,
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink
  },
  sumNote: {
    fontFamily: family.regular,
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.ink3,
    marginTop: 10
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
  row: {
    flexDirection: "row",
    gap: 10
  },
  col: {
    flex: 1,
    minWidth: 0
  },
  genderGroup: {
    gap: 8
  },
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
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16
  },
  backAction: {
    minWidth: 96
  },
  submit: {
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
    fontSize: 11,
    color: colors.alert,
    marginTop: 8
  },
  terms: {
    fontFamily: family.regular,
    fontSize: 11,
    lineHeight: 17,
    color: colors.ink3,
    textAlign: "center",
    marginTop: 14
  },
  link: {
    fontFamily: family.regular,
    color: colors.ink
  }
});
