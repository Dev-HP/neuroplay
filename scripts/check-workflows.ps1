#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Verifica status dos workflows via API do GitHub
.DESCRIPTION
    Script simples para verificar workflows sem precisar do gh CLI
.EXAMPLE
    .\scripts\check-workflows.ps1
#>

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "GITHUB WORKFLOWS - STATUS CHECK" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$owner = "Dev-HP"
$repo = "neuroplay"
$apiUrl = "https://api.github.com/repos/$owner/$repo/actions/runs?per_page=10"

try {
    Write-Host "Buscando workflows..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri $apiUrl -Method Get -Headers @{
        "Accept" = "application/vnd.github.v3+json"
        "User-Agent" = "PowerShell"
    }
    
    if ($response.workflow_runs.Count -eq 0) {
        Write-Host "Nenhum workflow encontrado" -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host "Últimos workflows:`n" -ForegroundColor Green
    
    # Agrupa por nome de workflow
    $grouped = $response.workflow_runs | Group-Object -Property name
    
    $stats = @{
        success = 0
        failure = 0
        in_progress = 0
        queued = 0
    }
    
    foreach ($group in $grouped) {
        $latest = $group.Group | Sort-Object -Property created_at -Descending | Select-Object -First 1
        
        $statusIcon = switch ($latest.status) {
            "completed" {
                switch ($latest.conclusion) {
                    "success" { "✅"; $stats.success++; "success" }
                    "failure" { "❌"; $stats.failure++; "failure" }
                    "cancelled" { "⚠️ "; "cancelled" }
                    default { "❓"; "unknown" }
                }
            }
            "in_progress" { "🔄"; $stats.in_progress++; "in_progress" }
            "queued" { "⏳"; $stats.queued++; "queued" }
            default { "❓"; "unknown" }
        }
        
        $color = switch ($latest.status) {
            "completed" {
                switch ($latest.conclusion) {
                    "success" { "Green" }
                    "failure" { "Red" }
                    default { "Yellow" }
                }
            }
            "in_progress" { "Yellow" }
            "queued" { "Cyan" }
            default { "Gray" }
        }
        
        $duration = ""
        if ($latest.status -eq "completed") {
            $start = [DateTime]::Parse($latest.created_at)
            $end = [DateTime]::Parse($latest.updated_at)
            $diff = $end - $start
            $duration = " ($([int]$diff.TotalMinutes)m $($diff.Seconds)s)"
        }
        
        Write-Host "  $statusIcon " -NoNewline
        Write-Host "$($latest.name)" -ForegroundColor $color -NoNewline
        Write-Host "$duration" -ForegroundColor Gray
        
        if ($latest.status -eq "completed" -and $latest.conclusion -eq "failure") {
            Write-Host "      URL: $($latest.html_url)" -ForegroundColor Red
        }
    }
    
    Write-Host "`n----------------------------------------" -ForegroundColor Gray
    Write-Host "Resumo:" -ForegroundColor White
    Write-Host "  ✅ Sucesso: $($stats.success)" -ForegroundColor Green
    Write-Host "  ❌ Falhou: $($stats.failure)" -ForegroundColor Red
    Write-Host "  🔄 Em progresso: $($stats.in_progress)" -ForegroundColor Yellow
    Write-Host "  ⏳ Na fila: $($stats.queued)" -ForegroundColor Cyan
    
    Write-Host "`nVer todos os workflows:" -ForegroundColor White
    Write-Host "  https://github.com/$owner/$repo/actions" -ForegroundColor Cyan
    
    # Status final
    if ($stats.in_progress -eq 0 -and $stats.queued -eq 0) {
        if ($stats.failure -eq 0 -and $stats.success -gt 0) {
            Write-Host "`n🎉 TODOS OS WORKFLOWS PASSARAM!" -ForegroundColor Green
        } elseif ($stats.failure -gt 0) {
            Write-Host "`n⚠️  ALGUNS WORKFLOWS FALHARAM!" -ForegroundColor Red
        }
    } else {
        Write-Host "`n⏳ Workflows ainda em execução..." -ForegroundColor Yellow
        Write-Host "   Execute novamente em alguns minutos" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "Erro ao buscar workflows: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nVerifique manualmente em:" -ForegroundColor Yellow
    Write-Host "  https://github.com/$owner/$repo/actions" -ForegroundColor Cyan
}

Write-Host "`n========================================`n" -ForegroundColor Cyan
