# Modelo de Implementacion

## Proposito

El modelo de implementacion describe como se organiza el codigo fuente y que componentes ejecutables participan. A diferencia del modelo de diseno, aqui se aterrizan paquetes, archivos, infraestructura de pruebas, CI/CD y dependencias operativas.

## Diagramas UML incluidos

| Diagrama | Archivo | Tipo |
| --- | --- | --- |
| Componentes | [07_implementacion_componentes.puml](./uml/07_implementacion_componentes.puml) | Diagrama UML de componentes. |
| Paquetes | [08_implementacion_paquetes.puml](./uml/08_implementacion_paquetes.puml) | Diagrama UML de paquetes. |

## Componentes ejecutables

El diagrama [07_implementacion_componentes.puml](./uml/07_implementacion_componentes.puml) muestra:

- Cliente web/movil que consume HTTP/JSON.
- Aplicacion FastAPI.
- Middleware de seguridad y observabilidad.
- Routers API v1.
- Servicios de dominio.
- Repositorios SQLAlchemy.
- PostgreSQL.
- Prometheus consumiendo `/metrics`.
- Proveedor SMTP para codigos de verificacion.

## Paquetes principales

| Paquete | Responsabilidad |
| --- | --- |
| `app/api/v1` | Endpoints versionados. Cada modulo representa un recurso de API. |
| `app/api/deps.py` | Dependencias compartidas de autenticacion, roles y RLS. |
| `app/core/config.py` | Variables de entorno y validaciones de produccion. |
| `app/core/database.py` | Motor y sesiones async de SQLAlchemy. |
| `app/core/security.py` | JWT, hashing, cifrado y utilidades de seguridad. |
| `app/core/middleware.py` | Rate limit, limite de body y cabeceras. |
| `app/core/metrics.py` | Metricas Prometheus sin dependencia externa. |
| `app/models` | Entidades SQLAlchemy. |
| `app/schemas` | DTOs Pydantic. |
| `app/services` | Casos de uso y reglas de negocio. |
| `app/repositories` | Persistencia y consultas. |
| `sql` | Inicializacion de PostgreSQL: esquemas, tablas, funciones, RLS, triggers e indices. |
| `tests` | Suite automatizada. |
| `infra/helm/imedexp-api` | Chart Helm de despliegue. |
| `infra/terraform/kubernetes` | Terraform para cluster existente. |

## Ciclo de request implementado

1. `app/main.py` recibe la peticion ASGI.
2. `MaxBodySizeMiddleware` rechaza cuerpos excesivos.
3. `RateLimitMiddleware` aplica cuotas por IP/ruta.
4. FastAPI enruta a un modulo en `app/api/v1`.
5. Pydantic valida payload, query params y path params.
6. Dependencias validan JWT, rol y contexto.
7. Se configura contexto RLS en la sesion de DB.
8. El router invoca un servicio.
9. El servicio usa repositorios.
10. SQLAlchemy ejecuta SQL parametrizado.
11. PostgreSQL aplica politicas RLS y triggers de auditoria.
12. La respuesta se serializa con schema Pydantic.
13. Se agregan cabeceras de seguridad y metricas.

## Comandos de implementacion y verificacion

### Pruebas completas

```bash
docker compose -f docker-compose.test.yaml up --build --abort-on-container-exit --exit-code-from tests
```

### Validacion de sintaxis Python

```bash
python3 -m compileall -q app tests
```

### Auditoria de dependencias

```bash
pip-audit -r requirements.txt
```

### Escaneo basico local autorizado

Ejecutar solo contra entornos propios:

```bash
nmap -sV -p 18082 127.0.0.1
nikto -h http://127.0.0.1:18082 -nointeractive -timeout 5 -Tuning x -maxtime 60s
sqlmap -u "http://127.0.0.1:18082/api/v1/medications/search?q=test" --batch --level=1 --risk=1
nuclei -u http://127.0.0.1:18082 -severity low,medium,high,critical -rate-limit 10
```

### Validacion de Helm

```bash
docker run --rm -v "$PWD:/workspace" -w /workspace alpine/helm:3.17.0 lint infra/helm/imedexp-api
docker run --rm -v "$PWD:/workspace" -w /workspace alpine/helm:3.17.0 template imedexp-api infra/helm/imedexp-api
```

### Validacion de Terraform

```bash
docker run --rm -v "$PWD:/workspace" -w /workspace hashicorp/terraform:1.10 -chdir=infra/terraform/kubernetes fmt -check
docker run --rm -v "$PWD:/workspace" -w /workspace hashicorp/terraform:1.10 -chdir=infra/terraform/kubernetes init -backend=false
docker run --rm -v "$PWD:/workspace" -w /workspace hashicorp/terraform:1.10 -chdir=infra/terraform/kubernetes validate
```

## Pipeline CI/CD

La implementacion contempla trabajos de:

- Pruebas automatizadas.
- Auditoria de dependencias con `pip-audit`.
- Escaneo de filesystem con Trivy.
- Lint/template de Helm.
- `terraform fmt`, `init` y `validate`.

Antes de produccion deben agregarse etapas de despliegue controlado, aprobaciones manuales, firma de imagenes y escaneo de imagen Docker.

## Modos de ejecucion

| Modo | Valor | Comportamiento esperado |
| --- | --- | --- |
| Desarrollo | `APP_ENV=development` | Puede habilitar docs y configuracion flexible. |
| Pruebas | `APP_ENV=testing` | Base limpia, fixtures y configuracion determinista. |
| Produccion | `APP_ENV=production` | Docs deshabilitados, CORS explicito, secretos fuertes y errores sanitizados. |

## Artefactos generados

| Artefacto | Origen | Uso |
| --- | --- | --- |
| Imagen Docker | `Dockerfile` | Ejecutar API en contenedor. |
| Chart Helm | `infra/helm/imedexp-api` | Despliegue Kubernetes. |
| Terraform | `infra/terraform/kubernetes` | Instalacion parametrizada en cluster. |
| Dashboard Grafana | `infra/monitoring` | Observabilidad inicial. |
| SQL bootstrap | `sql/*.sql` | Crear estructura PostgreSQL. |
