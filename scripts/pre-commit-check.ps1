#!/usr/bin/env pwsh
# Script de verificação pré-commit para segurança

Write-Host "🔒 Verificando segurança antes do commit..." -ForegroundColor Cyan

$errors = @()
$warnings = @()

# Verificar se existem arquivos .env commitados
Write-Host "`n📋 Verificando arquivos de ambiente..." -ForegroundColor Yellow
$envFiles = git ls-files | Select-String -Pattern "\.env$|\.env\."
if ($envFiles) {
    $errors += "❌ Arquivo .env detectado no stage: $envFiles"
}

# Verificar por chaves de API em código
Write-Host "📋 Verificando chaves de API no código..." -ForegroundColor Yellow
$apiKeyPatterns = @(
    "api[_-]?key\s*=\s*['\"][^'\"]{20,}['\"]",
    "api[_-]?secret\s*=\s*['\"][^'\"]{20,}['\"]",
    "token\s*=\s*['\"][^'\"]{20,}['\"]",
    "password\s*=\s*['\"][^'\"]{8,}['\"]",
    "secret[_-]?key\s*=\s*['\"][^'\"]{20,}['\"]",
    "SENTRY_DSN\s*=\s*['\"]https://[^'\"]+['\"]"
)

$stagedFiles = git diff --cached --name-only --diff-filter=ACM

foreach ($file in $stagedFiles) {
    if (-not (Test-Path $file)) { continue }
    
    $content = Get-Content $file -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    foreach ($pattern in $apiKeyPatterns) {
        if ($content -match $pattern) {
            # Verificar se é arquivo de exemplo
            if ($file -notmatch "\.example|\.sample|\.template") {
                $warnings += "⚠️  Possível chave de API detectada em: $file"
            }
        }
    }
}

# Verificar por credenciais hardcoded
Write-Host "📋 Verificando credenciais hardcoded..." -ForegroundColor Yellow
$credentialPatterns = @(
    "postgres://[^:]+:[^@]+@",
    "mysql://[^:]+:[^@]+@",
    "mongodb://[^:]+:[^@]+@",
    "redis://:[^@]+@"
)

foreach ($file in $stagedFiles) {
    if (-not (Test-Path $file)) { continue }
    
    $content = Get-Content $file -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    foreach ($pattern in $credentialPatterns) {
        if ($content -match $pattern) {
            if ($file -notmatch "\.example|\.sample|\.template|\.md|docker-compose") {
                $errors += "❌ Credencial de banco detectada em: $file"
            }
        }
    }
}

# Verificar arquivos grandes
Write-Host "📋 Verificando arquivos grandes..." -ForegroundColor Yellow
foreach ($file in $stagedFiles) {
    if (-not (Test-Path $file)) { continue }
    
    $size = (Get-Item $file).Length / 1MB
    if ($size -gt 10) {
        $warnings += "⚠️  Arquivo grande (${size}MB): $file"
    }
}

# Verificar por console.log não removidos
Write-Host "📋 Verificando console.log em produção..." -ForegroundColor Yellow
foreach ($file in $stagedFiles) {
    if ($file -match "\.(js|jsx|ts|tsx)$" -and $file -notmatch "test|spec") {
        if (-not (Test-Path $file)) { continue }
        
        $content = Get-Content $file -Raw -ErrorAction SilentlyContinue
        if ($content -match "console\.(log|debug|warn)\(") {
            $warnings += "⚠️  console.log encontrado em: $file"
        }
    }
}

# Verificar se há arquivos de cache
Write-Host "📋 Verificando arquivos de cache..." -ForegroundColor Yellow
$cachePatterns = @("__pycache__", "node_modules", ".pytest_cache", "*.pyc", "*.log")
foreach ($file in $stagedFiles) {
    foreach ($pattern in $cachePatterns) {
        if ($file -like "*$pattern*") {
            $errors += "❌ Arquivo de cache no stage: $file"
        }
    }
}

# Exibir resultados
Write-Host "`n" -NoNewline
if ($errors.Count -gt 0) {
    Write-Host "❌ ERROS CRÍTICOS ENCONTRADOS:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  $error" -ForegroundColor Red
    }
    Write-Host "`n❌ Commit bloqueado! Corrija os erros acima." -ForegroundColor Red
    exit 1
}

if ($warnings.Count -gt 0) {
    Write-Host "⚠️  AVISOS:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "  $warning" -ForegroundColor Yellow
    }
    Write-Host "`n⚠️  Revise os avisos acima antes de commitar." -ForegroundColor Yellow
    
    # Perguntar se deseja continuar
    $continue = Read-Host "Deseja continuar com o commit? (s/N)"
    if ($continue -ne "s" -and $continue -ne "S") {
        Write-Host "❌ Commit cancelado pelo usuário." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Verificação de segurança passou!" -ForegroundColor Green
Write-Host "🚀 Prosseguindo com o commit..." -ForegroundColor Cyan
exit 0
