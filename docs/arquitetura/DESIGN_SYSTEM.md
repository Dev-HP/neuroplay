# Design system

As variáveis ficam em `frontend/src/index.css` (`:root`). Use as variáveis, não cores soltas.

## Princípios

- **Baixa saturação e contraste suficiente.** Crianças com TEA e TDAH costumam ser sensíveis a cores vivas e piscantes; a paleta usa azul e verde-azulado sóbrios.
- **Alvos de toque grandes:** botões com pelo menos 44 px de altura; controles dos jogos com 56 px.
- **Movimento opcional:** animações respeitam `prefers-reduced-motion` e o painel de ajustes sensoriais.
- **Fim previsível:** toda atividade tem botão de parar visível e uma tela final clara.

## Cores

| Papel | Variável | Valor |
|---|---|---|
| Primária | `--primary-500` / `-700` | `#3f6fb5` / `#2a4a7c` |
| Secundária | `--secondary-500` | `#2f8a7c` |
| Sucesso | `--success` | `#3f8a5c` |
| Aviso | `--warning` | `#c8962f` |
| Erro | `--error` | `#c0504d` |
| Destaques | `--accent-yellow`, `--accent-coral`, `--accent-purple` | `#d4a63f`, `#c9744f`, `#6f68a8` |
| Texto / fundo | `--gray-800` / `--gray-50` | `#1f2937` / `#f9fafb` |
| Cabeçalho escuro (theme-color) | — | `#16294a` |

Cada cor tem a escala 50–900 (primária e secundária) ou a versão `-light` (destaques e estados).

## Tipografia

Fonte do sistema (Inter quando instalada, depois `-apple-system`, Segoe UI, Roboto). Não há fonte externa: a CSP bloqueia e evita enviar o IP da criança a terceiros.

## Componentes compartilhados

| Componente | Uso |
|---|---|
| `Logo` / `LogoMark` | Laço de infinito com botão "play" (arquivos em [`../marca/`](../marca/)) |
| `GameControls` | Botões na tela para jogos em canvas (toque e mouse), com "Encerrar" |
| `EmergencyStop` | Botão "Parar" fixo, sempre visível durante o jogo |
| `SensorySettings` | Brilho, contraste, cores, animações, partículas, volume, velocidade e intervalo de pausa |
