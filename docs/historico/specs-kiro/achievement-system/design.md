# Design Document - Sistema de Conquistas

## Overview

Este documento especifica o design técnico do Sistema de Conquistas (Achievement System) do NeuroPlay 2.0. O sistema implementa um framework completo de gamificação baseado em evidências científicas, incluindo gerenciamento de conquistas, notificações, painel de visualização e dashboard para educadores/terapeutas.

**Base Científica:**
- Recompensas intrínsecas (progresso, maestria) são mais eficazes que extrínsecas (pontos)
- Visualização de progresso aumenta motivação de longo prazo
- Envolvimento de educadores melhora resultados em 35%

**Objetivos:**
- Aumentar engajamento (+30% tempo de sessão)
- Melhorar frequência de uso (+40% sessões/semana)
- Aumentar taxa de retorno (+50% usuários que voltam após 7 dias)

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     NeuroPlay Frontend                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Games      │  │ Achievement  │  │  Educator    │      │
│  │  (4 jogos)   │  │    Panel     │  │  Dashboard   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │  Achievement    │                        │
│                   │     System      │                        │
│                   │   (Core Logic)  │                        │
│                   └────────┬────────┘                        │
│                            │                                 │
│         ┌──────────────────┼──────────────────┐             │
│         │                  │                  │             │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐     │
│  │ Notification │  │   Progress   │  │   Storage    │     │
│  │   Manager    │  │   Tracker    │  │   Manager    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                               │
└───────────────────────────┬───────────────────────────────────┘
                            │
                   ┌────────▼────────┐
                   │   localStorage  │
                   │   + Backend     │
                   │   (opcional)    │
                   └─────────────────┘
```

### Data Flow

1. **Event Capture**: Jogos disparam eventos (pontuação, acerto, nível completado)
2. **Progress Update**: AchievementSystem atualiza estatísticas do usuário
3. **Condition Check**: Sistema verifica se condições de conquistas foram satisfeitas
4. **Unlock**: Conquista é marcada como desbloqueada
5. **Notification**: NotificationManager exibe notificação animada
6. **Persistence**: Dados são salvos no localStorage
7. **Dashboard Sync**: Educator Dashboard é atualizado (se aplicável)

---

## Component Specifications

### 1. AchievementSystem (Core)

**Responsabilidade:** Gerenciamento central de conquistas, progresso e lógica de desbloqueio

**Location:** `frontend/src/systems/AchievementSystem.js`

**Interface:**
```javascript
class AchievementSystem {
  // Inicialização
  constructor(userId)
  async init()
  
  // Gerenciamento de Conquistas
  getAchievements(filters)
  getAchievementById(id)
  getAchievementsByGame(gameName)
  getAchievementsByCategory(category)
  
  // Progresso do Usuário
  getUserProgress()
  updateProgress(eventData)
  checkUnlockConditions()
  
  // Desbloqueio
  unlockAchievement(achievementId)
  isUnlocked(achievementId)
  getUnlockedAchievements()
  
  // Estatísticas
  getStats()
  getStatsByGame(gameName)
  
  // Persistência
  save()
  load()
  export()
}
```

**Key Methods:**


```javascript
// updateProgress: Atualiza estatísticas baseado em evento do jogo
updateProgress(eventData) {
  const { game, type, value, context } = eventData;
  
  // Atualiza estatísticas relevantes
  this.userProgress.stats[game][type] += value;
  this.userProgress.stats.global.totalEvents++;
  
  // Verifica conquistas
  this.checkUnlockConditions();
  
  // Salva
  this.save();
}

// checkUnlockConditions: Verifica todas as conquistas não desbloqueadas
checkUnlockConditions() {
  const unlockedAchievements = [];
  
  this.achievements.forEach(achievement => {
    if (!this.isUnlocked(achievement.id)) {
      if (achievement.condition(this.userProgress)) {
        this.unlockAchievement(achievement.id);
        unlockedAchievements.push(achievement);
      }
    }
  });
  
  return unlockedAchievements;
}
```

**State Management:**
```javascript
{
  userId: string,
  achievements: Achievement[],
  userProgress: {
    stats: {
      global: {
        totalGames: number,
        totalTime: number,
        consecutiveDays: number,
        achievementsUnlocked: number
      },
      cyberRunner: {
        gamesPlayed: number,
        maxScore: number,
        totalCorrect: number,
        totalIncorrect: number,
        maxCombo: number
      },
      echoTemple: {
        gamesPlayed: number,
        maxSequenceLength: number,
        totalCorrect: number,
        avgAccuracy: number
      },
      sonicJump: {
        gamesPlayed: number,
        maxHeight: number,
        phonemesCorrect: number,
        avgAccuracy: number
      },
      gravityLab: {
        gamesPlayed: number,
        ruleSwitches: number,
        totalCorrect: number,
        avgAccuracy: number
      }
    },
    unlockedAchievements: [
      {
        id: string,
        unlockedAt: timestamp,
        progress: number
      }
    ],
    lastPlayed: timestamp,
    lastSaved: timestamp
  }
}
```


### 2. NotificationManager

**Responsabilidade:** Exibir notificações animadas quando conquistas são desbloqueadas

**Location:** `frontend/src/systems/NotificationManager.js`

**Interface:**
```javascript
class NotificationManager {
  constructor(audioFeedback)
  
  // Notificações
  showAchievementNotification(achievement)
  showMessage(message, type, duration)
  
  // Fila
  queueNotification(notification)
  processQueue()
  
