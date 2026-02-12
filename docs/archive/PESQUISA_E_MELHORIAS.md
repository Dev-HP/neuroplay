# 🔬 Pesquisa e Melhorias - NeuroPlay

## 📚 Guia de Pesquisa para Validação Científica

Data: 10/02/2026

---

## 🎯 OBJETIVOS DA PESQUISA

### Objetivo Primário
Validar a eficácia do NeuroPlay como ferramenta complementar para estimulação de funções executivas em crianças com TEA.

### Objetivos Secundários
1. Medir engajamento e usabilidade
2. Identificar perfis de resposta ao tratamento
3. Avaliar aceitabilidade por educadores e famílias
4. Documentar efeitos adversos ou desconfortos sensoriais

---

## 📋 PROTOCOLO DE PESQUISA SUGERIDO

### Fase 1: Estudo Piloto (N=20-30)

**Duração:** 8 semanas

**Critérios de Inclusão:**
- Diagnóstico de TEA (DSM-5)
- Idade: 6-12 anos
- Acesso a computador/tablet com internet
- Consentimento informado dos responsáveis

**Critérios de Exclusão:**
- Epilepsia fotossensível
- Deficiência visual/auditiva não corrigida
- Impossibilidade de usar dispositivos digitais

**Protocolo de Intervenção:**
- Frequência: 3-5 sessões/semana
- Duração: 20-30 minutos/sessão
- Supervisão: Educador ou responsável presente
- Jogos: Rotação entre os 3 módulos

**Medidas Pré-Intervenção:**
- [ ] BRIEF-2 (Behavior Rating Inventory of Executive Function)
- [ ] Vineland-3 (Comportamento Adaptativo)
- [ ] Questionário de Perfil Sensorial
- [ ] Avaliação neuropsicológica de FE (opcional)

**Medidas Durante Intervenção:**
- [ ] Métricas do sistema (automáticas)
- [ ] Diário de observação do educador
- [ ] Questionário semanal de usabilidade
- [ ] Registro de eventos adversos

**Medidas Pós-Intervenção:**
- [ ] Repetir BRIEF-2
- [ ] Repetir Vineland-3
- [ ] Questionário de satisfação
- [ ] Entrevista semiestruturada com educadores

**Análise de Dados:**
```python
# Análise estatística sugerida
import pandas as pd
from scipy import stats

# Comparação pré-pós
pre_scores = df['brief_pre']
post_scores = df['brief_post']

# Teste t pareado
t_stat, p_value = stats.ttest_rel(pre_scores, post_scores)

# Tamanho de efeito (Cohen's d)
mean_diff = post_scores.mean() - pre_scores.mean()
pooled_std = np.sqrt((pre_scores.std()**2 + post_scores.std()**2) / 2)
cohens_d = mean_diff / pooled_std

print(f"t = {t_stat:.3f}, p = {p_value:.3f}, d = {cohens_d:.3f}")
```

---

## 🔍 MÉTRICAS A SEREM COLETADAS

### 1. Métricas de Desempenho Cognitivo

**Go/No-Go (Controle Inibitório):**
```javascript
{
  // Por sessão
  accuracy: number,              // % de acertos
  commissionErrors: number,      // Erros de comissão (clicar em no-go)
  omissionErrors: number,        // Erros de omissão (não clicar em go)
  avgReactionTime: number,       // Tempo médio de reação (ms)
  reactionTimeVariability: number, // Desvio padrão
  
  // Ao longo do tempo
  sessionsCompleted: number,
  difficultyProgression: array,  // Níveis alcançados
  improvementRate: number        // Taxa de melhora
}
```

**Dual N-Back (Memória de Trabalho):**
```javascript
{
  // Por sessão
  visualAccuracy: number,
  auditoryAccuracy: number,
  dualAccuracy: number,
  maxNLevel: number,             // Maior nível alcançado
  timeAtOptimalN: number,        // Tempo no nível ideal
  
  // Padrões de erro
  visualErrors: number,
  auditoryErrors: number,
  errorTypes: {
    falsePositive: number,
    falseNegative: number,
    confusionMinusOne: number,
    confusionPlusOne: number
  }
}
```

