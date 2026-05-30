# Seed RuRaveDB from SeedTestData.sql (Windows Auth)
# Cyrillic: sqlcmd needs UTF-8 input (-f i:65001) and UTF-8 BOM temp file.
param(
    [string]$Server = "DESKTOP-G67DLTD",
    [string]$Database = "RuRaveDB"
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$sqlFile = Join-Path $scriptDir "SeedTestData.sql"

if (-not (Test-Path $sqlFile)) {
    throw "SQL file not found: $sqlFile"
}

Write-Host "Server: $Server, Database: $Database"
Write-Host "Running seed (UTF-8)..."

$utf8Bom = New-Object System.Text.UTF8Encoding $true
$sqlText = [System.IO.File]::ReadAllText($sqlFile, [System.Text.Encoding]::UTF8)
$tempSql = Join-Path $env:TEMP ("RuRave_Seed_" + [guid]::NewGuid().ToString("N") + ".sql")

try {
    [System.IO.File]::WriteAllText($tempSql, $sqlText, $utf8Bom)
    & sqlcmd -S $Server -d $Database -E -C -i $tempSql -b -f i:65001,o:65001
    if ($LASTEXITCODE -ne 0) {
        throw "sqlcmd exited with code $LASTEXITCODE"
    }
}
finally {
    if (Test-Path $tempSql) {
        Remove-Item $tempSql -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "Seed completed."
