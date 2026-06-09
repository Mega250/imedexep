import AsyncStorage from "@react-native-async-storage/async-storage";

const PATIENT_DRAFT_KEY = "imedexp.registration.patient-draft.v1";

export type PatientRegistrationStep = 0 | 1 | 2;

export type PatientRegistrationDraft<T = Record<string, unknown>> = {
  version: 1;
  step: PatientRegistrationStep;
  updatedAt: string;
  form: T;
};

export async function loadPatientRegistrationDraft<T>(): Promise<PatientRegistrationDraft<T> | null> {
  const raw = await AsyncStorage.getItem(PATIENT_DRAFT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PatientRegistrationDraft<T>;
    if (parsed.version !== 1 || !parsed.form) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function savePatientRegistrationDraft<T>(
  step: PatientRegistrationStep,
  form: T,
): Promise<void> {
  await AsyncStorage.setItem(
    PATIENT_DRAFT_KEY,
    JSON.stringify({
      version: 1,
      step,
      updatedAt: new Date().toISOString(),
      form,
    } satisfies PatientRegistrationDraft<T>)
  );
}

export async function clearPatientRegistrationDraft(): Promise<void> {
  await AsyncStorage.removeItem(PATIENT_DRAFT_KEY);
}
