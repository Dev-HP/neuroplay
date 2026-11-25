# Auditoria de design, usabilidade e código — NeuroPlay

Data: 24/11/2026 · Escopo: frontend React (todas as telas e os 7 jogos) e backend Flask.

## 1. Como foi feito

1. **Pesquisa de referência.** Critérios do W3C COGA (*Making Content Usable for People with Cognitive and Learning Disabilities*), guias de design para TDAH (layout previsível, poucas distrações, indicadores de progresso) e WCAG 2.2 (alvo de toque mínimo de 24 px; adotamos 44 px nos controles principais).
2. **Mapeamento automático de layout.** Um navegador real (Chrome headless + Playwright) abriu 17 telas em dois tamanhos (desktop 1280×800 e celular 390×844), no estado inicial e durante o jogo. Em cada tela ele verificou:
   - se algum botão ou campo está coberto por outro elemento (teste `elementFromPoint` no centro do alvo);
   - alvos menores que 24 px;
   - texto cortado ou fora da tela, e rolagem horizontal indevida;
   - erros de JavaScript.
3. **Inspeção visual** de todas as capturas.
4. **Code review** dos fluxos de jogo e de salvamento.
5. **Teste prático:** cada jogo foi jogado de ponta a ponta no navegador, só pelos botões da tela, e conferimos se a sessão aparece no painel do estudante.

## 2. Achados e correções

| # | Problema encontrado | Gravidade | Correção |
|---|---|---|---|
| 1 | **Memória Dupla abria em branco** (`Cannot access before initialization`): `nextStimulus` usava `finishRound`/`finishGame` antes da declaração. | Crítica | Declarações reordenadas. |
| 2 | **Jogos em canvas recriavam o estado a cada ponto** (`useEffect` dependente de `score`/`stats`/`phase` criava um novo objeto `game`): a partida era apagada no meio. No Templo dos Ecos a sequência sumia na troca de fase, tornando o jogo impossível de vencer. | Crítica | Estado do jogo criado uma única vez em `gameRef` (Cyber-Runner, Templo dos Ecos, Sonic Jump, Gravity Lab). |
| 3 | **Templo dos Ecos:** qualquer passo em casa vazia contava como erro, e as casas sorteadas podiam se repetir. | Alta | Só conta pisar numa plataforma da sequência; casas distintas e fora da posição inicial. |
| 4 | **Gravity Lab nunca terminava**, então nenhuma partida era salva. | Alta | Sessão termina após 3 experimentos ou pelo botão "Encerrar". |
| 5 | **Templo dos Ecos somava pontos em dobro** no relatório (cada registro gravava o total acumulado). | Alta | Cada registro grava só o incremento desde o anterior; "Encerrar" salva o que faltou. |
| 6 | **Mestres do Sinal:** salvava `acertos + 1` mesmo após erro, perdia a última jogada, contava vários cliques no mesmo sinal e deixava o temporizador rodando após o fim. | Alta | Resultado calculado com a jogada final, uma resposta por sinal, temporizador encerrado no fim/pausa/saída. |
| 7 | **Vazamento de CSS global:** 34 classes definidas em vários arquivos (ex.: `SensorySettings.css` aplicava `.btn-primary { flex: 1 }` a todo o app). Efeito visível: botões "Começar" e "Iniciar Missão" viravam barras verticais. | Alta | Cada CSS de página/componente escopado sob o seu container raiz (13 arquivos, 542 seletores). |
| 8 | Jogos em canvas **só funcionavam com teclado** (sem toque, sem botão de voltar). | Alta | Componente `GameControls`: Começar, Voltar, Ajustes e setas na tela (botões ≥ 44 px), com dica para girar o celular. Gravity Lab com arraste por toque e coordenadas corrigidas para o canvas redimensionado. |
| 9 | Texto do sinal ("Verde — clique") herdava fonte gigante e cobria o botão "Clique!". | Média | Rótulo com tamanho próprio; botão acima na pilha. |
| 10 | Botão **PARAR** sobreposto ao placar "Pontos"/"Tempo". | Média | Movido para o canto inferior direito. |
| 11 | Caçador de Alvos: tela inicial cobria o "Voltar"; no celular o placar saía da tela. | Média | Cabeçalho acima da sobreposição; placar quebra linha no celular. |
| 12 | Link "Criar conta" com 16 px de altura. | Baixa | Alvo de 44 px, sublinhado. |
| 13 | "Voltar" dos jogos perdia o estudante selecionado. | Baixa | Volta para `/aluno?student_id=…`. |
| 14 | Paleta saturada (roxo/rosa/neon ciano), pouco adequada a crianças sensíveis a estímulos. | Média | Nova paleta sóbria: azul-ardósia, verde-sálvia e âmbar, com contraste para leitura. |
| 15 | Site publicado sem backend: o login ficava bloqueado. | Alta | Modo demonstração: backend local no navegador, mesmas rotas e regras da API (consentimento, validação, idempotência). |
| 16 | **Sonic Jump impossível de vencer** (pulo de ~200 px, plataformas a ~300 px) e direção lateral de 15 px por toque. | Crítica | Pulo calculado pela altura das plataformas e gravidade; direção contínua enquanto pressionada. |
| 17 | **Memória Dupla congelava:** cada resposta reiniciava o cronômetro do estímulo. | Alta | Cronômetro dependente só da posição na sequência. |
| 18 | Sonic Jump e Cyber-Runner só salvavam ao perder todas as vidas. | Alta | Botão "Encerrar" salva a partida. |
| 19 | Texto do botão "Entrar como educador demonstração" vazava do botão. | Baixa | Quebra de linha permitida; checagem "texto vazando" incluída no mapeamento automático. |
| 20 | Logo com símbolo genérico e paleta antiga. | Média | Nova identidade: laço de infinito (símbolo da neurodiversidade, em vez do quebra-cabeça, contestado pela comunidade autista) com botão "play"; arquivos em `docs/marca/`. |
| 21 | CI apontava para pastas inexistentes (`backend/app`, `backend/tests/unit`). | Média | Caminhos corrigidos. |

## 3. Resultado do mapeamento (depois)

17 telas × 2 tamanhos: **0 erros de JavaScript, 0 botões cobertos, 0 textos vazando de botões, 0 rolagens horizontais**. No celular, as quatro abas do painel do educador ficam numa grade 2×2 (antes a aba "Governança" ficava fora da tela).

A avaliação de design seguinte, com o tema único dos jogos e o novo relatório, está em [`AVALIACAO_DESIGN_FINAL.md`](AVALIACAO_DESIGN_FINAL.md).

## 4. Testes automatizados

- Frontend (Vitest): **78/78** (8 suítes). Na migração para o Vite foram removidas 8 suítes que só testavam valores criados dentro do próprio teste, sem importar código do app.
- Backend (pytest): **9/9**, nenhum ignorado.
- Lint: ESLint com 0 erros e 0 avisos; flake8 sem apontamentos.

## 5. Teste prático (jogando no navegador)

Os 7 jogos foram jogados de ponta a ponta só pelos controles da tela, e todos registraram a partida no painel do estudante. Detalhes em [`RESULTADOS_TESTE_PRATICO.md`](RESULTADOS_TESTE_PRATICO.md).

## 6. Dívida técnica registrada (não bloqueia o uso)

- Os jogos em canvas ainda reexecutam o efeito principal a cada mudança de pontuação. O estado já é preservado, mas o ideal é separar o laço de renderização do estado React.
- 32 avisos de lint (dependências de hooks e variáveis não usadas).
- Mapas de cor do canvas foram suavizados por substituição direta; um tema central para os jogos é recomendado.
