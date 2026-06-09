# Doctor — Editar expediente (datos generales) + navegación dashboard — Implementation Plan

> **For agentic workers:** este plan se ejecuta INLINE (no se permiten subagentes en esta sesión por regla del usuario). No hay git: los checkpoints son `npm run typecheck` + verificación manual en la app. Sin runner de pruebas (decisión del usuario): la lógica va en un helper puro y tipado.

**Goal:** Permitir que el médico edite los datos generales de un paciente desde el expediente (móvil y desktop), y mejorar el acceso al expediente desde el dashboard.

**Architecture:** Un helper puro (`patientEditForm.ts`) calcula el `PatientUpdate` con solo los campos cambiados (nunca `curp`/`date_of_birth`). Un componente `EditPatientSheet` (modal, reusa `FormField`/`SelectField`/`Button`) edita una copia de los valores. Cada página de expediente (móvil/desktop) abre el sheet, llama `updatePatientAuthed` y recarga. El dashboard móvil gana navegación real al expediente.

**Tech Stack:** Expo / React Native, TypeScript, tokens en `src/theme`, API en `src/services/api/patientsApi.ts`.

**Fuera de alcance (backend):** ver/editar historia clínica del paciente (no hay endpoint paciente-scoped; el front solo tiene `clinical-history/me`). NO se incluye `sensitivity_level` en la edición (es atributo de control de acceso, no "dato general"; se omite por seguridad — confirmar con el usuario si lo quiere después).

---

## File Structure

- **Create** `src/atomic/pages/doctor/patientEditForm.ts` — tipos + helper puro (diff → `PatientUpdate`, validación, mapeo de género). Mirrors `patientRegistration.ts`.
- **Create** `src/atomic/molecules/EditPatientSheet.tsx` — modal de edición, reusa átomos/moléculas existentes.
- **Modify** `src/atomic/pages/doctor/DocPatientFullMobilePage.tsx` — botón "Editar" + estado + guardar/recargar + render del sheet.
- **Modify** `src/atomic/pages/desktop/doctor/DocFullDesktopPage.tsx` — lo mismo en desktop (botón en `topBarRight`).
- **Modify** `src/atomic/pages/doctor/DashboardMobilePage.tsx` — buscador y stat "pacientes" navegables a `mob-patients`.
- **Verify (mínimo)** `src/atomic/pages/desktop/doctor/DoctorDashDesktopPage.tsx` — ya tiene navegación al expediente; solo confirmar (sin cambios obligatorios).

---

## Task 1: Helper puro `patientEditForm.ts`

**Files:**
- Create: `src/atomic/pages/doctor/patientEditForm.ts`

- [ ] **Step 1: Escribir el helper completo**

```ts
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
```

- [ ] **Step 2: Checkpoint** — `npm run typecheck` → debe pasar sin errores nuevos.
- [ ] **Step 3: Verificación manual de lógica** (no hay runner): revisar mentalmente con un caso — `original` = paciente actual, `draft` cambia solo `city` "" → "Mérida" ⇒ `update === { city: "Mérida" }`; vaciar `phone` ⇒ `{ phone: null }`; sin cambios ⇒ `{}`.

---

## Task 2: Componente `EditPatientSheet.tsx`

**Files:**
- Create: `src/atomic/molecules/EditPatientSheet.tsx`

- [ ] **Step 1: Escribir el componente completo**