  // Configurações
  setEnabled(enabled)
  respectSensorySettings(settings)
}
```

**Features:**
- Animação de entrada/saída suave
- Efeitos de partículas (confete, estrelas)
- Som de celebração (usando audioFeedback existente)
- Fila de notificações (múltiplas conquistas)
- Respeita configurações sensoriais do usuário
- Clique para abrir Achievement Panel

**Visual Design:**
```
┌─────────────────────────────────────┐
│  🏆  CONQUISTA DESBLOQUEADA!        │
│                                     │
│  ┌───┐                              │
│  │ 🎮 │  Primeira Corrida           │
│  └───┘  Complete seu primeiro jogo  │
│                                     │
│  ✨ +10 XP                          │
└─────────────────────────────────────┘
```


### 3. AchievementPanel

**Responsabilidade:** Interface visual para visualizar todas as conquistas e progresso

**Location:** `frontend/src/components/AchievementPanel.js`

**Interface:**
```javascript
function AchievementPanel({ userId, onClose }) {
  // Filtros
  const [filter, setFilter] = useState('all'); // all, game, category
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Dados
  const achievements = useAchievements(filter);
  const stats = useAchievementStats();
  
  return (
    <div className="achievement-panel">
      <Header stats={stats} />
      <Filters />
      <AchievementGrid achievements={achievements} />
      <Statistics stats={stats} />
    </div>
  );
}
```

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│  🏆 Conquistas                                    [X]  │
├────────────────────────────────────────────────────────┤
│  📊 15/30 Conquistas (50%)  ⭐ 450 XP                 │
├────────────────────────────────────────────────────────┤
│  Filtros: [Todos] [Cyber-Runner] [Echo Temple] ...    │
│           [Progresso] [Maestria] [Exploração] ...     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐             │
│  │  🏃  │  │  🧮  │  │  ⚡  │  │  👑  │             │
│  │ ✅   │  │ ✅   │  │ 🔒   │  │ 🔒   │             │
│  └──────┘  └──────┘  └──────┘  └──────┘             │
│  Primeira  Mestre    Velocista Rei do               │
│  Corrida   Matemática (80%)    Combo                │
│                                                        │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐             │
│  │  🧠  │  │  🎵  │  │  🔬  │  │  ???  │             │
│  │ ✅   │  │ 🔒   │  │ 🔒   │  │ 🔒   │             │
│  └──────┘  └──────┘  └──────┘  └──────┘             │
│  Memória   Ouvido    Cientista Secreta              │
│  Aguçada   Absoluto  (40%)     (???)                │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Features:**
- Grid responsivo de conquistas
- Conquistas desbloqueadas: cores vibrantes + timestamp
- Conquistas bloqueadas: escala de cinza + barra de progresso
- Conquistas secretas: "???" até desbloquear
- Filtros por jogo e categoria
- Estatísticas gerais (% conclusão, XP total)
- Navegação por teclado (Tab, Enter, Esc)
- Acessível (ARIA labels, alto contraste)


### 4. EducatorDashboard

**Responsabilidade:** Interface para educadores/terapeutas acompanharem progresso dos alunos

**Location:** `frontend/src/pages/EducatorDashboard.js`

**Interface:**
```javascript
function EducatorDashboard({ educatorId }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, inactive, attention
  
  return (
    <div className="educator-dashboard">
      <StudentList students={students} filter={filter} />
      {selectedStudent && (
        <StudentDetail student={selectedStudent} />
      )}
    </div>
  );
}
```

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│  👨‍🏫 Dashboard do Educador                                  │
├────────────────────────────────────────────────────────────┤
│  Filtros: [Todos] [Ativos] [Inativos] [Atenção]           │
│  Busca: [_________________]  📊 Relatório Geral            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │  👤 João Silva (8 anos)              ⚠️ Atenção  │    │
│  │  Última atividade: Há 4 dias                     │    │
│  │  Conquistas: 12/30 (40%)  📈 Progresso: +15%     │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │  👤 Maria Santos (10 anos)           ✅ Ativo    │    │
│  │  Última atividade: Hoje                          │    │
│  │  Conquistas: 18/30 (60%)  📈 Progresso: +25%     │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Student Detail View:**
```
┌────────────────────────────────────────────────────────────┐
│  ← Voltar                                                  │
│                                                            │
│  👤 João Silva (8 anos)                                    │
│  ID: #12345  |  Cadastrado: 15/01/2026                    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  📊 Estatísticas Gerais                                    │
│  ┌──────────────────────────────────────────────────┐    │
│  │  Tempo Total: 12h 30min                          │    │
│  │  Sessões: 45                                     │    │
│  │  Conquistas: 12/30 (40%)                         │    │
│  │  Última atividade: Há 4 dias ⚠️                  │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
│  🎮 Estatísticas por Jogo                                  │
│  ┌──────────────────────────────────────────────────┐    │
│  │  Cyber-Runner:   8 jogos  |  Acurácia: 75%      │    │
│  │  Echo Temple:    12 jogos |  Acurácia: 82%      │    │
│  │  Sonic Jump:     10 jogos |  Acurácia: 68% ⚠️   │    │
│  │  Gravity Lab:    5 jogos  |  Acurácia: 70%      │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
│  📈 Evolução (Últimas 4 Semanas)                           │
│  [Gráfico de linha mostrando progresso]                   │
│                                                            │
│  💡 Insights da IA                                         │
│  ┌──────────────────────────────────────────────────┐    │
│  │  ⚠️ Dificuldade detectada em Sonic Jump          │    │
│  │     Acurácia caiu de 75% para 68%                │    │
│  │                                                   │    │
│  │  ⚠️ Inatividade detectada                        │    │
│  │     Sem jogar há 4 dias (média: 3x/semana)       │    │
│  │                                                   │    │
│  │  ✅ Progresso em Echo Temple                     │    │
│  │     Acurácia aumentou de 70% para 82%            │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
│  📋 Recomendações                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  • Revisar configurações de Sonic Jump           │    │
│  │  • Considerar reduzir velocidade do jogo         │    │
│  │  • Entrar em contato para retomar atividades     │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
│  [📄 Gerar Relatório PDF]  [💾 Exportar Dados]            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Features:**
- Lista de todos os alunos vinculados
- Filtros (ativo, inativo, atenção)
- Busca por nome/ID
- Perfil detalhado de cada aluno
- Estatísticas por jogo
- Gráfico de evolução temporal
- Insights automáticos da IA
- Recomendações personalizadas
- Geração de relatórios PDF
- Exportação de dados (CSV/JSON)
- Comparação com benchmarks (opcional)
- Gestão de metas personalizadas


---

## Data Models

### Achievement Model

```javascript
{
  id: string,                    // Identificador único (e.g., 'first_run')
  name: string,                  // Nome da conquista
  description: string,           // Descrição detalhada
  icon: string,                  // Emoji ou URL do ícone
  category: string,              // 'progress', 'mastery', 'exploration', 'social', 'special'
  game: string | null,           // 'cyberRunner', 'echoTemple', 'sonicJump', 'gravityLab', null (global)
  xp: number,                    // Pontos de experiência
  secret: boolean,               // Se é conquista secreta
  levels: number,                // Número de níveis (1 = simples, 3 = bronze/prata/ouro)
  condition: function,           // Função que verifica se foi desbloqueada
  hint: string                   // Dica para conquistas secretas
}
```

