export const ADAPTATION_POLICY_VERSION = 'local-rules-v1';

export const DEFAULT_ADAPTATION_LIMITS = Object.freeze({
  minDifficulty: 1,
  maxDifficulty: 10,
  maxStep: 1,
  minAttempts: 10,
  increaseAccuracy: 0.85,
  increaseReactionTimeMs: 800,
  decreaseAccuracy: 0.6,
  decreaseReactionTimeMs: 2000,
  maxReactionVariabilityMs: 500
});

function finiteNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function normalizeAccuracy(value) {
  const numeric = finiteNumber(value, 0);
  const normalized = numeric > 1 ? numeric / 100 : numeric;
  return clamp(normalized, 0, 1);
}

export function normalizePerformanceMetrics(input = {}) {
  const sampleSize = Math.max(
    0,
    Math.floor(finiteNumber(input.sampleSize ?? input.attempts ?? input.totalAttempts, 0))
  );

  return {
    accuracy: normalizeAccuracy(input.accuracy),
    avgReactionTime: Math.max(0, finiteNumber(input.avgReactionTime ?? input.reactionTime, 1000)),
    rtVariability: Math.max(0, finiteNumber(input.rtVariability ?? input.reactionTimeVariability, 0)),
    errorsCount: Math.max(0, finiteNumber(input.errorsCount ?? input.errors, 0)),
    successStreak: Math.max(0, finiteNumber(input.successStreak ?? input.streak, 0)),
    sampleSize
  };
}

export function calculatePerformanceScore(input = {}) {
  const metrics = normalizePerformanceMetrics(input);
  const normalizedReaction = clamp(metrics.avgReactionTime / 2000, 0, 1);
  const normalizedErrors = clamp(metrics.errorsCount / 10, 0, 1);
  const normalizedStreak = clamp(metrics.successStreak / 10, 0, 1);
  const score = (
    metrics.accuracy * 0.4
    + (1 - normalizedReaction) * 0.2
    + (1 - normalizedErrors) * 0.2
    + normalizedStreak * 0.2
  );

  return clamp(score, 0, 1);
}

export function evaluateAdaptation(input = {}, options = {}) {
  const limits = { ...DEFAULT_ADAPTATION_LIMITS, ...options };
  const metrics = normalizePerformanceMetrics(input);
  const confidence = clamp(metrics.sampleSize / limits.minAttempts, 0, 1);

  if (metrics.sampleSize < limits.minAttempts) {
    return {
      action: 'insufficient_data',
      delta: 0,
      confidence,
      reason: `Dados insuficientes: ${metrics.sampleSize}/${limits.minAttempts} tentativas.`,
      metrics,
      policyVersion: ADAPTATION_POLICY_VERSION
    };
  }

  if (
    metrics.accuracy > limits.increaseAccuracy
    && metrics.avgReactionTime < limits.increaseReactionTimeMs
    && metrics.rtVariability <= limits.maxReactionVariabilityMs
  ) {
    return {
      action: 'increase',
      delta: limits.maxStep,
      confidence,
      reason: 'Precisão alta com tempo de reação e variabilidade estáveis.',
      metrics,
      policyVersion: ADAPTATION_POLICY_VERSION
    };
  }

  if (
    metrics.accuracy < limits.decreaseAccuracy
    || metrics.avgReactionTime > limits.decreaseReactionTimeMs
    || metrics.rtVariability > limits.maxReactionVariabilityMs
  ) {
    return {
      action: 'decrease',
      delta: -limits.maxStep,
      confidence,
      reason: 'Precisão baixa ou sinais de dificuldade/variabilidade elevados.',
      metrics,
      policyVersion: ADAPTATION_POLICY_VERSION
    };
  }

  return {
    action: 'maintain',
    delta: 0,
    confidence,
    reason: 'Desempenho dentro da faixa de estabilidade configurada.',
    metrics,
    policyVersion: ADAPTATION_POLICY_VERSION
  };
}

export function applyDifficultyDecision(currentDifficulty, decision, options = {}) {
  const limits = { ...DEFAULT_ADAPTATION_LIMITS, ...options };
  const current = clamp(
    finiteNumber(currentDifficulty, limits.minDifficulty),
    limits.minDifficulty,
    limits.maxDifficulty
  );
  const requestedDelta = decision?.delta ?? 0;
  const delta = clamp(requestedDelta, -limits.maxStep, limits.maxStep);
  const nextDifficulty = clamp(
    current + delta,
    limits.minDifficulty,
    limits.maxDifficulty
  );

  return {
    currentDifficulty: current,
    nextDifficulty,
    delta: nextDifficulty - current,
    action: decision?.action || 'maintain',
    reason: decision?.reason || 'Nenhuma alteração aplicada.',
    confidence: decision?.confidence ?? 0,
    policyVersion: decision?.policyVersion || ADAPTATION_POLICY_VERSION
  };
}
