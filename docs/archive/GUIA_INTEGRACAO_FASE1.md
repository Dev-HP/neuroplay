# 🔧 Guia de Integração - Fase 1

## 📋 Visão Geral

Este guia mostra como integrar as melhorias da Fase 1 nos jogos restantes e no menu principal.

---

## 1️⃣ INTEGRAR AUDIO FEEDBACK

### Echo Temple

```javascript
// frontend/src/games/EchoTemple/EchoTemple.js

import { getAudioFeedback } from '../../utils/audioFeedback';

function EchoTemple() {
  const audioRef = useRef(null);
  
  useEffect(() => {
    // Inicializa áudio após primeira interação
    const initAudio = async () => {
      if (!audioRef.current) {
        audioRef.current = getAudioFeedback();
        await audioRef.current.init();
      }
    };
    
    // Chama após clique do usuário
    window.addEventListener('click', initAudio, { once: true });
    
    return () => window.removeEventListener('click', initAudio);
  }, []);
  
  // Ao verificar resposta
  const checkAnswer = (userAnswer) => {
    const correct = userAnswer === correctAnswer;
    
    if (correct) {
      audioRef.current?.onCorrectAnswer(combo);
      setScore(s => s + 10);
    } else {
      audioRef.current?.onIncorrectAnswer();
    }
  };
}
```

### Sonic Jump

```javascript
// frontend/src/games/SonicJump/SonicJump.js

import { getAudioFeedback } from '../../utils/audioFeedback';

function SonicJump() {
  const audioRef = useRef(null);
  
  useEffect(() => {
    const initAudio = async () => {
      if (!audioRef.current) {
        audioRef.current = getAudioFeedback();
        await audioRef.current.init();
      }
    };
    
    window.addEventListener('click', initAudio, { once: true });
    return () => window.removeEventListener('click', initAudio);
  }, []);
  
  // Ao pular em plataforma correta
  const handleCorrectJump = () => {
    audioRef.current?.onCorrectAnswer();
    setScore(s => s + 10);
  };
  
  // Ao pular em plataforma errada
  const handleIncorrectJump = () => {
    audioRef.current?.onIncorrectAnswer();
    setLives(l => l - 1);
  };
}
```

### Gravity Lab

```javascript
// frontend/src/games/GravityLab/GravityLab.js

import { getAudioFeedback } from '../../utils/audioFeedback';

function GravityLab() {
  const audioRef = useRef(null);
  
  useEffect(() => {
    const initAudio = async () => {
      if (!audioRef.current) {
        audioRef.current = getAudioFeedback();
        await audioRef.current.init();
      }
    };
    
    window.addEventListener('click', initAudio, { once: true });
    return () => window.removeEventListener('click', initAudio);
  }, []);
  
  // Ao soltar objeto na zona correta
  const handleCorrectDrop = () => {
    audioRef.current?.onCorrectAnswer();
    setScore(s => s + 10);
  };
  
  // Ao soltar objeto na zona errada
  const handleIncorrectDrop = () => {
    audioRef.current?.onIncorrectAnswer();
  };
}
```

---

## 2️⃣ INTEGRAR CONFIGURAÇÕES SENSORIAIS

### Adicionar Botão no Menu Principal

```javascript
// frontend/src/App.js ou componente de menu

import { SensorySettings, loadSensorySettings, applySensorySettings } from './components/SensorySettings';
import { getAudioFeedback } from './utils/audioFeedback';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [sensorySettings, setSensorySettings] = useState(null);
  
  useEffect(() => {
    // Carrega configurações ao iniciar
    const settings = loadSensorySettings(userId);
    setSensorySettings(settings);
    
    // Aplica configurações
    const audio = getAudioFeedback();
    applySensorySettings(settings, null, audio);
  }, [userId]);
  
  const handleSaveSettings = (newSettings) => {
    setSensorySettings(newSettings);
    
    // Aplica em todos os jogos
    const audio = getAudioFeedback();
    applySensorySettings(newSettings, null, audio);
  };
  
  return (
    <div className="app">
      {/* Botão de configurações */}
      <button 
        className="settings-btn"
        onClick={() => setShowSettings(true)}
      >
        ⚙️ Configurações Sensoriais
      </button>
      
      {/* Modal de configurações */}
      {showSettings && (
        <SensorySettings
          userId={userId}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
      
      {/* Resto do app */}
    </div>
  );
}
```

### Aplicar Configurações em Cada Jogo

```javascript
// Em cada componente de jogo

import { loadSensorySettings, applySensorySettings } from '../../components/SensorySettings';
import { getAudioFeedback } from '../../utils/audioFeedback';

function GameComponent() {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    // Carrega e aplica configurações
    const settings = loadSensorySettings(userId);
    const audio = getAudioFeedback();
    
    if (canvasRef.current) {
      applySensorySettings(settings, canvasRef.current, audio);
    }
    
    // Aplica velocidade do jogo
    if (settings.gameplay) {
      game.speed *= settings.gameplay.gameSpeed;
    }
    
    // Aplica efeitos de partículas
    if (settings.visual) {
      if (settings.visual.particleEffects === 'minimal') {
        game.particleIntensity = 0.3;
      } else if (settings.visual.particleEffects === 'off') {
        game.particleIntensity = 0;
      } else if (settings.visual.particleEffects === 'intense') {
        game.particleIntensity = 1.5;
      }
    }
  }, [userId]);
}
```

---

## 3️⃣ INTEGRAR SISTEMA ADAPTATIVO

### Echo Temple

