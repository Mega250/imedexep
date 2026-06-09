#!/bin/bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_dir="$(cd "$script_dir/../.." && pwd)"
compose_file="${COMPOSE_FILE:-$project_dir/docker-compose.test.yaml}"
status=0

docker compose -f "$compose_file" build tests
docker compose -f "$compose_file" up -d postgres

nodes="$(docker compose -f "$compose_file" run --rm tests pytest --collect-only -q | sed -n '/::/p')"

while IFS= read -r node; do
    if [ -n "$node" ]; then
        docker compose -f "$compose_file" run --rm tests pytest -q "$node" || status=$?
    fi
done <<< "$nodes"

docker compose -f "$compose_file" down -v
exit "$status"
