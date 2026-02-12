import * as THREE from 'three';

/**
 * Sistema de Feedback Multissensorial
 * Fornece feedback visual, auditivo e háptico
 */
export class FeedbackSystem {
  constructor() {
    this.audioContext = null;
    this.initAudio();
  }

  initAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API não suportada:', e);
    }
  }

  /**
   * Feedback de Sucesso
   */
  triggerSuccess(intensity = 1.0) {
    // Visual: Partículas verdes
    this.createParticles({
      color: new THREE.Color(0x00ff00),
      count: Math.floor(50 * intensity),
      speed: 5 * intensity
    });

    // Auditivo: Acorde maior (C-E-G)
    this.playSuccessSound(intensity);

    // Háptico: Vibração curta
    this.vibrate([50, 30, 50]);

    return {
      type: 'success',
      intensity,
      timestamp: Date.now()
    };
  }

  /**
   * Feedback de Erro
   */
  triggerError(intensity = 1.0) {
    // Visual: Partículas vermelhas
    this.createParticles({
      color: new THREE.Color(0xff0000),
      count: Math.floor(30 * intensity),
      speed: 3 * intensity
    });

    // Auditivo: Som dissonante
    this.playErrorSound(intensity);

    // Háptico: Vibração longa
    this.vibrate([100]);

    return {
      type: 'error',
      intensity,
      timestamp: Date.now()
    };
  }

  /**
   * Feedback Neutro (ação sem julgamento)
   */
  triggerNeutral() {
    // Som suave de clique
    this.playClickSound();

    return {
      type: 'neutral',
      timestamp: Date.now()
    };
  }

  /**
   * Cria sistema de partículas
   */
  createParticles({ color, count, speed }) {
    // Retorna configuração para ser usada no Three.js
    return {
      color,
      count,
      speed,
      lifetime: 1.0,
      size: 0.1,
      spread: Math.PI / 4
    };
  }

  /**
   * Toca som de sucesso (acorde maior)
   */
  playSuccessSound(intensity) {
    if (!this.audioContext) return;

    const frequencies = [261.63, 329.63, 392.00]; // C-E-G
    const now = this.audioContext.currentTime;

    frequencies.forEach((freq, i) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3 * intensity, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start(now + i * 0.1);
      oscillator.stop(now + 0.5 + i * 0.1);
    });
  }

  /**
   * Toca som de erro (dissonância)
   */
  playErrorSound(intensity) {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.frequency.value = 200;
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0.2 * intensity, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.3);
  }

  /**
   * Toca som de clique neutro
   */
  playClickSound() {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }

  /**
   * Vibração háptica (mobile)
   */
  vibrate(pattern) {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }

  /**
   * Cleanup
   */
  dispose() {
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

export default FeedbackSystem;
