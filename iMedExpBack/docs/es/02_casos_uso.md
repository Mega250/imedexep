# Modelo de Casos de Uso

## Actores

| Actor | Descripcion |
| --- | --- |
| Paciente | Persona titular del expediente. Puede registrarse, verificar su correo, consultar datos autorizados, generar QR y registrar ciclos menstruales propios. |
| Doctor | Profesional clinico. Atiende pacientes, registra consultas, diagnosticos, signos vitales y recetas. |
| Secretaria | Personal administrativo. Gestiona citas, contactos de emergencia y relaciones operativas segun permisos. |
| Administrador de Institucion | Administra doctores, secretarias, invitaciones y recursos de su institucion. |
| Superadministrador | Administra instituciones y usuarios administrativos globales. |
| Sistema de Observabilidad | Prometheus/Grafana/alertas que consultan salud y metricas protegidas. |

## Diagrama general de casos de uso

Fuente UML PlantUML: [01_casos_uso.puml](./uml/01_casos_uso.puml).

El diagrama usa actores UML, casos de uso numerados y relaciones `<<include>>` / `<<extend>>` donde hay dependencia funcional:

- `UC-04` incluye autenticacion (`UC-03`) porque requiere un token valido.
- `UC-14` y `UC-16` extienden la consulta clinica (`UC-13`) porque ocurren dentro del contexto de una atencion.
- `UC-23` incluye el historial de ciclos (`UC-22`) porque la prediccion depende de registros previos.
- `UC-21` depende del acceso temporal generado por QR (`UC-20`).

## Matriz de casos de uso

| ID | Caso de uso | Actores | Endpoints principales |
| --- | --- | --- | --- |
| UC-01 | Registro de paciente | Paciente | `POST /api/v1/auth/register` |
| UC-02 | Verificacion de correo | Paciente | `POST /api/v1/auth/verify-email`, `POST /api/v1/auth/resend-code` |
| UC-03 | Inicio y renovacion de sesion | Todos | `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh` |
| UC-04 | Consulta de usuario actual | Todos autenticados | `GET /api/v1/auth/me` |
| UC-05 | Gestion de instituciones | Superadmin | `/api/v1/institutions/*` |
| UC-06 | Gestion de admins institucionales | Superadmin | `/api/v1/institutions/{id}/admins` |
| UC-07 | Registro de doctor | Doctor | `POST /api/v1/auth/register-doctor` |
| UC-08 | Gestion de secretarias | Admin institucion | `/api/v1/secretary/*` |
| UC-09 | Asignacion secretaria-doctor | Admin institucion | `POST /api/v1/secretary/{id}/doctors` |
| UC-10 | Gestion de pacientes | Doctor, admin, superadmin, paciente segun RLS | `/api/v1/patients/*` |
| UC-11 | Relacion paciente-institucion | Secretaria, admin, superadmin | `/api/v1/patient-institution/*` |
| UC-12 | Gestion de citas | Staff autorizado | `/api/v1/appointments/*` |
| UC-13 | Inicio y consulta de consulta clinica | Doctor, usuarios con RLS | `/api/v1/consultations/*` |
| UC-14 | Diagnosticos | Doctor | `/api/v1/consultations/{id}/diagnosis` |
| UC-15 | Signos vitales | Doctor, admin, superadmin | `/api/v1/vitals/*` |
| UC-16 | Prescripciones y tratamientos | Doctor, usuarios con RLS | `/api/v1/prescriptions/*` |
| UC-17 | Catalogo de medicamentos | Publico/API cliente | `GET /api/v1/medications/search` |
| UC-18 | Contactos de emergencia | Paciente y staff autorizado | `/api/v1/emergency-contacts/*` |
| UC-19 | Invitaciones institucionales | Admin institucion, doctor | `/api/v1/invitations/*` |
| UC-20 | Generacion de QR | Paciente | `POST /api/v1/qr-access/generate` |
| UC-21 | Redencion de QR | Staff autorizado | `POST /api/v1/qr-access/redeem` |
| UC-22 | Registro de ciclo menstrual | Paciente, doctor, admin | `/api/v1/menstrual-cycles/*` |
| UC-23 | Prediccion menstrual | Usuarios con RLS | `GET /api/v1/menstrual-cycles/patient/{id}/prediction` |
| UC-24 | Salud, readiness y metricas | Operacion/observabilidad | `/live`, `/ready`, `/health`, `/metrics` |

