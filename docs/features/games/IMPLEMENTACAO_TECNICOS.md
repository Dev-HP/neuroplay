# Guia Técnico de Implementação - NeuroPlay 2.0
## Especificações Detalhadas dos Módulos de Jogos

---

## 🎮 MÓDULO 1: CYBER-RUNNER

### Arquitetura do Componente

```javascript
// frontend/src/games/CyberRunner/CyberRunner.js

import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { useGameStore } from '../../store/gameStore';
import { useAdaptiveAI } from '../../hooks/useAdaptiveAI';

export default function CyberRunner() {
  const { difficulty, updateScore } = useGameStore();
  const { adjustDifficulty } = useAdaptiveAI();
  
  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
      <Physics gravity={[0, -9.81, 0]}>
        <RunnerTrack difficulty={difficulty} />
        <PlayerCharacter onCollision={handleCollision} />
        <ObstacleGenerator type="go-nogo" />
        <MathPortalSystem interval={45000} />
      </Physics>
      
      <EffectsComposer>
        <Bloom intensity={0.5} />
        <DepthOfField focusDistance={0.01} />
      </EffectsComposer>
    </Canvas>
  );
}
```

### Sistema de Geração Procedural

```javascript
// frontend/src/games/CyberRunner/TrackGenerator.js

class ProceduralTrackGenerator {
  constructor(seed, difficulty) {
    this.seed = seed;
    this.difficulty = difficulty;
    this.chunkSize = 50; // metros
    this.obstaclePatterns = this.generatePatterns();
  }
  
  generatePatterns() {
    // Padrões baseados em dificuldade
    const patterns = {
      easy: [
        { type: 'go', spacing: 5, speed: 1.0 },
        { type: 'nogo', spacing: 8, speed: 1.0 }
      ],
      medium: [
        { type: 'go', spacing: 3, speed: 1.3 },
        { type: 'nogo', spacing: 4, speed: 1.3 },
        { type: 'mixed', spacing: 2, speed: 1.5 }
      ],
      hard: [
        { type: 'rapid-fire', spacing: 1.5, speed: 1.8 },
        { type: 'fake-out', spacing: 2, speed: 2.0 }
      ]
    };
    
    return patterns[this.difficulty] || patterns.easy;
  }
  
  generateChunk(position) {
    const chunk = {
      obstacles: [],
      collectibles: [],
      mathPortals: []
    };
    
    // Gera obstáculos baseado em padrões
    this.obstaclePatterns.forEach(pattern => {
      const count = Math.floor(this.chunkSize / pattern.spacing);
      
      for (let i = 0; i < count; i++) {
        chunk.obstacles.push({
          type: pattern.type,
          position: [
            position.x,
            0,
            position.z + (i * pattern.spacing)
          ],
          speed: pattern.speed
        });
      }
    });
    
    return chunk;
  }
}
```

### Sistema Go/No-Go com Telemetria

```javascript
// frontend/src/games/CyberRunner/GoNoGoSystem.js

import { useEffect, useRef } from 'react';
import { useTelemetry } from '../../hooks/useTelemetry';

export function useGoNoGoDetection() {
  const { logEvent } = useTelemetry();
  const reactionStartTime = useRef(null);
  
  const handleObstacleAppear = (obstacle) => {
    reactionStartTime.current = performance.now();
    
    // Visual cue
    if (obstacle.type === 'go') {
      playSound('go_cue', { volume: 0.5 });
    } else {
      playSound('nogo_cue', { volume: 0.5 });
    }
  };
  
  const handlePlayerAction = (action, obstacle) => {
    const reactionTime = performance.now() - reactionStartTime.current;
    
    const isCorrect = (
      (obstacle.type === 'go' && action === 'jump') ||
      (obstacle.type === 'nogo' && action === 'slide')
    );
    
    // Log telemetria
    logEvent({
      event_type: 'go_nogo_response',
      obstacle_type: obstacle.type,
      player_action: action,
      reaction_time_ms: Math.round(reactionTime),
      was_correct: isCorrect,
      position: obstacle.position,
      timestamp: new Date().toISOString()
    });
    
    return { isCorrect, reactionTime };
  };
  
  return { handleObstacleAppear, handlePlayerAction };
}
```

### Sistema de Matemática (Bullet Time)

