import { AdaptiveDifficulty } from '../adaptiveDifficulty';

describe('AdaptiveDifficulty', () => {
  it('keeps the initial difficulty when there is no data', () => {
    const system = new AdaptiveDifficulty();

    expect(system.analyzePerformance()).toMatchObject({
      accuracy: 0,
      sampleSize: 0
    });
    expect(system.getParams()).toMatchObject({
      speed: 5,
      obstacleSpeed: 5,
      gravity: 0.8
    });
  });

  it('preserves the shared parameter contract for game consumers', () => {
    const system = new AdaptiveDifficulty();
    const params = system.getParams();

    expect(params).toEqual(expect.objectContaining({
      speed: expect.any(Number),
      challengeFrequency: expect.any(Number),
      obstacleSpeed: expect.any(Number),
      gravity: expect.any(Number),
      jumpVelocity: expect.any(Number)
    }));
  });

  it('adjusts upward after ten stable successful attempts', () => {
    const system = new AdaptiveDifficulty();

    for (let index = 0; index < 10; index += 1) {
      const result = system.recordAttempt({
        correct: true,
        reactionTime: 400,
        type: 'test'
      });

      if (index < 9) expect(result).toBeNull();
      if (index === 9) expect(result.adjustment).toBe('increase');
    }

    expect(system.getParams().speed).toBeGreaterThan(5);
  });

  it('adjusts downward after ten difficult attempts', () => {
    const system = new AdaptiveDifficulty();

    for (let index = 0; index < 10; index += 1) {
      const result = system.recordAttempt({
        correct: false,
        reactionTime: 2400,
        type: 'test'
      });

      if (index === 9) expect(result.adjustment).toBe('decrease');
    }

    expect(system.getParams().speed).toBeLessThan(5);
  });

  it('resets history, parameters and adjustment metadata', () => {
    const system = new AdaptiveDifficulty();
    system.recordAttempt({ correct: true, reactionTime: 500 });
    system.reset();

    expect(system.getStats()).toMatchObject({
      totalAttempts: 0,
      adjustmentCount: 0,
      lastAdjustment: null
    });
    expect(system.getParams().speed).toBe(5);
  });
});
