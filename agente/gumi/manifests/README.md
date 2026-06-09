# Manifests (datos declarativos)

Toda la configuración de gobernanza y comportamiento de Gumi vive aquí, como datos versionados, no como literales en código ni en prompts. El `manifest_loader` carga y valida estos YAML contra los contratos Pydantic de `gumi/contracts`.

## Capa de modelos
- `gumi.providers.yaml` — cómo llamar a cada proveedor (Ollama, OpenCode Go, vLLM, llama.cpp, OpenAI-compat, NVIDIA).
- `gumi.models.yaml` — registro model-id → tier + capacidades + roles recomendados + overrides. Con auto-sondeo y `fallback_tier`.
- `gumi.roles.yaml` — roles del consejo, `passes` por rol, `enable_planner_rebuttal`, `debate_style`.
- `behavior_profiles.yaml` — perfiles abstractos 0-1 (creativity/determinism/verbosity/exploration/strictness).
- `family_sampling.yaml` — traducción perfil → sampling real por familia de modelo (lerp).
- `tier_policy.yaml` — por tier: roles permitidos/prohibidos, modo de consejo, `local_mode_defaults`.
- `gumi.embeddings.yaml` — proveedores de embeddings y `target_dim` (RAG dimension-agnostic).

## Política (firewalls deterministas)
- `policy/domain_taxonomy.yaml` — niveles A/B/C/D y alternativas seguras.
- `policy/capability_map.yaml` — capacidades peligrosas y requisitos.
- `policy/meta_agent_policy.yaml` — guardia anti-recursión y `meta_permissions`.
- `policy/medical_modes.yaml` — modos médicos, PHI y cadena clínica.
- `policy/programming_policy.yaml` — agentes de programación por intención.
- `policy/content_safety.yaml` — moderador semántico (Nemotron Content Safety, API).
- `policy/policy_manifest.yaml` — combinador de reglas con defaults seguros.

## Tools y conectores
- `toolpacks/catalog.yaml` — catálogo de funciones backend (reemplaza el registry literal).
- `toolpacks/*_core.yaml` — toolpacks universales (db, document, template, identity, audit, scheduler, outbox, sandbox).
- `toolpacks/api_connectors/*.yaml` — un `ApiManifest` por API institucional.
- `role_matrix.yaml` — RBAC: roles → tools/scopes permitidos.
- `sandbox_policy.yaml` — límites del sandbox y patrones prohibidos.

## Secretos
- El template de variables vive en `../.env.example` (raíz del paquete `gumi/`). El `.env` real es local, va en `.gitignore` y nunca se versiona ni se expone al LLM.