```javascript
// frontend/src/games/CyberRunner/MathPortalSystem.js

import { useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

export function MathPortalSystem({ interval = 45000 }) {
  const [bulletTimeActive, setBulletTimeActive] = useState(false);
  const [currentEquation, setCurrentEquation] = useState(null);
  
  useEffect(() => {
    const timer = setInterval(() => {
      activateBulletTime();
    }, interval);
    
    return () => clearInterval(timer);
  }, [interval]);
  
  const activateBulletTime = () => {
    // Gera equação baseada em nível
    const equation = generateEquation(difficulty);
    setCurrentEquation(equation);
    setBulletTimeActive(true);
    
    // Desacelera tempo
    gsap.to(gameSpeed, {
      value: 0.3,
      duration: 1,
      ease: 'power2.inOut'
    });
  };
  
  const generateEquation = (difficulty) => {
    const operations = {
      easy: ['+', '-'],
      medium: ['+', '-', '×'],
      hard: ['+', '-', '×', '÷']
    };
    
    const op = operations[difficulty][
      Math.floor(Math.random() * operations[difficulty].length)
    ];
    
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    
    let answer;
    switch(op) {
      case '+': answer = a + b; break;
      case '-': answer = a - b; break;
      case '×': answer = a * b; break;
      case '÷': answer = Math.floor(a / b); break;
    }
    
    // Gera 2 respostas incorretas
    const wrongAnswers = [
      answer + Math.floor(Math.random() * 5) + 1,
      answer - Math.floor(Math.random() * 5) - 1
    ];
    
    return {
      question: `${a} ${op} ${b} = ?`,
      correctAnswer: answer,
      allAnswers: shuffle([answer, ...wrongAnswers])
    };
  };
  
  return bulletTimeActive ? (
    <BulletTimeUI
      equation={currentEquation}
      onAnswer={handleAnswer}
    />
  ) : null;
}
```

---

## 🗺️ MÓDULO 2: TEMPLO DOS ECOS

### Sistema de Memória Espacial

```javascript
// frontend/src/games/EchoTemple/SpatialMemorySystem.js

class SpatialMemoryChallenge {
  constructor(nLevel = 2) {
    this.nLevel = nLevel;
    this.sequence = [];
    this.currentPhase = 'encoding'; // encoding, retention, recall
  }
  
  generateSequence() {
    // Gera sequência de posições
    const directions = ['north', 'south', 'east', 'west'];
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    this.sequence = [];
    for (let i = 0; i < this.nLevel + 2; i++) {
      this.sequence.push({
        direction: directions[Math.floor(Math.random() * directions.length)],
        number: numbers[Math.floor(Math.random() * numbers.length)],
        position: this.directionToPosition(direction)
      });
    }
    
    return this.sequence;
  }
  
  directionToPosition(direction) {
    const positions = {
      north: [0, 0, -5],
      south: [0, 0, 5],
      east: [5, 0, 0],
      west: [-5, 0, 0]
    };
    return positions[direction];
  }
  
  async playEncodingPhase() {
    this.currentPhase = 'encoding';
    
    for (const step of this.sequence) {
      // Ilumina plataforma
      await this.highlightPlatform(step.position, step.number);
      await this.wait(1500); // 1.5s por item
    }
    
    this.currentPhase = 'retention';
    await this.wait(3000); // Período de retenção
    
    this.currentPhase = 'recall';
  }
  
  validateRecall(playerPath) {
    const correct = [];
    const errors = [];
    
    playerPath.forEach((step, index) => {
      const expected = this.sequence[index];
      const isCorrect = (
        step.position[0] === expected.position[0] &&
        step.position[2] === expected.position[2] &&
        step.number === expected.number
      );
      
      if (isCorrect) {
        correct.push(index);
      } else {
        errors.push({
          index,
          expected: expected,
          actual: step
        });
      }
    });
    
    return {
      accuracy: correct.length / this.sequence.length,
      correct,
      errors,
      nLevel: this.nLevel
    };
  }
}
```

### Dual N-Back Adaptativo