**Example:**
```javascript
{
  id: 'math_master',
  name: 'Mestre da Matemática',
  description: 'Acerte 10 desafios matemáticos seguidos',
  icon: '🧮',
  category: 'mastery',
  game: 'cyberRunner',
  xp: 50,
  secret: false,
  levels: 3, // Bronze: 5, Prata: 10, Ouro: 20
  condition: (userProgress) => {
    return userProgress.stats.cyberRunner.mathStreak >= 10;
  },
  hint: null
}
```

### UserProgress Model

```javascript
{
  userId: string,
  stats: {
    global: {
      totalGames: number,
      totalTime: number,           // em minutos
      consecutiveDays: number,
      achievementsUnlocked: number,
      totalXP: number,
      level: number,
      lastPlayDate: timestamp
    },
    cyberRunner: {
      gamesPlayed: number,
      maxScore: number,
      totalCorrect: number,
      totalIncorrect: number,
      maxCombo: number,
      mathStreak: number,
      colorStreak: number,
      sequenceStreak: number,
      memoryStreak: number,
      avgAccuracy: number,
      totalTime: number
    },
    echoTemple: {
      gamesPlayed: number,
      maxSequenceLength: number,
      totalCorrect: number,
      totalIncorrect: number,
      avgAccuracy: number,
      nBackLevel: number,
      totalTime: number
    },
    sonicJump: {
      gamesPlayed: number,
      maxHeight: number,
      phonemesCorrect: number,
      phonemesIncorrect: number,
      avgAccuracy: number,
      perfectRuns: number,
      totalTime: number
    },
    gravityLab: {
      gamesPlayed: number,
      ruleSwitches: number,
      totalCorrect: number,
      totalIncorrect: number,
      avgAccuracy: number,
      trapAvoided: number,
      totalTime: number
    }
  },
  unlockedAchievements: [
    {
      id: string,
      unlockedAt: timestamp,
      level: number,              // Para conquistas com múltiplos níveis
      progress: number            // 0-100%
    }
  ],
  createdAt: timestamp,
  lastSaved: timestamp
}
```

### Notification Model

```javascript
{
  id: string,
  type: 'achievement' | 'message' | 'warning',
  achievement: Achievement | null,
  message: string,
  duration: number,              // em ms
  priority: 'low' | 'normal' | 'high',
  timestamp: timestamp,
  shown: boolean
}
```

### EducatorInsight Model

```javascript
{
  studentId: string,
  type: 'positive' | 'attention' | 'critical',
  category: 'engagement' | 'performance' | 'activity',
  icon: string,
  title: string,
  description: string,
  data: object,                  // Dados relevantes
  recommendations: string[],
  generatedAt: timestamp
}
```


---

## Achievement Definitions

### Global Achievements (Todos os Jogos)

```javascript
const globalAchievements = [
  {
    id: 'first_steps',
    name: 'Primeiros Passos',
    description: 'Jogue pela primeira vez',
    icon: '👣',
    category: 'progress',
    game: null,
    xp: 10,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.global.totalGames >= 1
  },
  {
    id: 'explorer',
    name: 'Explorador',
    description: 'Jogue todos os 4 jogos',
    icon: '🗺️',
    category: 'exploration',
    game: null,
    xp: 100,
    secret: false,
    levels: 1,
    condition: (p) => 
      p.stats.cyberRunner.gamesPlayed > 0 &&
      p.stats.echoTemple.gamesPlayed > 0 &&
      p.stats.sonicJump.gamesPlayed > 0 &&
      p.stats.gravityLab.gamesPlayed > 0
  },
  {
    id: 'dedicated',
    name: 'Dedicado',
    description: 'Jogue por 7 dias consecutivos',
    icon: '📅',
    category: 'persistence',
    game: null,
    xp: 150,
    secret: false,
    levels: 3, // Bronze: 3, Prata: 7, Ouro: 14
    condition: (p) => p.stats.global.consecutiveDays >= 7
  },
  {
    id: 'marathon',
    name: 'Maratonista',
    description: 'Jogue por 10 horas no total',
    icon: '⏱️',
    category: 'persistence',
    game: null,
    xp: 200,
    secret: false,
    levels: 3, // Bronze: 5h, Prata: 10h, Ouro: 20h
    condition: (p) => p.stats.global.totalTime >= 600
  },
  {
    id: 'collector',
    name: 'Colecionador',
    description: 'Desbloqueie 20 conquistas',
    icon: '🏆',
    category: 'special',
    game: null,
    xp: 250,
    secret: false,
    levels: 3, // Bronze: 10, Prata: 20, Ouro: 30
    condition: (p) => p.stats.global.achievementsUnlocked >= 20
  }
];
```

### Cyber-Runner Achievements

```javascript
const cyberRunnerAchievements = [
  {
    id: 'first_run',
    name: 'Primeira Corrida',
    description: 'Complete seu primeiro jogo no Cyber-Runner',
    icon: '🏃',
    category: 'progress',
    game: 'cyberRunner',
    xp: 20,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.cyberRunner.gamesPlayed >= 1
  },
  {
    id: 'math_master',
    name: 'Mestre da Matemática',
    description: 'Acerte 10 desafios matemáticos seguidos',
    icon: '🧮',
    category: 'mastery',
    game: 'cyberRunner',
    xp: 50,
    secret: false,
    levels: 3, // Bronze: 5, Prata: 10, Ouro: 20
    condition: (p) => p.stats.cyberRunner.mathStreak >= 10
  },
  {
    id: 'speed_demon',
    name: 'Velocista',
    description: 'Alcance velocidade 10x',
    icon: '⚡',
    category: 'mastery',
    game: 'cyberRunner',
    xp: 75,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.cyberRunner.maxSpeed >= 10
  },
  {
    id: 'combo_king',
    name: 'Rei do Combo',
    description: 'Alcance combo de 20',
    icon: '👑',
    category: 'mastery',
    game: 'cyberRunner',
    xp: 100,
    secret: false,
    levels: 3, // Bronze: 10, Prata: 20, Ouro: 50
    condition: (p) => p.stats.cyberRunner.maxCombo >= 20
  },
  {
    id: 'perfect_score',
    name: 'Pontuação Perfeita',
    description: 'Alcance 1000 pontos em uma partida',
    icon: '💯',
    category: 'mastery',
    game: 'cyberRunner',
    xp: 150,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.cyberRunner.maxScore >= 1000
  },
  {
    id: 'rainbow_master',
    name: 'Mestre do Arco-Íris',
    description: 'Acerte 15 desafios de cores seguidos',
    icon: '🌈',
    category: 'mastery',
    game: 'cyberRunner',
    xp: 50,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.cyberRunner.colorStreak >= 15
  }
];
```

