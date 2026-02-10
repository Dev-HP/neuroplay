# ✅ TASKS PRÉ-DEPLOY - NeuroPlay

## 🎯 Checklist Completo Antes de Rodar com Usuários Reais

Data de Criação: 10/02/2026
Status: 🔴 PENDENTE

---

## 🔴 FASE 1: CRÍTICO - Segurança e Estabilidade (1-2 semanas)

### Task 1.1: Implementar Medição de Latência da IA
**Prioridade:** 🔴 CRÍTICA
**Tempo Estimado:** 4 horas
**Responsável:** Dev Backend/Frontend

**Subtarefas:**
- [ ] Adicionar `performance.now()` antes e depois de chamadas de IA
- [ ] Criar logger de métricas de performance
- [ ] Adicionar dashboard de monitoramento de latência
- [ ] Definir alertas se latência > 50ms
- [ ] Testar em dispositivos de baixo desempenho

**Arquivos a Modificar:**
- `frontend/src/utils/aiAdaptation.js`
- `backend/ai_engine.py`

**Código de Exemplo:**
```javascript
// frontend/src/utils/aiAdaptation.js
analyzePerformance(gameData) {
  const startTime = performance.now();
  
  // ... lógica existente ...
  
  const latency = performance.now() - startTime;
  
  // Log para análise
  this.performanceMetrics.push({
    timestamp: Date.now(),
    latency,
    gameData
  });
  
  // Alerta se muito lento
  if (latency > 50) {
    console.warn(`IA Latency HIGH: ${latency}ms`);
  }
  
  return { performanceScore, latency };
}
```

**Critério de Aceitação:**
- ✅ Latência média < 50ms em 95% dos casos
- ✅ Dashboard mostra latência em tempo real
- ✅ Logs salvos para análise posterior

---

### Task 1.2: Detecção de Erro em Cascata
**Prioridade:** 🔴 CRÍTICA
**Tempo Estimado:** 6 horas
**Responsável:** Dev Frontend

**Subtarefas:**
- [ ] Criar buffer de últimas 10 tentativas
- [ ] Implementar detector de 4+ erros consecutivos
- [ ] Adicionar ação automática: reduzir dificuldade
- [ ] Implementar sugestão de pausa
- [ ] Adicionar animação calmante quando detectado
- [ ] Testar com cenários de erro simulados

**Arquivos a Criar/Modificar:**
- `frontend/src/utils/errorCascadeDetector.js` (NOVO)
- `frontend/src/pages/JogoMestresSinal.js`
- `frontend/src/pages/JogoMemoriaDupla.js`
- `frontend/src/pages/JogoCacadorAlvos.js`

**Código de Exemplo:**
```javascript
// frontend/src/utils/errorCascadeDetector.js
export class ErrorCascadeDetector {
  constructor(threshold = 4) {
    this.threshold = threshold;
    this.recentAttempts = [];
  }
  
  addAttempt(isCorrect) {
    this.recentAttempts.push({ isCorrect, timestamp: Date.now() });
    
    // Manter apenas últimas 10
    if (this.recentAttempts.length > 10) {
      this.recentAttempts.shift();
    }
    
    return this.checkCascade();
  }
  
  checkCascade() {
    const lastFive = this.recentAttempts.slice(-5);
    const errors = lastFive.filter(a => !a.isCorrect).length;
    
    if (errors >= this.threshold) {
      return {
        cascade: true,
        consecutiveErrors: errors,
        action: 'reduce_difficulty',
        suggestion: 'Oferecer pausa de 30 segundos'
      };
    }
    
    return { cascade: false };
  }
  
  reset() {
    this.recentAttempts = [];
  }
}
```

**Critério de Aceitação:**
- ✅ Detecta 4+ erros consecutivos em < 100ms
- ✅ Reduz dificuldade automaticamente
- ✅ Mostra mensagem encorajadora
- ✅ Oferece pausa opcional

---

### Task 1.3: Captura Precisa de Tempo de Reação
**Prioridade:** 🔴 CRÍTICA
**Tempo Estimado:** 8 horas
**Responsável:** Dev Frontend

**Subtarefas:**
- [ ] Adicionar timestamp quando estímulo aparece
- [ ] Capturar timestamp quando usuário responde
- [ ] Calcular diferença em milissegundos
- [ ] Salvar no banco de dados
- [ ] Criar visualização no painel do educador
- [ ] Validar precisão com testes automatizados

**Arquivos a Modificar:**
- `frontend/src/pages/JogoMestresSinal.js`
- `frontend/src/pages/JogoMemoriaDupla.js`
- `backend/app.py` (adicionar campo reaction_time)
- `database/schema.sql` (adicionar coluna)