```javascript
// frontend/src/games/EchoTemple/DualNBackSystem.js

export class AdaptiveDualNBack {
  constructor() {
    this.currentN = 1;
    this.performanceWindow = [];
    this.windowSize = 5; // Últimas 5 tentativas
    this.thresholdUp = 0.80; // 80% acerto = aumenta N
    this.thresholdDown = 0.50; // <50% acerto = diminui N
  }
  
  recordPerformance(accuracy) {
    this.performanceWindow.push(accuracy);
    
    if (this.performanceWindow.length > this.windowSize) {
      this.performanceWindow.shift();
    }
    
    this.adjustDifficulty();
  }
  
  adjustDifficulty() {
    if (this.performanceWindow.length < this.windowSize) return;
    
    const avgAccuracy = this.performanceWindow.reduce((a, b) => a + b) / this.windowSize;
    
    if (avgAccuracy >= this.thresholdUp && this.currentN < 5) {
      this.currentN++;
      console.log(`N-Back aumentado para ${this.currentN}`);
      this.performanceWindow = []; // Reset window
    } else if (avgAccuracy < this.thresholdDown && this.currentN > 1) {
      this.currentN--;
      console.log(`N-Back reduzido para ${this.currentN}`);
      this.performanceWindow = [];
    }
  }
  
  getCurrentChallenge() {
    return {
      nLevel: this.currentN,
      requiresItemFromNBack: this.currentN > 1,
      itemToCollect: this.getItemFromNBack()
    };
  }
  
  getItemFromNBack() {
    // Retorna item que apareceu N salas atrás
    const history = this.getRoomHistory();
    if (history.length >= this.currentN) {
      return history[history.length - this.currentN].item;
    }
    return null;
  }
}
```

---

## 🎵 MÓDULO 3: ORQUESTRA DAS PLATAFORMAS

### Sistema de Processamento Fonológico

```javascript
// frontend/src/games/SonicJump/PhonemeSystem.js

import * as Tone from 'tone';

export class PhonemeRecognitionSystem {
  constructor() {
    this.phonemes = {
      // Pares mínimos para discriminação
      voiceless: ['p', 't', 'k', 'f', 's'],
      voiced: ['b', 'd', 'g', 'v', 'z']
    };
    
    this.synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.05,
        decay: 0.1,
        sustain: 0.3,
        release: 0.8
      }
    }).toDestination();
  }
  
  async playPhoneme(phoneme) {
    // Síntese de fonema usando formantes
    const formants = this.getFormants(phoneme);
    
    // Cria som usando Web Audio API
    const audioContext = Tone.context;
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    
    oscillator1.frequency.value = formants.f1;
    oscillator2.frequency.value = formants.f2;
    
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.3;
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator1.start();
    oscillator2.start();
    
    await this.wait(500);
    
    oscillator1.stop();
    oscillator2.stop();
  }
  
  getFormants(phoneme) {
    // Frequências formantes aproximadas (Hz)
    const formantMap = {
      'a': { f1: 730, f2: 1090 },
      'e': { f1: 530, f2: 1840 },
      'i': { f1: 270, f2: 2290 },
      'o': { f1: 570, f2: 840 },
      'u': { f1: 300, f2: 870 },
      'p': { f1: 200, f2: 1000 },
      'b': { f1: 200, f2: 1000 },
      't': { f1: 300, f2: 2500 },
      'd': { f1: 300, f2: 2500 },
      'f': { f1: 1200, f2: 2500 },
      'v': { f1: 1200, f2: 2500 },
      's': { f1: 4000, f2: 8000 },
      'z': { f1: 4000, f2: 8000 }
    };
    
    return formantMap[phoneme] || { f1: 500, f2: 1500 };
  }
  
  generateChallenge(difficulty) {
    let phonemePair;
    
    switch(difficulty) {
      case 'easy':
        // Fonemas muito diferentes
        phonemePair = ['a', 'i'];
        break;
      case 'medium':
        // Vogais próximas
        phonemePair = ['e', 'i'];
        break;
      case 'hard':
        // Pares mínimos (vozeado vs. não-vozeado)
        phonemePair = ['p', 'b'];
        break;
    }
    
    const target = phonemePair[Math.floor(Math.random() * 2)];
    const distractors = this.generateDistractors(target, 2);
    
    return {
      targetPhoneme: target,
      allOptions: shuffle([target, ...distractors]),
      formants: this.getFormants(target)
    };
  }
}
```

### Sistema de Física de Plataformas

```javascript
// frontend/src/games/SonicJump/PlatformPhysics.js

import { RigidBody } from '@react-three/rapier';

export function MusicalPlatform({ letter, isCorrect, onLand, onFall }) {
  const [isDestroying, setIsDestroying] = useState(false);
  
  const handleCollision = ({ other }) => {
    if (other.rigidBodyObject?.name === 'player') {
      if (isCorrect) {
        onLand();
        playSound('success_chord');
        triggerParticleExplosion('success');
      } else {
        setIsDestroying(true);
        playSound('error_dissonance');
        destroyPlatform();
        onFall();
      }
    }
  };
  
  const destroyPlatform = () => {
    // Voronoi fracture simulation
    const fragments = generateVoronoiFragments(platformMesh, 20);
    
    fragments.forEach((fragment, i) => {
      setTimeout(() => {
        fragment.applyImpulse({
          x: (Math.random() - 0.5) * 5,
          y: Math.random() * 3,
          z: (Math.random() - 0.5) * 5
        });
      }, i * 50);
    });
  };
  
  return (
    <RigidBody
      type="fixed"
      onCollisionEnter={handleCollision}
    >
      <mesh>
        <boxGeometry args={[3, 0.5, 3]} />
        <meshStandardMaterial
          color={isDestroying ? '#ff0000' : '#00ff00'}
          emissive={isDestroying ? '#ff0000' : '#000000'}
          emissiveIntensity={isDestroying ? 0.5 : 0}
        />
      </mesh>
      
      {/* Letra 3D flutuante */}
      <Text3D
        font="/fonts/helvetiker_bold.json"
        size={1.5}
        height={0.2}
        position={[0, 1, 0]}
      >
        {letter.toUpperCase()}
        <meshStandardMaterial color="#ffffff" />
      </Text3D>
    </RigidBody>
  );
}
```