### Echo Temple Achievements

```javascript
const echoTempleAchievements = [
  {
    id: 'memory_awakens',
    name: 'Memória Desperta',
    description: 'Complete seu primeiro jogo no Echo Temple',
    icon: '🧠',
    category: 'progress',
    game: 'echoTemple',
    xp: 20,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.echoTemple.gamesPlayed >= 1
  },
  {
    id: 'sequence_master',
    name: 'Mestre das Sequências',
    description: 'Acerte sequência de 10 posições',
    icon: '🔢',
    category: 'mastery',
    game: 'echoTemple',
    xp: 75,
    secret: false,
    levels: 3, // Bronze: 7, Prata: 10, Ouro: 15
    condition: (p) => p.stats.echoTemple.maxSequenceLength >= 10
  },
  {
    id: 'photographic_memory',
    name: 'Memória Fotográfica',
    description: 'Alcance 95% de acurácia',
    icon: '📸',
    category: 'mastery',
    game: 'echoTemple',
    xp: 100,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.echoTemple.avgAccuracy >= 0.95
  },
  {
    id: 'nback_champion',
    name: 'Campeão N-Back',
    description: 'Alcance nível 5-back',
    icon: '🏅',
    category: 'mastery',
    game: 'echoTemple',
    xp: 150,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.echoTemple.nBackLevel >= 5
  },
  {
    id: 'temple_guardian',
    name: 'Guardião do Templo',
    description: 'Jogue 50 partidas no Echo Temple',
    icon: '🛡️',
    category: 'persistence',
    game: 'echoTemple',
    xp: 100,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.echoTemple.gamesPlayed >= 50
  }
];
```


### Sonic Jump Achievements

```javascript
const sonicJumpAchievements = [
  {
    id: 'first_jump',
    name: 'Primeiro Salto',
    description: 'Complete seu primeiro jogo no Sonic Jump',
    icon: '🦘',
    category: 'progress',
    game: 'sonicJump',
    xp: 20,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.sonicJump.gamesPlayed >= 1
  },
  {
    id: 'phoneme_expert',
    name: 'Expert em Fonemas',
    description: 'Acerte 50 fonemas corretamente',
    icon: '🎵',
    category: 'mastery',
    game: 'sonicJump',
    xp: 75,
    secret: false,
    levels: 3, // Bronze: 25, Prata: 50, Ouro: 100
    condition: (p) => p.stats.sonicJump.phonemesCorrect >= 50
  },
  {
    id: 'sky_high',
    name: 'Nas Alturas',
    description: 'Alcance altura de 1000 pixels',
    icon: '☁️',
    category: 'mastery',
    game: 'sonicJump',
    xp: 50,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.sonicJump.maxHeight >= 1000
  },
  {
    id: 'perfect_ear',
    name: 'Ouvido Perfeito',
    description: 'Alcance 90% de acurácia',
    icon: '👂',
    category: 'mastery',
    game: 'sonicJump',
    xp: 100,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.sonicJump.avgAccuracy >= 0.90
  },
  {
    id: 'flawless_run',
    name: 'Corrida Impecável',
    description: 'Complete uma partida sem erros',
    icon: '✨',
    category: 'mastery',
    game: 'sonicJump',
    xp: 150,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.sonicJump.perfectRuns >= 1
  }
];
```

### Gravity Lab Achievements

```javascript
const gravityLabAchievements = [
  {
    id: 'first_experiment',
    name: 'Primeiro Experimento',
    description: 'Complete seu primeiro jogo no Gravity Lab',
    icon: '🔬',
    category: 'progress',
    game: 'gravityLab',
    xp: 20,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.gravityLab.gamesPlayed >= 1
  },
  {
    id: 'rule_switcher',
    name: 'Mestre da Mudança',
    description: 'Adapte-se a 20 mudanças de regra',
    icon: '🔄',
    category: 'mastery',
    game: 'gravityLab',
    xp: 75,
    secret: false,
    levels: 3, // Bronze: 10, Prata: 20, Ouro: 50
    condition: (p) => p.stats.gravityLab.ruleSwitches >= 20
  },
  {
    id: 'cognitive_flexibility',
    name: 'Flexibilidade Cognitiva',
    description: 'Alcance 85% de acurácia',
    icon: '🧩',
    category: 'mastery',
    game: 'gravityLab',
    xp: 100,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.gravityLab.avgAccuracy >= 0.85
  },
  {
    id: 'trap_master',
    name: 'Mestre das Armadilhas',
    description: 'Evite 10 armadilhas cognitivas',
    icon: '🎯',
    category: 'mastery',
    game: 'gravityLab',
    xp: 125,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.gravityLab.trapAvoided >= 10
  },
  {
    id: 'scientist',
    name: 'Cientista',
    description: 'Jogue 30 partidas no Gravity Lab',
    icon: '👨‍🔬',
    category: 'persistence',
    game: 'gravityLab',
    xp: 100,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.gravityLab.gamesPlayed >= 30
  }
];
```

### Secret Achievements

