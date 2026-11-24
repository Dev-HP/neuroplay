# 🏆 Sistema de Conquistas - NeuroPlay

Sistema completo de conquistas gamificadas para jogos terapêuticos, baseado em evidências científicas (Restack.io 2024, MDPI 2024).

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Instalação](#instalação)
- [Uso Básico](#uso-básico)
- [API Reference](#api-reference)
- [Conquistas](#conquistas)
- [Eventos](#eventos)
- [Componentes](#componentes)
- [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

O Sistema de Conquistas do NeuroPlay oferece:

- ✅ 25 conquistas em 5 categorias
- ✅ 4 níveis de raridade (Comum, Rara, Épica, Lendária)
- ✅ Notificações animadas
- ✅ Persistência automática
- ✅ Painel visual completo
- ✅ Integração com 4 jogos
- ✅ Sistema de pontos
- ✅ Estatísticas em tempo real

## 📦 Instalação

O sistema já está integrado ao NeuroPlay. Não requer instalação adicional.

## 🚀 Uso Básico

### 1. Inicializar o Sistema

```javascript
import { getAchievementSystem } from './systems/AchievementSystem';

// Obter instância singleton
const achievementSystem = getAchievementSystem();

// Inicializar (apenas uma vez)
await achievementSystem.initialize();
```

### 2. Rastrear Eventos

```javascript
// Em qualquer jogo
await achievementSystem.trackEvent('event_name', {
  game: 'game-name',
  data: value
});
```

### 3. Usar Hooks React

```javascript
import { useAchievementSystem } from './hooks/useAchievementSystem';

function MyComponent() {
  const { trackEvent, initialized } = useAchievementSystem();
  
  const handleAction = async () => {
    await trackEvent('action_completed', { score: 100 });
  };
}
```

### 4. Exibir Painel de Conquistas

```javascript
import AchievementPanel from './components/AchievementPanel';

function App() {
  const [showPanel, setShowPanel] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowPanel(true)}>
        Ver Conquistas
      </button>
      
      {showPanel && (
        <AchievementPanel onClose={() => setShowPanel(false)} />
      )}
    </>
  );
}
```

## 📚 API Reference

### AchievementSystem

#### `initialize()`
Inicializa o sistema de conquistas.

```javascript
await achievementSystem.initialize();
```

#### `trackEvent(eventType, data)`
Rastreia um evento que pode desbloquear conquistas.

```javascript
await achievementSystem.trackEvent('obstacle_dodged', {
  game: 'cyber-runner',
  totalDodged: 10
});
```

**Parâmetros:**
- `eventType` (string): Tipo do evento
- `data` (object): Dados do evento

**Retorna:** Array de conquistas desbloqueadas

#### `getAllAchievements()`
Retorna todas as conquistas com progresso.

```javascript
const achievements = await achievementSystem.getAllAchievements();
```

#### `getAchievementsByCategory(category)`
Retorna conquistas de uma categoria específica.

```javascript
const achievements = await achievementSystem.getAchievementsByCategory('cyber-runner');
```

#### `getStats()`
Retorna estatísticas gerais.

```javascript
const stats = await achievementSystem.getStats();
// { total, unlocked, locked, percentage, totalPoints, byRarity }
```

#### `addEventListener(callback)`
Adiciona listener para eventos de conquistas.

```javascript
const unsubscribe = achievementSystem.addEventListener((event, data) => {
  if (event === 'achievements_unlocked') {
    console.log('Conquistas desbloqueadas:', data);
  }
});

// Remover listener
unsubscribe();
```

### React Hooks

#### `useAchievementSystem()`
Hook principal para acessar o sistema.

```javascript
const {
  system,
  initialized,
  loading,
  error,
  trackEvent,
  getAllAchievements,
  getAchievementsByCategory,
  getStats,
  reset
} = useAchievementSystem();
```

#### `useAchievements(filters)`
Hook para obter conquistas com filtros.

```javascript
const { achievements, loading, error } = useAchievements({
  category: 'cyber-runner',
  unlocked: true,
  rarity: 'epic',
  sortBy: 'points'
});
```

**Filtros:**
- `category`: 'global' | 'cyber-runner' | 'echo-temple' | 'sonic-jump' | 'gravity-lab'
- `unlocked`: true | false
- `rarity`: 'common' | 'rare' | 'epic' | 'legendary'
- `sortBy`: 'rarity' | 'points' | 'recent' | 'name'

#### `useAchievementStats()`
Hook para estatísticas.

```javascript
const { stats, loading, error } = useAchievementStats();
```

## 🎮 Conquistas

### Global (5)
- 🎮 **Primeiro Passo** (10 pts) - Completar o tutorial
- 🔥 **Sequência de Fogo** (25 pts) - Jogar 7 dias consecutivos
- 🏆 **Colecionador** (50 pts) - Desbloquear 10 conquistas
- ⭐ **Mestre** (100 pts) - Desbloquear 25 conquistas
- 👑 **Lenda** (250 pts) - Desbloquear todas as conquistas

### Cyber-Runner (6)
- 🏃 **Corredor Iniciante** (10 pts) - Completar primeira corrida
- 🎯 **Reflexos Rápidos** (15 pts) - Desviar de 10 obstáculos
- 🧮 **Gênio da Matemática** (25 pts) - Resolver 50 portais matemáticos
- 🚀 **Velocista** (30 pts) - Correr 1000 metros
- 💎 **Coletor de Gemas** (20 pts) - Coletar 100 gemas
- 🏅 **Maratonista** (50 pts) - Correr 5000 metros

### Echo Temple (5)
- 👂 **Ouvinte Atento** (10 pts) - Completar primeira sequência
- 🎵 **Memória Musical** (20 pts) - Completar 5 sequências
- 🎼 **Maestro** (35 pts) - Completar sequência de 8 sons
- 🔊 **Ouvido Absoluto** (50 pts) - Completar 50 sequências
- 🎹 **Virtuoso** (75 pts) - Completar 100 sequências

### Sonic Jump (5)
- 🦘 **Primeiro Salto** (10 pts) - Alcançar primeira plataforma
- 🎯 **Saltador Preciso** (20 pts) - Alcançar 10 plataformas
- 🌟 **Acrobata** (30 pts) - Alcançar 25 plataformas
- 🚀 **Mestre dos Saltos** (50 pts) - Alcançar 50 plataformas
- 👑 **Rei das Alturas** (75 pts) - Alcançar 100 plataformas

### Gravity Lab (4)
- 🔬 **Cientista Curioso** (10 pts) - Completar primeira experiência
- 🧪 **Pesquisador** (20 pts) - Completar 10 experiências
- 🎓 **Professor** (35 pts) - Completar 25 experiências
- 🏆 **Einstein Jr** (50 pts) - Completar 50 experiências

## 📡 Eventos

### Cyber-Runner
- `game_started` - Nova partida iniciada
- `obstacle_dodged` - Obstáculo desviado (data: totalDodged)
- `portal_solved` - Portal matemático resolvido (data: totalSolved)
- `distance_reached` - Distância alcançada (data: distance)
- `gem_collected` - Gema coletada (data: totalGems)
- `game_completed` - Jogo finalizado (data: score, distance)

### Echo Temple
- `sequence_completed` - Sequência completada (data: totalCompleted, sequenceLength)
- `sequence_length` - Novo recorde de comprimento (data: length)

### Sonic Jump
- `platform_reached` - Plataforma alcançada (data: totalReached)

### Gravity Lab
- `experiment_completed` - Experimento completado (data: totalCompleted)

### Global
- `tutorial_completed` - Tutorial completado
- `daily_login` - Login diário
- `achievement_unlocked` - Conquista desbloqueada (automático)

## 🎨 Componentes

### AchievementPanel
Painel modal completo de conquistas.

```javascript
<AchievementPanel onClose={() => setShowPanel(false)} />
```

**Props:**
- `onClose` (function): Callback ao fechar

### AchievementCard
Card individual de conquista.

```javascript
<AchievementCard 
  achievement={achievement}
  onClick={() => console.log('clicked')}
/>
```

**Props:**
- `achievement` (object): Dados da conquista
- `onClick` (function): Callback ao clicar

### AchievementNotification
Notificação toast (gerenciada automaticamente).

```javascript
<AchievementNotification
  achievement={achievement}
  onClose={() => {}}
  duration={4000}
/>
```

**Props:**
- `achievement` (object): Dados da conquista
- `onClose` (function): Callback ao fechar
- `duration` (number): Duração em ms (padrão: 4000)

## 🔧 Troubleshooting

### Conquistas não desbloqueiam

1. Verifique se o sistema foi inicializado:
```javascript
const { initialized } = useAchievementSystem();
console.log('Initialized:', initialized);
```

2. Verifique se o evento está sendo rastreado:
```javascript
const unlocked = await trackEvent('event_name', data);
console.log('Unlocked:', unlocked);
```

3. Verifique o console para erros

### Notificações não aparecem

1. Verifique se o NotificationManager foi inicializado
2. Verifique z-index de outros elementos
3. Verifique se há erros no console

### Progresso não persiste

1. Verifique se LocalStorage está habilitado
2. Verifique quota do LocalStorage
3. Limpe o cache e tente novamente

### Performance lenta

1. Evite chamar `trackEvent` em loops
2. Use debounce para eventos frequentes
3. Verifique se há memory leaks

## 📊 Estrutura de Dados

### Achievement Object
```javascript
{
  id: 'achievement-id',
  name: 'Nome da Conquista',
  description: 'Descrição',
  icon: '🏆',
  category: 'global',
  rarity: 'common',
  points: 10,
  trigger: 'event_name',
  condition: (data, progress) => boolean,
  updateProgress: (data, progress) => newProgress,
  unlocked: false,
  unlockedAt: null,
  progress: 0
}
```

### Stats Object
```javascript
{
  total: 25,
  unlocked: 5,
  locked: 20,
  percentage: 20,
  totalPoints: 100,
  byRarity: {
    common: 3,
    rare: 1,
    epic: 1,
    legendary: 0
  }
}
```

## 🎯 Exemplos Completos

### Integrar em um Jogo

```javascript
import { useAchievementSystem } from './hooks/useAchievementSystem';

function MyGame() {
  const { trackEvent } = useAchievementSystem();
  const [score, setScore] = useState(0);
  
  const handleScoreIncrease = async (points) => {
    const newScore = score + points;
    setScore(newScore);
    
    // Track achievement
    await trackEvent('score_reached', {
      game: 'my-game',
      score: newScore
    });
  };
  
  return <div>Score: {score}</div>;
}
```

### Criar Nova Conquista

```javascript
// Em achievements/myGameAchievements.js
export const myGameAchievements = [
  {
    id: 'my-game-first-win',
    name: 'Primeira Vitória',
    description: 'Vença sua primeira partida',
    icon: '🎉',
    category: 'my-game',
    rarity: 'common',
    points: 10,
    trigger: 'game_won',
    condition: (data, progress) => {
      return data.game === 'my-game';
    }
  }
];
```

## 📝 Licença

MIT License - NeuroPlay 2024

## 🤝 Contribuindo

Veja [CONTRIBUTING.md](../../../../../../CONTRIBUTING.md) para detalhes.

## 📧 Suporte

Para dúvidas ou problemas, abra uma issue no GitHub.
