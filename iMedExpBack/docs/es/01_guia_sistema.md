# Guia del Sistema y Operacion

## Que es iMedExp Backend

iMedExp Backend es una API REST para gestionar expediente clinico electronico. El sistema permite registrar pacientes, doctores, instituciones, citas, consultas, diagnosticos, signos vitales, recetas, tratamientos, contactos de emergencia, accesos por QR, ciclos menstruales y prediccion del siguiente periodo.

El backend esta construido con:

- Python 3.12.
- FastAPI.
- SQLAlchemy async.
- PostgreSQL con esquemas separados, RLS y auditoria.
- Docker y Docker Compose.
- Helm y Terraform para despliegue Kubernetes.
- Prometheus/Grafana como base de observabilidad.

## Objetivo funcional

Centralizar operaciones clinicas y administrativas manteniendo controles de seguridad apropiados para informacion sensible de salud:

- Autenticacion por JWT.
- Autorizacion por roles.
- Row Level Security en base de datos.
- Cifrado de datos identificables sensibles.
- Auditoria de cambios en tablas clinicas y core.
- Limitacion de tasa y tamano de request.
- Cabeceras de seguridad.
- Endpoints de observabilidad protegidos.

## Roles principales

| Rol | Descripcion |
| --- | --- |
| `patient` | Usuario paciente. Puede consultar o gestionar datos propios donde aplique. |
| `doctor` | Profesional medico. Gestiona consultas, diagnosticos, recetas, signos vitales y datos clinicos permitidos. |
| `secretary` | Apoyo administrativo. Gestiona citas, relaciones paciente-institucion y contactos segun permisos. |
| `institution_admin` | Administra usuarios y recursos de una institucion. |
| `superadmin` | Administra instituciones y configuraciones globales. |

## Arquitectura logica

La arquitectura logica oficial esta documentada como diagrama UML de componentes en [07_implementacion_componentes.puml](./uml/07_implementacion_componentes.puml).

Resumen de capas:

| Capa | Responsabilidad |
| --- | --- |
| Cliente | Consumir la API por HTTP/JSON desde web o movil. |
| Middleware | Aplicar limite de body, rate limit, metricas y cabeceras de seguridad. |
| Router API | Exponer endpoints versionados y mapear requests a schemas Pydantic. |
| Dependencias | Resolver identidad, roles, permisos y contexto RLS. |
| Servicios | Ejecutar reglas de negocio y orquestar casos de uso. |
| Repositorios | Encapsular queries SQLAlchemy parametrizadas. |
| Base de datos | Persistencia PostgreSQL con RLS, triggers de auditoria e indices. |

## Estructura de carpetas

| Ruta | Proposito |
| --- | --- |
| `app/api/v1/` | Rutas HTTP versionadas. |
| `app/core/` | Configuracion, seguridad, base de datos, middleware y metricas. |
| `app/models/` | Modelos ORM SQLAlchemy. |
| `app/schemas/` | DTOs y validaciones Pydantic. |
| `app/services/` | Logica de negocio. |
| `app/repositories/` | Acceso a datos. |
| `sql/` | Bootstrap de PostgreSQL: esquemas, tablas, funciones, RLS, triggers e indices. |
| `tests/` | Pruebas automatizadas. |
| `infra/helm/imedexp-api/` | Chart Helm de la API. |
| `infra/terraform/kubernetes/` | Terraform para desplegar en un cluster existente. |
| `infra/monitoring/` | Dashboard Grafana inicial. |
| `ops/nginx/` | Configuracion base de proxy reverso. |

## Configuracion

El sistema usa variables de entorno. En desarrollo se puede partir de `env.example`.

Variables esenciales:

| Variable | Uso |
| --- | --- |
| `APP_ENV` | `development`, `testing` o `production`. |
| `DEBUG` | Debe ser `false` en produccion. |
| `POSTGRES_HOST` | Host de PostgreSQL. |
| `POSTGRES_PORT` | Puerto de PostgreSQL. |
| `POSTGRES_DB` | Base de datos. |
| `POSTGRES_USER` | Usuario de aplicacion. |
| `POSTGRES_PASSWORD` | Password del usuario de aplicacion. |
| `JWT_SECRET_KEY` | Secreto de firma JWT. Minimo 32 caracteres en produccion. |
| `ENCRYPTION_KEY` | Llave Fernet para cifrado de datos sensibles. |
| `CORS_ALLOW_ORIGINS` | Origenes frontend permitidos en produccion. |
| `RATE_LIMIT_*` | Limites de tasa por IP. |
| `MAX_REQUEST_BODY_BYTES` | Tamano maximo de body. |
| `METRICS_ENABLED` | Habilita `/metrics`. |
| `METRICS_BEARER_TOKEN` | Bearer token para Prometheus. |

