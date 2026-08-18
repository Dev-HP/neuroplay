import {
  ADAPTATION_POLICY_VERSION,
  applyDifficultyDecision,
  calculatePerformanceScore,
  evaluateAdaptation,
  normalizePerformanceMetrics
} from './adaptationPolicy';

class LocalAdaptation {
  constructor() {
    this.performanceHistory = [];
    this.initialized = false;
  }

  init() {
    this.initialized = true;
    return true;
  }

  analyzePerformance(gameData = {}) {
    const startTime = typeof performance !== 'undefined' && performance.now
      ? performance.now()
      : Date.now();
    const metrics = normalizePerformanceMetrics({
      accuracy: gameData.accuracy,
      reactionTime: gameData.reactionTime,
      errorsCount: gameData.errorsCount,
      successStreak: gameData.successStreak,
      sampleSize: gameData.sampleSize || this.performanceHistory.length + 1
    });
    const performanceScore = calculatePerformanceScore(metrics);
    const endTime = typeof performance !== 'undefined' && performance.now
      ? performance.now()
      : Date.now();
    const latency = Math.max(0, endTime - startTime);

    this.performanceHistory.push({
      score: performanceScore,
      timestamp: Date.now(),
      latency,
      metrics,
      gameData
    });

    if (this.performanceHistory.length > 50) {
      this.performanceHistory.shift();
    }

    return {
      performanceScore,
      metrics,
      latency,
      timestamp: Date.now(),
      policyVersion: ADAPTATION_POLICY_VERSION
    };
  }

  recommendDifficulty(currentDifficulty, performanceScore, options = {}) {
    const decision = evaluateAdaptation({
      accuracy: Number(performanceScore) || 0,
      avgReactionTime: options.avgReactionTime || 1000,
      rtVariability: options.rtVariability || 0,
      sampleSize: options.sampleSize || this.performanceHistory.length
    });

    return applyDifficultyDecision(currentDifficulty, decision, options);
  }

  detectPatterns() {
    if (this.performanceHistory.length < 5) {
      return {
        trend: 'insufficient_data',
        consistency: 0,
        averageScore: 0,
        recentScore: 0,
        confidence: 0
      };
    }

    const recent = this.performanceHistory.slice(-10);
    const scores = recent.map(entry => entry.score);
    const recentScores = scores.slice(-5);
    const olderScores = scores.slice(0, 5);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const recentScore = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
    const olderScore = olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / scores.length;

    let trend = 'stable';
    if (recentScore > olderScore + 0.1) trend = 'improving';
    if (recentScore < olderScore - 0.1) trend = 'declining';

    return {
      trend,
      consistency: 1 - Math.min(variance * 2, 1),
      averageScore,
      recentScore,
      confidence: Math.min(this.performanceHistory.length / 20, 1)
    };
  }

  generateInsights() {
    const patterns = this.detectPatterns();
    const insights = [];

    if (patterns.trend === 'improving') {
      insights.push({
        type: 'positive',
        message: 'O desempenho recente está melhorando de forma consistente.',
        icon: '📈'
      });
    } else if (patterns.trend === 'declining') {
      insights.push({
        type: 'attention',
        message: 'Considere uma pausa ou uma sessão mais curta.',
        icon: '☕'
      });
    }

    if (patterns.consistency > 0.8) {
      insights.push({
        type: 'positive',
        message: 'O desempenho recente está consistente.',
        icon: '🎯'
      });
    } else if (patterns.consistency > 0 && patterns.consistency < 0.4) {
      insights.push({
        type: 'tip',
        message: 'Manter um ritmo constante pode ajudar na experiência do jogo.',
        icon: '💡'
      });
    }

    if (patterns.averageScore > 0.8) {
      insights.push({
        type: 'achievement',
        message: 'O desempenho recente ficou em uma faixa alta.',
        icon: '🏆'
      });
    }

    return insights;
  }

  predictOptimalSessionTime() {
    if (this.performanceHistory.length < 10) return 15;

    const sessions = this.performanceHistory.slice(-20);
    const timePerformance = sessions.map(entry => ({
      time: Number(entry.gameData?.timeSpent) || 0,
      score: entry.score
    }));

    let optimalTime = 15;
    for (let index = 5; index < timePerformance.length; index += 1) {
      const recent = timePerformance.slice(index - 5, index);
      const averageScore = recent.reduce((sum, entry) => sum + entry.score, 0) / recent.length;
      if (averageScore < 0.6) {
        optimalTime = Math.max(10, Math.min(30, recent[0].time));
        break;
      }
    }

    return optimalTime;
  }

  suggestNextGame(currentGame, allGames = []) {
    const patterns = this.detectPatterns();
    const games = Array.isArray(allGames) ? allGames : [];

    if (patterns.averageScore > 0.75) {
      return games.find(game => game.difficulty > currentGame.difficulty
        && game.category === currentGame.category) || currentGame;
    }

    if (patterns.averageScore > 0 && patterns.averageScore < 0.5) {
      const easier = games.filter(game => game.difficulty < currentGame.difficulty
        && game.category === currentGame.category);
      return easier[easier.length - 1] || currentGame;
    }

    return games.find(game => game.category !== currentGame.category) || currentGame;
  }

  exportData() {
    return {
      performanceHistory: this.performanceHistory,
      patterns: this.detectPatterns(),
      insights: this.generateInsights(),
      optimalSessionTime: this.predictOptimalSessionTime(),
      latencyStats: this.getLatencyStats(),
      policyVersion: ADAPTATION_POLICY_VERSION
    };
  }

  getLatencyStats() {
    const latencies = this.performanceHistory
      .map(entry => entry.latency)
      .filter(latency => Number.isFinite(latency));

    if (latencies.length === 0) {
      return {
        average: 0,
        min: 0,
        max: 0,
        p95: 0,
        withinTarget: 0,
        totalMeasurements: 0
      };
    }

    const sorted = [...latencies].sort((left, right) => left - right);
    const average = latencies.reduce((sum, value) => sum + value, 0) / latencies.length;
    const p95 = sorted[Math.min(Math.floor(sorted.length * 0.95), sorted.length - 1)];

    return {
      average: Number(average.toFixed(2)),
      min: Number(sorted[0].toFixed(2)),
      max: Number(sorted[sorted.length - 1].toFixed(2)),
      p95: Number(p95.toFixed(2)),
      withinTarget: Number(((latencies.filter(value => value < 50).length / latencies.length) * 100).toFixed(1)),
      totalMeasurements: latencies.length
    };
  }

  reset() {
    this.performanceHistory = [];
  }
}

const localAdaptation = new LocalAdaptation();
export default localAdaptation;
