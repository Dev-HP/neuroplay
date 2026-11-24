# 🎮 Cyber-Runner MVP - Guia de Instalação e Teste

## ✅ O que foi criado

Implementamos o **MVP do Cyber-Runner**, o primeiro módulo do NeuroPlay 2.0:

### Componentes Criados

#### Frontend (`frontend/src/games/`)
```
games/
├── shared/
│   ├── useTelemetry.js          # Hook de telemetria
│   └── FeedbackSystem.js        # Sistema de feedback multissensorial
│
└── CyberRunner/
    ├── CyberRunner.js           # Componente principal
    ├── CyberRunner.css          # Estilos
    ├── components/
    │   ├── PlayerCharacter.js   # Personagem jogável
    │   ├── RunnerTrack.js       # Pista infinita
    │   ├── Obstacle.js          # Obstáculo individual
    │   ├── ObstacleGenerator.js # Gerador procedural
    │   ├── MathPortalSystem.js  # Sistema de matemática
    │   └── GameUI.js            # Interface do usuário
    └── hooks/
        └── useKeyboardControls.js # Controles de teclado
```

#### Backend (`backend/`)
```
backend/
├── telemetry_service.py         # Serviço de telemetria
└── app.py                        # Endpoints atualizados
```

### Funcionalidades Implementadas

✅ **Controle Inibitório (Go/No-Go)**
- Obstáculos verdes (Go) → Pular
- Obstáculos vermelhos (No-Go) → Deslizar
- Telemetria de tempo de reação

✅ **Dual-Task Matemático**
- Equações aparecem a cada 45 segundos
- Bullet Time (câmera lenta)
- 3 opções de resposta

✅ **Sistema de Feedback Multissensorial**
- Visual: Partículas coloridas
- Auditivo: Acordes e dissonâncias
- Háptico: Vibração (mobile)

✅ **Telemetria Completa**
- Coleta de eventos em tempo real
- Análise de performance cognitiva
- Cálculo de métricas (precisão, tempo de reação)

✅ **Adaptação de Dificuldade**
- 3 níveis: Easy, Medium, Hard
- Ajuste de velocidade e frequência

---

## 🚀 Instalação

### 1. Instalar Dependências do Frontend

```bash
cd frontend
npm install
```

Novas dependências adicionadas:
- `@react-three/rapier` - Física WebAssembly
- `@react-three/postprocessing` - Efeitos visuais
- `tone` - Síntese de áudio
- `gsap` - Animações
- `uuid` - Geração de IDs

### 2. Instalar Dependências do Backend

```bash
cd backend
pip install flask flask-cors flask-sqlalchemy
```

### 3. Inicializar Banco de Dados

O banco de telemetria é criado automaticamente ao iniciar o backend.

---

## 🎯 Como Testar

### 1. Iniciar Backend

```bash
cd backend
python app.py
```

O servidor iniciará em `http://localhost:5000`

### 2. Iniciar Frontend

```bash
cd frontend
npm start
```

O app abrirá em `http://localhost:3000`

### 3. Acessar o Jogo

1. Faça login no sistema
2. Navegue para: `http://localhost:3000/jogo/cyber-runner`
3. Clique em "INICIAR JOGO"

### 4. Controles

- **ESPAÇO** ou **↑** = Pular (obstáculos verdes)
- **↓** = Deslizar (obstáculos vermelhos)
- **Clique nos números** = Responder equações matemáticas

---

## 📊 Testando a Telemetria

### Ver Resumo de Sessão

```bash
curl http://localhost:5000/api/telemetry/session/<SESSION_ID>
```

Exemplo de resposta:
```json
{
  "session_id": "abc-123",
  "total_events": 45,
  "start_time": "2026-02-10T10:00:00",
  "end_time": "2026-02-10T10:05:30",
  "metrics": {
    "go_nogo": {
      "total_responses": 30,
      "correct_responses": 24,
      "incorrect_responses": 6,
      "avg_reaction_time": 450.5,
      "accuracy": 0.8
    },
    "math": {
      "total_attempts": 5,
      "correct_answers": 4,
      "avg_reaction_time": 3200.0,
      "accuracy": 0.8
    }
  }
}
```