## Comandos de desarrollo

### Levantar stack local

```bash
docker compose -f docker-compose.yaml up --build
```

En Windows PowerShell, para preparar la base local desde cero:

```powershell
.\scripts\windows\loadBd.ps1
```

Levanta:

- API en `127.0.0.1:8000`.
- PostgreSQL en `127.0.0.1:5432`.
- Neo4j en `127.0.0.1:7474` y `127.0.0.1:7687`.

### Ejecutar pruebas completas

```bash
docker compose -f docker-compose.test.yaml up --build --abort-on-container-exit --exit-code-from tests
```

Este comando crea una base PostgreSQL limpia, ejecuta los SQL de bootstrap y corre la suite.

Para correr cada nodo de prueba por separado:

```bash
bash scripts/linux/run_docker_tests_individual.sh
```

En Windows PowerShell:

```powershell
.\scripts\windows\run_docker_tests_individual.ps1
```

Para generar el PDF imprimible de la documentacion:

```bash
bash scripts/linux/build_docs_pdf.sh
```

En Windows PowerShell:

```powershell
.\scripts\windows\build_docs_pdf.ps1
```

### Limpiar volumenes de prueba

```bash
docker compose -f docker-compose.test.yaml down -v
```

Usar cuando se cambian archivos SQL de inicializacion.

### Validar Python

```bash
python3 -m compileall -q app tests
```

### Auditar dependencias

```bash
pip-audit -r requirements.txt
```

En Docker:

```bash
docker compose -f docker-compose.test.yaml run --rm --no-deps tests sh -c 'python -m pip install --user pip-audit && /home/appuser/.local/bin/pip-audit -r requirements.txt'
```

### Validar Helm

```bash
docker run --rm -v "$PWD:/workspace" -w /workspace alpine/helm:3.17.0 lint infra/helm/imedexp-api
docker run --rm -v "$PWD:/workspace" -w /workspace alpine/helm:3.17.0 template imedexp-api infra/helm/imedexp-api
```

### Validar Terraform

```bash
docker run --rm -v "$PWD:/workspace" -w /workspace hashicorp/terraform:1.10 -chdir=infra/terraform/kubernetes fmt -check
docker run --rm -v "$PWD:/workspace" -w /workspace hashicorp/terraform:1.10 -chdir=infra/terraform/kubernetes init -backend=false
docker run --rm -v "$PWD:/workspace" -w /workspace hashicorp/terraform:1.10 -chdir=infra/terraform/kubernetes validate
```

## Endpoints de infraestructura

| Endpoint | Uso | Observacion |
| --- | --- | --- |
| `GET /live` | Liveness probe. | No depende de DB. |
| `GET /ready` | Readiness probe. | Verifica DB. |
| `GET /health` | Salud general. | Verifica DB. |
| `GET /metrics` | Metricas Prometheus. | Requiere `METRICS_ENABLED=true` y bearer token. |

## Flujo general de una peticion protegida

El flujo de seguridad por request esta modelado como diagrama UML de secuencia en [11_seguridad_secuencia.puml](./uml/11_seguridad_secuencia.puml).

Secuencia conceptual:

1. El cliente envia request HTTP con `Authorization: Bearer <token>` cuando el endpoint lo requiere.
2. El middleware rechaza payloads excesivos y peticiones que excedan cuota.
3. El router valida payload con Pydantic.
4. Las dependencias validan JWT, rol y contexto de institucion/paciente.
5. El backend inicializa variables de sesion para RLS en PostgreSQL.
6. Servicio y repositorio ejecutan el caso de uso con queries parametrizadas.
7. PostgreSQL devuelve solamente filas permitidas por politicas RLS.
8. La respuesta sale con cabeceras de seguridad.

## Reglas operativas importantes

- En produccion, `/docs`, `/redoc` y `/openapi.json` quedan deshabilitados.
- En produccion, `CORS_ALLOW_ORIGINS` debe ser explicito.
- Los secretos no deben vivir en Git ni en `terraform.tfvars` real.
- El rate limit actual es por proceso. En despliegues multi-replica debe complementarse con WAF/CDN, Ingress o Redis/global limiter.
- La base de datos debe ser privada y administrada con backups cifrados.
