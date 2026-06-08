#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

n=$(find ./documentos -type f \( -iname "*.pdf" -o -iname "*.docx" -o -iname "*.txt" -o -iname "*.md" \) 2>/dev/null | wc -l)
if [ "$n" -eq 0 ]; then
  echo "No hay documentos en ./documentos. Pon ahi tus PDF/Word y vuelve a ejecutar."
  exit 0
fi

echo "Procesando $n documento(s) de ./documentos ..."
docker compose run --rm agente ingest /documentos
echo "Listo. El agente ya puede consultar y citar esas guias."
