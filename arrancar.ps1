# arrancar.ps1 — Levanta iMedExp + agente Gumi en Windows con Docker Desktop.
# Uso: abre PowerShell en esta carpeta y ejecuta:  ./arrancar.ps1
# (Requiere Docker Desktop con WSL2 instalado y corriendo.)

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

function Import-DotEnv {
    param([string]$Path)
    if (-not (Test-Path $Path)) { return }
    foreach ($raw in Get-Content $Path) {
        $line = $raw.Trim()
        if ($line -eq "" -or $line.StartsWith("#")) { continue }
        $i = $line.IndexOf("=")
        if ($i -lt 1) { continue }
        $k = $line.Substring(0, $i).Trim()
        $v = $line.Substring($i + 1).Trim()
        if (($v.StartsWith('"') -and $v.EndsWith('"')) -or ($v.StartsWith("'") -and $v.EndsWith("'"))) {
            $v = $v.Substring(1, $v.Length - 2)
        }
        [Environment]::SetEnvironmentVariable($k, $v, "Process")
    }
}

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Se creo .env desde la plantilla. Editalo con tus claves y vuelve a ejecutar ./arrancar.ps1" -ForegroundColor Yellow
    exit 0
}

Write-Host "Construyendo y levantando contenedores (la primera vez compila el motor del agente, puede tardar unos minutos)..." -ForegroundColor Cyan
docker compose up -d --build

Import-DotEnv ".env"
$SuperEmail = if ($env:SUPERADMIN_EMAIL) { $env:SUPERADMIN_EMAIL } else { "superadmin@imedexp.com" }
$SuperPass  = if ($env:SUPERADMIN_PASSWORD) { $env:SUPERADMIN_PASSWORD } else { "Imedexp2026!" }

Write-Host ""
Write-Host "Creando el superadmin (espera a que la API este lista)..." -ForegroundColor Cyan
$seedOk = $false
$prevEAP = $ErrorActionPreference
$ErrorActionPreference = "SilentlyContinue"
for ($i = 0; $i -lt 40 -and -not $seedOk; $i++) {
    docker cp "iMedExpBack/scripts/seed_superadmin.py" "med_api:/tmp/seed_superadmin.py" *> $null
    if ($LASTEXITCODE -eq 0) {
        docker exec -e "SEED_EMAIL=$SuperEmail" -e "SEED_PASSWORD=$SuperPass" med_api python3 /tmp/seed_superadmin.py *> $null
        if ($LASTEXITCODE -eq 0) {
            docker exec med_api rm -f /tmp/seed_superadmin.py *> $null
            $seedOk = $true
            break
        }
    }
    Start-Sleep -Seconds 3
}
$ErrorActionPreference = $prevEAP
if ($seedOk) {
    Write-Host "  Superadmin listo." -ForegroundColor Green
} else {
    Write-Host "  AVISO: la API tardo en responder. Crea el superadmin luego con:" -ForegroundColor Yellow
    Write-Host "         docker cp iMedExpBack/scripts/seed_superadmin.py med_api:/tmp/seed.py; docker exec -e SEED_EMAIL=$SuperEmail -e SEED_PASSWORD=$SuperPass med_api python3 /tmp/seed.py"
}

Write-Host ""
Write-Host "iMedExp + agente Gumi en marcha:" -ForegroundColor Green
Write-Host "  API imedexp : http://localhost:8000  (Swagger en /docs)"
Write-Host "  Agente Gumi : http://localhost:8100/health"
Write-Host "  Neo4j       : http://localhost:7474"
Write-Host "  Superadmin  : $SuperEmail / $SuperPass"
Write-Host ""
Write-Host "Datos demo: corre  docker exec -i med_postgres psql -U postgres -d med_records < iMedExpBack/scripts/_sembrar_demo.sql"
Write-Host "Front: en .\iMedExpFront ejecuta  npm install  y luego  npx expo start --web"
