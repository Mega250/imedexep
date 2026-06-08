#!/bin/bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
source "$PROJECT_DIR/.env"
SQL_DIR="$PROJECT_DIR/sql"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.yaml"

CONTAINER="med_postgres"
DB="${POSTGRES_DB:-med_records}"
DB_USER="postgres"
export PGPASSWORD="${POSTGRES_SUPERUSER_PASSWORD:-postgres_dev_password}"

MAX_WAIT_SECONDS=60
ONLY_SQL=false

for arg in "$@"; do
    case $arg in
        --only-sql) ONLY_SQL=true ;;
        *) echo -e "${RED}Argumento desconocido: $arg${NC}"; exit 1 ;;
    esac
done

log_step()  { echo -e "\n${BOLD}${BLUE} $*${NC}"; }
log_ok()    { echo -e "${GREEN}   $*${NC}"; }
log_warn()  { echo -e "${YELLOW}   $*${NC}"; }
log_error() { echo -e "${RED}   $*${NC}"; }

countdown() {
    local n=$1
    for i in $(seq "$n" -1 1); do
        printf "\r  %s segundos..." "$i"
        sleep 1
    done
    printf "\r%-30s\n" ""
}

wait_for_postgres() {
    log_step "Esperando a Postgres"
    local elapsed=0
    until docker exec "$CONTAINER" pg_isready -U "$DB_USER" -d "$DB" -q 2>/dev/null; do
        if [ "$elapsed" -ge "$MAX_WAIT_SECONDS" ]; then
            log_error "PostgreSQL no respondió en ${MAX_WAIT_SECONDS}s."
            echo -e "\n${CYAN}Últimas líneas del log:${NC}"
            docker logs --tail 20 "$CONTAINER" 2>&1 || true
            exit 1
        fi
        printf "."
        sleep 2
        elapsed=$((elapsed + 2))
    done
    echo ""
    log_ok "Iniciando"
}

run_sql_file() {
    local filepath="$1"
    local filename
    filename="$(basename "$filepath")"

    docker cp "$filepath" "$CONTAINER:/tmp/$filename"

    if docker exec -e PGPASSWORD="$PGPASSWORD" "$CONTAINER" \
        psql -U "$DB_USER" -d "$DB" \
             -v ON_ERROR_STOP=1 \
             --pset pager=off \
             -q \
             -f "/tmp/$filename" 2>&1; then
        log_ok "$filename"
    else
        log_error "$filename  FALLÓ"
        echo ""
        echo -e "${RED}${BOLD}Error al ejecutar $filename."
        exit 1
    fi

    docker exec "$CONTAINER" rm -f "/tmp/$filename"
}

if [ "$ONLY_SQL" = false ]; then
    log_step "Deteniendo contenedores y borrando volúmenes"
    docker compose -f "$COMPOSE_FILE" down -v --remove-orphans 2>&1 | sed 's/^/  /'
    countdown 3

    log_step "Levantando contenedores. Espere un momennto"
    docker compose -f "$COMPOSE_FILE" up -d 2>&1 | sed 's/^/  /'
else
    log_warn "Modo --only-sql: se omite docker-compose down/up"
fi

if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
    log_error "El contenedor '$CONTAINER' no está corriendo."
    exit 1
fi

wait_for_postgres

log_step "Recreando base de datos"
docker exec -e PGPASSWORD="$PGPASSWORD" "$CONTAINER" \
    psql -U "$DB_USER" -d postgres \
    -c "DROP DATABASE IF EXISTS $DB;" \
    -c "CREATE DATABASE $DB;"
log_ok "Base de datos recreada limpia"

if [ ! -d "$SQL_DIR" ]; then
    log_error "Directorio SQL no encontrado: $SQL_DIR"
    exit 1
fi

SQL_FILES=("$SQL_DIR"/[0-9]*.sql)

if [ ${#SQL_FILES[@]} -eq 0 ] || [ ! -f "${SQL_FILES[0]}" ]; then
    log_error "No se encontraron archivos SQL en $SQL_DIR"
    exit 1
fi

TOTAL=${#SQL_FILES[@]}
CURRENT=0

for sql_file in "${SQL_FILES[@]}"; do
    CURRENT=$((CURRENT + 1))
    printf "  ${CYAN}[%02d/%02d]${NC} " "$CURRENT" "$TOTAL"
    run_sql_file "$sql_file"
done

echo ""
echo -e "${BOLD}${GREEN}  Esquema cargado correctamente        ${NC}"
echo -e "${BOLD}${GREEN}  BD: $DB  Contenedor: $CONTAINER     ${NC}"
echo ""
echo -e "${CYAN}Para conectarte a la BD:${NC}"
echo -e "  docker exec -it -e PAGER=cat $CONTAINER psql -U $DB_USER -d $DB"
echo ""

docker ps

docker exec -i med_postgres psql -U postgres -d med_records \
    -c "ALTER ROLE app_api WITH LOGIN PASSWORD '${POSTGRES_PASSWORD}';"

log_step "Configurando pre-commit hooks"

if ! command -v uv &>/dev/null; then
    log_warn "uv no encontrado, instalando..."
    curl -LsSf https://astral.sh/uv/install.sh | sh

    CURRENT_SHELL="$(basename "$SHELL")"
    case "$CURRENT_SHELL" in
        fish)
            source "$HOME/.local/share/fish/vendor_conf.d/uv.fish" 2>/dev/null || \
            source "$HOME/.config/fish/conf.d/uv.fish" 2>/dev/null || \
            export PATH="$HOME/.local/bin:$PATH"
            ;;
        zsh)
            source "$HOME/.local/bin/env.zsh" 2>/dev/null || \
            export PATH="$HOME/.local/bin:$PATH"
            ;;
        bash)
            source "$HOME/.local/bin/env" 2>/dev/null || \
            export PATH="$HOME/.local/bin:$PATH"
            ;;
        *)
            export PATH="$HOME/.local/bin:$PATH"
            ;;
    esac

    if ! command -v uv &>/dev/null; then
        log_error "uv no se pudo activar. Abre una terminal nueva y vuelve a correr el script."
        exit 1
    fi

    log_ok "uv instalado correctamente"
fi

uv tool install pre-commit --quiet
"$(uv tool dir)/pre-commit/bin/pre-commit" install 2>/dev/null || pre-commit install

log_ok "pre-commit instalado — los tests correrán antes de cada commit"