```tsx
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FormField } from "@/atomic/molecules/FormField";
import { SelectField } from "@/atomic/molecules/SelectField";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";
import {
  PatientEditableValues,
  GENDER_LABELS,
  genderLabelFromValue,
  genderValueFromLabel,
  validatePatientDraft
} from "@/atomic/pages/doctor/patientEditForm";

type EditPatientSheetProps = {
  visible: boolean;
  initial: PatientEditableValues;
  submitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (values: PatientEditableValues) => void;
};

export function EditPatientSheet({
  visible,
  initial,
  submitting = false,
  error,
  onClose,
  onSubmit
}: EditPatientSheetProps) {
  const [values, setValues] = useState<PatientEditableValues>(initial);
  const [localError, setLocalError] = useState<string | null>(null);

  const set = (k: keyof PatientEditableValues) => (v: string) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  function submit() {
    const validationError = validatePatientDraft(values);
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    setLocalError(null);
    onSubmit(values);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>Editar datos del paciente</Text>
          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
          >
            <FormField label="Nombre" value={values.first_name} onChangeText={set("first_name")} autoCapitalize="words" />
            <FormField label="Apellidos" value={values.last_name} onChangeText={set("last_name")} autoCapitalize="words" />
            <SelectField
              label="Sexo"
              placeholder="Selecciona…"
              value={genderLabelFromValue(values.gender)}
              options={GENDER_LABELS}
              onValueChange={(label) => set("gender")(genderValueFromLabel(label))}
            />
            <FormField label="Tipo de sangre" placeholder="O+, A-, …" value={values.blood_type} onChangeText={set("blood_type")} autoCapitalize="characters" />
            <FormField label="Teléfono" value={values.phone} onChangeText={set("phone")} keyboardType="phone-pad" />
            <FormField label="Calle y número" value={values.street_address} onChangeText={set("street_address")} />
            <FormField label="Colonia" value={values.neighborhood} onChangeText={set("neighborhood")} />
            <FormField label="Código postal" value={values.postal_code} onChangeText={set("postal_code")} keyboardType="numeric" />
            <FormField label="Ciudad" value={values.city} onChangeText={set("city")} />
            <FormField label="Estado" value={values.state} onChangeText={set("state")} />
            {error || localError ? <Text style={styles.error}>{error ?? localError}</Text> : null}
          </ScrollView>
          <View style={styles.actions}>
            <Button label="Cancelar" variant="ghost" size="sm" block={false} onPress={onClose} />
            <Button label={submitting ? "Guardando…" : "Guardar"} size="sm" block={false} onPress={submit} disabled={submitting} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(3,4,94,0.42)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  card: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "88%",
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.rule,
    padding: 20
  },
  title: {
    fontFamily: family.medium,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 12
  },
  body: {
    flexGrow: 0
  },
  bodyContent: {
    gap: 12
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 16
  }
});
```

- [ ] **Step 2: Checkpoint** — `npm run typecheck` debe pasar.

---

## Task 3: Editar en móvil — `DocPatientFullMobilePage.tsx`

**Files:**
- Modify: `src/atomic/pages/doctor/DocPatientFullMobilePage.tsx`

- [ ] **Step 1: Imports.** Cambiar el import de `patientsApi` para incluir `updatePatientAuthed`, y agregar imports del sheet y el helper:

```tsx
import { PatientFull, SocioeconomicData, fetchPatientFull, fetchSocioeconomic, updatePatientAuthed } from "@/services/api/patientsApi";
import { EditPatientSheet } from "@/atomic/molecules/EditPatientSheet";
import { PatientEditableValues, buildPatientUpdate, hasPatientChanges, valuesFromPatient } from "@/atomic/pages/doctor/patientEditForm";
```

- [ ] **Step 2: Estado.** Dentro de `DocPatientFullMobilePage`, junto a los `useState` existentes, agregar:

```tsx
const [editing, setEditing] = useState(false);
const [saving, setSaving] = useState(false);
const [saveError, setSaveError] = useState<string | null>(null);
```

- [ ] **Step 3: Handler de guardado.** Agregar dentro del componente (antes del `return`):

```tsx
async function handleSave(values: PatientEditableValues) {
  if (!patient) {
    return;
  }
  const update = buildPatientUpdate(valuesFromPatient(patient), values);
  if (!hasPatientChanges(update)) {
    setEditing(false);
    return;
  }
  setSaving(true);
  setSaveError(null);
  try {
    await updatePatientAuthed(patient.id, update);
    const fresh = await fetchPatientFull(patient.id);
    setPatient(fresh);
    setEditing(false);
  } catch (err) {
    setSaveError(err instanceof Error ? err.message : "No pudimos guardar los cambios.");
  } finally {
    setSaving(false);
  }
}
```

