import {
  ADAPTATION_POLICY_VERSION,
  applyDifficultyDecision,
  calculatePerformanceScore,
  evaluateAdaptation,
  normalizePerformanceMetrics
} from '../adaptationPolicy';

describe('local adaptation policy', () => {
  it('normalizes percentage accuracy and bounds invalid metrics', () => {
    expect(normalizePerformanceMetrics({
      accuracy: 120,
      avgReactionTime: -10,
      rtVariability: 'invalid',
      errorsCount: -2,
      successStreak: 4,
      sampleSize: 3
    })).toEqual({
      accuracy: 1,
      avgReactionTime: 0,
      rtVariability: 0,
      errorsCount: 0,
      successStreak: 4,
      sampleSize: 3
    });
  });

  it('calculates a bounded performance score from gameplay metrics', () => {
    const score = calculatePerformanceScore({
      accuracy: 100,
      avgReactionTime: 0,
      errorsCount: 0,
      successStreak: 10
    });

    expect(score).toBe(1);
    expect(calculatePerformanceScore({ accuracy: 0, avgReactionTime: 2000, errorsCount: 10 })).toBe(0);
  });

  it('does not change difficulty before enough attempts', () => {
    const decision = evaluateAdaptation({
      accuracy: 1,
      avgReactionTime: 300,
      rtVariability: 20,
      sampleSize: 9
    });

    expect(decision.action).toBe('insufficient_data');
    expect(decision.delta).toBe(0);
    expect(decision.confidence).toBe(0.9);
  });

  it('increases difficulty only with high and stable performance', () => {
    const decision = evaluateAdaptation({
      accuracy: 0.9,
      avgReactionTime: 500,
      rtVariability: 100,
      sampleSize: 10
    });

    expect(decision.action).toBe('increase');
    expect(decision.delta).toBe(1);
    expect(decision.policyVersion).toBe(ADAPTATION_POLICY_VERSION);
  });

  it('decreases difficulty when performance or reaction stability is poor', () => {
    const decision = evaluateAdaptation({
      accuracy: 0.55,
      avgReactionTime: 900,
      rtVariability: 100,
      sampleSize: 10
    });

    expect(decision.action).toBe('decrease');
    expect(decision.delta).toBe(-1);
  });

  it('maintains difficulty inside the stable range', () => {
    const decision = evaluateAdaptation({
      accuracy: 0.72,
      avgReactionTime: 1000,
      rtVariability: 300,
      sampleSize: 10
    });

    expect(decision.action).toBe('maintain');
    expect(decision.delta).toBe(0);
  });

  it('clamps the final difficulty to configured bounds and step size', () => {
    const result = applyDifficultyDecision(10, {
      action: 'increase',
      delta: 10,
      reason: 'test',
      confidence: 1
    });

    expect(result.nextDifficulty).toBe(10);
    expect(result.delta).toBe(0);

    const minimum = applyDifficultyDecision(1, {
      action: 'decrease',
      delta: -10,
      reason: 'test',
      confidence: 1
    });

    expect(minimum.nextDifficulty).toBe(1);
    expect(minimum.delta).toBe(0);
  });
});
