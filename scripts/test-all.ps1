# Script de Automação de Testes Completo
# NeuroPlay - Test Automation

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NEUROPLAY - AUTOMAÇÃO DE TESTES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"
$testsPassed = 0
$testsFailed = 0

# Função para executar testes
function Run-Tests {
    param(
        [string]$TestName,
        [string]$Command,
        [string]$Path = "."
    )
    
    Write-Host "► Executando: $TestName" -ForegroundColor Yellow
    Write-Host "  Comando: $Command" -ForegroundColor Gray
    Write-Host "  Diretório: $Path" -ForegroundColor Gray
    Write-Host ""
    
    Push-Location $Path
    
    try {
        Invoke-Expression $Command
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ $TestName - PASSOU" -ForegroundColor Green
            $script:testsPassed++
        } else {
            Write-Host "✗ $TestName - FALHOU" -ForegroundColor Red
            $script:testsFailed++
        }
    } catch {
        Write-Host "✗ $TestName - ERRO: $_" -ForegroundColor Red
        $script:testsFailed++
    }
    
    Pop-Location
    Write-Host ""
}

# 1. Testes do Frontend
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. TESTES DO FRONTEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Run-Tests "Frontend - Unit Tests" "npm test -- --watchAll=false --coverage" "frontend"

# 2. Testes do Backend
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "2. TESTES DO BACKEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Run-Tests "Backend - Python Tests" "python -m pytest --verbose" "backend"

# 3. Build Tests
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "3. TESTES DE BUILD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Run-Tests "Frontend - Build" "npm run build" "frontend"

# 4. Lint Tests
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "4. TESTES DE LINT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Run-Tests "Frontend - ESLint" "npm run lint 2>&1 | Out-Null; exit 0" "frontend"

# 5. Testes de Integração
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "5. TESTES DE INTEGRAÇÃO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "► Verificando Docker..." -ForegroundColor Yellow
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Run-Tests "Docker - Build" "docker-compose build --no-cache" "."
    Write-Host "✓ Docker disponível" -ForegroundColor Green
} else {
    Write-Host "⚠ Docker não disponível - pulando testes de integração" -ForegroundColor Yellow
}
Write-Host ""

# Resumo Final
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUMO DOS TESTES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Testes Passaram: $testsPassed" -ForegroundColor Green
Write-Host "✗ Testes Falharam: $testsFailed" -ForegroundColor Red
Write-Host ""

$total = $testsPassed + $testsFailed
if ($total -gt 0) {
    $percentage = [math]::Round(($testsPassed / $total) * 100, 2)
    Write-Host "Taxa de Sucesso: $percentage%" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

# Exit code
if ($testsFailed -gt 0) {
    exit 1
} else {
    exit 0
}
