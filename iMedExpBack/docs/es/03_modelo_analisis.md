# Modelo de Analisis

## Proposito

El modelo de analisis describe el problema desde el punto de vista funcional y de dominio, sin entrar todavia al detalle de infraestructura. Su objetivo es explicar que objetos participan en los casos de uso, que responsabilidades tienen y que reglas de negocio deben cumplirse.

## Diagramas UML incluidos

| Diagrama | Archivo | Tipo |
| --- | --- | --- |
| Dominio de analisis | [02_analisis_dominio.puml](./uml/02_analisis_dominio.puml) | Diagrama UML de clases con estereotipos `boundary`, `control` y `entity`. |
| Consulta clinica | [03_analisis_consulta_sequence.puml](./uml/03_analisis_consulta_sequence.puml) | Diagrama UML de secuencia. |
| Salud menstrual | [04_analisis_menstrual_sequence.puml](./uml/04_analisis_menstrual_sequence.puml) | Diagrama UML de secuencia. |

## Estereotipos usados

| Estereotipo | Significado en el sistema |
| --- | --- |
| `<<boundary>>` | Punto de entrada del caso de uso. Normalmente corresponde a un router FastAPI en `app/api/v1/`. |
| `<<control>>` | Orquestador de reglas de negocio. Corresponde a servicios en `app/services/` o dependencias de autorizacion. |
| `<<entity>>` | Objeto persistente del dominio. Corresponde a modelos SQLAlchemy en `app/models/`. |

## Contextos de dominio

### Identidad y acceso

Agrupa autenticacion, emision de tokens, registro de pacientes/doctores, verificacion de correo y consulta de usuario actual.

Entidades principales:

- `User`: identidad base con correo, password hash, rol y estado.
- `EmailVerificationCode`: codigo temporal para activar cuenta.

Reglas:

- Un usuario tiene un rol unico.
- La autenticacion debe tener rate limit estricto.
- En produccion no se devuelven trazas ni detalles internos.

### Administracion institucional

Agrupa instituciones, administradores, secretarias, doctores asociados e invitaciones.

Entidades principales:

- `Institution`: unidad operativa donde ocurre la atencion.
- `InstitutionInvitation`: invitacion para asociar doctores.
- `Secretary` y `SecretaryDoctor`: personal administrativo y asignaciones.

Reglas:

- El `superadmin` gobierna instituciones.
- El `institution_admin` gobierna recursos de su institucion.
- La autorizacion efectiva debe ocurrir en backend, no en frontend.

### Personas y agenda

Agrupa pacientes, doctores, contactos, relaciones paciente-institucion y citas.

Entidades principales:

- `Patient`: titular del expediente.
- `Doctor`: profesional medico.
- `Appointment`: evento programado de atencion.
- `PatientInstitution`: relacion que habilita acceso institucional.

Reglas:

- El acceso a pacientes se filtra por RLS.
- La cita siempre pertenece a paciente, doctor e institucion.
- Los datos personales sensibles se almacenan cifrados cuando aplica.

### Atencion clinica

Agrupa consultas, diagnosticos, signos vitales, recetas y tratamientos.

Entidades principales:

- `Consultation`: evento clinico principal.
- `Diagnosis`: diagnostico asociado a una consulta.
- `VitalSign`: mediciones clinicas.
- `Prescription`: receta.
- `TreatmentDetail`: medicamentos e instrucciones de tratamiento.

Reglas:

- El doctor crea y firma prescripciones.
- Los diagnosticos deben asociarse a catalogos cuando existan.
- Las consultas y recetas deben auditarse por ser informacion clinica sensible.

### Salud menstrual

Agrupa registro de ciclos y prediccion del siguiente periodo.

Entidades y controles:

- `MenstrualCycle`: registro historico de inicio, fin, flujo, sintomas y notas.
- `MenstrualCycleService`: valida reglas de entrada y acceso.
- `MenstrualCyclePredictor`: calcula regularidad, confianza y ventana probable.

Reglas:

- No se aceptan fechas futuras.
- La fecha de fin debe ser igual o posterior a la de inicio.
- El historial personalizado pesa mas que valores genericos.
- Para pacientes irregulares la ventana se amplia y la confianza baja.

## Secuencia de consulta clinica

El diagrama [03_analisis_consulta_sequence.puml](./uml/03_analisis_consulta_sequence.puml) documenta el caso de uso clinico principal:

1. El doctor crea una consulta.
2. El backend valida JWT, rol y contexto RLS.
3. La consulta se persiste en `clinical.consultations`.
4. El doctor agrega diagnostico.
5. El doctor crea receta asociada a la consulta.

Este flujo separa claramente entrada HTTP, autorizacion, servicio de dominio y persistencia.

## Secuencia de prediccion menstrual

El diagrama [04_analisis_menstrual_sequence.puml](./uml/04_analisis_menstrual_sequence.puml) documenta:

1. Registro de un ciclo menstrual.
2. Validacion de fechas, flujo y sintomas.
3. Consulta de historial por paciente.
4. Calculo de intervalos entre ciclos.
5. Clasificacion de regularidad.
6. Respuesta con fecha esperada, ventana probable, confianza y metadata del modelo.

La prediccion no se trata como diagnostico medico definitivo. Es una estimacion basada en historial y debe presentarse al usuario como apoyo informativo.

## Reglas no funcionales derivadas del analisis

| Requisito | Implicacion tecnica |
| --- | --- |
| Confidencialidad clinica | JWT, roles, RLS, cifrado, secretos fuera de Git. |
| Disponibilidad | Rate limit, limites de body, readiness/liveness, HPA, WAF/CDN en produccion. |
| Trazabilidad | Triggers de auditoria y logs estructurados sin datos sensibles. |
| Integridad | Validacion Pydantic, repositorios con queries parametrizadas, constraints de DB. |
| Cumplimiento | Documentacion, controles de acceso, bitacora, backups y politicas operativas. |
