# iMedExp + Asistente Clínico (Gumi) — paquete portable

Asistente clínico **sellado e independiente**, creado por Gumi y desplegable junto a iMedExp.
El motor del agente viaja **compilado** (binarios, sin código fuente legible). Tú lo **usas y lo
alimentas**; no necesitas ver ni tocar su código.

## Requisitos
- Docker + Docker Compose.
- (Opcional) Ollama local si quieres correr el LLM en tu máquina sin claves de nube.

## Arranque (3 pasos)
1. Copia la plantilla y pon tus claves:
   ```
   cp .env.example .env
   ```
   Edita `.env` (ver "Configuración" abajo) con las claves que te entregamos: las contraseñas de
   base de datos y tu proveedor de LLM.
2. Levanta todo:
   ```
   ./arrancar.sh
   ```
   Esto inicia PostgreSQL, Neo4j, la API de iMedExp y el agente.
3. Comprueba el agente: http://localhost:8100/health

## Alimentar el conocimiento del agente (RAG) — "pega y listo"
1. Copia tus guías clínicas (PDF, Word, txt) dentro de la carpeta `documentos/`.
2. Ejecuta:
   ```
   ./alimentar.sh
   ```
El agente lee cada documento, **descubre por sí mismo las relaciones clínicas** (qué trata cada
fármaco, contraindicaciones, dosis, interacciones) y las guarda. No tienes que escribir nada: solo
pones los archivos. A partir de ahí el agente puede consultarlas y citarlas.

## Configuración del proveedor de LLM (eliges el tuyo)
El agente es **agnóstico**: funciona con el proveedor que tengas. En `.env`:
- **Ollama (local, sin clave, privado — recomendado para datos clínicos):** `GUMI_PROVIDER=ollama`,
  `GUMI_BASE_URL=http://host.docker.internal:11434`, `GUMI_AGENT_MODEL=<tu modelo local>`.
- **OpenAI:** `GUMI_PROVIDER=openai`, `GUMI_OPENAI_API_KEY=...`, `GUMI_AGENT_MODEL=gpt-...`.
- **Anthropic:** `GUMI_PROVIDER=anthropic`, `GUMI_ANTHROPIC_API_KEY=...`, `GUMI_AGENT_MODEL=...`.
- **NVIDIA / opencode / vLLM / llama.cpp:** análogo, con su clave y modelo.

Si usas un modelo que el motor no reconoce, lo trata con el máximo de salvaguardas (nunca le da
libertad de un modelo grande sin sus controles).

## Estructura
- `agente/` — el agente (motor compilado). No editable.
- `iMedExpBack/` — la API de iMedExp.
- `iMedExpFront/` — la app del paciente (Expo). Instálala con `npm install` y `npx expo start`.
- `documentos/` — aquí pones tus PDF/Word para alimentar el RAG.
- `docker-compose.yml`, `arrancar.sh`, `alimentar.sh`, `.env.example`.
