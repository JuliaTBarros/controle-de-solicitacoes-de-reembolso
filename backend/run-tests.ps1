# run-tests.ps1 - executa a suite completa de testes do backend
Set-Location $PSScriptRoot

$ErrorActionPreference = "Stop"

function Write-Header([string]$text) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  $text" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

# 1. Testes unitarios
Write-Header "TESTES UNITARIOS"
npx jest --runInBand --testPathPattern="tests/unit" --passWithNoTests
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[FALHA] Testes unitarios falharam." -ForegroundColor Red
    exit 1
}
Write-Host "`n[OK] Testes unitarios passaram." -ForegroundColor Green

# 2. Testes de integracao
Write-Header "TESTES DE INTEGRACAO"
npx jest --runInBand --testPathPattern="tests/integration" --passWithNoTests
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[FALHA] Testes de integracao falharam." -ForegroundColor Red
    exit 1
}
Write-Host "`n[OK] Testes de integracao passaram." -ForegroundColor Green

# 3. Cobertura completa
Write-Header "COBERTURA DE CODIGO"
npx jest --runInBand --coverage --passWithNoTests
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[FALHA] Suite completa com cobertura falhou." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  TODOS OS TESTES PASSARAM" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