---

## 🧩 MÓDULO 4: LABORATÓRIO DE GRAVIDADE

### Sistema de Set-Shifting

```javascript
// frontend/src/games/GravityLab/SetShiftingSystem.js

export class SetShiftingChallenge {
  constructor() {
    this.rules = ['color', 'shape', 'size'];
    this.currentRule = 'color';
    this.ruleHistory = [];
    this.switchFrequency = 30000; // 30 segundos
  }
  
  startChallenge() {
    this.ruleTimer = setInterval(() => {
      this.switchRule();
    }, this.switchFrequency);
  }
  
  switchRule() {
    const previousRule = this.currentRule;
    
    // Escolhe nova regra (diferente da atual)
    const availableRules = this.rules.filter(r => r !== this.currentRule);
    this.currentRule = availableRules[
      Math.floor(Math.random() * availableRules.length)
    ];
    
    this.ruleHistory.push({
      from: previousRule,
      to: this.currentRule,
      timestamp: Date.now()
    });
    
    // Feedback visual e auditivo
    this.announceRuleChange();
  }
  
  announceRuleChange() {
    // Alarme sonoro
    playSound('rule_change_alarm');
    
    // Animação de UI
    gsap.from('.rule-display', {
      scale: 0,
      rotation: 360,
      duration: 0.5,
      ease: 'back.out'
    });
    
    // Voz sintética (opcional)
    const utterance = new SpeechSynthesisUtterance(
      `Nova regra: organize por ${this.getRuleDescription()}`
    );
    speechSynthesis.speak(utterance);
  }
  
  getRuleDescription() {
    const descriptions = {
      color: 'COR - Azul com Azul, Vermelho com Vermelho',
      shape: 'FORMA - Quadrado com Quadrado, Círculo com Círculo',
      size: 'TAMANHO - Grande com Grande, Pequeno com Pequeno'
    };
    return descriptions[this.currentRule];
  }
  
  validatePlacement(object1, object2) {
    let isCorrect = false;
    
    switch(this.currentRule) {
      case 'color':
        isCorrect = object1.color === object2.color;
        break;
      case 'shape':
        isCorrect = object1.shape === object2.shape;
        break;
      case 'size':
        isCorrect = object1.size === object2.size;
        break;
    }
    
    // Log telemetria
    this.logSetShiftingEvent({
      rule: this.currentRule,
      object1: object1,
      object2: object2,
      isCorrect: isCorrect,
      reactionTime: Date.now() - this.lastRuleChange
    });
    
    return isCorrect;
  }
}
```

### NPC Emocional

