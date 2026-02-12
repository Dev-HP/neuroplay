# 🚀 Testar Fase 1 - Guia Rápido

## ⚡ Como Testar AGORA

### 1️⃣ Testar Sistema Adaptativo no Cyber-Runner

```bash
# 1. Certifique-se que o frontend está rodando
cd frontend
npm start

# 2. Abra o navegador em http://localhost:3000
# 3. Navegue até o jogo Cyber-Runner
# 4. Pressione ESPAÇO para começar
```

**O que observar:**
- ✅ Jogue 10+ tentativas
- ✅ Acerte 90%+ das tentativas → Deve aparecer mensagem "📈 Dificuldade aumentada!"
- ✅ Erre 60%+ das tentativas → Deve aparecer mensagem "📉 Dificuldade ajustada"
- ✅ Fique entre 60-85% → Deve aparecer "✅ Você está na zona ideal!"
- ✅ Velocidade do jogo deve mudar visivelmente

**Console do navegador:**
```
[Adaptive] 📈 Dificuldade aumentada! Você está indo muito bem!
  accuracy: "87.5%"
  avgRT: "750ms"
  params: {speed: 5.5, challengeFrequency: 0.00096, ...}
```

---

### 2️⃣ Testar Feedback Auditivo

**IMPORTANTE:** O áudio só funciona após interação do usuário (clique/tecla)

```javascript
// Abra o Console do navegador (F12)
// Cole este código:

import { getAudioFeedback } from './utils/audioFeedback';

const audio = getAudioFeedback();
await audio.init();

// Teste sons
audio.onCorrectAnswer(0);     // Som de acerto
audio.onCorrectAnswer(5);     // Som de acerto + combo
audio.onIncorrectAnswer();    // Som de erro (suave)
audio.onCoinCollected();      // Som de moeda
audio.onPowerUpCollected();   // Som de power-up
audio.onLevelComplete();      // Som de nível completo

// Ajuste volume
audio.setVolume(0.5);         // 50%
audio.onCorrectAnswer();      // Teste com volume reduzido
```

**O que observar:**
- ✅ Sons devem tocar imediatamente
- ✅ Sons de combo devem ser diferentes
- ✅ Som de erro deve ser suave (não punitivo)
- ✅ Volume deve ajustar corretamente

**Se não funcionar:**
- Verifique se clicou na página primeiro
- Verifique console para erros
- Tente em navegador diferente (Chrome recomendado)

---

### 3️⃣ Testar Configurações Sensoriais

**Opção A: Testar Componente Isolado**

```javascript
// Adicione temporariamente ao App.js ou página de teste

import { SensorySettings } from './components/SensorySettings';

function TestPage() {
  const [showSettings, setShowSettings] = useState(true);
  
  return (
    <div>
      <button onClick={() => setShowSettings(true)}>
        Abrir Configurações
      </button>
      
      {showSettings && (
        <SensorySettings
          userId="test-user"
          onSave={(settings) => {
            console.log('Configurações salvas:', settings);
            alert('Salvo!');
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
```

**Opção B: Testar via Console**

```javascript
// Abra Console (F12)

// Carrega configurações
import { loadSensorySettings } from './components/SensorySettings';
const settings = loadSensorySettings('test-user');
console.log('Configurações atuais:', settings);

// Salva configurações de teste
localStorage.setItem('sensory_settings_test-user', JSON.stringify({
  visual: {
    brightness: 70,
    contrast: 'low',
    colorScheme: 'pastel',
    animations: 'reduced',
    particleEffects: 'minimal',
    backgroundMotion: false
  },
  auditory: {
    masterVolume: 40,
    soundEffects: false,
    backgroundMusic: false
  },
  gameplay: {
    gameSpeed: 0.8,
    pauseReminders: true,
    pauseInterval: 10
  }
}));

// Recarregue a página e veja se aplicou
```

**O que testar:**

1. **Presets:**
   - ✅ Clique em "Hipersensível Visual" → Brilho deve reduzir
   - ✅ Clique em "Hipersensível Auditivo" → Volume deve reduzir
   - ✅ Clique em "Busca Sensorial" → Tudo deve aumentar
   - ✅ Clique em "Padrão" → Deve voltar ao normal

2. **Configurações Visual:**
   - ✅ Ajuste brilho → Canvas deve clarear/escurecer
   - ✅ Mude esquema de cores → Cores devem mudar
   - ✅ Desative animações → Animações devem parar

3. **Configurações Auditivo:**
   - ✅ Ajuste volume → Sons devem ficar mais baixos/altos
   - ✅ Desative efeitos sonoros → Sons devem parar

4. **Configurações Gameplay:**
   - ✅ Ajuste velocidade → Jogo deve ficar mais lento/rápido
   - ✅ Ative lembretes de pausa → Deve mostrar lembrete

5. **Persistência:**
   - ✅ Salve configurações
   - ✅ Recarregue página (F5)
   - ✅ Configurações devem estar mantidas

---

## 🧪 TESTES COMPLETOS

### Teste 1: Sistema Adaptativo Completo