```javascript
const secretAchievements = [
  {
    id: 'night_owl',
    name: 'Coruja Noturna',
    description: 'Jogue entre 22h e 6h',
    icon: '🦉',
    category: 'special',
    game: null,
    xp: 50,
    secret: true,
    levels: 1,
    condition: (p) => {
      const hour = new Date(p.stats.global.lastPlayDate).getHours();
      return hour >= 22 || hour < 6;
    },
    hint: 'Jogue em um horário incomum...'
  },
  {
    id: 'perfectionist',
    name: 'Perfeccionista',
    description: 'Alcance 100% de acurácia em qualquer jogo',
    icon: '💎',
    category: 'special',
    game: null,
    xp: 200,
    secret: true,
    levels: 1,
    condition: (p) => 
      p.stats.cyberRunner.avgAccuracy === 1.0 ||
      p.stats.echoTemple.avgAccuracy === 1.0 ||
      p.stats.sonicJump.avgAccuracy === 1.0 ||
      p.stats.gravityLab.avgAccuracy === 1.0,
    hint: 'Seja perfeito em um jogo...'
  },
  {
    id: 'speed_runner',
    name: 'Speed Runner',
    description: 'Complete qualquer jogo em menos de 2 minutos',
    icon: '⚡',
    category: 'special',
    game: null,
    xp: 150,
    secret: true,
    levels: 1,
    condition: (p) => {
      // Implementar lógica de tempo mínimo por partida
      return false; // Placeholder
    },
    hint: 'Seja rápido...'
  }
];
```


---

## Integration Strategy

### Game Integration

**Pattern:** Cada jogo dispara eventos para o AchievementSystem

```javascript
// Em cada jogo (exemplo: CyberRunnerCanvas.js)
import { getAchievementSystem } from '../../systems/AchievementSystem';

function CyberRunnerCanvas() {
  const achievementSystem = getAchievementSystem();
  
  // Ao iniciar jogo
  useEffect(() => {
    achievementSystem.updateProgress({
      game: 'cyberRunner',
      type: 'gameStarted',
      value: 1
    });
  }, []);
  
  // Ao completar jogo
  const handleGameEnd = (score, accuracy) => {
    achievementSystem.updateProgress({
      game: 'cyberRunner',
      type: 'gameCompleted',
      value: 1,
      context: { score, accuracy }
    });
    
    // Atualiza estatísticas específicas
    if (score > userProgress.stats.cyberRunner.maxScore) {
      achievementSystem.updateProgress({
        game: 'cyberRunner',
        type: 'maxScore',
        value: score
      });
    }
  };
  
  // Ao acertar desafio
  const handleCorrectAnswer = (challengeType) => {
    achievementSystem.updateProgress({
      game: 'cyberRunner',
      type: 'correctAnswer',
      value: 1,
      context: { challengeType }
    });
    
    // Atualiza streak
    achievementSystem.updateProgress({
      game: 'cyberRunner',
      type: `${challengeType}Streak`,
      value: currentStreak + 1
    });
  };
  
  return (
    // ... componente do jogo
  );
}
```

### Existing Systems Integration

**AudioFeedback Integration:**
```javascript
// NotificationManager usa audioFeedback existente
import { getAudioFeedback } from '../utils/audioFeedback';

class NotificationManager {
  constructor() {
    this.audioFeedback = getAudioFeedback();
  }
  
  showAchievementNotification(achievement) {
    // Toca som de conquista
    this.audioFeedback.onAchievementUnlocked();
    
    // Exibe notificação visual
    this.displayNotification(achievement);
  }
}
```

**SensorySettings Integration:**
```javascript
// NotificationManager respeita configurações sensoriais
import { loadSensorySettings } from '../components/SensorySettings';

class NotificationManager {
  respectSensorySettings(userId) {
    const settings = loadSensorySettings(userId);
    
    // Ajusta animações
    if (settings.visual.animations === 'reduced') {
      this.animationDuration = 200; // Reduzido
    } else if (settings.visual.animations === 'none') {
      this.animationDuration = 0; // Sem animação
    }
    
    // Ajusta partículas
    if (settings.visual.particleEffects === 'minimal') {
      this.particleCount = 10;
    } else if (settings.visual.particleEffects === 'off') {
      this.particleCount = 0;
    }
    
    // Áudio já é gerenciado pelo audioFeedback
  }
}
```

**AdaptiveDifficulty Integration:**
```javascript
// AchievementSystem pode usar dados do AdaptiveDifficulty
import { AdaptiveDifficulty } from '../games/CyberRunnerCanvas/adaptiveDifficulty';

// Conquista baseada em dificuldade adaptativa
{
  id: 'difficulty_master',
  name: 'Mestre da Dificuldade',
  description: 'Alcance nível de dificuldade máximo',
  icon: '🎚️',
  category: 'mastery',
  game: 'cyberRunner',
  xp: 200,
  secret: false,
  levels: 1,
  condition: (p) => {
    // Verifica se dificuldade adaptativa está no máximo
    const adaptiveDiff = new AdaptiveDifficulty();
    const params = adaptiveDiff.getParams();
    return params.speed >= 15 && params.challengeFrequency >= 0.003;
  }
}
```


---

## Storage Strategy

### localStorage Structure

```javascript
// Chave: neuroplay_achievements_{userId}
{
  version: '1.0',
  userId: string,
  userProgress: UserProgress,
  settings: {
    notificationsEnabled: boolean,
    soundEnabled: boolean,
    autoSave: boolean
  },
  lastSync: timestamp
}

// Chave: neuroplay_educator_{educatorId}
{
  version: '1.0',
  educatorId: string,
  students: [
    {
      studentId: string,
      name: string,
      age: number,
      linkedAt: timestamp,
      permissions: ['view', 'export', 'report']
    }
  ],
  lastSync: timestamp
}
```

### Persistence Methods

```javascript
class StorageManager {
  constructor(userId) {
    this.userId = userId;
    this.storageKey = `neuroplay_achievements_${userId}`;
  }
  
  // Salva dados
  save(data) {
    try {
      const serialized = JSON.stringify({
        version: '1.0',
        userId: this.userId,
        userProgress: data,
        lastSync: Date.now()
      });
      
      localStorage.setItem(this.storageKey, serialized);
      return true;
    } catch (error) {
      console.error('Erro ao salvar:', error);
      return false;
    }
  }
  
  // Carrega dados
  load() {
    try {
      const serialized = localStorage.getItem(this.storageKey);
      if (!serialized) return null;
      
      const data = JSON.parse(serialized);
      
      // Verifica versão
      if (data.version !== '1.0') {
        console.warn('Versão incompatível, migrando...');
        return this.migrate(data);
      }
      
      return data.userProgress;
    } catch (error) {
      console.error('Erro ao carregar:', error);
      return null;
    }
  }
  
  // Exporta dados (LGPD)
  export() {
    const data = this.load();
    if (!data) return null;
    
    return {
      format: 'JSON',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      userId: this.userId,
      data: data
    };
  }
  
  // Limpa dados (LGPD)
  clear() {
    localStorage.removeItem(this.storageKey);
  }
  
  // Migração de versões
  migrate(oldData) {
    // Implementar lógica de migração se necessário
    return oldData;
  }
}
```

