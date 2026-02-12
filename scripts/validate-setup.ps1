#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Valida setup do NeuroPlay 2.5 rapidamente

.DESCRIPTION
    Verifica se todos os componentes críticos estão configurados
#>

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "VALIDACAO RAPIDA - NEUROPLAY 2.5" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$checks = @()

# 1. Python
Write-Host "[CHECK] Python..." -NoNewline
try {
    $pythonVersion = python --version 2>&1
    Write-Host " OK ($pythonVersion)" -ForegroundColor Green
    $checks += @{name="Python"; status="OK"}
} catch {
    Write-Host " FALHOU" -ForegroundColor Red
    $checks += @{name="Python"; status="FALHOU"}
}

# 2. Node.js
Write-Host "[CHECK] Node.js..." -NoNewline
try {
    $nodeVersion = node --version
    Write-Host " OK ($nodeVersion)" -ForegroundColor Green
    $checks += @{name="Node.js"; status="OK"}
} catch {
    Write-Host " FALHOU" -ForegroundColor Red
    $checks += @{name="Node.js"; status="FALHOU"}
}

# 3. Docker
Write-Host "[CHECK] Docker..." -NoNewline
try {
    $dockerVersion = docker --version
    Write-Host " OK ($dockerVersion)" -ForegroundColor Green
    $checks += @{name="Docker"; status="OK"}
} catch {
    Write-Host " FALHOU (opcional)" -ForegroundColor Yellow
    $checks += @{name="Docker"; status="OPCIONAL"}
}

# 4. Backend dependencies
Write-Host "[CHECK] Backend dependencies..." -NoNewline
Push-Location backend
try {
    python -c "import flask; import flask_cors; import flask_sqlalchemy; import jwt" 2>$null
    Write-Host " OK" -ForegroundColor Green
    $checks += @{name="Backend Deps"; status="OK"}
} catch {
    Write-Host " FALTANDO" -ForegroundColor Yellow
    Write-Host "  Execute: pip install -r requirements.txt" -ForegroundColor Yellow
    $checks += @{name="Backend Deps"; status="FALTANDO"}
}
Pop-Location

# 5. Frontend dependencies
Write-Host "[CHECK] Frontend dependencies..." -NoNewline
Push-Location frontend
if (Test-Path "node_modules") {
    Write-Host " OK" -ForegroundColor Green
    $checks += @{name="Frontend Deps"; status="OK"}
} else {
    Write-Host " FALTANDO" -ForegroundColor Yellow
    Write-Host "  Execute: npm install" -ForegroundColor Yellow
    $checks += @{name="Frontend Deps"; status="FALTANDO"}
}
Pop-Location

# 6. Health check endpoint
Write-Host "[CHECK] Health check endpoint..." -NoNewline
if (Select-String -Path "backend/app.py" -Pattern "/health" -Quiet) {
    Write-Host " OK" -ForegroundColor Green
    $checks += @{name="Health Check"; status="OK"}
} else {
    Write-Host " FALTANDO" -ForegroundColor Red
    $checks += @{name="Health Check"; status="FALTANDO"}
}

# 7. Workbox config
Write-Host "[CHECK] Workbox config..." -NoNewline
if (Test-Path "frontend/workbox-config.js") {
    Write-Host " OK" -ForegroundColor Green
    $checks += @{name="Workbox Config"; status="OK"}
} else {
    Write-Host " FALTANDO" -ForegroundColor Red
    $checks += @{name="Workbox Config"; status="FALTANDO"}
}

# 8. Unit tests
Write-Host "[CHECK] Unit tests..." -NoNewline
if (Test-Path "backend/tests/unit/test_entities.py") {
    Write-Host " OK" -ForegroundColor Green
    $checks += @{name="Unit Tests"; status="OK"}
} else {
    Write-Host " FALTANDO" -ForegroundColor Red
    $checks += @{name="Unit Tests"; status="FALTANDO"}
}

# 9. CI/CD Pipeline
Write-Host "[CHECK] CI/CD Pipeline..." -NoNewline
if (Test-Path ".github/workflows/production.yml") {
    Write-Host " OK" -ForegroundColor Green
    $checks += @{name="CI/CD Pipeline"; status="OK"}
} else {
    Write-Host " FALTANDO" -ForegroundColor Red
    $checks += @{name="CI/CD Pipeline"; status="FALTANDO"}
}

# 10. Docker Compose
Write-Host "[CHECK] Docker Compose..." -NoNewline
if (Test-Path "docker-compose.prod.yml") {
    Write-Host " OK" -ForegroundColor Green
    $checks += @{name="Docker Compose"; status="OK"}
} else {
    Write-Host " FALTANDO" -ForegroundColor Red
    $checks += @{name="Docker Compose"; status="FALTANDO"}
}

# Resumo
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "RESUMO" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$ok = ($checks | Where-Object {$_.status -eq "OK"}).Count
$total = $checks.Count
$percentage = [math]::Round(($ok / $total) * 100)

Write-Host "Checks OK: $ok/$total ($percentage%)`n"

if ($percentage -eq 100) {
    Write-Host "[SUCCESS] Sistema pronto para CI/CD!" -ForegroundColor Green
    exit 0
} elseif ($percentage -ge 70) {
    Write-Host "[WARNING] Sistema quase pronto. Corrija os itens faltando." -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "[ERROR] Sistema nao esta pronto. Execute os comandos sugeridos." -ForegroundColor Red
    exit 1
}
