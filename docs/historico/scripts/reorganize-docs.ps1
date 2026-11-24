# Script para reorganizar documentacao do NeuroPlay
# Execucao: .\scripts\reorganize-docs.ps1

Write-Host "Iniciando reorganizacao da documentacao..." -ForegroundColor Green

# Criar estrutura se não existir
$folders = @(
    "docs/architecture",
    "docs/guides",
    "docs/development",
    "docs/features/achievements",
    "docs/features/games",
    "docs/status",
    "docs/archive"
)

foreach ($folder in $folders) {
    if (!(Test-Path $folder)) {
        New-Item -ItemType Directory -Force -Path $folder | Out-Null
        Write-Host "Criado: $folder" -ForegroundColor Cyan
    }
}

# Mover arquivos de arquitetura
Write-Host "`nMovendo arquivos de arquitetura..." -ForegroundColor Yellow
$archFiles = @(
    @{src="docs/ARQUITETURA.md"; dst="docs/architecture/ARQUITETURA.md"},
    @{src="docs/DESIGN_SYSTEM.md"; dst="docs/architecture/DESIGN_SYSTEM.md"},
    @{src="docs/TECNOLOGIAS.md"; dst="docs/architecture/TECNOLOGIAS.md"}
)

foreach ($file in $archFiles) {
    if (Test-Path $file.src) {
        Move-Item -Path $file.src -Destination $file.dst -Force
        Write-Host "  OK: $($file.src) -> $($file.dst)" -ForegroundColor Gray
    }
}

# Mover guias
Write-Host "`nMovendo guias..." -ForegroundColor Yellow
$guideFiles = @(
    @{src="docs/INSTALACAO.md"; dst="docs/guides/INSTALACAO.md"},
    @{src="QUICK_START.md"; dst="docs/guides/QUICK_START.md"},
    @{src="docs/DEPLOY.md"; dst="docs/guides/DEPLOY.md"},
    @{src="DEPLOY_AGORA.md"; dst="docs/guides/DEPLOY_AGORA.md"},
    @{src="INSTALAR_WINDOWS.md"; dst="docs/guides/INSTALAR_WINDOWS.md"}
)

foreach ($file in $guideFiles) {
    if (Test-Path $file.src) {
        Move-Item -Path $file.src -Destination $file.dst -Force
        Write-Host "  OK: $($file.src) -> $($file.dst)" -ForegroundColor Gray
    }
}

# Mover documentacao de desenvolvimento
Write-Host "`nMovendo docs de desenvolvimento..." -ForegroundColor Yellow
$devFiles = @(
    @{src="CONTRIBUTING.md"; dst="docs/development/CONTRIBUTING.md"},
    @{src="TASKS_PRE_DEPLOY.md"; dst="docs/development/TASKS_PRE_DEPLOY.md"},
    @{src="PLANO_ACAO_IMEDIATO.md"; dst="docs/development/PLANO_ACAO_IMEDIATO.md"}
)

foreach ($file in $devFiles) {
    if (Test-Path $file.src) {
        Copy-Item -Path $file.src -Destination $file.dst -Force
        Write-Host "  OK: $($file.src) -> $($file.dst)" -ForegroundColor Gray
    }
}

# Mover docs de conquistas
Write-Host "`nMovendo docs de conquistas..." -ForegroundColor Yellow
$achievementFiles = @(
    @{src="PASSO_6_DESIGN_CONQUISTAS.md"; dst="docs/features/achievements/DESIGN_CONQUISTAS.md"},
    @{src="PASSO_7_TASKS_CONQUISTAS.md"; dst="docs/features/achievements/TASKS_CONQUISTAS.md"},
    @{src="TESTAR_SISTEMA_CONQUISTAS.md"; dst="docs/features/achievements/TESTAR_CONQUISTAS.md"},
    @{src="SISTEMA_CONQUISTAS_100_COMPLETO.md"; dst="docs/features/achievements/SISTEMA_100_COMPLETO.md"},
    @{src="FASE1_MVP_CONQUISTAS_CONCLUIDA.md"; dst="docs/features/achievements/MVP_CONCLUIDO.md"},
    @{src="IMPLEMENTACAO_CONQUISTAS_PROGRESSO.md"; dst="docs/features/achievements/PROGRESSO.md"}
)