### Backend Sync (Opcional - Fase Futura)

```javascript
class BackendSync {
  constructor(userId, apiUrl) {
    this.userId = userId;
    this.apiUrl = apiUrl;
  }
  
  // Sincroniza com backend
  async sync(localData) {
    try {
      const response = await fetch(`${this.apiUrl}/achievements/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify({
          userId: this.userId,
          data: localData,
          timestamp: Date.now()
        })
      });
      
      if (response.ok) {
        const serverData = await response.json();
        return this.mergeData(localData, serverData);
      }
      
      return localData;
    } catch (error) {
      console.warn('Sync falhou, usando dados locais:', error);
      return localData;
    }
  }
  
  // Mescla dados local e servidor (resolve conflitos)
  mergeData(local, server) {
    // Usa timestamp mais recente
    if (server.lastSync > local.lastSync) {
      return server;
    }
    return local;
  }
}
```


---

## AI Insights System

### Insight Generation

```javascript
class InsightGenerator {
  constructor() {
    this.thresholds = {
      lowAccuracy: 0.60,
      highAccuracy: 0.85,
      inactivityDays: 3,
      rapidProgress: 5 // conquistas em uma semana
    };
  }
  
  // Gera insights para um aluno
  generateInsights(studentProgress) {
    const insights = [];
    
    // 1. Detecta dificuldade em jogos específicos
    Object.entries(studentProgress.stats).forEach(([game, stats]) => {
      if (game === 'global') return;
      
      if (stats.avgAccuracy < this.thresholds.lowAccuracy) {
        insights.push({
          type: 'attention',
          category: 'performance',
          icon: '⚠️',
          title: `Dificuldade detectada em ${this.getGameName(game)}`,
          description: `Acurácia de ${(stats.avgAccuracy * 100).toFixed(0)}% está abaixo do esperado`,
          data: { game, accuracy: stats.avgAccuracy },
          recommendations: [
            'Revisar configurações de dificuldade',
            'Considerar reduzir velocidade do jogo',
            'Verificar se há sobrecarga sensorial'
          ],
          generatedAt: Date.now()
        });
      }
    });
    
    // 2. Detecta inatividade
    const daysSinceLastPlay = this.getDaysSince(studentProgress.stats.global.lastPlayDate);
    if (daysSinceLastPlay >= this.thresholds.inactivityDays) {
      insights.push({
        type: 'critical',
        category: 'activity',
        icon: '⚠️',
        title: 'Inatividade detectada',
        description: `Sem jogar há ${daysSinceLastPlay} dias`,
        data: { daysSinceLastPlay },
        recommendations: [
          'Entrar em contato com responsáveis',
          'Verificar possíveis barreiras',
          'Oferecer incentivos para retorno'
        ],
        generatedAt: Date.now()
      });
    }
    
    // 3. Detecta progresso acelerado
    const recentAchievements = this.getRecentAchievements(studentProgress, 7);
    if (recentAchievements.length >= this.thresholds.rapidProgress) {
      insights.push({
        type: 'positive',
        category: 'engagement',
        icon: '✅',
        title: 'Progresso acelerado',
        description: `${recentAchievements.length} conquistas desbloqueadas na última semana`,
        data: { count: recentAchievements.length },
        recommendations: [
          'Parabenizar o aluno',
          'Considerar aumentar dificuldade',
          'Explorar novos desafios'
        ],
        generatedAt: Date.now()
      });
    }
    
    // 4. Detecta melhoria em jogo específico
    Object.entries(studentProgress.stats).forEach(([game, stats]) => {
      if (game === 'global') return;
      
      const previousAccuracy = this.getPreviousAccuracy(game, studentProgress);
      if (previousAccuracy && stats.avgAccuracy > previousAccuracy + 0.10) {
        insights.push({
          type: 'positive',
          category: 'performance',
          icon: '📈',
          title: `Melhoria em ${this.getGameName(game)}`,
          description: `Acurácia aumentou de ${(previousAccuracy * 100).toFixed(0)}% para ${(stats.avgAccuracy * 100).toFixed(0)}%`,
          data: { game, previousAccuracy, currentAccuracy: stats.avgAccuracy },
          recommendations: [
            'Reforçar comportamento positivo',
            'Manter estratégia atual',
            'Considerar novos desafios'
          ],
          generatedAt: Date.now()
        });
      }
    });
    
    // 5. Detecta engajamento aumentado
    const avgSessionTime = studentProgress.stats.global.totalTime / studentProgress.stats.global.totalGames;
    if (avgSessionTime > 25) { // > 25 minutos
      insights.push({
        type: 'positive',
        category: 'engagement',
        icon: '⏱️',
        title: 'Engajamento aumentado',
        description: `Tempo médio de sessão: ${avgSessionTime.toFixed(0)} minutos`,
        data: { avgSessionTime },
        recommendations: [
          'Manter atividades atuais',
          'Explorar interesses do aluno',
          'Considerar pausas regulares'
        ],
        generatedAt: Date.now()
      });
    }
    
    return insights;
  }
  
  // Helpers
  getGameName(gameId) {
    const names = {
      cyberRunner: 'Cyber-Runner',
      echoTemple: 'Echo Temple',
      sonicJump: 'Sonic Jump',
      gravityLab: 'Gravity Lab'
    };
    return names[gameId] || gameId;
  }
  