**Código de Exemplo:**
```javascript
// JogoMestresSinal.js
const [stimulusTimestamp, setStimulusTimestamp] = useState(null);
const [reactionTimes, setReactionTimes] = useState([]);

const showStimulus = () => {
  const timestamp = performance.now();
  setStimulusTimestamp(timestamp);
  setSinalAtual(Math.random() > 0.5 ? 'no-go' : 'go');
};

const handleClick = () => {
  if (!stimulusTimestamp) return;
  
  const reactionTime = performance.now() - stimulusTimestamp;
  const isCorrect = sinalAtual === 'go';
  
  // Salvar tentativa
  const attempt = {
    stimulusType: sinalAtual,
    correct: isCorrect,
    reactionTime: Math.round(reactionTime),
    timestamp: Date.now()
  };
  
  setReactionTimes(prev => [...prev, attempt]);
  
  // Enviar para backend
  saveAttempt(attempt);
};
```

**Schema SQL:**
```sql
ALTER TABLE progresso ADD COLUMN reaction_times JSONB;
ALTER TABLE progresso ADD COLUMN avg_reaction_time FLOAT;
ALTER TABLE progresso ADD COLUMN reaction_time_variance FLOAT;
```

**Critério de Aceitação:**
- ✅ Precisão de ±10ms
- ✅ Dados salvos no banco
- ✅ Gráfico de evolução no painel
- ✅ Média e variância calculadas

---

### Task 1.4: Modo Offline com LocalStorage
**Prioridade:** 🔴 CRÍTICA
**Tempo Estimado:** 12 horas
**Responsável:** Dev Frontend

**Subtarefas:**
- [ ] Implementar Service Worker
- [ ] Criar cache de assets estáticos
- [ ] Implementar fila de sincronização
- [ ] Salvar estado do jogo localmente
- [ ] Detectar reconexão e sincronizar
- [ ] Adicionar indicador de status (online/offline)
- [ ] Testar desconexão durante jogo

**Arquivos a Criar:**
- `public/service-worker.js` (NOVO)
- `frontend/src/utils/offlineQueue.js` (NOVO)
- `frontend/src/utils/syncManager.js` (NOVO)

**Código de Exemplo:**
```javascript
// public/service-worker.js
const CACHE_NAME = 'neuroplay-v1';
const urlsToCache = [
  '/',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json',
  '/logo192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

```javascript
// frontend/src/utils/offlineQueue.js
export class OfflineQueue {
  constructor() {
    this.queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
  }
  
  add(request) {
    this.queue.push({
      ...request,
      timestamp: Date.now(),
      id: crypto.randomUUID()
    });
    this.save();
  }
  
  async sync() {
    if (!navigator.onLine) return;
    
    const pending = [...this.queue];
    this.queue = [];
    this.save();
    
    for (const request of pending) {
      try {
        await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: JSON.stringify(request.data)
        });
      } catch (error) {
        // Re-adicionar à fila se falhar
        this.queue.push(request);
      }
    }
    
    this.save();
  }
  
  save() {
    localStorage.setItem('offlineQueue', JSON.stringify(this.queue));
  }
}
```

**Critério de Aceitação:**
- ✅ Funciona completamente offline
- ✅ Sincroniza ao reconectar
- ✅ Não perde dados
- ✅ Indicador visual de status

---

### Task 1.5: Botão de Emergência Sensorial
**Prioridade:** 🔴 CRÍTICA
**Tempo Estimado:** 4 horas
**Responsável:** Dev Frontend

**Subtarefas:**
- [ ] Criar componente EmergencyStop
- [ ] Adicionar em todos os jogos
- [ ] Implementar parada de todos sons
- [ ] Implementar parada de todas animações
- [ ] Criar tela calma (fundo neutro)
- [ ] Adicionar opções: Continuar / Sair
- [ ] Testar acessibilidade do botão

**Arquivos a Criar/Modificar:**
- `frontend/src/components/EmergencyStop.js` (NOVO)
- `frontend/src/components/EmergencyStop.css` (NOVO)
- Todos os jogos

**Código de Exemplo:**
```javascript
// frontend/src/components/EmergencyStop.js
import React from 'react';
import './EmergencyStop.css';

function EmergencyStop({ onStop }) {
  const handleEmergencyStop = () => {
    // Parar todos sons
    const audioContext = window.audioContext;
    if (audioContext) {
      audioContext.suspend();
    }
    
    // Parar todas animações
    document.querySelectorAll('*').forEach(el => {
      el.style.animation = 'none';
      el.style.transition = 'none';
    });
    
    // Callback para componente pai
    onStop();
  };
  
  return (
    <button
      className="emergency-stop-button"
      onClick={handleEmergencyStop}
      aria-label="Parar tudo - Botão de emergência"
      title="Clique se precisar parar tudo imediatamente"
    >
      <span className="emergency-icon">⏸️</span>
      <span className="emergency-text">PARAR</span>
    </button>
  );
}

