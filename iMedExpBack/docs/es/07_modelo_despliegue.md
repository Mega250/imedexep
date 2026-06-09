# Modelo de Despliegue

## Proposito

El modelo de despliegue documenta donde vive cada componente en ejecucion, como se comunican y que controles perimetrales deben existir antes de operar informacion clinica.

## Diagrama UML de despliegue

Fuente PlantUML: [10_despliegue.puml](./uml/10_despliegue.puml).

El diagrama representa la arquitectura objetivo para produccion:

- WAF/CDN antes del cluster.
- Ingress Controller como entrada Kubernetes.
- Servicio interno para la API.
- Multiples pods de FastAPI.
- PostgreSQL administrado privado.
- Prometheus/Grafana/Alertmanager.
- Gestor de secretos.
- CI/CD con despliegue Helm.

## Entornos

| Entorno | Proposito | Reglas |
| --- | --- | --- |
| Local | Desarrollo y depuracion. | Puede usar Docker Compose y puertos en `127.0.0.1`. |
| Testing | Pruebas automatizadas. | Base limpia, datos sinteticos, sin secretos reales. |
| Staging | Prueba de despliegue real. | Configuracion casi igual a produccion, datos anonimizados. |
| Produccion | Atencion real. | WAF/CDN, secretos reales, monitoreo, backups, alertas y cambios aprobados. |

## Componentes Kubernetes

| Recurso | Uso |
| --- | --- |
| `Deployment` | Ejecuta replicas de la API. |
| `Service` | Expone pods de API dentro del cluster. |
| `Ingress` | Recibe trafico externo filtrado por WAF/CDN. |
| `HPA` | Escala replicas por uso de recursos. |
| `PodDisruptionBudget` | Evita perder disponibilidad durante mantenimientos. |
| `NetworkPolicy` | Restringe trafico entre pods. |
| `ConfigMap` | Configuracion no secreta. |
| `Secret` | Credenciales, JWT secret, encryption key y token de metricas. |
| `ServiceMonitor` | Permite scraping por Prometheus. |
| `PrometheusRule` | Alertas basicas de disponibilidad, 5xx y rate limit. |

## Probes

| Probe | Endpoint | Motivo |
| --- | --- | --- |
| Liveness | `GET /live` | Saber si el proceso sigue vivo. No depende de DB. |
| Readiness | `GET /ready` | Saber si la replica puede recibir trafico. Verifica DB. |
| Health manual | `GET /health` | Diagnostico operativo. |
| Metrics | `GET /metrics` | Observabilidad Prometheus con bearer token. |

## Flujo de trafico

1. Usuario accede por HTTPS.
2. WAF/CDN filtra trafico malicioso, bots, patrones OWASP y volumen.
3. Ingress enruta al `Service`.
4. Kubernetes balancea hacia pods disponibles.
5. API consulta PostgreSQL privado.
6. Prometheus recolecta metricas internas.
7. Alertmanager dispara alertas ante indisponibilidad o errores.

## Gestion de secretos

En produccion los secretos no deben declararse en Terraform state ni en Git.

Recomendado:

- Secret Manager del proveedor cloud o Vault.
- Sincronizacion hacia Kubernetes Secret mediante External Secrets Operator o mecanismo equivalente.
- Rotacion documentada de `JWT_SECRET_KEY`, `ENCRYPTION_KEY`, passwords y tokens de metricas.
- Acceso a secretos restringido por IAM/RBAC.

## Base de datos

PostgreSQL debe operar como servicio privado administrado o cluster dedicado:

- Sin exposicion publica.
- TLS habilitado.
- Backups automatizados cifrados.
- Retencion definida por politica clinica/legal.
- Usuario de aplicacion con minimos privilegios.
- Usuario de migraciones separado.

## Escalabilidad

La API es stateless respecto a sesion HTTP; puede escalar horizontalmente. Consideraciones:

- El rate limit actual por proceso debe complementarse con WAF, Ingress o limiter distribuido.
- Las metricas deben agregarse por replica en Prometheus.
- Las migraciones de DB deben ejecutarse una vez por release, no por cada pod.
- Jobs pesados o notificaciones deben moverse a workers si aumentan volumen.

## Criterios de salida a produccion

Antes de produccion:

- Pentest de backend y frontend en staging.
- Pruebas de carga con cuotas reales.
- Backups restaurados en ambiente de prueba.
- Alertas validadas.
- Runbooks de incidentes.
- Politicas de privacidad y consentimiento aprobadas.
- Revision NOM/LFPDPPP por responsable legal/compliance.
