#!/bin/bash
# Inserta (o actualiza) el usuario superadmin usando Python dentro de med_api.
# El script Python corre directamente en el contenedor vía stdin para evitar
# problemas de interpolación de caracteres especiales en contraseñas.
# Uso: bash scripts/linux/seed_superadmin.sh [--email x] [--password x]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
source "$PROJECT_DIR/.env"

CONTAINER_API="med_api"

ADMIN_EMAIL="superadmin@imedexp.com"
ADMIN_PASSWORD="Imedexp2026!"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --password) ADMIN_PASSWORD="$2"; shift 2 ;;
        --email)    ADMIN_EMAIL="$2";    shift 2 ;;
        *) echo "Argumento desconocido: $1"; exit 1 ;;
    esac
done

if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_API}$"; then
    echo "ERROR: El contenedor '$CONTAINER_API' no está corriendo."
    exit 1
fi

echo "Ejecutando seed superadmin en med_api..."
echo "  Email:    ${ADMIN_EMAIL}"
echo "  Password: ${ADMIN_PASSWORD}"
echo ""

# Email y password van como env vars (-e), nunca interpolados en código Python.
# El script Python se pasa por stdin (-i) para no depender de archivos en el contenedor.
docker exec -i \
    -e SEED_EMAIL="${ADMIN_EMAIL}" \
    -e SEED_PASSWORD="${ADMIN_PASSWORD}" \
    "$CONTAINER_API" \
    python3 - < "${PROJECT_DIR}/scripts/seed_superadmin.py"

echo ""
echo "Listo."
