param(
    [switch]$OnlySql
)

$ErrorActionPreference = "Stop"

function Import-DotEnv {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        return
    }

    foreach ($rawLine in Get-Content $Path) {
        $line = $rawLine.Trim()
        if ([string]::IsNullOrWhiteSpace($line)) {
            continue
        }
        if ($line.StartsWith("#")) {
            continue
        }
        $separator = $line.IndexOf("=")
        if ($separator -lt 1) {
            continue
        }
        $key = $line.Substring(0, $separator).Trim()
        $value = $line.Substring($separator + 1).Trim()
        if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host $Message -ForegroundColor Blue
}

function Write-Ok {
    param([string]$Message)
    Write-Host "   $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "   $Message" -ForegroundColor Yellow
}

function Invoke-Checked {
    param(
        [string]$Message,
        [scriptblock]$Command
    )

    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw $Message
    }
}

function Wait-Postgres {
    $elapsed = 0
    Write-Step "Esperando PostgreSQL"
    while ($elapsed -lt $MaxWaitSeconds) {
        docker exec $Container pg_isready -U $DbUser -d $Db -q 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Ok "PostgreSQL listo"
            return
        }
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
        $elapsed += 2
    }

    Write-Host ""
    docker logs --tail 20 $Container
    throw "PostgreSQL no respondio en $MaxWaitSeconds segundos."
}

function Invoke-SqlFile {
    param([System.IO.FileInfo]$File)

    $target = "/tmp/$($File.Name)"
    Invoke-Checked "No se pudo copiar $($File.Name)." { docker cp $File.FullName "${Container}:$target" }

    try {
        docker exec -e "PGPASSWORD=$SuperuserPassword" $Container psql -U $DbUser -d $Db -v ON_ERROR_STOP=1 --pset pager=off -q -f $target
        if ($LASTEXITCODE -ne 0) {
            throw "$($File.Name) fallo."
        }
        Write-Ok $File.Name
    }
    finally {
        docker exec $Container rm -f $target | Out-Null
    }
}

function Install-PreCommit {
    Write-Step "Configurando pre-commit"

    $uvCommand = Get-Command uv -ErrorAction SilentlyContinue
    if ($uvCommand) {
        Invoke-Checked "No se pudo instalar pre-commit con uv." { uv tool install pre-commit --quiet }
        $uvToolDir = (uv tool dir).Trim()
        if ($LASTEXITCODE -ne 0) {
            throw "No se pudo resolver el directorio de herramientas de uv."
        }
        $preCommitExe = Join-Path $uvToolDir "pre-commit\Scripts\pre-commit.exe"
        if (Test-Path $preCommitExe) {
            Invoke-Checked "No se pudo instalar el hook de pre-commit." { & $preCommitExe install }
        }
        else {
            Invoke-Checked "No se pudo instalar el hook de pre-commit." { pre-commit install }
        }
        Write-Ok "pre-commit instalado"
        return
    }

    $preCommitCommand = Get-Command pre-commit -ErrorAction SilentlyContinue
    if ($preCommitCommand) {
        Invoke-Checked "No se pudo instalar el hook de pre-commit." { pre-commit install }
        Write-Ok "pre-commit instalado"
        return
    }

    Write-Warn "pre-commit no esta instalado. Ejecuta: pip install pre-commit"
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = (Resolve-Path (Join-Path $ScriptDir "..\..")).Path
$EnvFile = Join-Path $ProjectDir ".env"
$SqlDir = Join-Path $ProjectDir "sql"
$ComposeFile = Join-Path $ProjectDir "docker-compose.yaml"
$Container = "med_postgres"
$Db = $env:POSTGRES_DB
$DbUser = "postgres"
$SuperuserPassword = $env:POSTGRES_SUPERUSER_PASSWORD
$AppApiPassword = $env:POSTGRES_PASSWORD
$MaxWaitSeconds = 60

Import-DotEnv $EnvFile

$Db = $env:POSTGRES_DB
if ([string]::IsNullOrWhiteSpace($Db)) {
    $Db = "med_records"
}

$SuperuserPassword = $env:POSTGRES_SUPERUSER_PASSWORD
if ([string]::IsNullOrWhiteSpace($SuperuserPassword)) {
    $SuperuserPassword = "postgres_dev_password"
}

$AppApiPassword = $env:POSTGRES_PASSWORD
if ([string]::IsNullOrWhiteSpace($AppApiPassword)) {
    throw "POSTGRES_PASSWORD no esta configurado."
}

$env:PGPASSWORD = $SuperuserPassword

if (-not $OnlySql) {
    Write-Step "Deteniendo contenedores y borrando volumenes"
    Invoke-Checked "No se pudo limpiar Docker Compose." { docker compose -f $ComposeFile down -v --remove-orphans }

    Write-Step "Levantando servicios base"
    Invoke-Checked "No se pudieron levantar PostgreSQL y Neo4j." { docker compose -f $ComposeFile up -d postgres neo4j }
}
else {
    Write-Warn "Modo OnlySql activo"
}

$runningContainers = docker ps --format "{{.Names}}"
if ($LASTEXITCODE -ne 0) {
    throw "No se pudo consultar Docker."
}
if (-not ($runningContainers | Where-Object { $_ -eq $Container })) {
    throw "El contenedor $Container no esta corriendo."
}

Wait-Postgres

Write-Step "Recreando base de datos"
Invoke-Checked "No se pudo recrear la base de datos." { docker exec -e "PGPASSWORD=$SuperuserPassword" $Container psql -U $DbUser -d postgres -c "DROP DATABASE IF EXISTS $Db;" -c "CREATE DATABASE $Db;" }
Write-Ok "Base de datos recreada"

if (-not (Test-Path $SqlDir)) {
    throw "Directorio SQL no encontrado: $SqlDir"
}

$sqlFiles = Get-ChildItem -Path $SqlDir -Filter "*.sql" | Where-Object { $_.Name -match "^\d+.*\.sql$" } | Sort-Object Name
if (-not $sqlFiles) {
    throw "No se encontraron archivos SQL en $SqlDir"
}

$total = $sqlFiles.Count
$current = 0

foreach ($sqlFile in $sqlFiles) {
    $current += 1
    Write-Host ("  [{0:D2}/{1:D2}] " -f $current, $total) -NoNewline -ForegroundColor Cyan
    Invoke-SqlFile $sqlFile
}

Write-Step "Configurando rol de aplicacion"
Invoke-Checked "No se pudo actualizar app_api." { docker exec -e "PGPASSWORD=$SuperuserPassword" $Container psql -U $DbUser -d $Db -c "ALTER ROLE app_api WITH LOGIN PASSWORD '$AppApiPassword';" }
Write-Ok "Rol app_api actualizado"

if (-not $OnlySql) {
    Write-Step "Levantando API"
    Invoke-Checked "No se pudo levantar la API." { docker compose -f $ComposeFile up -d api }
}

Install-PreCommit

Write-Step "Estado de contenedores"
docker ps

Write-Host ""
Write-Host "Esquema cargado correctamente" -ForegroundColor Green
Write-Host "BD: $Db  Contenedor: $Container" -ForegroundColor Green
Write-Host "Conexion: docker exec -it -e PAGER=cat $Container psql -U $DbUser -d $Db" -ForegroundColor Cyan
