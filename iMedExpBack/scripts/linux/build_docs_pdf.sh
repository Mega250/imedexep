#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
PYTHON_BIN="${PYTHON:-python3}"

if [ "${1:-}" = "" ]; then
    "$PYTHON_BIN" "$PROJECT_DIR/docs/tools/build_print_pdf.py"
else
    "$PYTHON_BIN" "$PROJECT_DIR/docs/tools/build_print_pdf.py" --output "$1"
fi
