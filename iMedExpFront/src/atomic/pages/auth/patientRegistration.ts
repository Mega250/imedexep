export type PatientGender = "M" | "F" | "O";

export type PatientRegisterForm = {
  // Ficha de identificación
  nombre: string;
  apellidos: string;
  fecha: string;
  curp: string;
  gender: PatientGender | null;
  email: string;
  pwd: string;
  // Domicilio
  phone: string;
  street: string;
  neighborhood: string;
  postalCode: string;
  city: string;
  state: string;
  // Antecedentes personales no patológicos
  vaccines: string[];
  vaccinesOther: string;
  allergiesHas: string;
  allergies: string;
  serviceDrainage: string;
  serviceWater: string;
  serviceElectricity: string;
  household: string;
  cookingMaterial: string;
  cookingMethod: string;
  diet: string;
  sportHas: string;
  sport: string;
  // Antecedentes personales patológicos
  birthType: string;
  birthComplications: string;
  diseases: string[];
  diseasesOther: string;
  surgeries: string;
  hospitalizations: string;
  transfusions: string;
  seizures: string;
  trauma: string;
  // Antecedentes heredofamiliares
  hereditary: string[];
  hereditaryDetail: string;
  // Padecimiento actual
  currentCondition: string;
};

export const GENDER_OPTIONS: { label: string; value: PatientGender }[] = [
  { label: "Hombre", value: "M" },
  { label: "Mujer", value: "F" },
  { label: "Otro", value: "O" }
];

export const PATIENT_STEPS = ["Datos", "Dir.", "Historia", "Correo", "Entrar"];

export const YES_NO_OPTIONS = ["Sí", "No"];

export const VACCINE_OPTIONS = [
  "BCG",
  "Hepatitis B",
  "Pentavalente",
  "SRP (sarampión)",
  "Influenza",
  "COVID-19",
  "Tétanos",
  "VPH",
  "Neumococo"
];

export const COOKING_MATERIAL_OPTIONS = [
  "Gas",
  "Leña",
  "Carbón",
  "Eléctrica",
  "Otro"
];

export const COOKING_METHOD_OPTIONS = [
  "Estufa",
  "Fogón",
  "Horno",
  "Microondas",
  "Parrilla",
  "Otro"
];

export const BIRTH_TYPE_OPTIONS = ["Parto normal", "Cesárea", "No lo sé"];

export const DISEASE_OPTIONS = [
  "Diabetes",
  "Hipertensión",
  "Asma",
  "Cardiopatía",
  "Cáncer",
  "Tiroides",
  "Gastritis",
  "Ninguna"
];

export const HEREDITARY_OPTIONS = [
  "Diabetes",
  "Hipertensión",
  "Cáncer",
  "Cardiopatías",
  "Obesidad",
  "Tiroides",
  "Mentales",
  "Ninguna"
];

export function emptyPatientForm(): PatientRegisterForm {
  return {
    nombre: "",
    apellidos: "",
    fecha: "",
    curp: "",
    gender: null,
    email: "",
    pwd: "",
    phone: "",
    street: "",
    neighborhood: "",
    postalCode: "",
    city: "",
    state: "",
    vaccines: [],
    vaccinesOther: "",
    allergiesHas: "",
    allergies: "",
    serviceDrainage: "",
    serviceWater: "",
    serviceElectricity: "",
    household: "",
    cookingMaterial: "",
    cookingMethod: "",
    diet: "",
    sportHas: "",
    sport: "",
    birthType: "",
    birthComplications: "",
    diseases: [],
    diseasesOther: "",
    surgeries: "",
    hospitalizations: "",
    transfusions: "",
    seizures: "",
    trauma: "",
    hereditary: [],
    hereditaryDetail: "",
    currentCondition: ""
  };
}

const ARRAY_KEYS: (keyof PatientRegisterForm)[] = ["vaccines", "diseases", "hereditary"];

export function normalizePatientForm(raw: Partial<PatientRegisterForm> | undefined | null): PatientRegisterForm {
  const merged = { ...emptyPatientForm(), ...(raw ?? {}) } as PatientRegisterForm;
  for (const key of ARRAY_KEYS) {
    const value = merged[key];
    if (!Array.isArray(value)) {
      (merged[key] as unknown) = typeof value === "string" && value.trim() ? [value] : [];
    }
  }
  return merged;
}

function cleanList(items: string[], other: string, exclusiveValue?: string): string[] | null {
  const merged = [...items];
  const trimmedOther = other.trim();
  if (trimmedOther) {
    merged.push(trimmedOther);
  }
  const result =
    exclusiveValue && merged.includes(exclusiveValue) && merged.some((v) => v !== exclusiveValue)
      ? merged.filter((v) => v !== exclusiveValue)
      : merged;
  return result.length ? result : null;
}

function nullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function buildHealthQuestionnaire(form: PatientRegisterForm): Record<string, unknown> {
  return {
    non_pathological: {
      vaccination_scheme: cleanList(form.vaccines, form.vaccinesOther),
      allergies:
        form.allergiesHas === "Sí"
          ? nullable(form.allergies) ?? "Sí (sin especificar)"
          : form.allergiesHas
          ? "No"
          : null,
      home_services: {
        drainage: nullable(form.serviceDrainage),
        potable_water: nullable(form.serviceWater),
        electricity: nullable(form.serviceElectricity)
      },
      household_members: nullable(form.household),
      cooking_material: nullable(form.cookingMaterial),
      cooking_method: nullable(form.cookingMethod),
      daily_diet: nullable(form.diet),
      sport:
        form.sportHas === "Sí"
          ? nullable(form.sport) ?? "Sí (sin especificar)"
          : form.sportHas
          ? "No"
          : null
    },
    pathological: {
      birth_type: nullable(form.birthType),
      birth_complications: nullable(form.birthComplications),
      diseases: cleanList(form.diseases, form.diseasesOther, "Ninguna"),
      surgeries: nullable(form.surgeries),
      hospitalizations: nullable(form.hospitalizations),
      transfusions: nullable(form.transfusions),
      seizures: nullable(form.seizures),
      trauma: nullable(form.trauma),
      current_condition: nullable(form.currentCondition)
    },
    hereditary_family: {
      conditions: cleanList(form.hereditary, "", "Ninguna"),
      detail: nullable(form.hereditaryDetail)
    }
  };
}
