#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Monitora status dos GitHub Actions workflows
.DESCRIPTION
    Script para verificar status dos workflows do GitHub Actions em tempo real
.EXAMPLE
    .\scripts\monitor-workflows.ps1
#>

param(
    [int]$IntervalSeconds = 30,
    [int]$MaxChecks = 20
)

$ErrorActionPreference = "Stop"

# Cores
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "GITHUB ACTIONS WORKFLOW MONITOR" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Verifica se gh CLI está instalado
$ghInstalled = Get-Command gh -ErrorAction SilentlyContinue

if (-not $ghInstalled) {
    Write-Host "GitHub CLI (gh) não está instalado!" -ForegroundColor Red
    Write-Host "`nPara instalar:" -ForegroundColor Yellow
    Write-Host "  Windows: winget install --id GitHub.cli" -ForegroundColor White
    Write-Host "  ou baixe de: https://cli.github.com/" -ForegroundColor White
    Write-Host "`nAlternativamente, acesse:" -ForegroundColor Yellow
    Write-Host "  https://github.com/Dev-HP/neuroplay/actions" -ForegroundColor Cyan
    exit 1
}

# Verifica autenticação
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "GitHub CLI não está autenticado!" -ForegroundColor Red
    Write-Host "`nExecute: gh auth login" -ForegroundColor Yellow
    exit 1
}

Write-Host "Monitorando workflows..." -ForegroundColor Green
Write-Host "Intervalo: $IntervalSeconds segundos" -ForegroundColor Gray
Write-Host "Máximo de verificações: $MaxChecks" -ForegroundColor Gray
Write-Host ""

$checkCount = 0
$allPassed = $false

while ($checkCount -lt $MaxChecks -and -not $allPassed) {
    $checkCount++
    
    Write-Host "`n[Check $checkCount/$MaxChecks] $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Gray
    
    # Busca workflows mais recentes
    $workflows = gh run list --limit 10 --json status,conclusion,name,createdAt,displayTitle | ConvertFrom-Json
    
    if (-not $workflows) {
        Write-Host "Nenhum workflow encontrado" -ForegroundColor Yellow
        Start-Sleep -Seconds $IntervalSeconds
        continue
    }
    
    # Agrupa por nome de workflow
    $workflowGroups = $workflows | Group-Object -Property name
    
    $inProgress = 0
    $passed = 0
    $failed = 0
    
    foreach ($group in $workflowGroups) {
        $latest = $group.Group | Sort-Object -Property createdAt -Descending | Select-Object -First 1
        
        $statusIcon = switch ($latest.status) {
            "completed" {
                switch ($latest.conclusion) {
                    "success" { "✅"; $passed++; break }
                    "failure" { "❌"; $failed++; break }
                    "cancelled" { "⚠️"; break }
                    default { "❓"; break }
                }
            }
            "in_progress" { "🔄"; $inProgress++; break }
            "queued" { "⏳"; $inProgress++; break }
            default { "❓"; break }
        }
        
        $color = switch ($latest.status) {
            "completed" {
                switch ($latest.conclusion) {
                    "success" { "Green" }
                    "failure" { "Red" }
                    default { "Yellow" }
                }
            }
            default { "Yellow" }
        }
        
        Write-Host "  $statusIcon " -NoNewline
        Write-Host "$($latest.name)" -ForegroundColor $color -NoNewline
        Write-Host " - $($latest.status)" -ForegroundColor Gray
    }
    
    Write-Host "`n----------------------------------------" -ForegroundColor Gray
    Write-Host "Resumo: " -NoNewline
    Write-Host "✅ $passed " -ForegroundColor Green -NoNewline
    Write-Host "❌ $failed " -ForegroundColor Red -NoNewline
    Write-Host "🔄 $inProgress" -ForegroundColor Yellow
    
    # Verifica se todos passaram
    if ($inProgress -eq 0 -and $failed -eq 0 -and $passed -gt 0) {
        Write-Host "`n🎉 TODOS OS WORKFLOWS PASSARAM!" -ForegroundColor Green
        $allPassed = $true
        break
    }
    
    if ($inProgress -eq 0 -and $failed -gt 0) {
        Write-Host "`n⚠️  Alguns workflows falharam. Verifique os logs." -ForegroundColor Red
        Write-Host "   https://github.com/Dev-HP/neuroplay/actions" -ForegroundColor Cyan
        break
    }
    
    if ($checkCount -lt $MaxChecks -and -not $allPassed) {
        Write-Host "`nPróxima verificação em $IntervalSeconds segundos..." -ForegroundColor Gray
        Start-Sleep -Seconds $IntervalSeconds
    }
}

if (-not $allPassed -and $checkCount -eq $MaxChecks) {
    Write-Host "`n⏱️  Tempo limite atingido. Workflows ainda em execução." -ForegroundColor Yellow
    Write-Host "   Continue monitorando em: https://github.com/Dev-HP/neuroplay/actions" -ForegroundColor Cyan
}

Write-Host "`n========================================`n" -ForegroundColor Cyan
