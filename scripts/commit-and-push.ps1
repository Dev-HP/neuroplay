#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Commit e push das mudanças do NeuroPlay 2.5

.DESCRIPTION
    Faz commit com mensagem profissional e push para GitHub
#>

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "COMMIT & PUSH - NEUROPLAY 2.5" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Verificar status
Write-Host "[1/5] Verificando status do Git..." -ForegroundColor Yellow
git status --short

# 2. Adicionar arquivos
Write-Host "`n[2/5] Adicionando arquivos..." -ForegroundColor Yellow
git add .

# 3. Verificar o que será commitado
Write-Host "`n[3/5] Arquivos que serao commitados:" -ForegroundColor Yellow
git status --short

# 4. Confirmar
Write-Host "`n[4/5] Deseja continuar com o commit? (S/n): " -ForegroundColor Yellow -NoNewline
$response = Read-Host

if ($response -eq 'n' -or $response -eq 'N') {
    Write-Host "`n[CANCELADO] Commit cancelado pelo usuario." -ForegroundColor Red
    exit 0
}

# 5. Commit
Write-Host "`n[5/5] Fazendo commit..." -ForegroundColor Yellow
git commit -F COMMIT_MESSAGE.txt

# 6. Push
Write-Host "`n[PUSH] Fazendo push para GitHub..." -ForegroundColor Yellow
Write-Host "Branch atual: " -NoNewline
git branch --show-current

Write-Host "`nDeseja fazer push agora? (S/n): " -ForegroundColor Yellow -NoNewline
$pushResponse = Read-Host

if ($pushResponse -ne 'n' -and $pushResponse -ne 'N') {
    $branch = git branch --show-current
    git push origin $branch
    
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "SUCESSO!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "`nCommit e push concluidos com sucesso!" -ForegroundColor Green
    Write-Host "Pipeline CI/CD sera executado automaticamente." -ForegroundColor Green
    Write-Host "`nAcompanhe em: https://github.com/seu-usuario/neuroplay/actions" -ForegroundColor Cyan
} else {
    Write-Host "`n[INFO] Commit feito. Execute 'git push' quando estiver pronto." -ForegroundColor Yellow
}

Write-Host "`n"
