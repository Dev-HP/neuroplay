# Adaptação local de dificuldade

O Neuroplay usa uma política local e determinística para ajustar o desafio dos jogos. A política não é uma avaliação clínica e não estima inteligência, TDAH, TEA ou qualquer diagnóstico. Ela serve somente para ajustar parâmetros de experiência, como velocidade, frequência de desafios, gravidade e tamanho de sequência.

## Contrato compartilhado

A política está em `frontend/src/shared/utils/adaptationPolicy.js` e expõe:

| Função | Responsabilidade |
|---|---|
| `normalizePerformanceMetrics` | Normaliza precisão, reação, variabilidade, erros, sequência e tamanho da amostra |
| `calculatePerformanceScore` | Calcula score transparente entre 0 e 1 |
| `evaluateAdaptation` | Decide `increase`, `maintain`, `decrease` ou `insufficient_data` |
| `applyDifficultyDecision` | Aplica limites de nível e de passo |

A decisão exige dez tentativas por padrão. O motor não altera a dificuldade quando há poucos dados. Nenhum incremento pode ultrapassar um passo e os jogos mantêm limites mínimos e máximos.

## Motor dos jogos

`frontend/src/games/CyberRunnerCanvas/adaptiveDifficulty.js` implementa o contrato consumido por Cyber Runner, Templo dos Ecos, Sonic Jump e Gravity Lab. O contrato público desses jogos permanece:

```javascript
recordAttempt({ correct, reactionTime, type });
getParams();
getStats();
reset();
```

Os parâmetros `speed`, `challengeFrequency`, `obstacleSpeed`, `gravity` e `jumpVelocity` continuam disponíveis para os consumidores existentes.

`frontend/src/shared/utils/localAdaptation.js` atende os jogos Mestres do Sinal, Caçador de Alvos e Memória Dupla que precisam registrar métricas e gerar insights locais. O arquivo não cria uma rede neural vazia e não chama API externa.

## Política de segurança

O consentimento, a autorização, o tenant isolation, a persistência, a exclusão e a auditoria continuam sendo responsabilidades do backend Flask. A adaptação local nunca pode liberar uma atividade sem consentimento, acessar outro estudante ou substituir uma regra de governança.

Os recursos usados na adaptação devem ficar limitados às métricas necessárias da sessão. Não usar nome, diagnóstico, idade, texto livre ou histórico clínico como entrada. O sistema deve explicar a decisão com a versão da política e uma razão técnica, como “dados insuficientes” ou “variabilidade elevada”.

## TensorFlow.js no futuro

TensorFlow.js só deverá voltar ao bundle quando houver um modelo treinado, versionado e avaliado. Um modelo criado com `tf.sequential` sem treinamento e sem pesos não representa aprendizado real. Caso seja aprovado um modelo local futuramente, ele poderá propor uma ação, mas a política determinística continuará aplicando os limites e funcionando como fallback.

Antes da publicação de um modelo local, devem existir conjunto de validação, métrica de sucesso não clínica, teste de regressão, limite de latência, versão do artefato e mecanismo de desativação. O produto deve continuar funcionando se o modelo não carregar.
