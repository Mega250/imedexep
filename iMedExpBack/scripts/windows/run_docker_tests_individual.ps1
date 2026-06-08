param(
    [string]$ComposeFile = ""
)

$ErrorActionPreference = "Stop"
$ProjectDir = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path

if ([string]::IsNullOrWhiteSpace($ComposeFile)) {
    if ($env:COMPOSE_FILE) {
        $ComposeFile = $env:COMPOSE_FILE
    }
    else {
        $ComposeFile = Join-Path $ProjectDir "docker-compose.test.yaml"
    }
}

$status = 0

try {
    docker compose -f $ComposeFile build tests
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    docker compose -f $ComposeFile up -d postgres
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    $nodes = docker compose -f $ComposeFile run --rm tests pytest --collect-only -q
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    $nodes = $nodes | Where-Object { $_ -match "::" }

    foreach ($node in $nodes) {
        if (-not [string]::IsNullOrWhiteSpace($node)) {
            docker compose -f $ComposeFile run --rm tests pytest -q $node
            if ($LASTEXITCODE -ne 0) {
                $status = $LASTEXITCODE
            }
        }
    }
}
finally {
    docker compose -f $ComposeFile down -v
}

exit $status
