# Gumi — Creador de Agentes

Gumi tiene dos mundos separados:

- **Gumi Builder** crea, valida y modifica agentes.
- **Gumi Runtime** ejecuta agentes congelados (sin builder, council, forge ni recompiler).

El diseño completo está en `../../ARQUITECTURA_GUMI.md`.

## Principios

1. Jamás hardcoding: catálogos, políticas, dominios, roles, perfiles y RBAC viven como datos en `manifests/*.yaml`, validados contra `contracts/`.
2. El LLM solo hace la parte semántica (clasificar, proponer, redactar). El `policy/` determinista decide permisos.
3. Sin comentarios en el código ni en los YAML. La documentación va en archivos `.md`.
4. Modular: una capa por carpeta, una responsabilidad por archivo.
5. Bitácora de desarrollo en `logbook/BITACORA.md` y bitácora de runtime en `audit/` (append-only).

## Estructura

- `contracts/` — modelos Pydantic (artefactos de datos).
- `manifests/` — datos declarativos (proveedores, modelos, roles, perfiles, política, toolpacks, embeddings).
- `manifest_loader/` — carga y valida los YAML contra los contratos.
- `interfaces/` — Protocols de cada capa.
- `model/` — capa universal de modelos: router, tier_resolver, parameter_mapper, adaptadores de proveedor, embeddings.
- `classifier/` — clasificación semántica (LLM).
- `policy/` — Policy Engine determinista + firewalls de dominio, capacidad y recursión.
- `safety/` — gates sensibles (médico, PHI) y moderador de contenido (Nemotron Content Safety vía API).
- `council/` — consejo de roles (scout, planner, methodologist, skeptic, judge, appeal).
- `retrieval/` — librarian de tools (catálogo grande hacia candidatas).
- `forge/` — Tool Forge para tools faltantes (sandbox + test harness).
- `manifests_build/` — constructores de DataManifest, DocManifest, TemplateManifest, ApiManifest.
- `compiler/` — compilación, lock y export (frozen runtime + firma).
- `change/` — modificación versionada de agentes.
- `audit/` — Audit Ledger append-only.
- `approval/` — gateway de aprobación humana.
- `pipeline/` — orquestación de la creación.
- `runtime/` — ejecución del agente creado.
- `connectors/` — framework de conectores de API tipados + Policy Gateway.
- `platform/` — infraestructura reutilizada (toolpack, rag, ingestion, graph, docs, db).
- `api/` — routers FastAPI finos.

## Ejecutar

Local:

```
uvicorn gumi.main:app --reload --port 8080
```

TUI:

```
gumi
```

La TUI usa Textual y consume la API de Gumi por HTTP. Si la API local no responde en `http://127.0.0.1:8080`, el launcher intenta levantar `uvicorn gumi.main:app` automáticamente. Para diagnóstico:

```
gumi --doctor
```

Para recargar `.env` después de cambiar roles:

```
gumi --restart
```

El diseño de agentes usa SSE mediante `/gumi/agents/design/stream` para mostrar progreso conforme llega. Por default la TUI respeta `GUMI_MODEL_SCOUT`, `GUMI_MODEL_PLANNER`, `GUMI_MODEL_METHODOLOGIST`, `GUMI_MODEL_SKEPTIC`, `GUMI_MODEL_JUDGE` y `GUMI_MODEL_APPEAL`; el campo `Modelo` solo pisa esos roles cuando desactivas `Roles .env`. La prueba de runtime usa `/gumi/runtime/run`, que es el endpoint existente del backend. En el tab Roles usa `Configurar` para abrir el diálogo de asignación: ahí eliges rol, proveedor y modelo desde controles desplegables, sin depender de seleccionar filas de la tabla. El diálogo puede tomar modelos del registro interno o desde `/models` de Ollama, OpenCode Go premium, OpenCode Zen gratis y NVIDIA. El tab de documentos permite previsualizar texto de PDF local, construir `DocManifest` para CSV/XLSX y detectar campos de plantillas DOCX/TXT/MD/HTML/TEX. El tab Sistema muestra proveedores configurados sin exponer valores de API keys.

Docker:

```
cd docker
docker compose up --build
```

Antes copia `gumi/.env.example` a `gumi/.env` y rellena tus claves (API keys) y modelos. El `.env` real está ignorado por git; solo se versiona `.env.example`.
