# Seguridad, Cumplimiento y Operacion

## Proposito

Este documento consolida los controles de seguridad implementados o requeridos para operar un backend de expediente clinico. No sustituye una auditoria legal ni certificacion normativa, pero sirve como base tecnica para revision interna y cumplimiento.

## Diagrama UML de seguridad por request

Fuente PlantUML: [11_seguridad_secuencia.puml](./uml/11_seguridad_secuencia.puml).

El diagrama muestra la secuencia de defensa:

1. Limite de tamano de body.
2. Rate limiting.
3. Validacion de JWT y roles.
4. Inicializacion de contexto RLS.
5. Queries parametrizadas.
6. Filtrado por PostgreSQL RLS.
7. Cabeceras de seguridad en respuesta.

## Controles implementados en backend

| Control | Estado | Evidencia tecnica |
| --- | --- | --- |
| Autenticacion JWT | Implementado | `app/core/security.py`, rutas `auth`. |
| Hash de passwords | Implementado | Hashing en capa de seguridad. |
| Roles | Implementado | Dependencias y validaciones por endpoint. |
| RLS | Implementado | `sql/010RLSPolicies.sql` y contexto de sesion. |
| Validacion de entrada | Implementado | Schemas Pydantic en `app/schemas`. |
| Rate limiting | Implementado | `app/core/middleware.py`. |
| Limite de body | Implementado | `MaxBodySizeMiddleware`. |
| Cabeceras de seguridad | Implementado | CSP, HSTS, nosniff, frame deny, referrer policy. |
| Errores sanitizados | Implementado | Handlers en `app/main.py`. |
| Docs deshabilitadas en produccion | Implementado | Configuracion por `APP_ENV`. |
| Metricas protegidas | Implementado | `/metrics` con bearer token. |
| Auditoria DB | Implementado | Triggers y tabla `audit.audit_log`. |
| Escaneo de dependencias | Implementado en CI | `pip-audit`. |
| Escaneo de filesystem | Implementado en CI | Trivy. |

## Controles perimetrales requeridos

| Control | Recomendacion |
| --- | --- |
| WAF | Cloudflare, AWS WAF o ModSecurity con OWASP CRS. |
| CDN | Usar para assets estaticos del frontend y absorcion de trafico volumetrico. |
| Rate limit global | Implementar en WAF/Ingress o con Redis para multi-replica. |
| TLS | TLS 1.2/1.3, HSTS y certificados rotados. |
| DDoS | Proteccion del proveedor cloud y reglas por ruta critica. |
| IP allowlist interna | Para `/metrics`, DB, dashboards y administracion. |
| Bastion/VPN | Acceso administrativo solo por red privada. |

## Matriz de amenazas

| Amenaza | Riesgo | Controles |
| --- | --- | --- |
| Fuerza bruta login | Toma de cuenta o DoS por credenciales | Rate limit auth, MFA pendiente, alertas por 401/429. |
| Credential stuffing | Uso de passwords filtradas | Rate limit, MFA, revision HIBP pendiente si se decide. |
| SQL injection | Lectura/modificacion de expediente | SQLAlchemy parametrizado, Pydantic, RLS, pruebas sqlmap. |
| XSS | Robo de sesion o acciones no autorizadas | Output encoding en frontend, CSP, cookies HttpOnly si se migran tokens. |
| CSRF | Accion no deseada autenticada | SameSite/CSRF si se usan cookies; Bearer actual reduce vector clasico. |
| SSRF | Acceso a metadata/red interna | No aceptar URLs arbitrarias; allowlist si se agrega feature. |
| DoS por payload grande | Agotamiento de memoria | `MAX_REQUEST_BODY_BYTES`, WAF, Ingress limits. |
| DoS por 500 repetido | Saturacion por excepciones caras | Errores sanitizados, pruebas de mappers, rate limit, alertas 5xx. |
| IDOR | Acceso a expediente ajeno | Autorizacion backend + RLS por usuario/rol/institucion. |
| Fuga de secretos | Compromiso total de datos | Secret manager, no Git, rotacion, CI secret scanning pendiente. |

## Pruebas de seguridad recomendadas

Ejecutar contra staging propio, nunca contra terceros:

```bash
ffuf -u http://127.0.0.1:18082FUZZ -w wordlist.txt -rate 20 -mc all
nuclei -u http://127.0.0.1:18082 -severity low,medium,high,critical -rate-limit 10
nikto -h http://127.0.0.1:18082 -nointeractive -timeout 5 -Tuning x -maxtime 60s
sqlmap -u "http://127.0.0.1:18082/api/v1/medications/search?q=test" --batch --level=1 --risk=1
```

Pruebas manuales minimas:

- Login con credenciales invalidas repetidas debe terminar en `429`.
- Payload superior a limite debe devolver `413`.
- `/docs`, `/redoc` y `/openapi.json` deben devolver `404` en produccion.
- `/metrics` debe devolver `401` sin token.
- Endpoints clinicos deben devolver `401` sin JWT y `403` si el rol no corresponde.
- Acceso cruzado entre pacientes/instituciones debe ser bloqueado por backend y RLS.

## Requisitos operativos para NOM y privacidad

Para un sistema de historial clinico se debe tratar la informacion como dato sensible. A nivel tecnico, el sistema debe sostener:

- Control de acceso individual.
- Bitacora de accesos y cambios.
- Integridad y disponibilidad del expediente.
- Respaldo y recuperacion.
- Confidencialidad en transito y reposo.
- Politicas de conservacion y eliminacion.
- Procedimientos de incidentes.
- Aviso de privacidad y consentimiento donde aplique.

Referencias normativas a revisar con legal/compliance:

- NOM-004-SSA3-2012, expediente clinico.
- NOM-024-SSA3-2012, sistemas de informacion de registro electronico para la salud.
- Ley Federal de Proteccion de Datos Personales en Posesion de los Particulares.

## Pendientes antes de produccion

| Pendiente | Prioridad |
| --- | --- |
| MFA para administradores y doctores | Alta |
| Rate limit distribuido o perimetral definitivo | Alta |
| Secret scanning en CI | Alta |
| Backups restaurados y documentados | Alta |
| Logs estructurados centralizados | Alta |
| Alertas probadas en staging | Alta |
| Pentest frontend + backend en staging | Alta |
| Pruebas de carga y limites por endpoint | Alta |
| Runbooks de incidentes | Media |
| Revision legal de NOM y privacidad | Alta |

## Nota sobre frontend

Las pruebas de penetracion tambien deben cubrir frontend. El frontend puede introducir XSS, exposicion de tokens, errores de CORS, almacenamiento inseguro, IDOR por rutas mal protegidas, fuga de datos en cache o bundles con secretos. El backend debe seguir protegiendo todos los recursos aunque el frontend falle.
