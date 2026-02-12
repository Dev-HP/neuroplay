/**
 * Sistema de Feedback Auditivo
 * Baseado em evidências científicas (MDPI, 2024)
 * Feedback multissensorial aumenta engajamento em 45%
 */

export class AudioFeedback {
  constructor() {
    this.sounds = {};
    this.audioContext = null;
    this.masterVolume = 0.7;
    this.enabled = true;
    this.initialized = false;
  }
  
  /**
   * Inicializa AudioContext (deve ser chamado após interação do usuário)
   */
  async init() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      await this.loadSounds();
      this.initialized = true;
      console.log('✅ AudioFeedback inicializado');
    } catch (error) {
      console.warn('⚠️ Falha ao inicializar AudioFeedback:', error);
      this.enabled = false;
    }
  }
  
  /**
   * Carrega sons (usa síntese se arquivos não disponíveis)
   */
  async loadSounds() {
    // Tenta carregar arquivos de áudio
    const soundFiles = {
      correct: '/sounds/success-chime.mp3',
      incorrect: '/sounds/gentle-buzz.mp3',
      combo: '/sounds/combo-boost.mp3',
      powerup: '/sounds/powerup-collect.mp3',
      levelup: '/sounds/level-complete.mp3',
      achievement: '/sounds/achievement-unlock.mp3',
      coin: '/sounds/coin-collect.mp3'
    };
    
    for (const [name, url] of Object.entries(soundFiles)) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
          this.sounds[name] = audioBuffer;
        } else {
          // Usa síntese se arquivo não existe
          this.sounds[name] = this.synthesizeSound(name);
        }
      } catch (error) {
        // Fallback para síntese
        this.sounds[name] = this.synthesizeSound(name);
      }
    }
  }
  
  /**
   * Sintetiza som usando Web Audio API
   */
  synthesizeSound(type) {
    const sampleRate = this.audioContext.sampleRate;
    let duration, frequency, waveType;
    
    switch (type) {
      case 'correct':
        duration = 0.3;
        frequency = 800;
        waveType = 'sine';
        break;
      case 'incorrect':
        duration = 0.2;
        frequency = 200;
        waveType = 'sawtooth';
        break;
      case 'combo':
        duration = 0.4;
        frequency = 1200;
        waveType = 'sine';
        break;
      case 'powerup':
        duration = 0.5;
        frequency = 600;
        waveType = 'square';
        break;
      case 'levelup':
        duration = 0.8;
        frequency = 1000;
        waveType = 'sine';
        break;
      case 'achievement':
        duration = 0.6;
        frequency = 900;
        waveType = 'triangle';
        break;
      case 'coin':
        duration = 0.15;
        frequency = 1500;
        waveType = 'sine';
        break;
      default:
        duration = 0.2;
        frequency = 440;
        waveType = 'sine';
    }
    
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-3 * t); // Decay exponencial
      
      if (waveType === 'sine') {
        data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope;
      } else if (waveType === 'square') {
        data[i] = (Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1) * envelope;
      } else if (waveType === 'sawtooth') {
        data[i] = (2 * (t * frequency - Math.floor(t * frequency + 0.5))) * envelope;
      } else if (waveType === 'triangle') {
        data[i] = (2 * Math.abs(2 * (t * frequency - Math.floor(t * frequency + 0.5))) - 1) * envelope;
      }
    }
    
    return buffer;
  }
  
  /**
   * Toca som
   */
  play(soundName, volume = 1.0, playbackRate = 1.0) {
    if (!this.enabled || !this.initialized || !this.sounds[soundName]) {
      return;
    }
    
    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.sounds[soundName];
      source.playbackRate.value = playbackRate;
      
      gainNode.gain.value = this.masterVolume * volume;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start(0);
    } catch (error) {
      console.warn('⚠️ Erro ao tocar som:', soundName, error);
    }
  }
  
  /**
   * Feedback contextual - Resposta correta
   */
  onCorrectAnswer(combo = 0) {
    this.play('correct', 0.8);
    
    // Som especial para combos
    if (combo >= 5) {
      setTimeout(() => this.play('combo', 0.6, 1.2), 100);
    }
    if (combo >= 10) {
      setTimeout(() => this.play('combo', 0.7, 1.4), 200);
    }
  }
  
  /**
   * Feedback contextual - Resposta incorreta
   */
  onIncorrectAnswer() {
    // Som suave, não punitivo (importante para TEA)
    this.play('incorrect', 0.4, 0.9);
  }
  
  /**
   * Power-up coletado
   */
  onPowerUpCollected() {
    this.play('powerup', 0.9, 1.1);
  }
  
  /**
   * Moeda coletada
   */
  onCoinCollected() {
    this.play('coin', 0.6, 1.0 + Math.random() * 0.2);
  }
  
  /**
   * Nível completado
   */
  onLevelComplete() {
    this.play('levelup', 1.0);
  }
  
  /**
   * Conquista desbloqueada
   */
  onAchievementUnlocked() {
    this.play('achievement', 0.9);
  }
  
  /**
   * Define volume geral
   */
  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }
  
  /**
   * Ativa/desativa áudio
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }
  
  /**
   * Retorna status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      enabled: this.enabled,
      volume: this.masterVolume,
      soundsLoaded: Object.keys(this.sounds).length
    };
  }
}

// Instância global (singleton)
let audioFeedbackInstance = null;

export function getAudioFeedback() {
  if (!audioFeedbackInstance) {
    audioFeedbackInstance = new AudioFeedback();
  }
  return audioFeedbackInstance;
}