**Caçador de Alvos (Atenção Espacial):**
```javascript
{
  // Por sessão
  targetsCollected: number,
  targetsMissed: number,
  obstacleCollisions: number,
  accuracy: number,
  avgCollectionTime: number,
  
  // Progressão
  levelsCompleted: number,
  comboMax: number,
  spatialCoverage: number        // % da área explorada
}
```

### 2. Métricas de Engajamento

```javascript
{
  // Frequência
  sessionsPerWeek: number,
  totalSessions: number,
  consecutiveDays: number,
  
  // Duração
  avgSessionDuration: number,
  totalTimeSpent: number,
  
  // Completude
  completionRate: number,        // % de sessões completas
  dropoutRate: number,           // % de abandono
  
  // Preferências
  favoriteGame: string,
  leastFavoriteGame: string,
  sensoryPreferences: object
}
```

### 3. Métricas de Adaptação da IA

```javascript
{
  // Performance da IA
  avgLatency: number,
  maxLatency: number,
  adaptationAccuracy: number,    // % de ajustes apropriados
  
  // Eficácia
  timeInOptimalZone: number,     // % tempo em 70-80% acurácia
  difficultyAdjustments: number,
  cascadeDetections: number,
  
  // Insights
  insightsGenerated: number,
  insightsAccuracy: number       // Validado por educador
}
```

### 4. Métricas de Usabilidade

**System Usability Scale (SUS):**
```
1. Eu acho que gostaria de usar este sistema frequentemente
2. Eu achei o sistema desnecessariamente complexo
3. Eu achei o sistema fácil de usar
4. Eu acho que precisaria de ajuda técnica para usar este sistema
5. Eu achei que as várias funções neste sistema estavam bem integradas
6. Eu achei que havia muita inconsistência neste sistema
7. Eu imagino que a maioria das pessoas aprenderia a usar este sistema rapidamente
8. Eu achei o sistema muito complicado de usar
9. Eu me senti muito confiante usando o sistema
10. Eu precisei aprender várias coisas antes de continuar usando o sistema

Escala: 1 (Discordo totalmente) a 5 (Concordo totalmente)
Score: (soma - 25) * 2.5
Meta: > 68 (acima da média)
```

---

## 🧪 TESTES ESPECÍFICOS A REALIZAR

### Teste 1: Latência da IA em Dispositivos Diversos

**Objetivo:** Garantir que IA funciona bem em hardware variado

**Dispositivos a Testar:**
- [ ] Desktop high-end (i7, 16GB RAM)
- [ ] Desktop médio (i5, 8GB RAM)
- [ ] Desktop low-end (i3, 4GB RAM)
- [ ] Laptop médio
- [ ] Tablet iPad (2020+)
- [ ] Tablet Android (Samsung Tab A)
- [ ] Smartphone high-end (iPhone 12+)
- [ ] Smartphone médio (Android mid-range)

**Métricas:**
```javascript
{
  device: string,
  cpu: string,
  ram: number,
  browser: string,
  
  aiLatency: {
    min: number,
    max: number,
    avg: number,
    p95: number,
    p99: number
  },
  
  fps: {
    min: number,
    avg: number
  },
  
  loadTime: number,
  
  usable: boolean  // Latência < 100ms, FPS > 20
}
```

**Critério de Aceitação:**
- ✅ Latência média < 50ms em 80% dos dispositivos
- ✅ Latência < 100ms em 95% dos dispositivos
- ✅ FPS > 30 em jogos 3D em 70% dos dispositivos

---

### Teste 2: Detecção de Erro em Cascata

**Objetivo:** Validar que sistema detecta e intervém apropriadamente

**Cenários de Teste:**
```javascript
const testScenarios = [
  {
    name: 'Cascata Rápida',
    attempts: [false, false, false, false, false],
    expectedDetection: true,
    expectedAction: 'reduce_difficulty'
  },
  {
    name: 'Erros Espaçados',
    attempts: [false, true, false, true, false],
    expectedDetection: false
  },
  {
    name: 'Recuperação',
    attempts: [false, false, false, false, true, true, true],
    expectedDetection: true,
    expectedRecovery: true
  }
];
```