```javascript
// frontend/src/games/EchoTemple/EchoTemple.js

import { AdaptiveDifficulty } from '../CyberRunnerCanvas/adaptiveDifficulty';

function EchoTemple() {
  const adaptiveRef = useRef(null);
  
  useEffect(() => {
    if (!adaptiveRef.current) {
      adaptiveRef.current = new AdaptiveDifficulty();
    }
  }, []);
  
  const handleAnswer = (correct, reactionTime) => {
    const result = adaptiveRef.current.recordAttempt({
      correct,
      reactionTime,
      type: 'memory'
    });
    
    if (result) {
      // Ajusta tamanho da grade ou tempo de retenção
      const params = result.params;
      setGridSize(Math.floor(3 + params.speed / 2)); // 3-8
      setRetentionTime(3000 / params.speed); // 600-3000ms
      
      // Mostra mensagem
      showMessage(result.message);
    }
  };
}
```

### Sonic Jump

```javascript
// frontend/src/games/SonicJump/SonicJump.js

import { AdaptiveDifficulty } from '../CyberRunnerCanvas/adaptiveDifficulty';

function SonicJump() {
  const adaptiveRef = useRef(null);
  
  useEffect(() => {
    if (!adaptiveRef.current) {
      adaptiveRef.current = new AdaptiveDifficulty();
    }
  }, []);
  
  const handleJump = (correct, reactionTime) => {
    const result = adaptiveRef.current.recordAttempt({
      correct,
      reactionTime,
      type: 'phoneme'
    });
    
    if (result) {
      // Ajusta velocidade de queda e frequência de plataformas
      const params = result.params;
      setFallSpeed(params.speed);
      setPlatformFrequency(params.challengeFrequency * 1000);
      
      showMessage(result.message);
    }
  };
}
```

### Gravity Lab

```javascript
// frontend/src/games/GravityLab/GravityLab.js

import { AdaptiveDifficulty } from '../CyberRunnerCanvas/adaptiveDifficulty';

function GravityLab() {
  const adaptiveRef = useRef(null);
  
  useEffect(() => {
    if (!adaptiveRef.current) {
      adaptiveRef.current = new AdaptiveDifficulty();
    }
  }, []);
  
  const handleDrop = (correct, reactionTime) => {
    const result = adaptiveRef.current.recordAttempt({
      correct,
      reactionTime,
      type: 'sorting'
    });
    
    if (result) {
      // Ajusta frequência de mudança de regra
      const params = result.params;
      setRuleChangeFrequency(params.challengeFrequency * 2000);
      
      showMessage(result.message);
    }
  };
}
```

---

## 4️⃣ TESTAR IMPLEMENTAÇÃO

### Checklist de Testes

#### Sistema Adaptativo
- [ ] Jogue 20+ tentativas e verifique se dificuldade ajusta
- [ ] Acerte 90%+ e veja se fica mais difícil
- [ ] Erre 60%+ e veja se fica mais fácil
- [ ] Verifique mensagens de ajuste na tela

#### Feedback Auditivo
- [ ] Teste som de resposta correta
- [ ] Teste som de resposta incorreta
- [ ] Teste som de combo (5+ acertos)
- [ ] Teste som de moeda/power-up
- [ ] Ajuste volume e verifique

#### Configurações Sensoriais
- [ ] Abra modal de configurações
- [ ] Teste preset "Hipersensível Visual"
- [ ] Teste preset "Hipersensível Auditivo"
- [ ] Teste preset "Busca Sensorial"
- [ ] Ajuste brilho e veja mudança
- [ ] Ajuste volume e veja mudança
- [ ] Ajuste velocidade do jogo
- [ ] Salve e recarregue página (deve manter)

---

## 5️⃣ PRÓXIMOS PASSOS

### Curto Prazo (1-2 semanas)
1. Integrar audio feedback em todos os jogos
2. Adicionar botão de configurações no menu
3. Testar com usuários reais
4. Coletar feedback inicial

### Médio Prazo (1 mês)
1. Implementar síntese de fonemas para Sonic Jump
2. Criar arquivos de áudio profissionais
3. Adicionar mais presets sensoriais
4. Implementar lembretes de pausa

### Longo Prazo (2-3 meses)
1. Implementar Fase 2 (Dual N-Back, Conquistas)
2. Criar dashboard para educadores
3. Validar com estudo piloto
4. Publicar resultados

---

## 📊 MÉTRICAS PARA COLETAR

### Durante Desenvolvimento
- Tempo de implementação
- Bugs encontrados
- Performance (FPS, latência)

### Durante Testes
- Tempo médio de sessão
- Frequência de uso
- Taxa de conclusão
- Acurácia média
- Preferências de configuração

### Validação Científica
- BRIEF-2 (pré/pós)
- Vineland-3 (pré/pós)
- SRS-2 (pré/pós)
- System Usability Scale
- Questionário de satisfação

---

## 🐛 TROUBLESHOOTING

### Áudio não funciona
- Verifique se `init()` foi chamado após interação do usuário
- Verifique console para erros
- Teste em navegador diferente

### Configurações não salvam
- Verifique localStorage no DevTools
- Verifique se userId está correto
- Limpe cache e teste novamente

### Sistema adaptativo não ajusta
- Verifique se `recordAttempt()` está sendo chamado
- Verifique console para logs
- Jogue 10+ tentativas (ajusta a cada 10)

### Performance ruim
- Reduza efeitos de partículas
- Desative movimento de fundo
- Reduza velocidade do jogo

---

## 📞 SUPORTE

Se encontrar problemas:
1. Verifique console do navegador
2. Leia documentação dos componentes
3. Consulte `FASE_1_IMPLEMENTADA.md`
4. Entre em contato com a equipe

---

**Documento elaborado por:** Equipe NeuroPlay  
**Data:** 10 de Fevereiro de 2026  
**Versão:** 1.0

*Boa sorte com a integração! 🚀*
