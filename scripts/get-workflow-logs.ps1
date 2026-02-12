#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Busca logs dos workflows que falharam
.EXAMPLE
    .\scripts\get-workflow-logs.ps1
#>

$ErrorActionPreference = "Stop"

$owner = "Dev-HP"
$repo = "neuroplay"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "BUSCANDO LOGS DOS WORKFLOWS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

try {
    # Busca workflows recentes
    $runsUrl = "https://api.github.com/repos/$owner/$repo/actions/runs?per_page=10"
    $runs = Invoke-RestMethod -Uri $runsUrl -Method Get -Headers @{
        "Accept" = "application/vnd.github.v3+json"
        "User-Agent" = "PowerShell"
    }
    
    # Filtra workflows que falharam
    $failedRuns = $runs.workflow_runs | Where-Object { 
        $_.conclusion -eq "failure" -and $_.status -eq "completed" 
    } | Sort-Object -Property created_at -Descending | Select-Object -First 5
    
    if ($failedRuns.Count -eq 0) {
        Write-Host "Nenhum workflow com falha encontrado!" -ForegroundColor Green
        exit 0
    }
    
    Write-Host "Workflows com falha encontrados: $($failedRuns.Count)`n" -ForegroundColor Yellow
    
    foreach ($run in $failedRuns) {
        Write-Host "========================================" -ForegroundColor Gray
        Write-Host "Workflow: $($run.name)" -ForegroundColor Cyan
        Write-Host "Run ID: $($run.id)" -ForegroundColor Gray
        Write-Host "Criado em: $($run.created_at)" -ForegroundColor Gray
        Write-Host "URL: $($run.html_url)" -ForegroundColor Blue
        Write-Host "========================================`n" -ForegroundColor Gray
        
        # Busca jobs deste run
        $jobsUrl = "https://api.github.com/repos/$owner/$repo/actions/runs/$($run.id)/jobs"
        $jobs = Invoke-RestMethod -Uri $jobsUrl -Method Get -Headers @{
            "Accept" = "application/vnd.github.v3+json"
            "User-Agent" = "PowerShell"
        }
        
        # Filtra jobs que falharam
        $failedJobs = $jobs.jobs | Where-Object { $_.conclusion -eq "failure" }
        
        if ($failedJobs.Count -eq 0) {
            Write-Host "  Nenhum job com falha encontrado neste workflow`n" -ForegroundColor Yellow
            continue
        }
        
        foreach ($job in $failedJobs) {
            Write-Host "  Job: $($job.name)" -ForegroundColor Red
            Write-Host "  Status: $($job.status) - $($job.conclusion)" -ForegroundColor Red
            Write-Host "  Duração: $([math]::Round(($job.completed_at - $job.started_at).TotalSeconds, 2))s" -ForegroundColor Gray
            
            # Busca steps que falharam
            $failedSteps = $job.steps | Where-Object { $_.conclusion -eq "failure" }
            
            if ($failedSteps.Count -gt 0) {
                Write-Host "`n  Steps que falharam:" -ForegroundColor Yellow
                foreach ($step in $failedSteps) {
                    Write-Host "    - $($step.name)" -ForegroundColor Red
                    Write-Host "      Número: $($step.number)" -ForegroundColor Gray
                    Write-Host "      Duração: $([math]::Round(($step.completed_at - $step.started_at).TotalSeconds, 2))s" -ForegroundColor Gray
                }
            }
            
            Write-Host "`n  Para ver logs completos:" -ForegroundColor White
            Write-Host "    $($run.html_url)" -ForegroundColor Cyan
            Write-Host ""
        }
        
        Write-Host ""
    }
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "RESUMO" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Total de workflows com falha: $($failedRuns.Count)" -ForegroundColor Yellow
    Write-Host "`nPara corrigir os problemas:" -ForegroundColor White
    Write-Host "  1. Analise os steps que falharam acima" -ForegroundColor Gray
    Write-Host "  2. Acesse os links para ver logs detalhados" -ForegroundColor Gray
    Write-Host "  3. Cole os erros aqui para correção" -ForegroundColor Gray
    Write-Host "========================================`n" -ForegroundColor Cyan
    
} catch {
    Write-Host "Erro ao buscar logs: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nVerifique manualmente em:" -ForegroundColor Yellow
    Write-Host "  https://github.com/$owner/$repo/actions" -ForegroundColor Cyan
}