**Validação:**
- [ ] Detecta 4+ erros consecutivos em < 100ms
- [ ] Reduz dificuldade automaticamente
- [ ] Oferece pausa apropriadamente
- [ ] Não detecta falsos positivos

---

### Teste 3: Precisão de Tempo de Reação

**Objetivo:** Validar que medição é precisa e confiável

**Método:**
1. Criar script automatizado que "clica" em tempos conhecidos
2. Comparar tempo registrado vs. tempo real
3. Repetir 1000 vezes
4. Calcular erro médio e desvio padrão

```javascript
async function testReactionTimePrecision() {
  const results = [];
  
  for (let i = 0; i < 1000; i++) {
    const expectedDelay = 500; // 500ms
    const startTime = performance.now();
    
    await sleep(expectedDelay);
    
    const actualDelay = performance.now() - startTime;
    const error = actualDelay - expectedDelay;
    
    results.push({ expected: expectedDelay, actual: actualDelay, error });
  }
  
  const avgError = results.reduce((sum, r) => sum + r.error, 0) / results.length;
  const stdError = Math.sqrt(
    results.reduce((sum, r) => sum + Math.pow(r.error - avgError, 2), 0) / results.length
  );
  
  console.log(`Erro médio: ${avgError.toFixed(2)}ms`);
  console.log(`Desvio padrão: ${stdError.toFixed(2)}ms`);
  
  return { avgError, stdError };
}
```

**Critério de Aceitação:**
- ✅ Erro médio < ±10ms
- ✅ Desvio padrão < 20ms
- ✅ 95% das medições dentro de ±30ms

---

### Teste 4: Modo Offline

**Objetivo:** Garantir funcionamento sem internet

**Cenários:**
1. **Iniciar offline:**
   - [ ] Aplicação carrega
   - [ ] Jogos funcionam
   - [ ] Dados salvos localmente

2. **Perder conexão durante jogo:**
   - [ ] Jogo continua sem interrupção
   - [ ] Dados salvos em fila
   - [ ] Indicador de offline aparece

3. **Reconectar:**
   - [ ] Sincronização automática
   - [ ] Dados enviados ao servidor
   - [ ] Indicador de online aparece

4. **Múltiplas sessões offline:**
   - [ ] Todas sessões salvas
   - [ ] Sincronização em lote
   - [ ] Sem perda de dados

**Validação:**
```javascript
// Simular offline
window.dispatchEvent(new Event('offline'));

// Jogar sessão
playGameSession();

// Verificar dados locais
const localData = localStorage.getItem('offlineQueue');
assert(localData !== null, 'Dados devem estar salvos localmente');

// Simular online
window.dispatchEvent(new Event('online'));

// Aguardar sincronização
await waitForSync();

// Verificar dados no servidor
const serverData = await fetchFromServer();
assert(serverData.length > 0, 'Dados devem estar no servidor');
```

---

### Teste 5: Acessibilidade WCAG

**Objetivo:** Garantir conformidade com WCAG 2.1 AA

**Ferramentas:**
- axe DevTools
- Lighthouse
- WAVE
- Testes manuais

**Checklist:**

**Perceptível:**
- [ ] Contraste de cores ≥ 4.5:1
- [ ] Texto redimensionável até 200%
- [ ] Conteúdo não depende apenas de cor
- [ ] Legendas para áudio
- [ ] Alternativas textuais para imagens

**Operável:**
- [ ] Navegação completa por teclado
- [ ] Sem armadilhas de teclado
- [ ] Tempo ajustável
- [ ] Pausar/parar animações
- [ ] Sem conteúdo piscante

**Compreensível:**
- [ ] Linguagem clara e simples
- [ ] Navegação consistente
- [ ] Identificação de erros
- [ ] Sugestões de correção
- [ ] Prevenção de erros

**Robusto:**
- [ ] HTML válido
- [ ] ARIA usado corretamente
- [ ] Compatível com tecnologias assistivas

---

## 📊 ANÁLISE DE DADOS SUGERIDA

### Script Python para Análise

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

# Carregar dados
df = pd.read_csv('neuroplay_data.csv')

