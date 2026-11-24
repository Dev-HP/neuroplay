#!/usr/bin/env pwsh
# Script para organizar documentação do projeto

Write-Host "🧹 Organizando documentação do NeuroPlay..." -ForegroundColor Cyan

# Criar estrutura de diretórios
$dirs = @(
    "docs/development/progress",
    "docs/development/planning",
    "docs/development/commits",
    "docs/development/testing",
    "docs/development/analysis"
)

foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✓ Criado: $dir" -ForegroundColor Green
    }
}

# Mover documentos de progresso
$progressDocs = @(
    "PROGRESSO_MELHORIAS_TECNICAS.md",
    "RESUMO_MELHORIAS_CSS.md",
    "RESUMO_SESSAO_ATUAL.md",
    "STATUS_ATUAL.md"
)

foreach ($doc in $progressDocs) {
    if (Test-Path $doc) {
        Move-Item -Path $doc -Destination "docs/development/progress/" -Force
        Write-Host "✓ Movido: $doc → docs/development/progress/" -ForegroundColor Green
    }
}

# Mover documentos de planejamento
$planningDocs = @(
    "PLANO_ACAO_IMEDIATO.md",
    "TASKS_PRE_DEPLOY.md",
    "DEPLOY_CHECKLIST.md"
)

foreach ($doc in $planningDocs) {
    if (Test-Path $doc) {
        Move-Item -Path $doc -Destination "docs/development/planning/" -Force
        Write-Host "✓ Movido: $doc → docs/development/planning/" -ForegroundColor Green
    }
}

# Mover documentos de commits
$commitDocs = @(
    "COMMIT_CASCADE_DETECTOR.md",
    "COMMIT_REORGANIZACAO.md"
)

foreach ($doc in $commitDocs) {
    if (Test-Path $doc) {
        Move-Item -Path $doc -Destination "docs/development/commits/" -Force
        Write-Host "✓ Movido: $doc → docs/development/commits/" -ForegroundColor Green
    }
}

# Mover documentos de testes
$testingDocs = @(
    "TEST_AUTOMATION_REPORT.md",
    "TESTING_STRATEGY.md",
    "VERIFICACAO_CASCADE_DETECTOR.md",
    "TESTE_SISTEMA.md"
)

foreach ($doc in $testingDocs) {
    if (Test-Path $doc) {
        Move-Item -Path $doc -Destination "docs/development/testing/" -Force
        Write-Host "✓ Movido: $doc → docs/development/testing/" -ForegroundColor Green
    }
}

# Mover documentos de análise
$analysisDocs = @(
    "ANALISE_COMPLETA_E_DEPLOY.md",
    "ANALISE_E_PLANO_FINAL.md",
    "FASE_0_RELATORIO.md"
)

foreach ($doc in $analysisDocs) {
    if (Test-Path $doc) {
        Move-Item -Path $doc -Destination "docs/development/analysis/" -Force
        Write-Host "✓ Movido: $doc → docs/development/analysis/" -ForegroundColor Green
    }
}

# Manter na raiz (documentação importante)
$keepInRoot = @(
    "README.md",
    "CONTRIBUTING.md",
    "LICENSE",
    "ENTREGA_FINAL.md",
    "RESUMO_EXECUTIVO.md",
    "IMPLEMENTACAO_COMPLETA.md"
)

Write-Host "`n📌 Mantidos na raiz:" -ForegroundColor Yellow
foreach ($doc in $keepInRoot) {
    if (Test-Path $doc) {
        Write-Host "  • $doc" -ForegroundColor White
    }
}

# Remover arquivos temporários
$tempFiles = @(
    "COMMIT_MESSAGE.txt",
    "PROXIMOS_PASSOS.txt"
)

Write-Host "`n🗑️  Removendo arquivos temporários:" -ForegroundColor Yellow
foreach ($file in $tempFiles) {
    if (Test-Path $file) {
        Remove-Item -Path $file -Force
        Write-Host "✓ Removido: $file" -ForegroundColor Red
    }
}

Write-Host "`n✅ Organização completa!" -ForegroundColor Green
Write-Host "📁 Estrutura de documentação:" -ForegroundColor Cyan
Write-Host "  • docs/development/progress/    - Relatorios de progresso" -ForegroundColor White
Write-Host "  • docs/development/planning/    - Planejamento e tarefas" -ForegroundColor White
Write-Host "  • docs/development/commits/     - Documentacao de commits" -ForegroundColor White
Write-Host "  • docs/development/testing/     - Estrategias de teste" -ForegroundColor White
Write-Host "  • docs/development/analysis/    - Analises tecnicas" -ForegroundColor White