## Detalle de casos de uso

### UC-01 Registro de paciente

**Objetivo:** crear una cuenta inicial de paciente y registrar sus datos basicos.

**Actor primario:** Paciente.

**Precondiciones:** el correo no debe estar registrado. La entrada debe cumplir validaciones de schema.

**Flujo principal:**

1. El cliente envia correo, password y datos personales a `POST /api/v1/auth/register`.
2. El backend valida estructura, formato y reglas de negocio.
3. Se crea usuario/paciente y se genera codigo de verificacion.
4. Si el correo esta habilitado, se envia codigo.
5. El sistema responde `201` con mensaje.

**Flujos alternos:**

- Datos invalidos: `422`.
- Correo duplicado o conflicto de datos: `409` o error de dominio.

**Postcondiciones:** existe una cuenta pendiente de verificacion.

### UC-02 Verificacion de correo

**Objetivo:** activar o validar una cuenta mediante codigo enviado al correo.

**Actor primario:** Paciente.

**Endpoints:** `POST /api/v1/auth/verify-email`, `POST /api/v1/auth/resend-code`.

**Flujo principal:**

1. El usuario envia correo y codigo.
2. El backend valida que el codigo exista, no haya expirado y corresponda al usuario.
3. Se marca la verificacion como completada.
4. Se devuelve par de tokens.

**Excepciones:** codigo invalido, expirado o correo inexistente.

### UC-03 Inicio y renovacion de sesion

**Objetivo:** autenticar usuarios y renovar tokens.

**Actores:** paciente, doctor, secretaria, admin de institucion, superadmin.

**Endpoints:** `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`.

**Flujo principal:**

1. El usuario envia correo y password.
2. El backend valida credenciales.
3. Se emiten access token y refresh token.
4. Las siguientes peticiones usan `Authorization: Bearer <token>`.

**Controles:**

- Rate limit estricto en `/api/v1/auth/*`.
- Respuestas `401` cuando faltan credenciales.
- Respuestas `403` cuando el usuario autenticado no tiene rol suficiente.

### UC-04 Consulta de usuario actual

**Objetivo:** obtener identidad y contexto del usuario autenticado.

**Endpoint:** `GET /api/v1/auth/me`.

**Flujo principal:** el cliente envia token, el backend parsea claims y consulta usuario.

**Postcondiciones:** el frontend conoce rol e institucion para construir la experiencia de usuario.

### UC-05 Gestion de instituciones

**Objetivo:** crear, listar, actualizar o desactivar instituciones.

**Actor:** Superadmin.

**Endpoints:** `POST`, `GET`, `PATCH`, `DELETE /api/v1/institutions/*`.

**Reglas:** solo `superadmin`. Los datos se validan con schemas de institucion.

### UC-06 Gestion de administradores institucionales

**Objetivo:** administrar cuentas con rol `institution_admin`.

**Actor:** Superadmin.

**Endpoints:** `/api/v1/institutions/{institution_id}/admins`.

**Flujo principal:** crear admin, listar admins, modificar estado o eliminar/desactivar.

### UC-07 Registro de doctor

**Objetivo:** registrar profesional medico con datos profesionales.

**Actor:** Doctor.

**Endpoint:** `POST /api/v1/auth/register-doctor`.

**Datos relevantes:** correo, password, nombre, cedula general, especialidad.

### UC-08 Gestion de secretarias

**Objetivo:** administrar personal administrativo de una institucion.

**Actor:** Admin de institucion.

**Endpoints:** `POST`, `GET`, `DELETE /api/v1/secretary/*`.

**Reglas:** solo `institution_admin`. La secretaria queda vinculada a la institucion del administrador.

### UC-09 Asignacion secretaria-doctor

**Objetivo:** asignar doctores a una secretaria.

**Actor:** Admin de institucion.

**Endpoint:** `POST /api/v1/secretary/{secretary_id}/doctors`.

**Postcondiciones:** existe relacion `secretary_doctor`.

### UC-10 Gestion de pacientes

**Objetivo:** crear, consultar, actualizar, listar y eliminar logicamente pacientes.

**Actores:** doctor, admin, superadmin y paciente segun contexto.

**Endpoints:** `/api/v1/patients/*`.

**Controles:** RLS filtra datos segun usuario, rol e institucion. Datos sensibles se almacenan cifrados.

### UC-11 Relacion paciente-institucion

**Objetivo:** vincular un paciente con una institucion para atencion.

