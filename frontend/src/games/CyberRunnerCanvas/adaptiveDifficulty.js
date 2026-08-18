import {
  DEFAULT_ADAPTATION_LIMITS,
  evaluateAdaptation
} from '../../shared/utils/adaptationPolicy';

/**
 * Adaptação local e determinística de dificuldade.
 *
 * O motor ajusta apenas parâmetros de desafio do jogo. Ele não faz diagnóstico,
 * não estima capacidade cognitiva e não substitui consentimento ou autorização.
 */
export class AdaptiveDifficulty {
  constructor(options = {}) {
    this.windowSize = options.windowSize || DEFAULT_ADAPTATION_LIMITS.minAttempts;
    this.attemptHistory = [];
    this.currentParams = {
      speed: 5,
      challengeFrequency: 0.0008,
      obstacleSpeed: 5,
      gravity: 0.8,
      jumpVelocity: -12
    };
    this.adjustmentCount = 0;
    this.lastAdjustment = null;
  }

  recordAttempt(attempt = {}) {
    this.attemptHistory.push({
      correct: Boolean(attempt.correct),
      reactionTime: Math.max(0, Number(attempt.reactionTime) || 0),
      timestamp: Date.now(),
      type: attempt.type || 'generic'
    });

    if (this.attemptHistory.length > this.windowSize * 2) {
      this.attemptHistory.shift();
    }

    if (
      this.attemptHistory.length >= this.windowSize
      && this.attemptHistory.length % this.windowSize === 0
    ) {
      return this.adjustDifficulty();
    }

    return null;
  }

  analyzePerformance() {
    const recentAttempts = this.attemptHistory.slice(-this.windowSize);
    const reactionTimes = recentAttempts
      .map(attempt => attempt.reactionTime)
      .filter(reactionTime => reactionTime > 0);

    if (recentAttempts.length === 0) {
      return {
        accuracy: 0,
        avgReactionTime: 1000,
        rtVariability: 0,
        sampleSize: 0
      };
    }

    const accuracy = recentAttempts.filter(attempt => attempt.correct).length / recentAttempts.length;
    const avgReactionTime = reactionTimes.length > 0
      ? reactionTimes.reduce((sum, value) => sum + value, 0) / reactionTimes.length
      : 1000;

    return {
      accuracy,
      avgReactionTime,
      rtVariability: this.calculateStdDev(reactionTimes),
      sampleSize: recentAttempts.length
    };
  }

  adjustDifficulty() {
    const metrics = this.analyzePerformance();
    const decision = evaluateAdaptation(metrics, {
      minAttempts: this.windowSize,
      maxStep: 1
    });

    if (decision.action === 'increase') {
      this.currentParams.speed = Math.min(this.currentParams.speed * 1.1, 15);
      this.currentParams.challengeFrequency = Math.min(
        this.currentParams.challengeFrequency * 1.2,
        0.003
      );
      this.currentParams.obstacleSpeed = Math.min(this.currentParams.obstacleSpeed * 1.05, 12);
      this.currentParams.gravity = Math.min(this.currentParams.gravity * 1.02, 1.2);
    } else if (decision.action === 'decrease') {
      this.currentParams.speed = Math.max(this.currentParams.speed * 0.9, 3);
      this.currentParams.challengeFrequency = Math.max(
        this.currentParams.challengeFrequency * 0.8,
        0.0003
      );
      this.currentParams.obstacleSpeed = Math.max(this.currentParams.obstacleSpeed * 0.95, 3);
      this.currentParams.gravity = Math.max(this.currentParams.gravity * 0.95, 0.6);
    }

    const messageByAction = {
      increase: 'Dificuldade aumentada gradualmente com base no desempenho recente.',
      decrease: 'Dificuldade reduzida gradualmente para manter uma experiência confortável.',
      maintain: 'Dificuldade mantida dentro da faixa de estabilidade configurada.',
      insufficient_data: 'Mais tentativas são necessárias antes de ajustar a dificuldade.'
    };

    this.adjustmentCount += 1;
    this.lastAdjustment = {
      timestamp: Date.now(),
      type: decision.action,
      accuracy: metrics.accuracy,
      avgReactionTime: metrics.avgReactionTime,
      rtVariability: metrics.rtVariability,
      sampleSize: metrics.sampleSize,
      confidence: decision.confidence,
      reason: decision.reason,
      policyVersion: decision.policyVersion
    };

    return {
      adjustment: decision.action,
      message: messageByAction[decision.action] || messageByAction.maintain,
      reason: decision.reason,
      confidence: decision.confidence,
      params: this.getParams(),
      policyVersion: decision.policyVersion
    };
  }

  calculateStdDev(values) {
    if (values.length === 0) return 0;

    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    const squaredDifferences = values.map(value => Math.pow(value - average, 2));
    const averageSquaredDifference = squaredDifferences.reduce((sum, value) => sum + value, 0) / values.length;
    return Math.sqrt(averageSquaredDifference);
  }

  getParams() {
    return { ...this.currentParams };
  }

  getStats() {
    const metrics = this.analyzePerformance();
    return {
      totalAttempts: this.attemptHistory.length,
      recentAccuracy: metrics.accuracy,
      avgReactionTime: metrics.avgReactionTime,
      rtVariability: metrics.rtVariability,
      sampleSize: metrics.sampleSize,
      adjustmentCount: this.adjustmentCount,
      lastAdjustment: this.lastAdjustment,
      currentParams: this.getParams()
    };
  }

  reset() {
    this.attemptHistory = [];
    this.adjustmentCount = 0;
    this.lastAdjustment = null;
    this.currentParams = {
      speed: 5,
      challengeFrequency: 0.0008,
      obstacleSpeed: 5,
      gravity: 0.8,
      jumpVelocity: -12
    };
  }
}
