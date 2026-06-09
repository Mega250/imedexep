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

set -a; . ./.env 2>/dev/null || true; set +a
SUPERADMIN_EMAIL="${SUPERADMIN_EMAIL:-superadmin@imedexp.com}"
SUPERADMIN_PASSWORD="${SUPERADMIN_PASSWORD:-Imedexp2026!}"

echo ""
echo "Creando el superadmin (espera a que la API este lista)..."
seed_ok=0
for _ in $(seq 1 40); do
  if docker cp iMedExpBack/scripts/seed_superadmin.py med_api:/tmp/seed_superadmin.py >/dev/null 2>&1 \
     && docker exec -e SEED_EMAIL="$SUPERADMIN_EMAIL" -e SEED_PASSWORD="$SUPERADMIN_PASSWORD" \
          med_api python3 /tmp/seed_superadmin.py >/dev/null 2>&1; then
    docker exec med_api rm -f /tmp/seed_superadmin.py >/dev/null 2>&1 || true
    seed_ok=1
    break
  fi
  sleep 3
done
if [ "$seed_ok" -eq 1 ]; then
  echo "  Superadmin listo."
else
  echo "  AVISO: la API tardo en responder. Crea el superadmin luego con:"
  echo "         bash iMedExpBack/scripts/linux/seed_superadmin.sh"
fi

echo ""
echo "iMedExp + agente Gumi en marcha:"
echo "  API imedexp : http://localhost:8000"
echo "  Agente Gumi : http://localhost:8100/health"
echo "  Neo4j       : http://localhost:7474"
echo "  Superadmin  : $SUPERADMIN_EMAIL / $SUPERADMIN_PASSWORD"
echo ""
echo "Alimenta el RAG: pon tus PDF/Word en ./documentos y corre ./alimentar.sh"
