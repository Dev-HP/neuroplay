# 🧪 Testar Sistema de Conquistas

Guia completo para testar o Sistema de Conquistas do NeuroPlay.

## 🚀 Quick Test

### 1. Rodar Testes Automatizados

```bash
cd frontend
npm test
```

Deve passar todos os testes (50+).

### 2. Testar no Navegador

```bash
cd frontend
npm start
```

Abra http://localhost:3000

## 🎮 Testes Manuais por Jogo

### Cyber-Runner

1. **Iniciar jogo**
   - Abrir Cyber-Runner
   - Pressionar ESPAÇO
   - ✅ Deve rastrear `game_started`

2. **Desviar obstáculos**
   - Desviar de 10 obstáculos
   - ✅ Deve desbloquear: 🎯 Reflexos Rápidos

3. **Resolver portais**
   - Resolver 50 portais matemáticos
   - ✅ Deve desbloquear: 🧮 Gênio da Matemática

4. **Correr distância**
   - Correr 1000 metros
   - ✅ Deve desbloquear: 🚀 Velocista

5. **Verificar notificação**
   - ✅ Notificação deve aparecer no canto superior direito
   - ✅ Deve ter animação slide-in
   - ✅ Deve desaparecer após 4s
   - ✅ Pode clicar para fechar

### Echo Temple

1. **Primeira sequência**
   - Completar 1ª sequência
   - ✅ Deve desbloquear: 👂 Ouvinte Atento

2. **Múltiplas sequências**
   - Completar 5 sequências
   - ✅ Deve desbloquear: 🎵 Memória Musical

3. **Sequência longa**
   - Completar sequência de 8 sons
   - ✅ Deve desbloquear: 🎼 Maestro

### Sonic Jump

1. **Primeira plataforma**
   - Alcançar 1ª plataforma correta
   - ✅ Deve desbloquear: 🦘 Primeiro Salto

2. **Múltiplas plataformas**
   - Alcançar 10 plataformas
   - ✅ Deve desbloquear: 🎯 Saltador Preciso

3. **Acrobata**
   - Alcançar 25 plataformas
   - ✅ Deve desbloquear: 🌟 Acrobata

### Gravity Lab

1. **Primeiro experimento**
   - Completar 1º experimento
   - ✅ Deve desbloquear: 🔬 Cientista Curioso

2. **Múltiplos experimentos**
   - Completar 10 experimentos
   - ✅ Deve desbloquear: 🧪 Pesquisador

## 🎨 Testar Painel de Conquistas

### Abrir Painel

1. Adicionar botão temporário no App.js:

```javascript
import { useState } from 'react';
import AchievementPanel from './components/AchievementPanel';

function App() {
  const [showPanel, setShowPanel] = useState(false);
  
  return (
    <>
      <button 
        onClick={() => setShowPanel(true)}
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          padding: '10px 20px',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        🏆 Conquistas
      </button>
      
      {showPanel && (
        <AchievementPanel onClose={() => setShowPanel(false)} />
      )}
      
      {/* Resto do app */}
    </>
  );
}
```

### Testar Funcionalidades

1. **Header**
   - ✅ Título "🏆 Conquistas"
   - ✅ Botão fechar (X)
   - ✅ 3 cards de estatísticas

2. **Filtros**
   - ✅ 6 abas de categorias
   - ✅ Filtro por estado (todas/desbloqueadas/bloqueadas)
   - ✅ Ordenação (raridade/pontos/recentes/nome)

3. **Grid**
   - ✅ Cards em grid responsivo
   - ✅ Scroll funcional
   - ✅ Loading state
   - ✅ Empty state

4. **Cards**
   - ✅ Ícone animado
   - ✅ Badge de raridade
   - ✅ Nome e descrição
   - ✅ Pontos
   - ✅ Data (se desbloqueada)
   - ✅ Badge "✓" (se desbloqueada)
   - ✅ Barra de progresso (se bloqueada)

5. **Interações**
   - ✅ Hover nos cards
   - ✅ Click nos cards
   - ✅ Fechar com X
   - ✅ Fechar com ESC

## 🔍 Testar Persistência

### LocalStorage

1. **Desbloquear conquista**
   - Desbloquear qualquer conquista
   - Fechar navegador
   - Abrir novamente
   - ✅ Conquista deve continuar desbloqueada

2. **Verificar dados**
   - Abrir DevTools (F12)
   - Application > Local Storage
   - ✅ Deve ter chave `neuroplay_achievements`
   - ✅ Dados em JSON válido