- [ ] **Step 4: Acción "Editar".** En la `Section` de "Datos básicos" (actualmente `<Section title="Datos básicos">`), añadir acción:

```tsx
<Section title="Datos básicos" action="Editar →" onAction={() => setEditing(true)}>
```

- [ ] **Step 5: Render del sheet.** Justo antes del `<FAB ... />` final (dentro del `SafeAreaView`), agregar:

```tsx
{editing && patient ? (
  <EditPatientSheet
    visible
    initial={valuesFromPatient(patient)}
    submitting={saving}
    error={saveError}
    onClose={() => {
      setEditing(false);
      setSaveError(null);
    }}
    onSubmit={handleSave}
  />
) : null}
```

- [ ] **Step 6: Checkpoint** — `npm run typecheck` debe pasar.
- [ ] **Step 7: Verificación manual** — abrir un paciente → "Datos básicos" → "Editar →" → cambiar Ciudad → Guardar → el expediente refleja el cambio. (Si el backend rechaza el `PATCH` por permisos, se muestra el error: reportar al usuario.)

---

## Task 4: Editar en desktop — `DocFullDesktopPage.tsx`

**Files:**
- Modify: `src/atomic/pages/desktop/doctor/DocFullDesktopPage.tsx`

- [ ] **Step 1: Imports.** Incluir `updatePatientAuthed` en el import de `patientsApi`, y añadir:

```tsx
import { EditPatientSheet } from "@/atomic/molecules/EditPatientSheet";
import { PatientEditableValues, buildPatientUpdate, hasPatientChanges, valuesFromPatient } from "@/atomic/pages/doctor/patientEditForm";
```

- [ ] **Step 2: Estado.** Junto a los `useState` de `DocFullDesktopPage`:

```tsx
const [editing, setEditing] = useState(false);
const [saving, setSaving] = useState(false);
const [saveError, setSaveError] = useState<string | null>(null);
```

- [ ] **Step 3: Handler.** Agregar dentro del componente (antes del `return`):

```tsx
async function handleSave(values: PatientEditableValues) {
  if (!patient) {
    return;
  }
  const update = buildPatientUpdate(valuesFromPatient(patient), values);
  if (!hasPatientChanges(update)) {
    setEditing(false);
    return;
  }
  setSaving(true);
  setSaveError(null);
  try {
    await updatePatientAuthed(patient.id, update);
    const fresh = await fetchPatientFull(patient.id);
    setPatient(fresh);
    setEditing(false);
  } catch (err) {
    setSaveError(err instanceof Error ? err.message : "No pudimos guardar los cambios.");
  } finally {
    setSaving(false);
  }
}
```

- [ ] **Step 4: Botón "Editar"** en `topBarRight`, antes del botón "Imprimir / PDF":

```tsx
<Button
  label="Editar datos"
  variant="ghost"
  size="sm"
  block={false}
  height={42}
  radius={radii.md}
  iconLeft="edit"
  onPress={() => setEditing(true)}
  disabled={!patient}
/>
```

- [ ] **Step 5: Render del sheet.** Dentro de `DesktopShell`, al final del bloque de contenido (después del `<>...</>` del expediente o justo antes de cerrar `</DesktopShell>`), agregar:

```tsx
{editing && patient ? (
  <EditPatientSheet
    visible
    initial={valuesFromPatient(patient)}
    submitting={saving}
    error={saveError}
    onClose={() => {
      setEditing(false);
      setSaveError(null);
    }}
    onSubmit={handleSave}
  />
) : null}
```

- [ ] **Step 6: Checkpoint** — `npm run typecheck` debe pasar.
- [ ] **Step 7: Verificación manual** (web) — mismo flujo que móvil.

---

