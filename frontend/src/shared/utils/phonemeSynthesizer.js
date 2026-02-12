/**
 * Phoneme Synthesizer
 * 
 * Generates realistic phoneme sounds using Web Audio API
 * Based on formant synthesis (F1, F2 frequencies)
 * 
 * Evidence: BMC Psychiatry (2022) - Real auditory training improves phonological processing
 */

class PhonemeSynthesizer {
  constructor() {
    this.audioContext = null;
    this.initialized = false;
    
    // Formant frequencies for each phoneme (in Hz)
    // Based on acoustic phonetics research
    this.phonemeData = {
      '/B/': {
        type: 'plosive',
        voiced: true,
        f1: 700,
        f2: 1220,
        f3: 2600,
        duration: 0.15,
        burstDuration: 0.03,
        description: 'Voiced bilabial plosive'
      },
      '/P/': {
        type: 'plosive',
        voiced: false,
        f1: 700,
        f2: 1220,
        f3: 2600,
        duration: 0.12,
        burstDuration: 0.04,
        aspirated: true,
        description: 'Voiceless bilabial plosive'
      },
      '/D/': {
        type: 'plosive',
        voiced: true,
        f1: 400,
        f2: 1700,
        f3: 2600,
        duration: 0.15,
        burstDuration: 0.03,
        description: 'Voiced alveolar plosive'
      },
      '/T/': {
        type: 'plosive',
        voiced: false,
        f1: 400,
        f2: 1700,
        f3: 2600,
        duration: 0.12,
        burstDuration: 0.04,
        aspirated: true,
        description: 'Voiceless alveolar plosive'
      },
      '/V/': {
        type: 'fricative',
        voiced: true,
        f1: 570,
        f2: 840,
        f3: 2410,
        duration: 0.20,
        noiseFreq: 4000,
        description: 'Voiced labiodental fricative'
      },
      '/F/': {
        type: 'fricative',
        voiced: false,
        f1: 570,
        f2: 840,
        f3: 2410,
        duration: 0.18,
        noiseFreq: 5000,
        description: 'Voiceless labiodental fricative'
      },
      '/S/': {
        type: 'fricative',
        voiced: false,
        f1: 200,
        f2: 5000,
        f3: 8000,
        duration: 0.25,
        noiseFreq: 7000,
        description: 'Voiceless alveolar fricative'
      },
      '/Z/': {
        type: 'fricative',
        voiced: true,
        f1: 200,
        f2: 5000,
        f3: 8000,
        duration: 0.22,
        noiseFreq: 6000,
        description: 'Voiced alveolar fricative'
      }
    };
  }

