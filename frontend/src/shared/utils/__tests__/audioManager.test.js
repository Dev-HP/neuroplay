import audioManager from '../audioManager';

const AudioManager = audioManager.constructor;

describe('audioManager.noteToFrequency', () => {
  it('converte notas naturais pela afinação A4 = 440 Hz', () => {
    expect(AudioManager.noteToFrequency('A4')).toBeCloseTo(440, 2);
    expect(AudioManager.noteToFrequency('C4')).toBeCloseTo(261.63, 2);
    expect(AudioManager.noteToFrequency('C5')).toBeCloseTo(523.25, 2);
    expect(AudioManager.noteToFrequency('G5')).toBeCloseTo(783.99, 2);
  });

  it('aplica sustenidos e bemóis', () => {
    expect(AudioManager.noteToFrequency('F#4')).toBeCloseTo(369.99, 2);
    expect(AudioManager.noteToFrequency('Bb3')).toBeCloseTo(233.08, 2);
  });

  it('dá uma altura diferente para cada nota do n-back auditivo', () => {
    const notas = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
    const frequencias = notas.map((n) => AudioManager.noteToFrequency(n));
    expect(new Set(frequencias.map((f) => f.toFixed(2))).size).toBe(notas.length);
    frequencias.slice(1).forEach((f, i) => expect(f).toBeGreaterThan(frequencias[i]));
  });

  it('usa 440 Hz para notação inválida em vez de falhar', () => {
    expect(AudioManager.noteToFrequency('H9')).toBe(440);
    expect(AudioManager.noteToFrequency(undefined)).toBe(440);
  });
});

describe('audioManager.playMelody', () => {
  it('agenda uma nota por batida e aceita note ou pitch', () => {
    const manager = new AudioManager();
    const playNote = vi.spyOn(manager, 'playNote').mockImplementation(() => {});

    manager.playMelody(['C4', { pitch: 'E4', duration: 0.1 }, { note: 'G4' }], 120);

    expect(playNote).toHaveBeenCalledTimes(3);
    expect(playNote.mock.calls[0]).toEqual(['C4', 0.45, 0]);
    expect(playNote.mock.calls[1]).toEqual(['E4', 0.1, 0.5]);
    expect(playNote.mock.calls[2]).toEqual(['G4', 0.45, 1]);
  });

  it('não faz nada sem AudioContext inicializado', () => {
    const manager = new AudioManager();
    expect(() => manager.playNote('A4')).not.toThrow();
  });
});
