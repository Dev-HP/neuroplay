/**
 * Sistema de Adaptação Dinâmica de Dificuldade
 * Baseado em evidências científicas (Nature, 2021)
 * Mantém jogador na "zona de desenvolvimento proximal" (60-85% acerto)
 */

export class AdaptiveDifficulty {
  constructor() {
    this.windowSize = 10; // Últimas 10 tentativas
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
  
  /**
   * Registra tentativa do jogador
   */
  recordAttempt(attempt) {
    this.attemptHistory.push({
      correct: attempt.correct,
      reactionTime: attempt.reactionTime,
      timestamp: Date.now(),
      type: attempt.type // 'obstacle', 'challenge', etc
    });
    
    // Mantém apenas últimas N tentativas
    if (this.attemptHistory.length > this.windowSize * 2) {
      this.attemptHistory.shift();
    }
    
    // Ajusta a cada 10 tentativas
    if (this.attemptHistory.length >= this.windowSize && 
        this.attemptHistory.length % this.windowSize === 0) {
      return this.adjustDifficulty();
    }
    
    return null;
  }
  
  /**
   * Analisa performance recente
   */
  analyzePerformance() {
    const recentAttempts = this.attemptHistory.slice(-this.windowSize);
    
    if (recentAttempts.length === 0) {
      return { accuracy: 1.0, avgReactionTime: 1000, rtVariability: 0 };
    }
    
    const accuracy = recentAttempts.filter(a => a.correct).length / recentAttempts.length;
    const reactionTimes = recentAttempts.map(a => a.reactionTime).filter(rt => rt > 0);
    
    const avgReactionTime = reactionTimes.length > 0
      ? reactionTimes.reduce((sum, rt) => sum + rt, 0) / reactionTimes.length
      : 1000;
    
    const rtVariability = this.calculateStdDev(reactionTimes);
    
    return { accuracy, avgReactionTime, rtVariability };
  }
  
  /**
   * Ajusta dificuldade baseado em performance
   * Zona de Desenvolvimento Proximal (Vygotsky): 60-85% acerto
   */
  adjustDifficulty() {
    const { accuracy, avgReactionTime, rtVariability } = this.analyzePerformance();
    
    let adjustment = null;
    let message = null;
    
    // Muito fácil - aumenta dificuldade
    if (accuracy > 0.85 && avgReactionTime < 800) {
      this.currentParams.speed = Math.min(this.currentParams.speed * 1.1, 15);
      this.currentParams.challengeFrequency = Math.min(this.currentParams.challengeFrequency * 1.2, 0.003);
      this.currentParams.obstacleSpeed = Math.min(this.currentParams.obstacleSpeed * 1.05, 12);
      
      adjustment = 'increase';
      message = '📈 Dificuldade aumentada! Você está indo muito bem!';
      
    // Muito difícil - reduz dificuldade
    } else if (accuracy < 0.60 || avgReactionTime > 2000 || rtVariability > 500) {
      this.currentParams.speed = Math.max(this.currentParams.speed * 0.9, 3);
      this.currentParams.challengeFrequency = Math.max(this.currentParams.challengeFrequency * 0.8, 0.0003);
      this.currentParams.obstacleSpeed = Math.max(this.currentParams.obstacleSpeed * 0.95, 3);
      this.currentParams.gravity = Math.max(this.currentParams.gravity * 0.95, 0.6);
      
      adjustment = 'decrease';
      message = '📉 Dificuldade ajustada para melhor experiência';
      
    // Zona ideal - mantém
    } else {
      adjustment = 'maintain';
      message = '✅ Você está na zona ideal de aprendizado!';
    }
    
    this.adjustmentCount++;
    this.lastAdjustment = {
      timestamp: Date.now(),
      type: adjustment,
      accuracy,
      avgReactionTime,
      rtVariability
    };
    
    console.log(`[Adaptive] ${message}`, {
      accuracy: `${(accuracy * 100).toFixed(1)}%`,
      avgRT: `${avgReactionTime.toFixed(0)}ms`,
      params: this.currentParams
    });
    
    return { adjustment, message, params: this.getParams() };
  }
  
  /**
   * Calcula desvio padrão
   */
  calculateStdDev(values) {
    if (values.length === 0) return 0;
    
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squareDiffs = values.map(v => Math.pow(v - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((sum, v) => sum + v, 0) / values.length;
    
    return Math.sqrt(avgSquareDiff);
  }
  
  /**
   * Retorna parâmetros atuais
   */
  getParams() {
    return { ...this.currentParams };
  }
  
  /**
   * Retorna estatísticas
   */
  getStats() {
    const { accuracy, avgReactionTime, rtVariability } = this.analyzePerformance();
    
    return {
      totalAttempts: this.attemptHistory.length,
      recentAccuracy: accuracy,
      avgReactionTime,
      rtVariability,
      adjustmentCount: this.adjustmentCount,
      lastAdjustment: this.lastAdjustment,
      currentParams: this.currentParams
    };
  }
  
  /**
   * Reseta sistema
   */
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