export default EmergencyStop;
```

```css
/* EmergencyStop.css */
.emergency-stop-button {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  background: #FF6B6B;
  color: white;
  border: 3px solid #d32f2f;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.emergency-stop-button:hover {
  transform: scale(1.1);
  background: #d32f2f;
}

.emergency-stop-button:focus {
  outline: 4px solid #FFD93D;
  outline-offset: 4px;
}

.emergency-icon {
  font-size: 32px;
}

.emergency-text {
  font-size: 12px;
  margin-top: 4px;
}
```

**Critério de Aceitação:**
- ✅ Visível em todos os jogos
- ✅ Acessível por teclado (Tab + Enter)
- ✅ Para tudo instantaneamente
- ✅ Tela calma aparece
- ✅ Testado com crianças (simulação)

---

### Task 1.6: Auditoria WCAG Automatizada
**Prioridade:** 🔴 CRÍTICA
**Tempo Estimado:** 6 horas
**Responsável:** Dev Frontend + QA

**Subtarefas:**
- [ ] Instalar ferramentas (axe, lighthouse)
- [ ] Executar auditoria em todas as páginas
- [ ] Documentar violações encontradas
- [ ] Corrigir violações críticas
- [ ] Re-executar auditoria
- [ ] Gerar relatório final
- [ ] Adicionar CI/CD check

**Comandos:**
```bash
# Instalar ferramentas
npm install --save-dev @axe-core/cli lighthouse

# Adicionar scripts
"scripts": {
  "audit:a11y": "axe http://localhost:3000 --save audit-axe.json",
  "audit:lighthouse": "lighthouse http://localhost:3000 --output=json --output-path=./audit-lighthouse.json --only-categories=accessibility",
  "audit:all": "npm run audit:a11y && npm run audit:lighthouse"
}

