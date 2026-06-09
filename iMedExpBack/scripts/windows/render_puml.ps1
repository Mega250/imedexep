param(
    [ValidateSet("svg", "png")]
    [string]$Format = "svg",
    [string]$UmlDir = "docs/es/uml"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker no esta disponible en esta terminal."
}

$ProjectDir = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$ResolvedUmlDir = (Resolve-Path (Join-Path $ProjectDir $UmlDir)).Path
$Files = Get-ChildItem -Path $ResolvedUmlDir -Filter "*.puml" | Sort-Object Name | ForEach-Object {
    [System.IO.Path]::GetRelativePath($ProjectDir, $_.FullName).Replace("\", "/")
}

if (-not $Files) {
    throw "No se encontraron archivos .puml en $ResolvedUmlDir."
}

$DockerArgs = @("run", "--rm", "-v", "${ProjectDir}:/workspace", "-w", "/workspace", "plantuml/plantuml", "-t$Format") + $Files
docker @DockerArgs
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