**Actores:** secretaria, admin de institucion, superadmin.

**Endpoints:** `/api/v1/patient-institution/*`.

**Postcondiciones:** se habilita acceso RLS a datos clinicos segun politicas.

### UC-12 Gestion de citas

**Objetivo:** crear, listar, consultar, actualizar y cancelar citas.

**Actores:** staff autorizado y usuarios con acceso RLS.

**Endpoints:** `/api/v1/appointments/*`.

**Reglas:** cancelacion permitida a doctor, secretaria, admin de institucion y superadmin.

### UC-13 Inicio y consulta de consulta clinica

**Objetivo:** abrir una consulta clinica para un paciente.

**Actor primario:** Doctor.

**Endpoints:** `POST /api/v1/consultations/`, `GET /api/v1/consultations/*`.

**Flujo principal:**

1. Doctor inicia consulta con paciente e institucion.
2. Backend valida rol `doctor`.
3. Se crea registro clinico versionado.
4. Usuarios autorizados pueden consultar por RLS.

### UC-14 Registro de diagnosticos

**Objetivo:** asociar diagnosticos a una consulta.

**Actor:** Doctor.

**Endpoints:** `POST /api/v1/consultations/{consultation_id}/diagnosis`, `GET /api/v1/consultations/{consultation_id}/diagnosis`.

**Datos:** enfermedad catalogada, tipo de diagnostico, notas adicionales.

### UC-15 Registro de signos vitales

**Objetivo:** capturar mediciones clinicas del paciente.

**Actores:** doctor, admin de institucion, superadmin.

**Endpoints:** `POST /api/v1/vitals/`, `GET /api/v1/vitals/patient/{id}`, `GET /api/v1/vitals/patient/{id}/latest`.

### UC-16 Prescripciones y tratamientos

**Objetivo:** crear receta, agregar tratamientos y firmar prescripcion.

**Actor primario:** Doctor.

**Endpoints:** `/api/v1/prescriptions/*`.

**Reglas:** creacion y firma requieren doctor. Consulta se filtra por RLS.

### UC-17 Busqueda de medicamentos

**Objetivo:** autocompletar medicamentos desde catalogo.

**Actor:** cliente publico/API frontend.

**Endpoint:** `GET /api/v1/medications/search?q=texto`.

**Seguridad:** consulta parametrizada por SQLAlchemy y validacion de longitud minima.

### UC-18 Contactos de emergencia

**Objetivo:** crear, listar, actualizar y eliminar contactos del paciente.

**Actores:** paciente y staff autorizado.

**Endpoints:** `/api/v1/emergency-contacts/*`.

### UC-19 Invitaciones institucionales

**Objetivo:** invitar doctores a una institucion y aceptar/rechazar invitaciones.

**Actores:** admin de institucion y doctor.

**Endpoints:** `POST /api/v1/invitations/`, `PATCH /api/v1/invitations/{id}`.

### UC-20 Generacion de acceso QR

**Objetivo:** permitir al paciente emitir un acceso temporal a su expediente.

**Actor:** Paciente.

**Endpoint:** `POST /api/v1/qr-access/generate`.

**Postcondiciones:** se crea token/registro de acceso temporal.

### UC-21 Redencion de acceso QR

**Objetivo:** permitir a staff autorizado acceder temporalmente al expediente mediante QR.

**Actores:** doctor, secretaria, admin de institucion, superadmin.

**Endpoint:** `POST /api/v1/qr-access/redeem`.

**Reglas:** valida token QR, vigencia y rol.

### UC-22 Gestion de ciclo menstrual

**Objetivo:** registrar, listar y eliminar registros de menstruacion.

**Actores:** paciente, doctor, admin de institucion, superadmin.

**Endpoints:** `POST /api/v1/menstrual-cycles/`, `GET /api/v1/menstrual-cycles/patient/{patient_id}`, `DELETE /api/v1/menstrual-cycles/{cycle_id}`.

**Validaciones:**

- Fecha de inicio no futura.
- Fecha de fin no futura.
- Fecha de fin posterior o igual a inicio.
- Duracion maxima de sangrado.
- Sintomas acotados para evitar payloads grandes/anidados.

### UC-23 Prediccion menstrual

**Objetivo:** estimar siguiente menstruacion y ventana probable.

**Actores:** paciente y staff autorizado con acceso RLS.

**Endpoint:** `GET /api/v1/menstrual-cycles/patient/{patient_id}/prediction`.

