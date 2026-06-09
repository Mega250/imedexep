# Modelo de Base de Datos

## Proposito

El modelo de base de datos documenta la persistencia relacional del expediente clinico. Incluye entidades, relaciones, esquemas, politicas RLS, auditoria e indices relevantes.

## Diagrama E-R

Fuente UML/PlantUML: [09_base_datos_er.puml](./uml/09_base_datos_er.puml).

El diagrama usa notacion de entidad-relacion compatible con PlantUML. Las columnas marcadas como `PK` son llaves primarias y las marcadas como `FK` son llaves foraneas.

## Esquemas

| Esquema | Contenido |
| --- | --- |
| `core` | Usuarios, pacientes, doctores, instituciones, agenda, relaciones administrativas y accesos QR. |
| `clinical` | Consultas, diagnosticos, signos vitales, recetas, tratamientos y ciclos menstruales. |
| `catalog` | Catalogos medicos como medicamentos y enfermedades. |
| `audit` | Bitacora de cambios. |

## Entidades core

| Tabla | Descripcion |
| --- | --- |
| `core.users` | Identidad y credenciales de acceso. |
| `core.patients` | Perfil clinico-administrativo del paciente. |
| `core.doctors` | Perfil profesional del doctor. |
| `core.institutions` | Instituciones donde ocurre atencion. |
| `core.secretaries` | Personal administrativo vinculado a institucion. |
| `core.patient_institutions` | Relacion muchos-a-muchos paciente-institucion. |
| `core.appointments` | Citas programadas. |
| `core.emergency_contacts` | Contactos de emergencia del paciente. |
| `core.qr_record_access` | Accesos temporales por QR. |

## Entidades clinicas

| Tabla | Descripcion |
| --- | --- |
| `clinical.consultations` | Evento clinico principal. |
| `clinical.diagnosis` | Diagnosticos de una consulta. |
| `clinical.vital_signs` | Mediciones de signos vitales. |
| `clinical.prescriptions` | Recetas emitidas. |
| `clinical.treatment_details` | Medicamentos e instrucciones de una receta. |
| `clinical.menstrual_cycles` | Historial menstrual por paciente. |

## Catalogos

| Tabla | Descripcion |
| --- | --- |
| `catalog.diseases` | Enfermedades o diagnosticos catalogados. |
| `catalog.medications` | Medicamentos para busqueda y prescripcion. |

## Relaciones principales

| Relacion | Cardinalidad | Descripcion |
| --- | --- | --- |
| `users` a `patients` | `1` a `0..1` | Un usuario puede tener perfil paciente. |
| `users` a `doctors` | `1` a `0..1` | Un usuario puede tener perfil doctor. |
| `users` a `secretaries` | `1` a `0..1` | Un usuario puede tener perfil secretaria. |
| `patients` a `institutions` | `*` a `*` | Mediante `patient_institutions`. |
| `appointments` a `patients/doctors/institutions` | `*` a `1` | Toda cita tiene esos contextos. |
| `consultations` a `diagnosis` | `1` a `0..*` | Una consulta puede tener multiples diagnosticos. |
| `consultations` a `prescriptions` | `1` a `0..1` | Una consulta puede generar una receta. |
| `prescriptions` a `treatment_details` | `1` a `0..*` | Una receta puede contener varios tratamientos. |
| `patients` a `menstrual_cycles` | `1` a `0..*` | Historial de ciclos por paciente. |

## Orden de inicializacion SQL

Los archivos en `sql/` deben ejecutarse de forma ordenada:

1. Extensiones y esquemas.
2. Tipos/enums.
3. Tablas `core`.
4. Tablas `clinical`.
5. Tablas `catalog` y `audit`.
6. Funciones.
7. Triggers.
8. Politicas RLS.
9. Indices.

Este orden evita referencias a tipos, funciones o tablas no creadas.

## Row Level Security

RLS es una capa de autorizacion dentro de PostgreSQL. El backend configura variables de sesion con el usuario, rol e institucion. Las politicas usan ese contexto para permitir o negar filas.

Objetivo:

- Reducir el impacto de errores de filtro en codigo.
- Impedir acceso lateral entre instituciones.
- Proteger expedientes de pacientes fuera del contexto permitido.

RLS no sustituye validaciones de backend. Debe operar como defensa en profundidad.

## Auditoria

Las tablas sensibles deben registrar cambios relevantes en `audit.audit_log`.

Eventos esperados:

- Inserciones clinicas.
- Actualizaciones de datos sensibles.
- Eliminaciones logicas o cambios de estado.
- Cambios en relaciones paciente-institucion.

Los logs no deben almacenar passwords, tokens, secretos ni datos cifrados en claro.

## Indices

Indices recomendados y aplicados segun uso:

- Llaves foraneas frecuentes: `patient_id`, `doctor_id`, `institution_id`, `consultation_id`.
- Busqueda de medicamentos por nombre/principio activo.
- Fechas de agenda y consultas.
- Historial menstrual por `patient_id` y `start_date`.
- Tokens QR por hash y expiracion.

## Cifrado

Los datos identificables sensibles se cifran en la capa de aplicacion cuando aplica. La llave `ENCRYPTION_KEY` debe residir en gestor de secretos y rotarse con procedimiento documentado.

Buenas practicas:

- Cifrado de volumen/base administrada.
- TLS entre API y PostgreSQL.
- Backups cifrados.
- Separacion de usuario de aplicacion y usuario administrador.
