import { PatientFull, PatientUpdate } from "@/services/api/patientsApi";
import { GENDER_OPTIONS } from "@/atomic/pages/auth/patientRegistration";

export type PatientEditableValues = {
  first_name: string;
  last_name: string;
  gender: string; // "M" | "F" | "O" | ""
  blood_type: string;
  phone: string;
  street_address: string;
  neighborhood: string;
  postal_code: string;
  city: string;
  state: string;
};

export const GENDER_LABELS: string[] = GENDER_OPTIONS.map((o) => o.label);

export function genderLabelFromValue(value: string): string {
  return GENDER_OPTIONS.find((o) => o.value === value)?.label ?? "";
}

export function genderValueFromLabel(label: string): string {
  return GENDER_OPTIONS.find((o) => o.label === label)?.value ?? "";
}

export function valuesFromPatient(p: PatientFull): PatientEditableValues {
  return {
    first_name: p.first_name ?? "",
    last_name: p.last_name ?? "",
    gender: p.gender ?? "",
    blood_type: p.blood_type ?? "",
    phone: p.phone ?? "",
    street_address: p.street_address ?? "",
    neighborhood: p.neighborhood ?? "",
    postal_code: p.postal_code ?? "",
    city: p.city ?? "",
    state: p.state ?? ""
  };
}

const NULLABLE_KEYS: (keyof PatientEditableValues)[] = [
  "gender",
  "blood_type",
  "phone",
  "street_address",
  "neighborhood",
  "postal_code",
  "city",
  "state"
];

export function validatePatientDraft(draft: PatientEditableValues): string | null {
  if (!draft.first_name.trim()) {
    return "El nombre es obligatorio.";
  }
  if (!draft.last_name.trim()) {
    return "Los apellidos son obligatorios.";
  }
  return null;
}

export function buildPatientUpdate(
  original: PatientEditableValues,
  draft: PatientEditableValues
): PatientUpdate {
  const update: PatientUpdate = {};
  const keys = Object.keys(original) as (keyof PatientEditableValues)[];
  for (const key of keys) {
    const before = original[key].trim();
    const after = draft[key].trim();
    if (after === before) {
      continue;
    }
    if (key === "first_name" || key === "last_name") {
      update[key] = after; // validado no-vacío antes de llamar
    } else if (NULLABLE_KEYS.includes(key)) {
      (update as Record<string, string | null>)[key] = after ? after : null;
    }
  }
  return update;
}

export function hasPatientChanges(update: PatientUpdate): boolean {
  return Object.keys(update).length > 0;
}
