# Teste prático dos jogos — NeuroPlay (modo demonstração)

Data: 24/11/2026 · Navegador: Chrome (headless) controlado por Playwright · Tela 1280×800.

**Como foi feito:** para cada jogo, o teste entrou como educador demonstração, abriu o painel do estudante "Aluno Demo" (com consentimento registrado), escolheu o jogo pelo cartão e jogou **somente pelos controles da tela**: botões Começar, Pular, setas, Encerrar e arrastar. Depois conferimos o registro salvo e o painel do estudante. Foram usados três perfis de jogador:

- **aleatório:** clica sem estratégia, para testar se o jogo é robusto;
- **atento:** responde só ao estímulo certo, como uma criança que entendeu a regra;
- **memorizou:** refaz a sequência mostrada, desviando de casas que ainda não são a vez.

| Jogo | Perfil | Como terminou | Pontos | Acertos | Erros | Duração | Salvo e visível no painel | Erros JS |
|---|---|---|---|---|---|---|---|---|
| Mestres do Sinal | atento | 10 respostas | 100 | 10 | 0 | 44 s | ✅ | 0 |
| Caçador de Alvos | aleatório | tempo (60 s) | 75 | 3 | 2 | 63 s | ✅ | 0 |
| Memória Dupla | aleatório | 4 rodadas completas (aceitou a pausa sugerida) | 220 | 22 | 57 | 256 s | ✅ | 0 |
| Templo dos Ecos | memorizou | 2 sequências de 5 casas | 300 + 350 | 5 + 5 | 0 | — | ✅ (um registro por sequência) | 0 |
| Gravity Lab | atento | 3 experimentos (fim automático) | 1050 | 15 | 0 | 17 s | ✅ | 0 |
| Sonic Jump | atento | botão Encerrar após 8 pulos | 600 | 4 | 0 | — | ✅ | 0 |
| Cyber-Runner | atento | botão Encerrar | 36 | 3 | 0 | 9 s | ✅ | 0 |
| Cyber-Runner | aleatório | perdeu as vidas | 35 | 1 | 3 | 18 s | ✅ | 0 |

## Defeitos que só apareceram jogando (todos corrigidos)

1. **Sonic Jump era impossível de vencer:** o pulo alcançava cerca de 200 px e as plataformas ficam cerca de 300 px acima. A força do pulo passou a ser calculada pela altura das plataformas e pela gravidade adaptativa.
2. **Sonic Jump não dava para jogar por toque:** cada toque na seta movia 15 px. Agora o movimento é contínuo enquanto a seta está pressionada.
3. **Memória Dupla "congelava":** cada resposta reiniciava o cronômetro do estímulo. Agora o tempo depende só da posição na sequência.
4. **Templo dos Ecos:** passar por casa vazia contava como erro, e as plataformas já acertadas eram cobradas de novo. Agora só conta pisar numa plataforma pendente.
5. **Sonic Jump e Cyber-Runner só salvavam ao perder todas as vidas**, e o Gravity Lab nunca encerrava. Os três ganharam o botão "Encerrar", que salva a partida, e o Gravity Lab encerra sozinho após 3 experimentos.
6. **Mestres do Sinal:** cliques repetidos no mesmo sinal contavam várias vezes. Agora vale uma resposta por sinal.

## Limites deste teste

- Este teste valida o fluxo e o registro dos dados, **não** substitui testes de usabilidade com crianças, educadores e responsáveis.
- O áudio (fonemas, notas) foi executado sem conferência auditiva.
- Executado no modo demonstração (dados no navegador). Com backend real, as mesmas rotas são cobertas pelos testes Pytest da API.