```
1. Inicie Cyber-Runner
2. Jogue 10 tentativas acertando TUDO (pule todos os verdes, deslize todos os vermelhos)
3. Observe: "📈 Dificuldade aumentada!"
4. Continue jogando - deve ficar mais rápido
5. Agora erre TUDO propositalmente por 10 tentativas
6. Observe: "📉 Dificuldade ajustada"
7. Continue jogando - deve ficar mais lento
8. Agora acerte ~70% das tentativas
9. Observe: "✅ Você está na zona ideal!"
10. Dificuldade deve se manter estável
```

**Resultado esperado:**
- Velocidade aumenta quando muito fácil
- Velocidade diminui quando muito difícil
- Velocidade mantém quando ideal
- Mensagens aparecem na tela

---

### Teste 2: Feedback Auditivo Completo

```
1. Inicie Cyber-Runner
2. Clique na tela (ativa áudio)
3. Acerte um obstáculo → Deve tocar som agradável
4. Acerte 5 seguidos → Deve tocar som de combo
5. Erre um obstáculo → Deve tocar som suave (não assustador)
6. Colete uma moeda → Deve tocar som de moeda
7. Abra configurações e reduza volume para 30%
8. Repita testes - sons devem estar mais baixos
9. Desative efeitos sonoros
10. Repita testes - não deve tocar nada
```

**Resultado esperado:**
- Sons tocam imediatamente
- Sons de combo são especiais
- Som de erro é suave
- Volume ajusta corretamente
- Desativar funciona

---

### Teste 3: Configurações Sensoriais Completo

```
1. Abra modal de configurações
2. Teste preset "Hipersensível Visual":
   - Brilho deve ir para 70%
   - Contraste deve ir para "baixo"
   - Cores devem ficar pastéis
   - Animações devem reduzir
   - Partículas devem minimizar
3. Salve e jogue - deve estar mais suave
4. Reabra configurações
5. Teste preset "Busca Sensorial":
   - Brilho deve ir para 120%
   - Contraste deve ir para "alto"
   - Cores devem ficar vibrantes
   - Animações devem estar completas
   - Partículas devem intensificar
6. Salve e jogue - deve estar mais intenso
7. Recarregue página (F5)
8. Configurações devem estar mantidas
```

**Resultado esperado:**
- Presets aplicam corretamente
- Mudanças são visíveis imediatamente
- Salvamento funciona
- Persistência funciona após reload

---

## 🐛 PROBLEMAS COMUNS

### Áudio não toca
**Causa:** Navegador bloqueia áudio antes de interação
**Solução:** Clique na página primeiro, depois teste

### Configurações não salvam
**Causa:** localStorage bloqueado ou userId incorreto
**Solução:** 
```javascript
// Verifique localStorage
console.log(localStorage.getItem('sensory_settings_test-user'));

// Limpe e teste novamente
localStorage.clear();
```

### Sistema adaptativo não ajusta
**Causa:** Precisa de 10 tentativas para ajustar
**Solução:** Jogue pelo menos 10 tentativas

### Performance ruim
**Causa:** Muitos efeitos visuais
**Solução:** Use preset "Hipersensível Visual"

---

## 📊 MÉTRICAS PARA ANOTAR

Durante os testes, anote:

### Sistema Adaptativo
- [ ] Quantas tentativas até primeiro ajuste? (esperado: 10)
- [ ] Ajuste aumentou dificuldade quando acurácia > 85%?
- [ ] Ajuste diminuiu dificuldade quando acurácia < 60%?
- [ ] Mensagens apareceram na tela?
- [ ] Mudança de velocidade foi perceptível?

### Feedback Auditivo
- [ ] Sons tocaram imediatamente?
- [ ] Som de combo foi diferente?
- [ ] Som de erro foi suave?
- [ ] Ajuste de volume funcionou?
- [ ] Desativar funcionou?

### Configurações Sensoriais
- [ ] Modal abriu corretamente?
- [ ] Presets aplicaram?
- [ ] Mudanças foram visíveis?
- [ ] Salvamento funcionou?
- [ ] Persistência funcionou após reload?

---

## ✅ CHECKLIST FINAL

Antes de considerar concluído:

- [ ] Sistema adaptativo ajusta dificuldade
- [ ] Mensagens de ajuste aparecem
- [ ] Sons tocam corretamente
- [ ] Volume ajusta
- [ ] Configurações salvam
- [ ] Configurações persistem após reload
- [ ] Presets funcionam
- [ ] Sem erros no console
- [ ] Performance aceitável (>30 FPS)
- [ ] Funciona em Chrome
- [ ] Funciona em Firefox (opcional)

---

## 🎯 PRÓXIMO PASSO

Após testar tudo:

1. ✅ Anote bugs encontrados
2. ✅ Anote melhorias sugeridas
3. ✅ Compartilhe feedback com equipe
4. ✅ Prossiga para integração nos outros jogos

---

## 📞 REPORTAR PROBLEMAS

Se encontrar bugs:

1. Anote o que estava fazendo
2. Copie mensagem de erro do console
3. Tire screenshot se possível
4. Descreva comportamento esperado vs. real
5. Informe navegador e versão

---

**Boa sorte com os testes! 🚀**

*Lembre-se: Estes são sistemas baseados em evidências científicas. Cada ajuste tem um propósito terapêutico específico.*
