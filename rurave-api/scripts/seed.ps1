# Запуск SeedTestData.sql на SQL Server (Windows Auth)
param(
    [string]$Server = "DESKTOP-G67DLTD",
    [string]$Database = "RuRaveDB"
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$sqlFile = Join-Path $scriptDir "SeedTestData.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Error "Не найден файл: $sqlFile"
}

Write-Host "Сервер: $Server, БД: $Database"
Write-Host "Выполняется $sqlFile ..."

sqlcmd -S $Server -d $Database -E -C -i $sqlFile -b

if ($LASTEXITCODE -ne 0) {
    Write-Error "sqlcmd завершился с кодом $LASTEXITCODE"
}

Write-Host "Seed выполнен успешно."