## Task 5: Dashboard móvil — navegación + empty states — `DashboardMobilePage.tsx`

**Files:**
- Modify: `src/atomic/pages/doctor/DashboardMobilePage.tsx`

- [ ] **Step 1: Buscador navegable.** El bloque `<View style={styles.search}>…</View>` (texto "Buscar paciente, diagnóstico…") envolverlo en `Tappable` que navega a la lista de pacientes (de donde se abre el expediente). `Tappable` y `goToScreen` ya están importados:

```tsx
<Tappable scaleTo={0.99} onPress={() => goToScreen("mob-patients")}>
  <View style={styles.search}>
    <Icon kind="search" size={15} color={colors.ink3} />
    <Text style={styles.searchText}>Buscar paciente, diagnóstico…</Text>
  </View>
</Tappable>
```

- [ ] **Step 2: Stat "pacientes" navegable.** En el `STATS.map`, hacer que la card cuyo label es `"pacientes"` navegue a `mob-patients`. Reemplazar el `Card` por:

```tsx
{STATS.map(([n, l]) =>
  l === "pacientes" ? (
    <Tappable key={l} scaleTo={0.98} onPress={() => goToScreen("mob-patients")} style={styles.flex}>
      <Card radius={radii.md} style={styles.statCard}>
        <Text style={styles.statNum}>{n}</Text>
        <Text style={styles.statLabel}>{l}</Text>
      </Card>
    </Tappable>
  ) : (
    <Card key={l} radius={radii.md} style={styles.statCard}>
      <Text style={styles.statNum}>{n}</Text>
      <Text style={styles.statLabel}>{l}</Text>
    </Card>
  )
)}
```

- [ ] **Step 3: Empty state honesto** (cuando no hay pacientes): si `patientsTotal === 0 && !loading`, el texto de la agenda vacía ya cubre citas; añadir una línea bajo el saludo sólo si aplica (opcional, mínimo). Mantener YAGNI: si el usuario no lo pide, no agregar más.

- [ ] **Step 4: Checkpoint** — `npm run typecheck` debe pasar.
- [ ] **Step 5: Verificación manual** — en el dashboard, tocar el buscador o la tarjeta "pacientes" → llega a "Mis Pacientes" → abrir un paciente → expediente.

---

## Task 6: Dashboard desktop — confirmar (sin cambios obligatorios)

**Files:**
- Verify: `src/atomic/pages/desktop/doctor/DoctorDashDesktopPage.tsx`

- [ ] **Step 1:** Confirmar que `NextPatientHero` ya ofrece "Ver expediente" (`goToScreen("doc-full")`) y `AccesoRapido` "Buscar paciente" (`goToScreen("dsk-patients")`). Ya existe navegación al expediente → **no se requiere cambio**. (Si el usuario quiere la stat "pacientes" clicable para paridad con móvil, es un extra opcional, no incluido por YAGNI.)

---

## Self-Review

**Spec coverage:**
- Editar datos generales (móvil + desktop) → Tasks 1–4. ✅
- Navegación + empty states desde el dashboard → Task 5 (móvil) + Task 6 (desktop ya cubierto). ✅
- Historia clínica → explícitamente fuera (backend). ✅
- `sensitivity_level` → excluido a propósito (señalado al usuario). ⚠️ desviación menor del spec, intencional por seguridad.

**Placeholder scan:** sin "TBD/TODO"; todo el código está completo. ✅

**Type consistency:** `PatientEditableValues`, `buildPatientUpdate`, `valuesFromPatient`, `hasPatientChanges`, `validatePatientDraft`, `GENDER_LABELS`, `genderLabelFromValue`, `genderValueFromLabel` se usan con la misma firma en Tasks 2–4. `updatePatientAuthed(id, PatientUpdate)` coincide con `patientsApi.ts`. ✅

**Riesgo conocido:** que el backend autorice al rol *doctor* a `PATCH /patients/{id}` — se valida en la verificación manual; si falla, se reporta (no se arregla aquí, es backend).
