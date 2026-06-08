#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Se creo .env desde la plantilla."
  echo "Edita .env con tus claves (proveedor de LLM, contrasenas, GUMI_SIGNING_KEY) y vuelve a ejecutar ./arrancar.sh"
  exit 0
fi

docker compose up -d --build

echo ""
echo "iMedExp + agente Gumi en marcha:"
echo "  API imedexp : http://localhost:8000"
echo "  Agente Gumi : http://localhost:8100/health"
echo "  Neo4j       : http://localhost:7474"
echo ""
echo "Alimenta el RAG: pon tus PDF/Word en ./documentos y corre ./alimentar.sh"
