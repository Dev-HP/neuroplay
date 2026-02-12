#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Simula o pipeline de CI/CD localmente antes de fazer commit

.DESCRIPTION
    Executa os mesmos testes que o GitHub Actions rodará:
    1. Linting
    2. Testes unitários
    3. Build do frontend
    4. Teste de carga (opcional)

.PARAMETER SkipLoadTest
    Pula o teste de carga (mais rápido)

.PARAMETER SkipFrontend
    Pula testes e build do frontend

.PARAMETER Quick
    Modo rápido: apenas linting e testes unitários

.EXAMPLE
    .\scripts\test-pipeline.ps1
    Executa pipeline completo

.EXAMPLE
    .\scripts\test-pipeline.ps1 -Quick
    Executa apenas testes rápidos

.EXAMPLE
    .\scripts\test-pipeline.ps1 -SkipLoadTest
    Executa tudo exceto teste de carga
#>

param(
    [switch]$SkipLoadTest,
    [switch]$SkipFrontend,
    [switch]$Quick
)

$ErrorActionPreference = "Stop"

# Cores para output
function Write-Step {
    param([string]$Message)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host $Message -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Failure {
    param([string]$Message)
    Write-Host "[ERRO] $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[AVISO] $Message" -ForegroundColor Yellow
}

# Variáveis
$startTime = Get-Date
$failedSteps = @()

# ============================================
# 1. QUALITY CHECK
# ============================================

Write-Step "1. QUALITY CHECK - Linting & Unit Tests"

try {
    Write-Host "[CHECK] Verificando formatacao com Black..."
    Push-Location backend
    
    # Verifica se Black está instalado
    if (-not (Get-Command black -ErrorAction SilentlyContinue)) {
        Write-Warning "Black não instalado. Instalando..."
        pip install black flake8
    }
    
    # Black (não crítico)
    black --check app tests 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Código formatado corretamente"
    } else {
        Write-Warning "Código não formatado (execute: black app tests)"
    }
    
    # Flake8 (crítico)
    Write-Host "[CHECK] Verificando qualidade com Flake8..."
    flake8 app --count --select=E9,F63,F7,F82 --show-source --statistics
    if ($LASTEXITCODE -ne 0) {
        throw "Flake8 encontrou erros críticos"
    }
    Write-Success "Flake8 passou"
    
    # Pytest
    Write-Host "[TEST] Executando testes unitarios..."
    pytest tests/unit -v --tb=short
    if ($LASTEXITCODE -ne 0) {
        throw "Testes unitários falharam"
    }
    Write-Success "Testes unitários passaram"
    
    Pop-Location
    
} catch {
    Write-Failure "Quality Check falhou: $_"
    $failedSteps += "Quality Check"
    Pop-Location
    if (-not $Quick) {
        exit 1
    }
}

# ============================================
# 2. FRONTEND BUILD
# ============================================

if (-not $SkipFrontend -and -not $Quick) {
    Write-Step "2. FRONTEND BUILD & PWA Check"
    
    try {
        Push-Location frontend
        
        Write-Host "[INSTALL] Instalando dependencias..."
        npm ci
        
        Write-Host "[TEST] Executando testes do frontend..."
        npm run test:ci
        if ($LASTEXITCODE -ne 0) {
            throw "Testes do frontend falharam"
        }
        Write-Success "Testes do frontend passaram"
        
        Write-Host "[BUILD] Building production bundle..."
        npm run build
        if ($LASTEXITCODE -ne 0) {
            throw "Build do frontend falhou"
        }
        Write-Success "Build concluído"
        
        # Verifica Service Worker
        Write-Host "[CHECK] Verificando Service Worker..."
        if (-not (Test-Path "build/service-worker.js")) {
            throw "service-worker.js nao foi gerado!"
        }
        Write-Success "Service Worker encontrado"
        
        # Verifica Manifest
        Write-Host "[CHECK] Verificando manifest.json..."
        if (-not (Test-Path "build/manifest.json")) {
            throw "manifest.json nao encontrado!"
        }
        Write-Success "Manifest encontrado"
        
        # Tamanho do bundle
        $buildSize = (Get-ChildItem -Path build -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "[INFO] Tamanho do build: $([math]::Round($buildSize, 2)) MB"
        
        Pop-Location
        
    } catch {
        Write-Failure "Frontend Build falhou: $_"
        $failedSteps += "Frontend Build"
        Pop-Location
        exit 1
    }
}

# ============================================
# 3. LOAD TEST
# ============================================

if (-not $SkipLoadTest -and -not $Quick) {
    Write-Step "3. LOAD TEST - Locust"
    
    Write-Warning "Teste de carga requer Docker Compose rodando"
    Write-Host "Execute: docker-compose up -d"
    
    $response = Read-Host "Docker Compose está rodando? (s/N)"
    
    if ($response -eq 's' -or $response -eq 'S') {
        try {
            # Verifica se Locust está instalado
            if (-not (Get-Command locust -ErrorAction SilentlyContinue)) {
                Write-Warning "Locust não instalado. Instalando..."
                pip install locust
            }
            
            Write-Host "[LOAD] Executando teste de carga (30s, 50 usuarios)..."
            locust `
                -f tests/load/locustfile.py `
                --headless `
                --users 50 `
                --spawn-rate 10 `
                --run-time 30s `
                --host http://localhost:5000 `
                --html locust-report.html
            
            if ($LASTEXITCODE -ne 0) {
                throw "Teste de carga falhou"
            }
            
            Write-Success "Teste de carga passou"
            Write-Host "[INFO] Relatorio salvo em: locust-report.html"
            
        } catch {
            Write-Failure "Load Test falhou: $_"
            $failedSteps += "Load Test"
            exit 1
        }
    } else {
        Write-Warning "Teste de carga pulado (Docker Compose não está rodando)"
    }
}

# ============================================
# 4. SECURITY SCAN (Opcional)
# ============================================

if (-not $Quick) {
    Write-Step "4. SECURITY SCAN - Vulnerabilidades"
    
    try {
        # Verifica se Safety está instalado
        if (-not (Get-Command safety -ErrorAction SilentlyContinue)) {
            Write-Warning "Safety não instalado. Instalando..."
            pip install safety
        }
        
        Write-Host "[SECURITY] Verificando vulnerabilidades em dependencias Python..."
        Push-Location backend
        safety check --json 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Nenhuma vulnerabilidade encontrada"
        } else {
            Write-Warning "Vulnerabilidades encontradas (não bloqueante)"
        }
        Pop-Location
        
    } catch {
        Write-Warning "Security Scan falhou (não crítico): $_"
        Pop-Location
    }
}

# ============================================
# RESUMO
# ============================================

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host "`n" -NoNewline
Write-Step "RESUMO DO PIPELINE"

Write-Host "[TIME] Tempo total: $([math]::Round($duration.TotalMinutes, 2)) minutos`n"

if ($failedSteps.Count -eq 0) {
    Write-Success "TODOS OS TESTES PASSARAM!"
    Write-Host "`nVoce pode fazer commit com seguranca.`n" -ForegroundColor Green
    exit 0
} else {
    Write-Failure "ALGUNS TESTES FALHARAM:"
    foreach ($step in $failedSteps) {
        Write-Host "  - $step" -ForegroundColor Red
    }
    Write-Host "`nCorrija os erros antes de fazer commit.`n" -ForegroundColor Red
    exit 1
}