  getDaysSince(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
  
  getRecentAchievements(progress, days) {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    return progress.unlockedAchievements.filter(a => a.unlockedAt >= cutoff);
  }
  
  getPreviousAccuracy(game, progress) {
    // Implementar histórico de acurácia
    // Por enquanto, retorna null
    return null;
  }
}
```


---

## Testing Strategy

### Unit Tests

```javascript
// tests/AchievementSystem.test.js
describe('AchievementSystem', () => {
  let system;
  
  beforeEach(() => {
    system = new AchievementSystem('test_user');
    system.init();
  });
  
  test('should initialize with default progress', () => {
    const progress = system.getUserProgress();
    expect(progress.stats.global.totalGames).toBe(0);
    expect(progress.unlockedAchievements).toHaveLength(0);
  });
  
  test('should update progress correctly', () => {
    system.updateProgress({
      game: 'cyberRunner',
      type: 'gamesPlayed',
      value: 1
    });
    
    const progress = system.getUserProgress();
    expect(progress.stats.cyberRunner.gamesPlayed).toBe(1);
  });
  
  test('should unlock achievement when condition is met', () => {
    // Simula primeira partida
    system.updateProgress({
      game: 'cyberRunner',
      type: 'gamesPlayed',
      value: 1
    });
    
    // Verifica se "Primeira Corrida" foi desbloqueada
    expect(system.isUnlocked('first_run')).toBe(true);
  });
  
  test('should not unlock achievement twice', () => {
    system.unlockAchievement('first_run');
    system.unlockAchievement('first_run');
    
    const unlocked = system.getUnlockedAchievements();
    expect(unlocked.filter(a => a.id === 'first_run')).toHaveLength(1);
  });
  
  test('should save and load progress', () => {
    system.updateProgress({
      game: 'cyberRunner',
      type: 'gamesPlayed',
      value: 5
    });
    
    system.save();
    
    const newSystem = new AchievementSystem('test_user');
    newSystem.load();
    
    const progress = newSystem.getUserProgress();
    expect(progress.stats.cyberRunner.gamesPlayed).toBe(5);
  });
});
```

### Integration Tests

```javascript
// tests/GameIntegration.test.js
describe('Game Integration', () => {
  test('CyberRunner should trigger achievement events', () => {
    const achievementSystem = getAchievementSystem();
    const spy = jest.spyOn(achievementSystem, 'updateProgress');
    
    // Renderiza jogo
    render(<CyberRunnerCanvas userId="test_user" />);
    
    // Simula jogo
    // ... ações do jogo
    
    // Verifica se eventos foram disparados
    expect(spy).toHaveBeenCalledWith({
      game: 'cyberRunner',
      type: 'gameStarted',
      value: 1
    });
  });
});
```

### E2E Tests

```javascript
// tests/e2e/achievements.spec.js
describe('Achievement System E2E', () => {
  test('should show notification when achievement is unlocked', async () => {
    // Inicia jogo
    await page.goto('http://localhost:3000/games/cyber-runner');
    
    // Joga até desbloquear conquista
    // ... ações do jogo
    
    // Verifica notificação
    const notification = await page.waitForSelector('.achievement-notification');
    expect(notification).toBeTruthy();
    
    const text = await notification.textContent();
    expect(text).toContain('CONQUISTA DESBLOQUEADA');
  });
  
  test('should open achievement panel on key press', async () => {
    await page.goto('http://localhost:3000');
    
    // Pressiona 'A'
    await page.keyboard.press('a');
    
    // Verifica se painel abriu
    const panel = await page.waitForSelector('.achievement-panel');
    expect(panel).toBeTruthy();
  });
});
```

### Accessibility Tests

```javascript
// tests/accessibility.test.js
describe('Accessibility', () => {
  test('AchievementPanel should be keyboard navigable', () => {
    render(<AchievementPanel userId="test_user" />);
    
    // Tab para navegar
    userEvent.tab();
    expect(document.activeElement).toHaveClass('achievement-card');
    
    // Enter para selecionar
    userEvent.keyboard('{Enter}');
    // ... verifica ação
  });
  
  test('should have proper ARIA labels', () => {
    render(<AchievementPanel userId="test_user" />);
    
    const panel = screen.getByRole('dialog');
    expect(panel).toHaveAttribute('aria-label', 'Painel de Conquistas');
    
    const achievements = screen.getAllByRole('article');
    achievements.forEach(achievement => {
      expect(achievement).toHaveAttribute('aria-label');
    });
  });
});
```


---

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading de Conquistas**
   - Carregar apenas conquistas visíveis no viewport
   - Usar virtualização para listas longas

2. **Debouncing de Eventos**
   - Agrupar múltiplos eventos em batch
   - Salvar no localStorage apenas a cada 5 segundos

3. **Memoization**
   - Cachear cálculos de condições de conquistas
   - Usar React.memo para componentes de conquistas

4. **Web Workers (Futuro)**
   - Processar verificações de conquistas em background
   - Não bloquear thread principal

```javascript
// Exemplo de debouncing
class AchievementSystem {
  constructor(userId) {
    this.saveTimeout = null;
    this.saveDelay = 5000; // 5 segundos
  }
  
  updateProgress(eventData) {
    // Atualiza em memória
    this._updateProgressInMemory(eventData);
    
    // Agenda salvamento
    this.debouncedSave();
  }
  
  debouncedSave() {
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.save();
    }, this.saveDelay);
  }
  
  // Força salvamento imediato (ao fechar jogo)
  forceSave() {
    clearTimeout(this.saveTimeout);
    this.save();
  }
}
```

### Memory Management

```javascript
// Limpar listeners ao desmontar
useEffect(() => {
  const achievementSystem = getAchievementSystem();
  
  const handleAchievement = (achievement) => {
    // ... lógica
  };
  
  achievementSystem.on('unlock', handleAchievement);
  
  return () => {
    achievementSystem.off('unlock', handleAchievement);
  };
}, []);
```

### Bundle Size

- AchievementSystem: ~15KB (minified)
- NotificationManager: ~8KB (minified)
- AchievementPanel: ~12KB (minified)
- EducatorDashboard: ~20KB (minified)
- **Total: ~55KB** (aceitável para funcionalidade)

---

## Security & Privacy

### LGPD Compliance

1. **Consentimento**
   - Solicitar consentimento explícito para coleta de dados
   - Permitir opt-out a qualquer momento

2. **Portabilidade**
   - Função de exportação de dados em JSON
   - Formato legível e estruturado

3. **Exclusão**
   - Função de exclusão completa de dados
   - Confirmação antes de excluir

4. **Anonimização**
   - Dados agregados não contêm informações identificáveis
   - Benchmarks usam dados anônimos

```javascript
// Exemplo de exportação LGPD
class AchievementSystem {
  exportUserData() {
    return {
      format: 'JSON',
      standard: 'LGPD',
      exportedAt: new Date().toISOString(),
      userId: this.userId,
      data: {
        progress: this.userProgress,
        achievements: this.getUnlockedAchievements(),
        statistics: this.getStats()
      },
      rights: {
        portability: 'Você pode usar estes dados em outros sistemas',
        deletion: 'Você pode solicitar exclusão a qualquer momento',
        correction: 'Você pode solicitar correção de dados incorretos'
      }
    };
  }
  
