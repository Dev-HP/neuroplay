# Jogos

Sete jogos publicados no painel do aluno, mais dois anunciados como "Em breve". Nenhum deles é tratamento: registram o que aconteceu na partida (pontos, acertos, erros, duração) para acompanhamento pedagógico. A justificativa científica de cada escolha está em [`../pesquisa/ANALISE_JOGOS_EVIDENCIAS.md`](../pesquisa/ANALISE_JOGOS_EVIDENCIAS.md).

| Jogo | Habilidade (tarefa de referência) | Como se joga | Fim da partida |
|---|---|---|---|
| **Mestres do Sinal** | Controle inibitório (Go/No-Go) | Tocar só no sinal verde; ignorar o vermelho. 75% dos sinais são verdes. | Bloco de 20 sinais. Registra omissões, comissões e tempo de reação. |
| **Cyber-Runner** | Decisão rápida + inibição (multitarefa) | Pular/deslizar para desviar e responder a desafios rápidos durante a corrida. | Ao perder as vidas ou com "Encerrar". |
| **Templo dos Ecos** | Memória visuoespacial (tipo Corsi) | Observar a sequência de casas e repeti-la com as setas. | Cada sequência concluída é gravada; a sessão segue até "Encerrar". |
| **Gravity Lab** | Flexibilidade (troca de regra) | Arrastar objetos para a zona correta, organizando por cor ou por forma; a regra troca durante a sessão. | Após 3 experimentos ou com "Encerrar". |
| **Sonic Jump** | Discriminação de sons e tempo | Ouvir o fonema e pular na plataforma certa (R repete o som). | Ao perder as vidas ou com "Encerrar". |
| **Memória Dupla** | Memória de trabalho (n-back visual e auditivo) | Apertar "Visual" ou "Áudio" quando a posição ou a nota repetir a de N passos atrás. Cada letra tem uma nota própria. | Quatro rodadas. |
| **Caçador de Alvos** | Atenção visual seletiva | Coletar os alvos e evitar os obstáculos na cena 3D. | 60 segundos. |
| *Jogo das Emoções* (em breve) | Reconhecimento de emoções | — | — |
| *Peixinhos* (em breve) | Atenção seletiva (Flanker) | — | — |

## Recursos comuns

- **Botão "Parar"** sempre visível e **"Encerrar"** nos jogos em canvas: a criança pode sair a qualquer momento, e a partida é gravada se houve jogada.
- **Controles na tela** (`GameControls`) para toque e mouse, além do teclado.
- **Dificuldade adaptativa** determinística: só muda com dados suficientes e um passo por vez ([`../arquitetura/LOCAL_ADAPTATION.md`](../arquitetura/LOCAL_ADAPTATION.md)).
- **Detector de erros em cascata:** depois de erros seguidos, o jogo sugere uma pausa; a criança escolhe pausar ou continuar.
- **Ajustes sensoriais:** brilho, contraste, animações, volume e velocidade.
- **Conquistas** nos jogos em canvas (Cyber-Runner, Templo dos Ecos, Sonic Jump, Gravity Lab), guardadas no navegador.

## Onde está o código

Cada jogo fica em `frontend/src/games/<Nome>/`. O envio das partidas para a API usa `frontend/src/shared/api/gameplay.js` (ou chamada direta a `/api/v1/gameplay/sync`).