### Export/Import

```javascript
// No console do navegador
const system = window.achievementSystem;

// Exportar
const data = await system.storage.exportData();
console.log(data);

// Limpar
await system.reset();

// Importar
await system.storage.importData(data);
```

## 🎯 Testar Hooks

### useAchievementSystem

```javascript
import { useAchievementSystem } from './hooks/useAchievementSystem';

function TestComponent() {
  const { 
    initialized, 
    loading, 
    error,
    trackEvent 
  } = useAchievementSystem();
  
  console.log('Initialized:', initialized);
  console.log('Loading:', loading);
  console.log('Error:', error);
  
  return (
    <button onClick={() => trackEvent('test', {})}>
      Test Event
    </button>
  );
}
```

### useAchievements

```javascript
import { useAchievements } from './hooks/useAchievements';

function TestComponent() {
  const { achievements, loading } = useAchievements({
    category: 'cyber-runner',
    unlocked: true
  });
  
  console.log('Achievements:', achievements);
  
  return <div>{achievements.length} conquistas</div>;
}
```

### useAchievementStats

```javascript
import { useAchievementStats } from './hooks/useAchievementStats';

function TestComponent() {
  const { stats, loading } = useAchievementStats();
  
  console.log('Stats:', stats);
  
  return (
    <div>
      {stats.unlocked}/{stats.total} ({stats.percentage}%)
    </div>
  );
}
```

## 🐛 Debug

### Console Logs

Ativar logs detalhados:

```javascript
// No console
localStorage.setItem('debug', 'achievements:*');
```

### Verificar Sistema

```javascript
// No console
const system = window.achievementSystem;

// Ver todas as conquistas
const all = await system.getAllAchievements();
console.table(all);

// Ver estatísticas
const stats = await system.getStats();
console.log(stats);

// Ver progresso específico
const progress = await system.storage.getAchievementProgress('achievement-id');
console.log(progress);
```

### Forçar Desbloqueio (Teste)

```javascript
// No console
const system = window.achievementSystem;

// Desbloquear conquista específica
await system.storage.unlockAchievement('cyber-runner-first-run', Date.now());

// Recarregar página para ver
location.reload();
```

### Resetar Tudo

```javascript
// No console
const system = window.achievementSystem;
await system.reset();
location.reload();
```

## 📊 Checklist Completo

### Funcionalidades Core
- [ ] Sistema inicializa corretamente
- [ ] Eventos são rastreados
- [ ] Conquistas desbloqueiam
- [ ] Notificações aparecem
- [ ] Dados persistem
- [ ] Estatísticas atualizam

### UI/UX
- [ ] Painel abre/fecha
- [ ] Filtros funcionam
- [ ] Ordenação funciona
- [ ] Cards exibem corretamente
- [ ] Animações suaves
- [ ] Responsivo mobile

### Integração
- [ ] Cyber-Runner integrado
- [ ] Echo Temple integrado
- [ ] Sonic Jump integrado
- [ ] Gravity Lab integrado

### Performance
- [ ] Sem lag ao rastrear eventos
- [ ] Painel abre rápido
- [ ] Scroll suave
- [ ] Sem memory leaks

### Qualidade
- [ ] Testes passam
- [ ] Sem erros no console
- [ ] Sem warnings
- [ ] Código limpo

## 🎉 Teste de Aceitação

### Cenário Completo

1. Abrir aplicação
2. Jogar Cyber-Runner
3. Desbloquear 3 conquistas
4. Abrir painel de conquistas
5. Verificar conquistas desbloqueadas
6. Filtrar por categoria
7. Fechar painel
8. Fechar navegador
9. Abrir novamente
10. Verificar conquistas persistidas

✅ Se tudo funcionar, sistema está pronto!

## 📝 Reportar Bugs

Se encontrar bugs:

1. Anotar passos para reproduzir
2. Capturar screenshot/vídeo
3. Copiar erros do console
4. Verificar LocalStorage
5. Criar issue no GitHub

## 🚀 Próximos Testes

Após validação básica:

1. Teste de carga (muitos eventos)
2. Teste de stress (LocalStorage cheio)
3. Teste cross-browser
4. Teste mobile
5. Teste de acessibilidade
6. Teste de performance

## 📖 Documentação

Para mais detalhes:
- `frontend/src/systems/achievements/README.md`
- `frontend/src/systems/achievements/QUICK_START.md`

---

**Boa sorte nos testes! 🎮**