```javascript
// frontend/src/games/GravityLab/EmotionalNPC.js

export class EmotionalRobotNPC {
  constructor() {
    this.emotions = ['happy', 'sad', 'neutral', 'excited', 'frustrated'];
    this.currentEmotion = 'neutral';
    this.expressionIntensity = 0.5;
  }
  
  reactToPerformance(isCorrect, streak) {
    if (isCorrect) {
      if (streak >= 3) {
        this.setEmotion('excited', 1.0);
        this.playAnimation('celebrate');
        this.speak('Incrível! Você está dominando!');
      } else {
        this.setEmotion('happy', 0.7);
        this.playAnimation('thumbs_up');
        this.speak('Muito bem!');
      }
    } else {
      if (streak < -2) {
        this.setEmotion('sad', 0.8);
        this.playAnimation('comfort');
        this.speak('Não desista, você consegue!');
      } else {
        this.setEmotion('neutral', 0.5);
        this.playAnimation('think');
        this.speak('Tente novamente, você está quase lá.');
      }
    }
  }
  
  setEmotion(emotion, intensity) {
    this.currentEmotion = emotion;
    this.expressionIntensity = intensity;
    
    // Atualiza blend shapes faciais
    this.updateFacialExpression();
  }
  
  updateFacialExpression() {
    const expressions = {
      happy: {
        mouthSmile: 1.0,
        eyeSquint: 0.3,
        browUp: 0.2
      },
      sad: {
        mouthFrown: 0.8,
        eyeSquint: 0.1,
        browDown: 0.6
      },
      excited: {
        mouthOpen: 0.7,
        mouthSmile: 1.0,
        eyeWide: 0.8,
        browUp: 0.5
      },
      frustrated: {
        mouthFrown: 0.5,
        browDown: 0.8,
        eyeSquint: 0.4
      },
      neutral: {
        // Todos em 0
      }
    };
    
    const targetExpression = expressions[this.currentEmotion];
    
    // Anima blend shapes suavemente
    Object.keys(targetExpression).forEach(blendShape => {
      gsap.to(this.mesh.morphTargetInfluences, {
        [blendShape]: targetExpression[blendShape] * this.expressionIntensity,
        duration: 0.5,
        ease: 'power2.out'
      });
    });
  }
  
  speak(text) {
    // Mostra balão de fala
    this.showSpeechBubble(text);
    
    // Síntese de voz (opcional)
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.2; // Voz mais aguda para robô
    speechSynthesis.speak(utterance);
  }
}
```

---

## 📊 SISTEMA DE TELEMETRIA UNIFICADO

```javascript
// frontend/src/hooks/useTelemetry.js

export function useTelemetry() {
  const sessionId = useRef(generateUUID());
  const eventBuffer = useRef([]);
  const flushInterval = 5000; // Envia dados a cada 5s
  
  useEffect(() => {
    const timer = setInterval(() => {
      flushEvents();
    }, flushInterval);
    
    return () => {
      clearInterval(timer);
      flushEvents(); // Flush final
    };
  }, []);
  
  const logEvent = (eventData) => {
    const event = {
      session_id: sessionId.current,
      timestamp: new Date().toISOString(),
      ...eventData
    };
    
    eventBuffer.current.push(event);
    
    // Flush imediato se buffer cheio
    if (eventBuffer.current.length >= 50) {
      flushEvents();
    }
  };
  
  const flushEvents = async () => {
    if (eventBuffer.current.length === 0) return;
    
    const events = [...eventBuffer.current];
    eventBuffer.current = [];
    
    try {
      await fetch('/api/telemetry/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events })
      });
    } catch (error) {
      console.error('Falha ao enviar telemetria:', error);
      // Re-adiciona ao buffer para retry
      eventBuffer.current.unshift(...events);
    }
  };
  
  return { logEvent, sessionId: sessionId.current };
}
```

---

## 🎨 SISTEMA DE FEEDBACK MULTISSENSORIAL

```javascript
// frontend/src/utils/feedbackSystem.js

export class MultisensoryFeedback {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.particleSystem = new ParticleSystem();
  }
  
  triggerSuccess(intensity = 1.0) {
    // Visual
    this.particleSystem.explode({
      position: [0, 0, 0],
      color: '#00ff00',
      count: 50 * intensity,
      speed: 5 * intensity
    });
    
    // Auditivo
    this.playSuccessSound(intensity);
    
    // Háptico
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }
    
    // UI
    this.showFloatingText('+10 Neuro-Energia', '#00ff00');
  }
  
  triggerError(intensity = 1.0) {
    // Visual
    this.particleSystem.explode({
      position: [0, 0, 0],
      color: '#ff0000',
      count: 30 * intensity,
      speed: 3 * intensity
    });
    
    // Auditivo
    this.playErrorSound(intensity);
    
    // Háptico
    if (navigator.vibrate) {
      navigator.vibrate([100]);
    }
    
    // UI
    this.showFloatingText('Tente novamente', '#ff0000');
  }
  
  playSuccessSound(intensity) {
    // Acorde maior (C-E-G)
    const frequencies = [261.63, 329.63, 392.00];
    
    frequencies.forEach((freq, i) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3 * intensity, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 0.5
      );
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.start(this.audioContext.currentTime + i * 0.1);
      oscillator.stop(this.audioContext.currentTime + 0.5 + i * 0.1);
    });
  }
  
  playErrorSound(intensity) {
    // Dissonância (tritone)
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.frequency.value = 200; // Frequência baixa
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.2 * intensity, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.3
    );
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }
}
```

---

**Documento Técnico Completo**  
**Versão**: 1.0.0  
**Última Atualização**: 10/02/2026  
**Próxima Revisão**: Após implementação do MVP