foreach ($file in $achievementFiles) {
    if (Test-Path $file.src) {
        Move-Item -Path $file.src -Destination $file.dst -Force
        Write-Host "  OK: $($file.src) -> $($file.dst)" -ForegroundColor Gray
    }
}

# Mover docs de jogos
Write-Host "`nMovendo docs de jogos..." -ForegroundColor Yellow
$gameFiles = @(
    @{src="CYBER_RUNNER_MVP.md"; dst="docs/features/games/CYBER_RUNNER_MVP.md"},
    @{src="ECHO_TEMPLE_GUIA.md"; dst="docs/features/games/ECHO_TEMPLE_GUIA.md"},
    @{src="docs/JOGOS_TERAPEUTICOS.md"; dst="docs/features/games/JOGOS_TERAPEUTICOS.md"},
    @{src="docs/IMPLEMENTACAO_JOGOS_TECNICOS.md"; dst="docs/features/games/IMPLEMENTACAO_TECNICOS.md"},
    @{src="NEUROPLAY_4_JOGOS_COMPLETOS.md"; dst="docs/features/games/4_JOGOS_COMPLETOS.md"}
)

foreach ($file in $gameFiles) {
    if (Test-Path $file.src) {
        Move-Item -Path $file.src -Destination $file.dst -Force
        Write-Host "  OK: $($file.src) -> $($file.dst)" -ForegroundColor Gray
    }
}

# Mover arquivos de status
Write-Host "`nMovendo arquivos de status..." -ForegroundColor Yellow
$statusFiles = @(
    @{src="FASE_1_100_COMPLETA.md"; dst="docs/status/FASE_1_100_COMPLETA.md"},
    @{src="FASE_1_COMPLETA.md"; dst="docs/status/FASE_1_COMPLETA.md"},
    @{src="FASE_1_IMPLEMENTADA.md"; dst="docs/status/FASE_1_IMPLEMENTADA.md"},
    @{src="STATUS_CYBER_RUNNER.md"; dst="docs/status/STATUS_CYBER_RUNNER.md"},
    @{src="STATUS_PESQUISA_CIENTIFICA.md"; dst="docs/status/STATUS_PESQUISA_CIENTIFICA.md"},
    @{src="RESUMO_FASE1_FINAL.md"; dst="docs/status/RESUMO_FASE1_FINAL.md"}
)

foreach ($file in $statusFiles) {
    if (Test-Path $file.src) {
        Move-Item -Path $file.src -Destination $file.dst -Force
        Write-Host "  OK: $($file.src) -> $($file.dst)" -ForegroundColor Gray
    }
}

# Arquivar documentos antigos/temporarios
Write-Host "`nArquivando documentos antigos..." -ForegroundColor Yellow
$archiveFiles = @(
    "TASK_*.md",
    "PASSO_*.md",
    "RESUMO_*.md",
    "SISTEMA_CONQUISTAS_*.md",
    "AJUSTES_*.md",
    "COMANDOS_*.txt",
    "GUIA_*.md",
    "MELHORIAS_*.md",
    "TESTAR_*.md",
    "INICIAR_*.txt",
    "ECHO_TEMPLE_*.txt"
)

foreach ($pattern in $archiveFiles) {
    $files = Get-ChildItem -Path . -Filter $pattern -File
    foreach ($file in $files) {
        if ($file.Name -notlike "*CONQUISTAS*") {
            Move-Item -Path $file.FullName -Destination "docs/archive/$($file.Name)" -Force
            Write-Host "  OK: $($file.Name) -> docs/archive/" -ForegroundColor Gray
        }
    }
}

Write-Host "`nReorganizacao concluida!" -ForegroundColor Green
Write-Host "`nProximos passos:" -ForegroundColor Cyan
Write-Host "  1. Revisar arquivos movidos"
Write-Host "  2. Atualizar links internos"
Write-Host "  3. Criar docs/README.md com indice"
Write-Host "  4. Commit das mudancas"