### Ver Progresso do Usuário

```bash
curl http://localhost:5000/api/telemetry/progress/1/cyber_runner
```

---

## 🧪 Cenários de Teste

### Teste 1: Controle Inibitório Básico
1. Inicie o jogo
2. Pule nos obstáculos verdes
3. Deslize nos obstáculos vermelhos
4. Verifique se o score aumenta nos acertos
5. Verifique se perde vidas nos erros

### Teste 2: Sistema Matemático
1. Jogue por 45 segundos
2. Aguarde o "Bullet Time"
3. Resolva a equação clicando na resposta correta
4. Verifique o bônus de pontos (+50)

### Teste 3: Game Over
1. Erre 3 vezes (perca todas as vidas)
2. Verifique a tela de Game Over
3. Confira as estatísticas finais
4. Clique em "JOGAR NOVAMENTE"

### Teste 4: Telemetria
1. Complete uma sessão de jogo
2. Abra o console do navegador
3. Procure por logs de telemetria
4. Verifique se os eventos foram enviados ao backend

---

## 🐛 Troubleshooting

### Erro: "Cannot find module '@react-three/rapier'"

```bash
cd frontend
npm install @react-three/rapier @react-three/postprocessing tone gsap uuid
```

### Erro: "CORS policy"

Verifique se o backend está rodando e se o CORS está habilitado em `app.py`.

### Jogo muito lento

1. Reduza a qualidade dos efeitos visuais
2. Desabilite o Bloom em `CyberRunner.js`:
```javascript
// Comente estas linhas:
// <EffectComposer>
//   <Bloom ... />
// </EffectComposer>
```

### Física não funciona

Certifique-se de que o navegador suporta WebAssembly:
```javascript
console.log(typeof WebAssembly); // Deve retornar "object"
```

---

## 📈 Próximos Passos

### Melhorias Imediatas
- [ ] Adicionar mais tipos de obstáculos
- [ ] Implementar power-ups
- [ ] Criar sistema de conquistas
- [ ] Adicionar música de fundo

### Integração com NeuroGuardian
- [ ] Sistema de Neuro-Energia
- [ ] Progressão visual do Mind Palace
- [ ] Avatar customizável

### Novos Módulos
- [ ] Templo dos Ecos (Memória Espacial)
- [ ] Orquestra das Plataformas (Fonologia)
- [ ] Laboratório de Gravidade (Flexibilidade)

---

## 📚 Documentação Técnica

Para detalhes de implementação, consulte:
- `NEUROPLAY_2.0_PLANO_COMPLETO.md` - Visão geral do projeto
- `docs/IMPLEMENTACAO_JOGOS_TECNICOS.md` - Especificações técnicas
- `docs/MELHORIAS_BASEADAS_EVIDENCIAS.md` - Fundamentação científica

---

## 🎓 Fundamentação Científica

Este módulo é baseado em:

1. **Meta-análise 2025** (Frontiers Pediatrics)
   - GBI melhoram cognição (g=0.57)
   - Efeito maior em crianças

2. **Estudo PMC 2022**
   - Treinamento virtual eficaz para funções executivas
   - Melhoria em memória de trabalho, inibição e flexibilidade

3. **Revisão Frontiers Psychology 2021**
   - Jogos digitais com reforço comportamental são eficazes
   - Incorporação de interesses restritos aumenta engajamento

---

## ✅ Checklist de Validação

- [x] Jogo roda no navegador
- [x] Controles responsivos
- [x] Física realista
- [x] Feedback multissensorial
- [x] Telemetria funcional
- [x] UI acessível
- [x] Responsivo (desktop/mobile)
- [ ] Testado com crianças TEA
- [ ] Validação clínica

---

**Versão**: 1.0.0 MVP  
**Data**: 10 de Fevereiro de 2026  
**Status**: Pronto para testes internos  
**Próxima Milestone**: Testes com 5 crianças TEA
