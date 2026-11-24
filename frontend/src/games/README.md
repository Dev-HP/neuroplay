# Jogos

Cada jogo fica numa pasta própria e é aberto pela rota `/jogo/<slug>?student_id=<id>`.

| Pasta | Rota | Processo | Como termina |
|---|---|---|---|
| `MestresDoSinal/` | `mestres-sinal` | Controle inibitório (Go/No-Go 75/25) | Bloco de 20 sinais |
| `CacadorDeAlvos/` | `cacador-alvos` | Busca visual | Tempo de 60 s |
| `MemoriaDupla/` | `memoria-dupla` | Memória de trabalho (n-back) | 4 rodadas |
| `CyberRunner/` | `cyber-runner-canvas` | Atenção em multitarefa | Vidas ou botão Encerrar |
| `EchoTemple/` | `echo-temple` | Memória visuoespacial | Cada sequência salva; Encerrar |
| `SonicJump/` | `sonic-jump` | Processamento fonológico | Vidas ou botão Encerrar |
| `GravityLab/` | `gravity-lab` | Flexibilidade cognitiva | 3 experimentos ou Encerrar |

Regras para um jogo novo:

1. Pasta `games/<Nome>/` com `<Nome>.js` e `<Nome>.css`; todo seletor do CSS começa pela classe raiz do jogo.
2. Jogos em canvas: estado em `gameRef` criado uma vez; controles na tela com `shared/components/GameControls`.
3. Salvar com `shared/api/gameplay.js` (`persistGameplay`) só quando houver jogada.
4. Fim claro (tempo, número de tentativas ou "Encerrar") e uma resposta por estímulo.
5. Registrar o jogo em `App.js`, em `pages/PainelAluno.js` e no catálogo do backend (`seed_activities`).

Base científica e recomendações: `docs/pesquisa/ANALISE_JOGOS_EVIDENCIAS.md`.