# 1. Análise Descritiva
print("=== ESTATÍSTICAS DESCRITIVAS ===")
print(df.describe())

# 2. Análise Pré-Pós
pre_post = df.groupby('timepoint')[['accuracy', 'reaction_time']].mean()
print("\n=== COMPARAÇÃO PRÉ-PÓS ===")
print(pre_post)

# 3. Teste t pareado
pre = df[df['timepoint'] == 'pre']['accuracy']
post = df[df['timepoint'] == 'post']['accuracy']
t_stat, p_value = stats.ttest_rel(pre, post)
print(f"\nTeste t: t={t_stat:.3f}, p={p_value:.3f}")

# 4. Tamanho de efeito
cohens_d = (post.mean() - pre.mean()) / np.sqrt((pre.std()**2 + post.std()**2) / 2)
print(f"Cohen's d: {cohens_d:.3f}")

# 5. Visualizações
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

# Evolução temporal
axes[0, 0].plot(df.groupby('session')['accuracy'].mean())
axes[0, 0].set_title('Evolução da Acurácia')
axes[0, 0].set_xlabel('Sessão')
axes[0, 0].set_ylabel('Acurácia (%)')

# Distribuição de tempos de reação
axes[0, 1].hist(df['reaction_time'], bins=30)
axes[0, 1].set_title('Distribuição de Tempos de Reação')
axes[0, 1].set_xlabel('Tempo (ms)')

# Comparação por jogo
df.boxplot(column='accuracy', by='game_type', ax=axes[1, 0])
axes[1, 0].set_title('Acurácia por Tipo de Jogo')

# Correlação dificuldade vs performance
axes[1, 1].scatter(df['difficulty'], df['accuracy'])
axes[1, 1].set_title('Dificuldade vs Acurácia')
axes[1, 1].set_xlabel('Nível de Dificuldade')
axes[1, 1].set_ylabel('Acurácia (%)')

plt.tight_layout()
plt.savefig('analise_neuroplay.png', dpi=300)
plt.show()

# 6. Análise de Subgrupos
print("\n=== ANÁLISE POR SUBGRUPO ===")
for age_group in df['age_group'].unique():
    subset = df[df['age_group'] == age_group]
    print(f"\n{age_group}:")
    print(f"  N = {len(subset)}")
    print(f"  Acurácia média = {subset['accuracy'].mean():.2f}%")
    print(f"  Tempo de reação médio = {subset['reaction_time'].mean():.0f}ms")
```

---

## 📝 RELATÓRIO FINAL SUGERIDO

### Estrutura do Artigo Científico

**Título:**
"Eficácia de uma Plataforma Web Gamificada com IA Adaptativa para Treinamento de Funções Executivas em Crianças com TEA: Estudo Piloto"

**Seções:**

1. **Introdução**
   - Contexto do TEA e FE
   - Intervenções digitais
   - Objetivos do estudo

2. **Métodos**
   - Participantes
   - Procedimentos
   - Medidas
   - Análise estatística

3. **Resultados**
   - Características da amostra
   - Análise pré-pós
   - Métricas do sistema
   - Usabilidade e aceitabilidade

4. **Discussão**
   - Interpretação dos resultados
   - Comparação com literatura
   - Limitações
   - Implicações clínicas

5. **Conclusões**
   - Síntese dos achados
   - Próximos passos

---

## 🎯 PRÓXIMOS PASSOS

### Imediato (Antes de Iniciar Pesquisa)
1. ✅ Completar todas tasks da Fase 1 (TASKS_PRE_DEPLOY.md)
2. ✅ Submeter protocolo ao Comitê de Ética
3. ✅ Preparar materiais (TCLE, questionários)
4. ✅ Treinar equipe de pesquisa
5. ✅ Configurar sistema de coleta de dados

### Curto Prazo (Durante Pesquisa)
1. Monitorar dados em tempo real
2. Realizar ajustes baseados em feedback
3. Documentar eventos adversos
4. Manter comunicação com participantes

### Médio Prazo (Após Pesquisa)
1. Análise de dados
2. Redação do artigo
3. Submissão para revista
4. Apresentação em congressos

---

**Documento vivo - Atualizar conforme progresso da pesquisa**