**Comportamiento:**

- Usa historial personalizado de ciclos.
- Clasifica regularidad: `insufficient_data`, `regular`, `mostly_regular`, `irregular`, `highly_irregular`.
- Amplia ventana y baja confianza en ciclos irregulares.
- Devuelve metadata del modelo.

### UC-24 Salud y metricas

**Objetivo:** permitir operacion segura del sistema.

**Actor:** Sistema de observabilidad.

**Endpoints:** `/live`, `/ready`, `/health`, `/metrics`.

**Reglas:**

- `/live` no depende de DB.
- `/ready` y `/health` validan DB.
- `/metrics` requiere bearer token y debe ser consumido solo internamente.

## Matriz tecnica de validaciones y resultados

| ID | Precondiciones | Resultado esperado | Errores principales |
| --- | --- | --- | --- |
| UC-01 | Correo no registrado y password valido. | Usuario paciente creado y codigo de verificacion emitido. | `409` duplicado, `422` payload invalido. |
| UC-02 | Codigo vigente asociado al correo. | Usuario verificado y tokens emitidos. | `400/401` codigo invalido, `410` expirado si se modela. |
| UC-03 | Credenciales correctas y usuario activo. | Access token y refresh token. | `401` credenciales invalidas, `429` exceso de intentos. |
| UC-04 | JWT valido. | Perfil del usuario autenticado. | `401` token ausente/invalido. |
| UC-05 | Rol `superadmin`. | Institucion creada/listada/actualizada/desactivada. | `403` rol insuficiente, `404` inexistente. |
| UC-06 | Rol `superadmin` e institucion existente. | Admin institucional creado/listado/actualizado/desactivado. | `403`, `404`, `409` correo duplicado. |
| UC-07 | Correo no registrado y datos profesionales validos. | Cuenta de doctor pendiente o confirmada segun flujo. | `409`, `422`. |
| UC-08 | Rol `institution_admin`. | Secretaria creada/listada/desactivada en la institucion del admin. | `403`, `404`, `409`. |
| UC-09 | Secretaria y doctor validos en contexto permitido. | Relacion secretaria-doctor creada. | `403`, `404`, `409` relacion duplicada. |
| UC-10 | JWT valido y acceso RLS al paciente. | Paciente creado/consultado/actualizado/desactivado. | `401`, `403`, `404`, `422`. |
| UC-11 | Paciente e institucion existentes y rol autorizado. | Relacion paciente-institucion creada o eliminada. | `403`, `404`, `409`. |
| UC-12 | Staff autorizado y entidades existentes. | Cita creada/listada/actualizada/cancelada. | `403`, `404`, `409` conflicto de agenda si se modela. |
| UC-13 | Doctor autenticado y paciente accesible. | Consulta clinica creada o consultada. | `403`, `404`, `422`. |
| UC-14 | Consulta existente y doctor autorizado. | Diagnostico asociado a consulta. | `403`, `404`, `422`. |
| UC-15 | Rol clinico/admin autorizado y paciente accesible. | Signos vitales registrados o consultados. | `403`, `404`, `422`. |
| UC-16 | Consulta existente y doctor autorizado. | Receta creada, tratamientos agregados o receta firmada. | `403`, `404`, `409` receta ya firmada. |
| UC-17 | Query de busqueda valida. | Lista de medicamentos coincidentes. | `422` query invalida, `429` exceso de cuota. |
| UC-18 | Paciente accesible por actor. | Contacto creado/listado/actualizado/eliminado. | `403`, `404`, `422`. |
| UC-19 | Admin institucional o doctor segun accion. | Invitacion creada, aceptada o rechazada. | `403`, `404`, `409`, `410` si expirada. |
| UC-20 | Paciente autenticado. | QR temporal generado con expiracion. | `401`, `403`, `429`. |
| UC-21 | Staff autorizado y token QR vigente. | Acceso temporal concedido al expediente permitido. | `403`, `404`, `410` token expirado/usado. |
| UC-22 | Paciente accesible y fechas validas. | Ciclo menstrual creado/listado/eliminado. | `403`, `404`, `422`. |
| UC-23 | Paciente accesible e historial consultable. | Prediccion con fecha, ventana, regularidad y confianza. | `403`, `404`, `422` si historial insuficiente segun contrato. |
| UC-24 | Servicio activo; token para `/metrics`. | Estado de salud o metricas. | `401` metricas sin token, `503` DB no lista. |
