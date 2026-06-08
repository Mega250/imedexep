# Modelo de Diseno

## Proposito

El modelo de diseno convierte el analisis en estructura tecnica: clases, relaciones, capas y responsabilidades. Este documento se centra en como estan organizadas las entidades y servicios que implementan los casos de uso.

## Diagramas UML incluidos

| Diagrama | Archivo | Tipo |
| --- | --- | --- |
| Clases core | [05_diseno_clases_core.puml](./uml/05_diseno_clases_core.puml) | Diagrama UML de clases. |
| Clases clinicas | [06_diseno_clases_clinico.puml](./uml/06_diseno_clases_clinico.puml) | Diagrama UML de clases. |

## Principios de diseno

1. Separar entrada HTTP de reglas de negocio.
2. Mantener schemas Pydantic como contrato externo de API.
3. Mantener modelos SQLAlchemy como contrato interno de persistencia.
4. Encapsular queries en repositorios.
5. Mantener RLS como segunda capa de defensa en base de datos.
6. No depender de validaciones de frontend para autorizacion o integridad.

## Diseno por capas

| Capa | Codigo | Responsabilidad |
| --- | --- | --- |
| Router | `app/api/v1/*.py` | Define endpoints, status codes, dependencias y DTOs. |
| Dependencias | `app/api/deps.py` | Resuelve usuario, roles, institucion y contexto RLS. |
| Servicio | `app/services/*.py` | Ejecuta reglas de negocio y coordina repositorios. |
| Repositorio | `app/repositories/*.py` | Ejecuta acceso a datos con SQLAlchemy async. |
| Modelo | `app/models/*.py` | Define entidades persistentes y relaciones ORM. |
| Schema | `app/schemas/*.py` | Valida entrada y serializa salida. |
| Core | `app/core/*.py` | Configuracion, DB, seguridad, middleware y metricas. |

## Diagrama de clases core

El diagrama [05_diseno_clases_core.puml](./uml/05_diseno_clases_core.puml) modela las entidades administrativas:

- `User` es la identidad comun.
- `Patient`, `Doctor` y `Secretary` especializan el perfil operacional mediante relacion uno-a-cero/uno con `User`.
- `Institution` agrupa la operacion institucional.
- `PatientInstitution` representa la relacion muchos-a-muchos entre pacientes e instituciones.
- `Appointment` une paciente, doctor e institucion en una atencion programada.
- `QRRecordAccess` permite accesos temporales al expediente.
- `InstitutionInvitation` formaliza invitaciones de doctores.

Relaciones clave:

| Relacion | Cardinalidad | Motivo |
| --- | --- | --- |
| `User` - `Patient` | `1` a `0..1` | No todo usuario es paciente. |
| `User` - `Doctor` | `1` a `0..1` | No todo usuario es doctor. |
| `Institution` - `Secretary` | `1` a `0..*` | Una institucion puede tener varias secretarias. |
| `Patient` - `Institution` | `*` a `*` via `PatientInstitution` | Un paciente puede atenderse en varias instituciones. |
| `Appointment` - `Patient/Doctor/Institution` | `*` a `1` | Toda cita requiere estos tres contextos. |

## Diagrama de clases clinicas

El diagrama [06_diseno_clases_clinico.puml](./uml/06_diseno_clases_clinico.puml) modela el expediente:

- `Consultation` es la raiz de una atencion.
- `Diagnosis` depende de una consulta y referencia `Disease`.
- `Prescription` se asocia a una consulta, paciente y doctor.
- `TreatmentDetail` descompone la receta en medicamentos e instrucciones.
- `VitalSign` registra mediciones por paciente.
- `MenstrualCycle` registra historial menstrual.
- `MenstrualCyclePredictor` usa el historial para estimar el siguiente ciclo.

Relaciones clave:

| Relacion | Cardinalidad | Motivo |
| --- | --- | --- |
| `Consultation` - `Diagnosis` | `1` a `0..*` | Una consulta puede tener varios diagnosticos. |
| `Consultation` - `Prescription` | `1` a `0..1` | Una consulta puede o no generar receta. |
| `Prescription` - `TreatmentDetail` | `1` a `0..*` | Una receta puede incluir multiples tratamientos. |
| `Patient` - `MenstrualCycle` | `1` a `0..*` | La prediccion requiere historial por paciente. |

## Diseno de prediccion menstrual

La prediccion actual es un modelo estadistico personalizado, apropiado como primera version de machine learning operativo porque aprende del historial individual sin requerir un dataset externo.

Entradas:

- Fechas de inicio de ciclos historicos.
- Duracion del sangrado cuando existe fecha de fin.
- Variabilidad de intervalos.
- Cantidad de datos disponibles.

Salidas:

- Fecha esperada del siguiente inicio.
- Ventana probable.
- Clasificacion de regularidad.
- Puntaje de confianza.
- Metadata del modelo.

Reglas de diseno:

- Con pocos ciclos se devuelve `insufficient_data`.
- En ciclos regulares se usa ventana mas estrecha.
- En ciclos irregulares se usa ventana mas amplia.
- La respuesta debe evitar lenguaje determinista porque no es diagnostico.

## Contratos de datos

Los modelos ORM no se exponen directamente. Cada endpoint debe devolver schemas Pydantic para evitar fuga accidental de campos internos, hashes, tokens o columnas cifradas.

Ejemplo de separacion:

| Modelo interno | Schema externo |
| --- | --- |
| `User` | `UserMeResponse`, `TokenResponse` |
| `Patient` | `PatientResponse`, `PatientFullResponse` |
| `MenstrualCycle` | `MenstrualCycleResponse`, `MenstrualCyclePredictionResponse` |
| `Prescription` | `PrescriptionResponse` |

## Decisiones de seguridad en el diseno

- Toda autorizacion sensible vive en backend.
- RLS protege aun si un repositorio comete un error de filtro.
- Los endpoints clinicos deben requerir identidad autenticada.
- Los errores se sanitizan en produccion.
- Las queries se construyen con SQLAlchemy y parametros, no concatenacion manual.