  deleteUserData() {
    if (confirm('Tem certeza? Esta ação não pode ser desfeita.')) {
      localStorage.removeItem(this.storageKey);
      // Se houver backend, chamar API de exclusão
      return true;
    }
    return false;
  }
}
```

### Data Validation

```javascript
// Validar dados antes de salvar
class StorageManager {
  validate(data) {
    // Schema validation
    const schema = {
      userId: 'string',
      stats: 'object',
      unlockedAchievements: 'array'
    };
    
    for (const [key, type] of Object.entries(schema)) {
      if (typeof data[key] !== type) {
        throw new Error(`Invalid data: ${key} must be ${type}`);
      }
    }
    
    // Range validation
    if (data.stats.global.totalGames < 0) {
      throw new Error('Invalid data: totalGames cannot be negative');
    }
    
    return true;
  }
}
```


---

## Implementation Phases

### Phase 1: MVP (High Priority)

**Duration:** 2-3 weeks

**Components:**
1. AchievementSystem (core logic)
2. Basic achievement definitions (5 per game + 5 global)
3. NotificationManager (simple notifications)
4. AchievementPanel (basic UI)
5. localStorage persistence
6. Integration with 4 games

**Deliverables:**
- Functional achievement system
- Notifications on unlock
- Achievement panel accessible via 'A' key
- 25 total achievements

**Success Criteria:**
- All achievements can be unlocked
- Notifications appear correctly
- Data persists across sessions
- No performance issues

### Phase 2: Enhanced Features (Medium Priority)

**Duration:** 2-3 weeks

**Components:**
1. EducatorDashboard (basic version)
2. Multi-level achievements (bronze/silver/gold)
3. Secret achievements
4. Enhanced notifications (particles, animations)
5. Statistics and progress charts
6. Export functionality

**Deliverables:**
- Educator dashboard with student list
- 30+ total achievements
- Rich visual feedback
- Data export (JSON)

**Success Criteria:**
- Educators can view student progress
- Multi-level achievements work correctly
- Animations respect sensory settings
- Export complies with LGPD

### Phase 3: Advanced Features (Low Priority)

**Duration:** 2-3 weeks

**Components:**
1. AI Insights system
2. Automated recommendations
3. PDF report generation
4. Benchmark comparisons
5. Custom goals
6. Backend sync (optional)

**Deliverables:**
- AI-generated insights
- Professional PDF reports
- Benchmark system
- Custom goal tracking

**Success Criteria:**
- Insights are accurate and helpful
- Reports are professional quality
- Benchmarks respect privacy
- Backend sync works reliably

---

## File Structure

```
frontend/src/
├── systems/
│   ├── AchievementSystem.js          # Core achievement logic
│   ├── NotificationManager.js        # Notification display
│   ├── StorageManager.js             # localStorage management
│   ├── InsightGenerator.js           # AI insights
│   └── achievements/
│       ├── globalAchievements.js     # Global achievements
│       ├── cyberRunnerAchievements.js
│       ├── echoTempleAchievements.js
│       ├── sonicJumpAchievements.js
│       ├── gravityLabAchievements.js
│       └── secretAchievements.js
│
├── components/
│   ├── AchievementPanel.js           # Achievement panel UI
│   ├── AchievementPanel.css
│   ├── AchievementCard.js            # Individual achievement card
│   ├── AchievementNotification.js    # Notification component
│   └── AchievementNotification.css
│
├── pages/
│   ├── EducatorDashboard.js          # Educator dashboard
│   ├── EducatorDashboard.css
│   ├── StudentDetail.js              # Student detail view
│   └── StudentDetail.css
│
├── hooks/
│   ├── useAchievements.js            # Hook for achievements
│   ├── useAchievementStats.js        # Hook for statistics
│   └── useEducatorData.js            # Hook for educator data
│
└── utils/
    ├── achievementHelpers.js         # Helper functions
    └── reportGenerator.js            # PDF report generation
```

---

## Dependencies

### Required

- React 18+ (já instalado)
- localStorage API (nativo)
- Web Audio API (nativo) - via audioFeedback existente

### Optional (Phase 3)

- jsPDF (geração de PDF)
- Chart.js ou Recharts (gráficos)
- date-fns (manipulação de datas)

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "jspdf": "^2.5.1",
    "recharts": "^2.5.0",
    "date-fns": "^2.29.0"
  }
}
```

---

## Success Metrics

### Technical Metrics

- **Performance:** < 50ms para verificar conquistas
- **Storage:** < 1MB de dados por usuário
- **Load Time:** < 100ms para carregar painel
- **FPS:** Sem impacto no FPS dos jogos

### User Metrics

- **Engagement:** +30% tempo de sessão
- **Frequency:** +40% sessões/semana
- **Retention:** +50% retorno após 7 dias
- **Satisfaction:** SUS > 80

### Educator Metrics

- **Adoption:** 70% dos educadores usam dashboard
- **Usefulness:** 80% consideram insights úteis
- **Time Saved:** 30% redução em tempo de análise manual

---

## Next Steps

1. **Review & Approval:** Revisar este design com stakeholders
2. **Create Tasks:** Criar tasks.md com implementação detalhada
3. **Setup Environment:** Configurar estrutura de arquivos
4. **Phase 1 Implementation:** Começar com MVP
5. **Testing:** Testes contínuos durante desenvolvimento
6. **User Testing:** Testar com usuários reais após MVP
7. **Iterate:** Ajustar baseado em feedback

---

**Document Version:** 1.0  
**Created:** 10 de Fevereiro de 2026  
**Status:** Ready for Review  
**Next Step:** Create tasks.md with detailed implementation plan

