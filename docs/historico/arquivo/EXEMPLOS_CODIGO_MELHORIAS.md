# 💻 Exemplos de Código - Melhorias Científicas

## 📋 Índice

1. [Sistema de Adaptação Dinâmica](#sistema-de-adaptação-dinâmica)
2. [Feedback Auditivo](#feedback-auditivo)
3. [Configurações Sensoriais](#configurações-sensoriais)
4. [Dual N-Back Adaptativo](#dual-n-back-adaptativo)
5. [Síntese de Áudio para Fonemas](#síntese-de-áudio-para-fonemas)
6. [Sistema de Conquistas](#sistema-de-conquistas)
7. [Telemetria Avançada](#telemetria-avançada)

---

## Sistema de Adaptação Dinâmica

### Implementação para Cyber-Runner

```javascript
// frontend/src/games/CyberRunnerCanvas/adaptiveDifficulty.js

export class AdaptiveDifficulty {
  constructor() {
    this.windowSize = 10; // Últimas 10 tentativas
    this.attemptHistory = [];
    this.currentParams = {
      speed: 5,
      challengeFrequency: 0.0008,
      obstacleSpeed: 5,
      gravity: 0.8
    };
  }
  
  // Registra tentativa
  recordAttempt(attempt) {
    this.attemptHistory.push({
      correct: attempt.correct,
      reactionTime: attempt.reactionTime,
      timestamp: Date.now()
    });
    
    // Mantém apenas últimas N tentativas
    if (this.attemptHistory.length > this.windowSize) {
      this.attemptHistory.shift();
    }
    
    // Ajusta a cada 10 tentativas
    if (this.attemptHistory.length === this.windowSize) {
      this.adjustDifficulty();
    }
  }
  
  // Analisa performance
  analyzePerformance() {
    const recentAttempts = this.attemptHistory.slice(-this.windowSize);
    
    const accuracy = recentAttempts.filter(a => a.correct).length / recentAttempts.length;
    const avgReactionTime = recentAttempts.reduce((sum, a) => sum + a.reactionTime, 0) / recentAttempts.length;
    const rtVariability = this.calculateStdDev(recentAttempts.map(a => a.reactionTime));
    
    return { accuracy, avgReactionTime, rtVariability };
  }
  
  // Ajusta dificuldade
  adjustDifficulty() {
    const { accuracy, avgReactionTime } = this.analyzePerformance();
    
    // Zona de Desenvolvimento Proximal (Vygotsky): 60-85% acerto
    if (accuracy > 0.85 && avgReactionTime < 800) {
      // Muito fácil - aumenta dificuldade
      this.currentParams.speed *= 1.1;
      this.currentParams.challengeFrequency *= 1.2;
      this.currentParams.obstacleSpeed *= 1.05;
      console.log('📈 Dificuldade aumentada');
    } else if (accuracy < 0.60 || avgReactionTime > 2000) {
      // Muito difícil - reduz dificuldade
      this.currentParams.speed *= 0.9;
      this.currentParams.challengeFrequency *= 0.8;
      this.currentParams.obstacleSpeed *= 0.95;
      this.currentParams.gravity *= 0.95;
      console.log('📉 Dificuldade reduzida');
    } else {
      console.log('✅ Dificuldade ideal mantida');
    }
    
    // Limites
    this.currentParams.speed = Math.max(3, Math.min(this.currentParams.speed, 15));
    this.currentParams.challengeFrequency = Math.max(0.0003, Math.min(this.currentParams.challengeFrequency, 0.003));
  }
  
  // Calcula desvio padrão
  calculateStdDev(values) {
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squareDiffs = values.map(v => Math.pow(v - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((sum, v) => sum + v, 0) / values.length;
    return Math.sqrt(avgSquareDiff);
  }
  
  // Retorna parâmetros atuais
  getParams() {
    return { ...this.currentParams };
  }
}

// Uso no jogo
const adaptiveSystem = new AdaptiveDifficulty();

// Quando jogador responde a desafio
const handleChallengeResponse = (correct, reactionTime) => {
  adaptiveSystem.recordAttempt({ correct, reactionTime });
  const newParams = adaptiveSystem.getParams();
  
  // Aplica novos parâmetros
  game.speed = newParams.speed;
  game.challengeFrequency = newParams.challengeFrequency;
  // ... etc
};
```

---

## Feedback Auditivo

### Sistema de Áudio com Web Audio API

```javascript
// frontend/src/utils/audioFeedback.js

export class AudioFeedback {
  constructor() {
    this.sounds = {};
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.masterVolume = 0.7;
    this.enabled = true;
  }
  
  // Carrega sons
  async loadSounds() {
    const soundFiles = {
      correct: '/sounds/success-chime.mp3',
      incorrect: '/sounds/gentle-buzz.mp3',
      combo: '/sounds/combo-boost.mp3',
      powerup: '/sounds/powerup-collect.mp3',
      levelup: '/sounds/level-complete.mp3',
      achievement: '/sounds/achievement-unlock.mp3'
    };
    
    for (const [name, url] of Object.entries(soundFiles)) {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.sounds[name] = audioBuffer;
      } catch (error) {
        console.warn(`Failed to load sound: ${name}`, error);
      }
    }
  }
  
  // Toca som
  play(soundName, volume = 1.0, playbackRate = 1.0) {
    if (!this.enabled || !this.sounds[soundName]) return;
    
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = this.sounds[soundName];
    source.playbackRate.value = playbackRate;
    
    gainNode.gain.value = this.masterVolume * volume;
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    source.start(0);
  }
  
  // Feedback contextual
  onCorrectAnswer(combo = 0) {
    this.play('correct', 0.8);
    
    // Som especial para combos
    if (combo >= 5) {
      setTimeout(() => this.play('combo', 0.6, 1.2), 100);
    }
  }
  
  onIncorrectAnswer() {
    // Som suave, não punitivo
    this.play('incorrect', 0.4, 0.9);
  }
  
  onPowerUpCollected() {
    this.play('powerup', 0.9, 1.1);
  }
  
  onLevelComplete() {
    this.play('levelup', 1.0);
  }
  
  onAchievementUnlocked() {
    this.play('achievement', 0.9);
  }
  
  // Controles
  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }
  
  setEnabled(enabled) {
    this.enabled = enabled;
  }
}

// Uso no jogo
const audioFeedback = new AudioFeedback();
await audioFeedback.loadSounds();

// Quando jogador acerta
if (correct) {
  audioFeedback.onCorrectAnswer(currentCombo);
  setScore(s => s + 50);
} else {
  audioFeedback.onIncorrectAnswer();
}
```

---


## Configurações Sensoriais

### Componente React para Configurações

```javascript
// frontend/src/components/SensorySettings.js

import React, { useState, useEffect } from 'react';
import './SensorySettings.css';

export function SensorySettings({ userId, onSave }) {
  const [settings, setSettings] = useState({
    visual: {
      brightness: 100,
      contrast: 'normal',
      colorScheme: 'vibrant',
      animations: 'full',
      particleEffects: 'normal'
    },
    auditory: {
      masterVolume: 70,
      soundEffects: true,
      backgroundMusic: false
    },
    gameplay: {
      gameSpeed: 1.0,
      pauseReminders: true,
      pauseInterval: 10
    }
  });
  
  // Carrega configurações salvas
  useEffect(() => {
    const saved = localStorage.getItem(`sensory_settings_${userId}`);
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, [userId]);
  
  // Atualiza configuração
  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };
  
  // Salva configurações
  const handleSave = () => {
    localStorage.setItem(`sensory_settings_${userId}`, JSON.stringify(settings));
    onSave(settings);
    alert('✅ Configurações salvas!');
  };
  
  // Presets
  const presets = {
    'Hipersensível Visual': {
      visual: {
        brightness: 70,
        contrast: 'low',
        colorScheme: 'pastel',
        animations: 'reduced',
        particleEffects: 'minimal'
      }
    },
    'Hipersensível Auditivo': {
      auditory: {
        masterVolume: 40,
        soundEffects: false,
        backgroundMusic: false
      }
    },
    'Busca Sensorial': {
      visual: {
        brightness: 120,
        contrast: 'high',
        colorScheme: 'vibrant',
        animations: 'full',
        particleEffects: 'intense'
      },
      auditory: {
        masterVolume: 90,
        soundEffects: true,
        backgroundMusic: true
      }
    }
  };
  
  const applyPreset = (presetName) => {
    setSettings(prev => ({
      ...prev,
      ...presets[presetName]
    }));
  };
  
  return (
    <div className="sensory-settings">
      <h2>⚙️ Configurações Sensoriais</h2>
      
      {/* Presets */}
      <section className="presets">
        <h3>Perfis Pré-Configurados</h3>
        <div className="preset-buttons">
          {Object.keys(presets).map(presetName => (
            <button 
              key={presetName}
              onClick={() => applyPreset(presetName)}
              className="preset-btn"
            >
              {presetName}
            </button>
          ))}
        </div>
      </section>
      
      {/* Visual */}
      <section className="setting-group">
        <h3>👁️ Visual</h3>
        
        <div className="setting-item">
          <label>
            Brilho
            <input 
              type="range" 
              min="50" 
              max="150" 
              value={settings.visual.brightness}
              onChange={(e) => updateSetting('visual', 'brightness', parseInt(e.target.value))}
            />
            <span className="value">{settings.visual.brightness}%</span>
          </label>
        </div>
        
        <div className="setting-item">
          <label>
            Esquema de Cores
            <select 
              value={settings.visual.colorScheme}
              onChange={(e) => updateSetting('visual', 'colorScheme', e.target.value)}
            >
              <option value="vibrant">Vibrante</option>
              <option value="pastel">Pastel (Suave)</option>
              <option value="monochrome">Monocromático</option>
            </select>
          </label>
        </div>
        
        <div className="setting-item">
          <label>
            Animações
            <select 
              value={settings.visual.animations}
              onChange={(e) => updateSetting('visual', 'animations', e.target.value)}
            >
              <option value="full">Completas</option>
              <option value="reduced">Reduzidas</option>
              <option value="none">Desativadas</option>
            </select>
          </label>
        </div>
      </section>
      
      {/* Auditivo */}
      <section className="setting-group">
        <h3>🔊 Auditivo</h3>
        
        <div className="setting-item">
          <label>
            Volume Geral
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={settings.auditory.masterVolume}
              onChange={(e) => updateSetting('auditory', 'masterVolume', parseInt(e.target.value))}
            />
            <span className="value">{settings.auditory.masterVolume}%</span>
          </label>
        </div>
        
        <div className="setting-item">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={settings.auditory.soundEffects}
              onChange={(e) => updateSetting('auditory', 'soundEffects', e.target.checked)}
            />
            Efeitos Sonoros
          </label>
        </div>
        
        <div className="setting-item">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={settings.auditory.backgroundMusic}
              onChange={(e) => updateSetting('auditory', 'backgroundMusic', e.target.checked)}
            />
            Música de Fundo
          </label>
        </div>
      </section>
      
      {/* Gameplay */}
      <section className="setting-group">
        <h3>🎮 Gameplay</h3>
        
        <div className="setting-item">
          <label>
            Velocidade do Jogo
            <input 
              type="range" 
              min="0.5" 
              max="2.0" 
              step="0.1"
              value={settings.gameplay.gameSpeed}
              onChange={(e) => updateSetting('gameplay', 'gameSpeed', parseFloat(e.target.value))}
            />
            <span className="value">{settings.gameplay.gameSpeed}x</span>
          </label>
        </div>
        
        <div className="setting-item">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={settings.gameplay.pauseReminders}
              onChange={(e) => updateSetting('gameplay', 'pauseReminders', e.target.checked)}
            />
            Lembretes de Pausa
          </label>
        </div>
      </section>
      
      {/* Botões */}
      <div className="actions">
        <button onClick={handleSave} className="btn-primary">
          💾 Salvar Configurações
        </button>
        <button onClick={() => setSettings(defaultSettings)} className="btn-secondary">
          🔄 Restaurar Padrões
        </button>
      </div>
    </div>
  );
}

// Aplicar configurações no jogo
export function applySettings(settings, gameRef) {
  // Visual
  const canvas = gameRef.current.canvas;
  canvas.style.filter = `brightness(${settings.visual.brightness}%)`;
  
  // Partículas
  if (settings.visual.particleEffects === 'minimal') {
    gameRef.current.particleIntensity = 0.3;
  } else if (settings.visual.particleEffects === 'intense') {
    gameRef.current.particleIntensity = 1.5;
  }
  
  // Áudio
  if (gameRef.current.audioFeedback) {
    gameRef.current.audioFeedback.setVolume(settings.auditory.masterVolume / 100);
    gameRef.current.audioFeedback.setEnabled(settings.auditory.soundEffects);
  }
  
  // Gameplay
  gameRef.current.gameSpeed *= settings.gameplay.gameSpeed;
}
```

---


## Dual N-Back Adaptativo

### Implementação para Echo Temple

```javascript
// frontend/src/games/EchoTemple/dualNBack.js

export class DualNBack {
  constructor() {
    this.nLevel = 2; // Começa em 2-back
    this.visualSequence = [];
    this.auditorySequence = [];
    this.sounds = ['do', 're', 'mi', 'fa', 'sol', 'la', 'si'];
    this.performanceHistory = [];
  }
  
  // Gera sequência
  generateSequence(length) {
    this.visualSequence = [];
    this.auditorySequence = [];
    
    for (let i = 0; i < length; i++) {
      // Posição visual
      this.visualSequence.push({
        col: Math.floor(Math.random() * 5),
        row: Math.floor(Math.random() * 5)
      });
      
      // Som auditivo
      this.auditorySequence.push(
        this.sounds[Math.floor(Math.random() * this.sounds.length)]
      );
    }
  }
  
  // Verifica se há match N-back
  checkVisualMatch(currentIndex) {
    if (currentIndex < this.nLevel) return false;
    
    const current = this.visualSequence[currentIndex];
    const nBack = this.visualSequence[currentIndex - this.nLevel];
    
    return current.col === nBack.col && current.row === nBack.row;
  }
  
  checkAuditoryMatch(currentIndex) {
    if (currentIndex < this.nLevel) return false;
    
    return this.auditorySequence[currentIndex] === 
           this.auditorySequence[currentIndex - this.nLevel];
  }
  
  // Registra performance
  recordPerformance(visualCorrect, auditoryCorrect) {
    this.performanceHistory.push({
      nLevel: this.nLevel,
      visualCorrect,
      auditoryCorrect,
      timestamp: Date.now()
    });
    
    // Mantém últimas 20 tentativas
    if (this.performanceHistory.length > 20) {
      this.performanceHistory.shift();
    }
    
    // Ajusta N a cada 10 tentativas
    if (this.performanceHistory.length >= 10 && 
        this.performanceHistory.length % 10 === 0) {
      this.adjustN();
    }
  }
  
  // Ajusta nível N
  adjustN() {
    const recent = this.performanceHistory.slice(-10);
    
    const visualAccuracy = recent.filter(p => p.visualCorrect).length / recent.length;
    const auditoryAccuracy = recent.filter(p => p.auditoryCorrect).length / recent.length;
    const overallAccuracy = (visualAccuracy + auditoryAccuracy) / 2;
    
    if (overallAccuracy > 0.85 && this.nLevel < 5) {
      this.nLevel++;
      console.log(`📈 N-back aumentado para ${this.nLevel}`);
      return `Nível aumentado para ${this.nLevel}-back! 🎉`;
    } else if (overallAccuracy < 0.60 && this.nLevel > 1) {
      this.nLevel--;
      console.log(`📉 N-back reduzido para ${this.nLevel}`);
      return `Nível ajustado para ${this.nLevel}-back`;
    }
    
    return null;
  }
  
  // Toca som
  playSound(sound) {
    // Usar Web Audio API ou Tone.js
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Frequências das notas
    const frequencies = {
      'do': 261.63,
      're': 293.66,
      'mi': 329.63,
      'fa': 349.23,
      'sol': 392.00,
      'la': 440.00,
      'si': 493.88
    };
    
    oscillator.frequency.value = frequencies[sound];
    oscillator.type = 'sine';
    
    gainNode.gain.value = 0.3;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  }
}

// Uso no jogo
const dualNBack = new DualNBack();

// Fase de codificação
const showSequence = async () => {
  dualNBack.generateSequence(10);
  
  for (let i = 0; i < dualNBack.visualSequence.length; i++) {
    // Mostra posição visual
    highlightPosition(dualNBack.visualSequence[i]);
    
    // Toca som auditivo
    dualNBack.playSound(dualNBack.auditorySequence[i]);
    
    await sleep(1500); // 1.5s entre estímulos
  }
};

// Fase de recuperação
const handleUserResponse = (index, visualMatch, auditoryMatch) => {
  const actualVisualMatch = dualNBack.checkVisualMatch(index);
  const actualAuditoryMatch = dualNBack.checkAuditoryMatch(index);
  
  const visualCorrect = visualMatch === actualVisualMatch;
  const auditoryCorrect = auditoryMatch === actualAuditoryMatch;
  
  dualNBack.recordPerformance(visualCorrect, auditoryCorrect);
  
  const message = dualNBack.adjustN();
  if (message) showMessage(message);
};
```

---

## Síntese de Áudio para Fonemas

### Implementação para Sonic Jump

```javascript
// frontend/src/games/SonicJump/phonemeSynthesizer.js

import * as Tone from 'tone';

export class PhonemeSynthesizer {
  constructor() {
    this.synth = new Tone.PolySynth(Tone.FMSynth).toDestination();
    
    // Parâmetros de formantes para cada fonema
    this.phonemes = {
      '/B/': { 
        f1: 700, 
        f2: 1220, 
        duration: 0.15,
        type: 'plosive',
        voiced: true
      },
      '/P/': { 
        f1: 700, 
        f2: 1220, 
        duration: 0.10,
        type: 'plosive',
        voiced: false,
        aspirated: true
      },
      '/D/': { 
        f1: 400, 
        f2: 1700, 
        duration: 0.15,
        type: 'plosive',
        voiced: true
      },
      '/T/': { 
        f1: 400, 
        f2: 1700, 
        duration: 0.10,
        type: 'plosive',
        voiced: false,
        aspirated: true
      },
      '/V/': { 
        f1: 570, 
        f2: 840, 
        duration: 0.20,
        type: 'fricative',
        voiced: true
      },
      '/F/': { 
        f1: 570, 
        f2: 840, 
        duration: 0.20,
        type: 'fricative',
        voiced: false
      },
      '/S/': { 
        f1: 200, 
        f2: 5000, 
        duration: 0.25,
        type: 'fricative',
        voiced: false
      },
      '/Z/': { 
        f1: 200, 
        f2: 5000, 
        duration: 0.25,
        type: 'fricative',
        voiced: true
      }
    };
    
    // Alternativa: Usar samples de áudio pré-gravados
    this.audioSamples = {};
  }
  
  // Carrega samples de áudio
  async loadSamples() {
    const phonemeList = Object.keys(this.phonemes);
    
    for (const phoneme of phonemeList) {
      const letter = phoneme.replace(/\//g, '').toLowerCase();
      try {
        const audio = new Audio(`/sounds/phonemes/${letter}.mp3`);
        await audio.load();
        this.audioSamples[phoneme] = audio;
      } catch (error) {
        console.warn(`Failed to load phoneme: ${phoneme}`, error);
      }
    }
  }
  
  // Toca fonema usando síntese
  playPhonemeSynthesized(phoneme) {
    const params = this.phonemes[phoneme];
    if (!params) return;
    
    const now = Tone.now();
    
    if (params.type === 'plosive') {
      // Plosivas: burst rápido
      this.synth.triggerAttackRelease(params.f1, params.duration, now, 0.5);
      
      if (params.aspirated) {
        // Adiciona aspiração (ruído)
        const noise = new Tone.Noise('white').toDestination();
        noise.start(now);
        noise.stop(now + 0.05);
      }
    } else if (params.type === 'fricative') {
      // Fricativas: ruído contínuo
      if (params.voiced) {
        // Fricativa sonora: tom + ruído
        this.synth.triggerAttackRelease(params.f1, params.duration, now, 0.3);
        
        const noise = new Tone.Noise('pink').toDestination();
        noise.volume.value = -20;
        noise.start(now);
        noise.stop(now + params.duration);
      } else {
        // Fricativa surda: apenas ruído
        const noise = new Tone.Noise('white').toDestination();
        noise.volume.value = -15;
        noise.start(now);
        noise.stop(now + params.duration);
      }
    }
    
    // Segundo formante
    setTimeout(() => {
      this.synth.triggerAttackRelease(params.f2, params.duration * 0.7, now + 0.05, 0.2);
    }, 50);
  }
  
  // Toca fonema usando sample
  playPhonemeSample(phoneme) {
    const audio = this.audioSamples[phoneme];
    if (!audio) {
      console.warn(`No sample for phoneme: ${phoneme}`);
      return;
    }
    
    audio.currentTime = 0;
    audio.play();
  }
  
  // Método principal
  playPhoneme(phoneme, useSamples = true) {
    if (useSamples && this.audioSamples[phoneme]) {
      this.playPhonemeSample(phoneme);
    } else {
      this.playPhonemeSynthesized(phoneme);
    }
  }
}

// Uso no jogo
const synthesizer = new PhonemeSynthesizer();
await synthesizer.loadSamples();

// Quando mostra desafio
const showPhonemeChallenge = (phoneme) => {
  // Toca som
  synthesizer.playPhoneme(phoneme.sound);
  
  // Mostra visual
  setCurrentSound(phoneme);
  game.showingSound = true;
  game.soundTimer = 180;
};
```

---


## Sistema de Conquistas

### Implementação Global

```javascript
// frontend/src/store/achievementsStore.js

export const achievements = [
  {
    id: 'first_game',
    name: 'Primeira Aventura',
    description: 'Complete seu primeiro jogo',
    icon: '🎮',
    points: 10,
    category: 'iniciante',
    condition: (stats) => stats.gamesPlayed >= 1
  },
  {
    id: 'streak_7',
    name: 'Dedicação',
    description: 'Jogue 7 dias seguidos',
    icon: '🔥',
    points: 50,
    category: 'engajamento',
    condition: (stats) => stats.consecutiveDays >= 7
  },
  {
    id: 'perfect_score',
    name: 'Perfeição',
    description: 'Acerte 100% em um jogo',
    icon: '⭐',
    points: 30,
    category: 'maestria',
    condition: (stats) => stats.perfectGames >= 1
  },
  {
    id: 'math_master',
    name: 'Mestre da Matemática',
    description: 'Acerte 10 desafios matemáticos seguidos',
    icon: '🧮',
    points: 40,
    category: 'maestria',
    condition: (stats) => stats.mathStreak >= 10
  },
  {
    id: 'speed_demon',
    name: 'Velocista',
    description: 'Alcance velocidade 10x',
    icon: '⚡',
    points: 35,
    category: 'maestria',
    condition: (stats) => stats.maxSpeed >= 10
  },
  {
    id: 'combo_king',
    name: 'Rei do Combo',
    description: 'Alcance combo de 20',
    icon: '👑',
    points: 45,
    category: 'maestria',
    condition: (stats) => stats.maxCombo >= 20
  },
  {
    id: 'memory_champion',
    name: 'Campeão da Memória',
    description: 'Alcance 5-back no Echo Temple',
    icon: '🧠',
    points: 60,
    category: 'maestria',
    condition: (stats) => stats.maxNBack >= 5
  },
  {
    id: 'phoneme_expert',
    name: 'Expert em Fonemas',
    description: 'Acerte todos os 8 fonemas em uma sessão',
    icon: '🎵',
    points: 50,
    category: 'maestria',
    condition: (stats) => stats.phonemesCorrect >= 8
  },
  {
    id: 'flexible_mind',
    name: 'Mente Flexível',
    description: 'Complete 5 mudanças de regra sem erros',
    icon: '🔄',
    points: 55,
    category: 'maestria',
    condition: (stats) => stats.ruleChangesCorrect >= 5
  }
];

export class AchievementSystem {
  constructor(userId) {
    this.userId = userId;
    this.unlockedAchievements = this.loadUnlocked();
    this.userStats = this.loadStats();
  }
  
  // Carrega conquistas desbloqueadas
  loadUnlocked() {
    const saved = localStorage.getItem(`achievements_${this.userId}`);
    return saved ? JSON.parse(saved) : [];
  }
  
  // Carrega estatísticas do usuário
  loadStats() {
    const saved = localStorage.getItem(`user_stats_${this.userId}`);
    return saved ? JSON.parse(saved) : {
      gamesPlayed: 0,
      consecutiveDays: 0,
      perfectGames: 0,
      mathStreak: 0,
      maxSpeed: 0,
      maxCombo: 0,
      maxNBack: 0,
      phonemesCorrect: 0,
      ruleChangesCorrect: 0
    };
  }
  
  // Atualiza estatísticas
  updateStats(newStats) {
    this.userStats = { ...this.userStats, ...newStats };
    localStorage.setItem(`user_stats_${this.userId}`, JSON.stringify(this.userStats));
    this.checkAchievements();
  }
  
  // Verifica conquistas
  checkAchievements() {
    const newlyUnlocked = [];
    
    achievements.forEach(achievement => {
      // Já desbloqueada?
      if (this.unlockedAchievements.includes(achievement.id)) {
        return;
      }
      
      // Verifica condição
      if (achievement.condition(this.userStats)) {
        this.unlockAchievement(achievement);
        newlyUnlocked.push(achievement);
      }
    });
    
    return newlyUnlocked;
  }
  
  // Desbloqueia conquista
  unlockAchievement(achievement) {
    this.unlockedAchievements.push(achievement.id);
    localStorage.setItem(
      `achievements_${this.userId}`, 
      JSON.stringify(this.unlockedAchievements)
    );
    
    console.log(`🏆 Conquista desbloqueada: ${achievement.name}`);
    this.showNotification(achievement);
  }
  
  // Mostra notificação
  showNotification(achievement) {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-content">
        <div class="achievement-title">Conquista Desbloqueada!</div>
        <div class="achievement-name">${achievement.name}</div>
        <div class="achievement-points">+${achievement.points} pontos</div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animação
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 500);
    }, 4000);
    
    // Som
    const audio = new Audio('/sounds/achievement-unlock.mp3');
    audio.play();
  }
  
  // Retorna progresso
  getProgress() {
    const total = achievements.length;
    const unlocked = this.unlockedAchievements.length;
    const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);
    const earnedPoints = achievements
      .filter(a => this.unlockedAchievements.includes(a.id))
      .reduce((sum, a) => sum + a.points, 0);
    
    return {
      unlocked,
      total,
      percentage: (unlocked / total) * 100,
      earnedPoints,
      totalPoints
    };
  }
  
  // Retorna conquistas por categoria
  getByCategory(category) {
    return achievements.filter(a => a.category === category);
  }
}

// Uso no jogo
const achievementSystem = new AchievementSystem(userId);

// Após cada jogo
const handleGameEnd = (gameStats) => {
  achievementSystem.updateStats({
    gamesPlayed: achievementSystem.userStats.gamesPlayed + 1,
    maxCombo: Math.max(achievementSystem.userStats.maxCombo, gameStats.maxCombo),
    maxSpeed: Math.max(achievementSystem.userStats.maxSpeed, gameStats.maxSpeed),
    // ... etc
  });
  
  const newAchievements = achievementSystem.checkAchievements();
  if (newAchievements.length > 0) {
    console.log(`🎉 ${newAchievements.length} nova(s) conquista(s)!`);
  }
};
```

### CSS para Notificações

```css
/* frontend/src/components/AchievementNotification.css */

.achievement-notification {
  position: fixed;
  top: 20px;
  right: -400px;
  width: 350px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 15px;
  transition: right 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  z-index: 10000;
}

.achievement-notification.show {
  right: 20px;
}

.achievement-icon {
  font-size: 48px;
  animation: bounce 0.6s ease-in-out;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.achievement-content {
  flex: 1;
  color: white;
}

.achievement-title {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.9;
  margin-bottom: 5px;
}

.achievement-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.achievement-points {
  font-size: 14px;
  color: #ffd700;
  font-weight: bold;
}
```

---

## Telemetria Avançada

### Backend Python

```python
# backend/telemetry_advanced.py

import time
import numpy as np
from datetime import datetime
from typing import Dict, List, Optional

class AdvancedTelemetry:
    """
    Sistema de telemetria avançada para coleta de dados científicos
    """
    
    def __init__(self, db_connection):
        self.db = db_connection
        self.anxiety_threshold = 0.7
        self.flow_threshold = 0.75
    
    def log_cognitive_event(self, event_data: Dict) -> Dict:
        """
        Registra evento cognitivo com timestamp preciso
        
        Args:
            event_data: Dicionário com dados do evento
            
        Returns:
            Evento processado com métricas adicionais
        """
        event = {
            'timestamp': time.time_ns(),  # Nanosegundos para precisão
            'user_id': event_data['user_id'],
            'game_module': event_data['game'],
            'event_type': event_data['type'],
            'reaction_time_ms': event_data.get('reaction_time'),
            'was_correct': event_data.get('correct'),
            'difficulty_level': event_data.get('difficulty'),
            'stimulus_type': event_data.get('stimulus'),
            'context': event_data.get('context', {}),
            
            # Métricas de estado inferidas
            'anxiety_score': self.calculate_anxiety(event_data),
            'flow_state': self.detect_flow(event_data),
            'fatigue_level': self.estimate_fatigue(event_data)
        }
        
        # Salva no banco
        self.save_event(event)
        
        return event
    
    def calculate_anxiety(self, event_data: Dict) -> float:
        """
        Calcula score de ansiedade baseado em:
        - Variabilidade de tempo de reação
        - Taxa de erro súbita
        - Padrões de hesitação
        """
        recent_rts = event_data.get('recent_reaction_times', [])
        recent_accuracy = event_data.get('recent_accuracy', 1.0)
        
        if len(recent_rts) < 3:
            return 0.0
        
        # Variabilidade de RT (maior = mais ansioso)
        rt_variability = np.std(recent_rts) / np.mean(recent_rts) if np.mean(recent_rts) > 0 else 0
        
        # Taxa de erro
        error_rate = 1 - recent_accuracy
        
        # Score combinado (0-1)
        anxiety_score = (rt_variability * 0.5) + (error_rate * 0.5)
        
        return min(1.0, anxiety_score)
    
    def detect_flow(self, event_data: Dict) -> bool:
        """
        Detecta estado de flow baseado em:
        - Acurácia consistente (70-85%)
        - Tempo de reação estável
        - Engajamento contínuo
        """
        recent_accuracy = event_data.get('recent_accuracy', 0)
        recent_rts = event_data.get('recent_reaction_times', [])
        
        if len(recent_rts) < 5:
            return False
        
        # Acurácia na zona ideal
        accuracy_in_zone = 0.70 <= recent_accuracy <= 0.85
        
        # Estabilidade de RT
        rt_stability = 1 - (np.std(recent_rts) / np.mean(recent_rts)) if np.mean(recent_rts) > 0 else 0
        
        # Flow = acurácia ideal + RT estável
        in_flow = accuracy_in_zone and (rt_stability > self.flow_threshold)
        
        return in_flow
    
    def estimate_fatigue(self, event_data: Dict) -> float:
        """
        Estima fadiga baseado em:
        - Aumento gradual de RT
        - Queda de acurácia
        - Tempo de sessão
        """
        session_duration = event_data.get('session_duration_minutes', 0)
        recent_rts = event_data.get('recent_reaction_times', [])
        recent_accuracy = event_data.get('recent_accuracy', 1.0)
        
        # Fadiga aumenta com tempo
        time_fatigue = min(1.0, session_duration / 30)  # Máximo em 30 min
        
        # Fadiga aumenta com RT crescente
        if len(recent_rts) >= 10:
            first_half = np.mean(recent_rts[:5])
            second_half = np.mean(recent_rts[5:])
            rt_increase = (second_half - first_half) / first_half if first_half > 0 else 0
            rt_fatigue = min(1.0, max(0, rt_increase))
        else:
            rt_fatigue = 0
        
        # Fadiga aumenta com queda de acurácia
        accuracy_fatigue = max(0, 1 - recent_accuracy)
        
        # Score combinado
        fatigue_score = (time_fatigue * 0.4) + (rt_fatigue * 0.3) + (accuracy_fatigue * 0.3)
        
        return min(1.0, fatigue_score)
    
    def save_event(self, event: Dict):
        """Salva evento no banco de dados"""
        query = """
        INSERT INTO cognitive_events (
            timestamp, user_id, game_module, event_type,
            reaction_time_ms, was_correct, difficulty_level,
            stimulus_type, context, anxiety_score, flow_state, fatigue_level
        ) VALUES (
            %(timestamp)s, %(user_id)s, %(game_module)s, %(event_type)s,
            %(reaction_time_ms)s, %(was_correct)s, %(difficulty_level)s,
            %(stimulus_type)s, %(context)s, %(anxiety_score)s, %(flow_state)s, %(fatigue_level)s
        )
        """
        self.db.execute(query, event)
    
    def get_session_summary(self, user_id: int, session_id: str) -> Dict:
        """
        Gera resumo da sessão com métricas agregadas
        """
        query = """
        SELECT 
            COUNT(*) as total_events,
            AVG(reaction_time_ms) as avg_rt,
            STDDEV(reaction_time_ms) as rt_variability,
            AVG(CASE WHEN was_correct THEN 1 ELSE 0 END) as accuracy,
            AVG(anxiety_score) as avg_anxiety,
            SUM(CASE WHEN flow_state THEN 1 ELSE 0 END) / COUNT(*) as flow_percentage,
            AVG(fatigue_level) as avg_fatigue
        FROM cognitive_events
        WHERE user_id = %s AND session_id = %s
        """
        
        result = self.db.fetchone(query, (user_id, session_id))
        
        return {
            'total_events': result['total_events'],
            'avg_reaction_time_ms': result['avg_rt'],
            'rt_variability': result['rt_variability'],
            'accuracy': result['accuracy'],
            'avg_anxiety': result['avg_anxiety'],
            'flow_percentage': result['flow_percentage'],
            'avg_fatigue': result['avg_fatigue']
        }
```

---

**Documento criado:** 10 de Fevereiro de 2026  
**Versão:** 1.0  
**Status:** Completo

Para mais detalhes, consulte `NEUROPLAY_2.0_MELHORIAS_CIENTIFICAS.md`
