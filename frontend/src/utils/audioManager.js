// Sistema de áudio simplificado usando Web Audio API nativa

class AudioManager {
  constructor() {
    this.sounds = {};
    this.music = null;
    this.initialized = false;
    this.synth = null;
  }

  async init() {
    if (this.initialized) return;
    
    // Inicializar Web Audio API
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();
    
    this.initialized = true;
  }

  // Gerar sons proceduralmente usando Web Audio API
  generateSuccessSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const duration = 0.3;
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      // Arpejo ascendente
      const freq1 = 523.25; // C5
      const freq2 = 659.25; // E5
      const freq3 = 783.99; // G5
      
      const envelope = Math.exp(-t * 8);
      data[i] = envelope * (
        Math.sin(2 * Math.PI * freq1 * t) * 0.3 +
        Math.sin(2 * Math.PI * freq2 * (t - 0.1)) * 0.3 +
        Math.sin(2 * Math.PI * freq3 * (t - 0.2)) * 0.4
      );
    }
    
    return this.bufferToWav(buffer);
  }

  generateErrorSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const duration = 0.2;
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const freq = 200 - (t * 100); // Frequência descendente
      const envelope = Math.exp(-t * 10);
      data[i] = envelope * Math.sin(2 * Math.PI * freq * t) * 0.5;
    }
    
    return this.bufferToWav(buffer);
  }

  generateClickSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const duration = 0.05;
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 50);
      data[i] = envelope * (Math.random() * 2 - 1) * 0.3;
    }
    
    return this.bufferToWav(buffer);
  }

  generateAchievementSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const duration = 0.8;
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 3);
      let sample = 0;
      
      notes.forEach((freq, idx) => {
        const delay = idx * 0.15;
        if (t > delay) {
          sample += Math.sin(2 * Math.PI * freq * (t - delay)) * 0.25;
        }
      });
      
      data[i] = envelope * sample;
    }
    
    return this.bufferToWav(buffer);
  }

  bufferToWav(buffer) {
    const length = buffer.length * buffer.numberOfChannels * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    const channels = [];
    let offset = 0;
    let pos = 0;

    // WAV header
    const setUint16 = (data) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };
    const setUint32 = (data) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt "
    setUint32(16);
    setUint16(1);
    setUint16(buffer.numberOfChannels);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels);
    setUint16(buffer.numberOfChannels * 2);
    setUint16(16);
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  play(soundName) {
    if (!this.audioContext) return;
    
    // Tocar som simples
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    if (soundName === 'success') {
      oscillator.frequency.value = 523.25; // C5
      gainNode.gain.value = 0.3;
    } else if (soundName === 'error') {
      oscillator.frequency.value = 200;
      gainNode.gain.value = 0.2;
    } else {
      oscillator.frequency.value = 440;
      gainNode.gain.value = 0.1;
    }
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  playNote(note, duration = 0.2) {
    // Simplificado - apenas toca um beep
    this.play('click');
  }

  playMelody(notes, tempo = 120) {
    // Simplificado
    this.play('success');
  }

  stopAll() {
    // Nada a fazer na versão simplificada
  }
}

const audioManagerInstance = new AudioManager();
export default audioManagerInstance;
