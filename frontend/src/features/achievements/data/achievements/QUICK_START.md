# 🚀 Quick Start - Sistema de Conquistas

Guia rápido para começar a usar o Sistema de Conquistas do NeuroPlay.

## ⚡ 5 Minutos para Começar

### 1. Importar e Usar Hook (Recomendado)

```javascript
import { useAchievementSystem } from './hooks/useAchievementSystem';

function MyGame() {
  const { trackEvent, initialized } = useAchievementSystem();
  
  const handleAction = async () => {
    if (!initialized) return;
    
    await trackEvent('action_completed', {
      game: 'my-game',
      value: 100
    });
  };
  
  return <button onClick={handleAction}>Fazer Ação</button>;
}
```

### 2. Exibir Painel de Conquistas

```javascript
import { useState } from 'react';
import AchievementPanel from './components/AchievementPanel';

function App() {
  const [showAchievements, setShowAchievements] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowAchievements(true)}>
        🏆 Conquistas
      </button>
      
      {showAchievements && (
        <AchievementPanel 
          onClose={() => setShowAchievements(false)} 
        />
      )}
    </>
  );
}
```

### 3. Ver Estatísticas

```javascript
import { useAchievementStats } from './hooks/useAchievementStats';

function StatsDisplay() {
  const { stats, loading } = useAchievementStats();
  
  if (loading) return <div>Carregando...</div>;
  
  return (
    <div>
      <p>Conquistas: {stats.unlocked}/{stats.total}</p>
      <p>Progresso: {stats.percentage.toFixed(1)}%</p>
      <p>Pontos: {stats.totalPoints}</p>
    </div>
  );
}
```

## 🎮 Eventos por Jogo

### Cyber-Runner
```javascript
// Obstáculo desviado
await trackEvent('obstacle_dodged', {
  game: 'cyber-runner',
  totalDodged: 10
});

// Portal resolvido
await trackEvent('portal_solved', {
  game: 'cyber-runner',
  totalSolved: 50
});

// Distância alcançada
await trackEvent('distance_reached', {
  game: 'cyber-runner',
  distance: 1000
});
```

### Echo Temple
```javascript
// Sequência completada
await trackEvent('sequence_completed', {
  game: 'echo-temple',
  totalCompleted: 5,
  sequenceLength: 8
});
```

### Sonic Jump
```javascript
// Plataforma alcançada
await trackEvent('platform_reached', {
  game: 'sonic-jump',
  totalReached: 10
});
```

### Gravity Lab
```javascript
// Experimento completado
await trackEvent('experiment_completed', {
  game: 'gravity-lab',
  totalCompleted: 10
});
```

## 🎨 Filtrar Conquistas

```javascript
import { useAchievements } from './hooks/useAchievements';

function FilteredAchievements() {
  // Apenas desbloqueadas
  const { achievements } = useAchievements({ 
    unlocked: true 
  });
  
  // Por categoria
  const { achievements } = useAchievements({ 
    category: 'cyber-runner' 
  });
  
  // Por raridade
  const { achievements } = useAchievements({ 
    rarity: 'legendary' 
  });
  
  // Ordenar por pontos
  const { achievements } = useAchievements({ 
    sortBy: 'points' 
  });
  
  return (
    <div>
      {achievements.map(a => (
        <div key={a.id}>{a.name}</div>
      ))}
    </div>
  );
}
```

## 🔔 Ouvir Eventos

```javascript
import { useEffect } from 'react';
import { getAchievementSystem } from './systems/AchievementSystem';

function AchievementListener() {
  useEffect(() => {
    const system = getAchievementSystem();
    
    const unsubscribe = system.addEventListener((event, data) => {
      if (event === 'achievements_unlocked') {
        console.log('Novas conquistas:', data);
        // Fazer algo com as conquistas desbloqueadas
      }
    });
    
    return unsubscribe;
  }, []);
  
  return null;
}
```

## 🎯 Padrões Comuns

### Contador Incremental
```javascript
const [count, setCount] = useState(0);

const increment = async () => {
  setCount(c => {
    const newCount = c + 1;
    trackEvent('counter_increased', {
      game: 'my-game',
      total: newCount
    });
    return newCount;
  });
};
```

### Milestone de Distância
```javascript
const [distance, setDistance] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setDistance(d => {
      const newDistance = d + 1;
      
      // Track a cada 100m
      if (newDistance % 100 === 0) {
        trackEvent('distance_reached', {
          game: 'my-game',
          distance: newDistance
        });
      }
      
      return newDistance;
    });
  }, 100);
  
  return () => clearInterval(interval);
}, []);
```

### Completar Nível
```javascript
const handleLevelComplete = async () => {
  await trackEvent('level_completed', {
    game: 'my-game',
    level: currentLevel,
    score: score
  });
  
  setLevel(l => l + 1);
};
```

## 🐛 Debug

### Ver Todas as Conquistas
```javascript
const system = getAchievementSystem();
const all = await system.getAllAchievements();
console.table(all);
```

### Ver Progresso Específico
```javascript
const storage = system.storage;
const progress = await storage.getAchievementProgress('achievement-id');
console.log(progress);
```

### Resetar Tudo (Desenvolvimento)
```javascript
const system = getAchievementSystem();
await system.reset();
```

### Forçar Desbloqueio (Teste)
```javascript
const storage = system.storage;
await storage.unlockAchievement('achievement-id', Date.now());
```

## 📱 Atalhos de Teclado

No painel de conquistas:
- `ESC` - Fechar painel
- `A` - Abrir painel (se configurado)

## 🎨 Customizar Cores

As cores são definidas por raridade:

```css
/* Comum */
--rarity-common: #667eea;

/* Rara */
--rarity-rare: #4facfe;

/* Épica */
--rarity-epic: #fa709a;

/* Lendária */
--rarity-legendary: #ffd89b;
```

## 💡 Dicas

1. **Sempre verifique `initialized`** antes de chamar `trackEvent`
2. **Use setState callback** para garantir valor atualizado
3. **Evite tracking em loops** - pode causar lag
4. **Use debounce** para eventos muito frequentes
5. **Teste no console** antes de integrar

## 🚨 Erros Comuns

### "System not initialized"
```javascript
// ❌ Errado
trackEvent('event', data);

// ✅ Correto
if (initialized) {
  await trackEvent('event', data);
}
```

### "Cannot read property of undefined"
```javascript
// ❌ Errado
const { trackEvent } = useAchievementSystem();
trackEvent('event', data); // Pode ser undefined

// ✅ Correto
const { trackEvent } = useAchievementSystem();
if (trackEvent) {
  await trackEvent('event', data);
}
```

### Notificações não aparecem
```javascript
// Verifique se o container existe
const container = document.getElementById('achievement-notifications');
console.log('Container:', container);
```

## 📚 Próximos Passos

- Leia o [README completo](./README.md)
- Veja exemplos avançados
- Consulte a [API Reference](./README.md#api-reference)

## 🎉 Pronto!

Agora você está pronto para usar o Sistema de Conquistas!

Para mais informações, consulte a documentação completa.