# Executar
npm run audit:all
```

**Páginas a Auditar:**
- [ ] Login
- [ ] Painel Aluno
- [ ] Painel Educador
- [ ] Jogo Mestres do Sinal
- [ ] Jogo Memória Dupla
- [ ] Jogo Caçador de Alvos

**Critério de Aceitação:**
- ✅ Score Lighthouse Accessibility > 90
- ✅ Zero violações críticas no axe
- ✅ Relatório documentado
- ✅ CI/CD falha se score < 90

---

## 🟡 FASE 2: IMPORTANTE - Validação Clínica (2-3 semanas)

### Task 2.1: Logs Estruturados de Curva de Aprendizagem
**Prioridade:** 🟡 IMPORTANTE
**Tempo Estimado:** 8 horas

**Subtarefas:**
- [ ] Criar estrutura de log JSON
- [ ] Implementar logger de mudanças de dificuldade
- [ ] Salvar em IndexedDB
- [ ] Criar endpoint de exportação
- [ ] Gerar visualização gráfica
- [ ] Testar com dados simulados

**Estrutura de Log:**
```javascript
{
  sessionId: "uuid",
  userId: "user123",
  gameType: "go-no-go",
  difficultyChanges: [
    {
      timestamp: 1707580800000,
      oldLevel: 1,
      newLevel: 2,
      reason: "high_performance",
      metrics: {
        accuracy: 0.87,
        reactionTime: 450,
        consecutiveCorrect: 8
      }
    }
  ],
  performanceOverTime: [
    { timestamp: 1707580800000, accuracy: 0.75, difficulty: 1 },
    { timestamp: 1707580860000, accuracy: 0.82, difficulty: 1 },
    { timestamp: 1707580920000, accuracy: 0.87, difficulty: 2 }
  ]
}
```

---

### Task 2.2: Classificação de Tipos de Erro
**Prioridade:** 🟡 IMPORTANTE
**Tempo Estimado:** 10 horas

**Subtarefas:**
- [ ] Implementar classificador de erros
- [ ] Diferenciar: omissão, comissão, confusão
- [ ] Adicionar ao banco de dados
- [ ] Criar visualização por tipo
- [ ] Gerar insights automáticos
- [ ] Testar com cenários reais

**Tipos de Erro:**
```javascript
const errorTypes = {
  omission: 'Não respondeu quando deveria',
  commission: 'Respondeu quando não deveria',
  memory_confusion_minus1: 'Confundiu com N-1',
  memory_confusion_plus1: 'Confundiu com N+1',
  false_positive: 'Resposta aleatória',
  slow_response: 'Resposta correta mas muito lenta'
};
```

---

### Task 2.3: Melhorar Painel do Educador
**Prioridade:** 🟡 IMPORTANTE
**Tempo Estimado:** 16 horas

**Subtarefas:**
- [ ] Redesign com foco em clareza
- [ ] Adicionar gráficos de evolução
- [ ] Implementar insights automáticos
- [ ] Adicionar comparação entre alunos
- [ ] Criar relatórios exportáveis
- [ ] Testar com educadores reais

**Componentes Necessários:**
- Dashboard Overview
- Gráfico de Evolução Temporal
- Heatmap de Desempenho
- Alertas Automáticos
- Recomendações Personalizadas

---

### Task 2.4: Perfis Sensoriais Salvos
**Prioridade:** 🟡 IMPORTANTE
**Tempo Estimado:** 6 horas

**Subtarefas:**
- [ ] Criar interface de configuração
- [ ] Salvar perfil no localStorage
- [ ] Aplicar automaticamente ao iniciar
- [ ] Permitir múltiplos perfis
- [ ] Adicionar presets (ex: "Sensível a Som")
- [ ] Testar com diferentes perfis

---

### Task 2.5: Retry Automático com Fila Local
**Prioridade:** 🟡 IMPORTANTE
**Tempo Estimado:** 8 hours

**Subtarefas:**
- [ ] Implementar sistema de retry
- [ ] Criar fila de requisições pendentes
- [ ] Adicionar backoff exponencial
- [ ] Mostrar feedback ao usuário
- [ ] Sincronizar ao reconectar
- [ ] Testar com rede instável

---

## 🟢 FASE 3: DESEJÁVEL - Melhorias Futuras (Após validação)

### Task 3.1: Monitoramento de Sobrecarga Sensorial
**Prioridade:** 🟢 DESEJÁVEL
**Tempo Estimado:** 12 horas

### Task 3.2: Exportação de Relatórios PDF
**Prioridade:** 🟢 DESEJÁVEL
**Tempo Estimado:** 8 horas

### Task 3.3: Integração com Wearables
**Prioridade:** 🟢 DESEJÁVEL
**Tempo Estimado:** 40+ horas

### Task 3.4: Modo Multiplayer Cooperativo
**Prioridade:** 🟢 DESEJÁVEL
**Tempo Estimado:** 60+ horas

---

## 📊 CRONOGRAMA SUGERIDO

### Semana 1-2: Fase 1 (Crítico)
- Dias 1-2: Tasks 1.1, 1.2
- Dias 3-4: Task 1.3
- Dias 5-7: Task 1.4
- Dias 8-9: Tasks 1.5, 1.6
- Dia 10: Testes integrados

### Semana 3-5: Fase 2 (Importante)
- Semana 3: Tasks 2.1, 2.2
- Semana 4: Task 2.3
- Semana 5: Tasks 2.4, 2.5

### Semana 6+: Fase 3 (Desejável)
- Após validação clínica inicial

---

## ✅ CRITÉRIOS DE PRONTIDÃO PARA DEPLOY

### Checklist Final

**Técnico:**
- [ ] Todas tasks da Fase 1 completas
- [ ] Testes automatizados passando
- [ ] Score WCAG > 90
- [ ] Latência IA < 50ms
- [ ] Funciona offline
- [ ] Sem erros no console

**Clínico:**
- [ ] Métricas de tempo de reação implementadas
- [ ] Detecção de erro em cascata funcionando
- [ ] Botão de emergência testado
- [ ] Painel do educador funcional
- [ ] Dados salvos corretamente

**Segurança:**
- [ ] HTTPS configurado
- [ ] Dados criptografados
- [ ] LGPD compliance
- [ ] Backup automático
- [ ] Logs de auditoria

**Documentação:**
- [ ] Manual do usuário
- [ ] Guia do educador
- [ ] Documentação técnica
- [ ] Protocolo de validação
- [ ] Termo de consentimento

---

## 🚨 BLOQUEADORES CONHECIDOS

1. **TensorFlow.js não treinado:** Modelo precisa de dados reais para treinar
2. **Banco de dados não populado:** Precisa de dados de teste
3. **Testes com usuários reais:** Aguardando aprovação ética

---

## 📞 CONTATOS

**Dev Lead:** [Nome]
**QA Lead:** [Nome]
**Pesquisador Responsável:** [Nome]
**Comitê de Ética:** [Contato]

---

**Última Atualização:** 10/02/2026
**Próxima Revisão:** Após conclusão Fase 1
