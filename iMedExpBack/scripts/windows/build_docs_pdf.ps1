param(
    [string]$Output = ""
)

$ErrorActionPreference = "Stop"
$ProjectDir = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$Builder = Join-Path $ProjectDir "docs\tools\build_print_pdf.py"

if ([string]::IsNullOrWhiteSpace($Output)) {
    python $Builder
}
else {
    python $Builder --output $Output
}

if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
