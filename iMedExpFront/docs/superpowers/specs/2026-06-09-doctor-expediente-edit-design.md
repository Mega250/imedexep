# Doctor — Ver / editar expediente del paciente (slice frontend)

- **Fecha:** 2026-06-09
- **Estado:** diseño aprobado en conversación; pendiente revisión de este spec.
- **Alcance autorizado:** SOLO frontend. Lo que requiera backend se reporta y se detiene.

## Problema

El médico ya ve a sus pacientes vinculados en "Mis Pacientes" (`mob-patients`) y puede abrir el expediente (`doc-full-mob`), pero el expediente es **solo-lectura** y se siente **incompleto**. Se necesita: (a) un acceso claro al expediente **desde el dashboard**, y (b) que el médico pueda **editar** la información del paciente.

La **historia clínica paciente-scoped** (alergias / cirugías / vacunas / antecedentes) NO es alcanzable desde el front: el único servicio es `clinical-history/me` (la del usuario autenticado). → Queda como **trabajo de backend** (falta endpoint por `patientId`).

## Alcance

**Dentro (100% frontend):**

1. **Editar datos generales** del paciente desde el expediente, en **móvil (`doc-full-mob`)** y **desktop (`doc-full`)**.
   - Campos editables: `first_name, last_name, gender, blood_type, phone, street_address, neighborhood, postal_code, city, state, sensitivity_level`.
   - API existente: `updatePatientAuthed(id, payload)` → `PATCH /api/v1/patients/{id}`.
   - Inmutables (excluidos por el tipo `PatientUpdate`): `curp`, `date_of_birth`.
2. **Navegación + empty states desde el dashboard**, en **móvil (`dash-mob`)** y **desktop (`doctor-dash`)**: acceso directo para abrir el expediente de un paciente y empty states honestos.

**Fuera (→ backend, ya reportado):**

- Ver/editar la **historia clínica** del paciente (falta endpoint paciente-scoped).
- A verificar en pruebas: que el rol *doctor* esté autorizado a `PATCH /patients/{id}` (si el backend lo rechaza, se reporta).

## Diseño

### 1. Editar datos generales — UX: hoja/modal

- En el expediente, botón explícito **"Editar"** (en el hero o en el encabezado de las secciones de datos).
- Abre una **hoja modal** con formulario, **reusando** `FormField` / `TextField` / `SelectField` (género y tipo de sangre como selección donde aplique). Prefill con los datos actuales del paciente.
- **Guardar** → arma un `PatientUpdate` **solo con los campos modificados** → `updatePatientAuthed` → cierra → **refetch** del expediente → refleja los cambios.
- Estados: `submitting`, error (tokens `alert`), validación mínima. **Cancelar** descarta sin guardar.
- La edición es **explícita y separada** de la lectura (respeta "confianza por honestidad" del PRODUCT.md; evita ediciones accidentales).

### 2. Dashboard — navegación + empty states

- Móvil (`dash-mob`) y desktop (`doctor-dash`): proveer un acceso claro para **abrir el expediente** de un paciente (hacer accionable la búsqueda/atajo a "Mis Pacientes" o una lista corta → `setSelectedPatientId(id)` + `goToScreen("doc-full-mob" | "doc-full")`).
- Empty states honestos cuando no hay pacientes/citas (texto claro, sin controles que no funcionen).

### Reglas transversales

- **Sin hardcoding:** colores / espaciados / tipografía desde `src/theme`. Solo componentes atómicos existentes (reuse-before-invent).
- Mantener **paridad móvil/desktop** (archivos separados, según el patrón del proyecto).

## Datos / contratos (ya existentes en `patientsApi.ts`)

- Lectura: `PatientFull` vía `fetchPatientFull(id)`.
- Edición: `PatientUpdate = Partial<Omit<PatientCreate, "curp" | "date_of_birth">>`; `updatePatientAuthed(patientId, payload)`.

## Pruebas (TDD)

- **Unidad:** armado del payload (solo campos cambiados; nunca `curp`/`date_of_birth`), validación, mapeo de error.
- **Componente** (si el setup lo permite): el modal hace prefill, guarda y dispara refetch; el botón "Editar" abre/cierra.
- **Verificación real:** persistencia + permiso del doctor en la app corriendo (skill `verify`).

## A confirmar en la fase de implementación (aún no re-explorado, para no sobre-explorar)

- API exacta de `FormField` / `TextField` / `SelectField`, y si conviene reusar `RecordFormModal` o crear una hoja `EditPatientSheet` nueva.
- Estructura de `DocFullDesktopPage` y `DoctorDashDesktopPage`.
- Setup de pruebas (Jest / React Native Testing Library) del proyecto.