  /**
   * Initialize audio context (must be called after user interaction)
   */
  async init() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
      console.log('[PhonemeSynthesizer] Initialized successfully');
    } catch (error) {
      console.error('[PhonemeSynthesizer] Failed to initialize:', error);
    }
  }

  /**
   * Play a phoneme sound
   * @param {string} phoneme - Phoneme symbol (e.g., '/B/', '/P/')
   * @param {number} volume - Volume (0-1)
   */
  async playPhoneme(phoneme, volume = 0.7) {
    if (!this.initialized) {
      console.warn('[PhonemeSynthesizer] Not initialized. Call init() first.');
      return;
    }

    const data = this.phonemeData[phoneme];
    if (!data) {
      console.error(`[PhonemeSynthesizer] Unknown phoneme: ${phoneme}`);
      return;
    }

    const now = this.audioContext.currentTime;

    if (data.type === 'plosive') {
      this.synthesizePlosive(data, now, volume);
    } else if (data.type === 'fricative') {
      this.synthesizeFricative(data, now, volume);
    }
  }

  /**
   * Synthesize plosive sounds (B, P, D, T)
   * Plosives have a burst followed by formant transition
   */
  synthesizePlosive(data, startTime, volume) {
    const ctx = this.audioContext;

    // 1. BURST (explosion of air)
    const burstNoise = ctx.createBufferSource();
    const burstBuffer = this.createNoiseBuffer(data.burstDuration, 0.3);
    burstNoise.buffer = burstBuffer;

    const burstFilter = ctx.createBiquadFilter();
    burstFilter.type = 'bandpass';
    burstFilter.frequency.value = data.f2;
    burstFilter.Q.value = 2;

    const burstGain = ctx.createGain();
    burstGain.gain.setValueAtTime(volume * 0.8, startTime);
    burstGain.gain.exponentialRampToValueAtTime(0.01, startTime + data.burstDuration);

    burstNoise.connect(burstFilter);
    burstFilter.connect(burstGain);
    burstGain.connect(ctx.destination);

    burstNoise.start(startTime);
    burstNoise.stop(startTime + data.burstDuration);

    // 2. VOICED FORMANTS (if voiced)
    if (data.voiced) {
      const voiceStart = startTime + data.burstDuration;
      const voiceDuration = data.duration - data.burstDuration;

      // Fundamental frequency (pitch)
      const oscillator = ctx.createOscillator();
      oscillator.type = 'sawtooth';
      oscillator.frequency.value = 120; // ~120 Hz for child voice

      // Formant 1
      const formant1 = ctx.createBiquadFilter();
      formant1.type = 'bandpass';
      formant1.frequency.value = data.f1;
      formant1.Q.value = 10;

      // Formant 2
      const formant2 = ctx.createBiquadFilter();
      formant2.type = 'bandpass';
      formant2.frequency.value = data.f2;
      formant2.Q.value = 10;

      // Envelope
      const voiceGain = ctx.createGain();
      voiceGain.gain.setValueAtTime(0, voiceStart);
      voiceGain.gain.linearRampToValueAtTime(volume * 0.5, voiceStart + 0.02);
      voiceGain.gain.exponentialRampToValueAtTime(0.01, voiceStart + voiceDuration);

      oscillator.connect(formant1);
      formant1.connect(formant2);
      formant2.connect(voiceGain);
      voiceGain.connect(ctx.destination);

      oscillator.start(voiceStart);
      oscillator.stop(voiceStart + voiceDuration);
    }

    // 3. ASPIRATION (for voiceless plosives like P, T)
    if (data.aspirated) {
      const aspirationStart = startTime + data.burstDuration;
      const aspirationDuration = 0.06;

      const aspirationNoise = ctx.createBufferSource();
      const aspirationBuffer = this.createNoiseBuffer(aspirationDuration, 0.2);
      aspirationNoise.buffer = aspirationBuffer;

      const aspirationFilter = ctx.createBiquadFilter();
      aspirationFilter.type = 'highpass';
      aspirationFilter.frequency.value = 3000;

      const aspirationGain = ctx.createGain();
      aspirationGain.gain.setValueAtTime(volume * 0.4, aspirationStart);
      aspirationGain.gain.exponentialRampToValueAtTime(0.01, aspirationStart + aspirationDuration);

      aspirationNoise.connect(aspirationFilter);
      aspirationFilter.connect(aspirationGain);
      aspirationGain.connect(ctx.destination);

      aspirationNoise.start(aspirationStart);
      aspirationNoise.stop(aspirationStart + aspirationDuration);
    }
  }

  /**
   * Synthesize fricative sounds (V, F, S, Z)
   * Fricatives are continuous noise with formant coloring
   */
  synthesizeFricative(data, startTime, volume) {
    const ctx = this.audioContext;

    // 1. NOISE SOURCE
    const noise = ctx.createBufferSource();
    const noiseBuffer = this.createNoiseBuffer(data.duration, 1.0);
    noise.buffer = noiseBuffer;

    // 2. FILTER (shapes the noise)
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = data.noiseFreq;
    filter.Q.value = data.voiced ? 5 : 2;

    // 3. VOICED COMPONENT (for V, Z)
    if (data.voiced) {
      // Add periodic component
      const oscillator = ctx.createOscillator();
      oscillator.type = 'sawtooth';
      oscillator.frequency.value = 120;

      const formant = ctx.createBiquadFilter();
      formant.type = 'bandpass';
      formant.frequency.value = data.f1;
      formant.Q.value = 8;

      const voiceGain = ctx.createGain();
      voiceGain.gain.setValueAtTime(volume * 0.3, startTime);
      voiceGain.gain.exponentialRampToValueAtTime(0.01, startTime + data.duration);

      oscillator.connect(formant);
      formant.connect(voiceGain);
      voiceGain.connect(ctx.destination);

      oscillator.start(startTime);
      oscillator.stop(startTime + data.duration);
    }

    // 4. ENVELOPE
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume * 0.6, startTime + 0.03);
    gain.gain.setValueAtTime(volume * 0.6, startTime + data.duration - 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + data.duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(startTime);
    noise.stop(startTime + data.duration);
  }

  /**
   * Create white noise buffer
   */
  createNoiseBuffer(duration, amplitude) {
    const sampleRate = this.audioContext.sampleRate;
    const bufferSize = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * amplitude;
    }

    return buffer;
  }

  /**
   * Set master volume
   */
  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get phoneme info
   */
  getPhonemeInfo(phoneme) {
    return this.phonemeData[phoneme];
  }

  /**
   * Get all available phonemes
   */
  getAllPhonemes() {
    return Object.keys(this.phonemeData);
  }
}

// Singleton instance
let phonemeSynthesizerInstance = null;

/**
 * Get phoneme synthesizer instance
 */
export function getPhonemeSynthesizer() {
  if (!phonemeSynthesizerInstance) {
    phonemeSynthesizerInstance = new PhonemeSynthesizer();
  }
  return phonemeSynthesizerInstance;
}

export default PhonemeSynthesizer;
