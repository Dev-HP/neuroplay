// Sistema de IA para adaptação de dificuldade usando TensorFlow.js
import * as tf from '@tensorflow/tfjs';

class AIAdaptation {
  constructor() {
    this.model = null;
    this.performanceHistory = [];
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    // Criar modelo simples de rede neural para predição de dificuldade
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [10], units: 16, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 8, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['accuracy']
    });

    this.initialized = true;
  }

  // Analisar desempenho do jogador
  analyzePerformance(gameData) {
    const startTime = performance.now(); // ← MEDIÇÃO DE LATÊNCIA INICIADA

    const {
      accuracy,
      reactionTime,
      errorsCount,
      successStreak
    } = gameData;

    // Calcular métricas normalizadas
    const normalizedAccuracy = accuracy / 100;
    const normalizedReactionTime = Math.min(reactionTime / 2000, 1);
    const normalizedErrors = Math.min(errorsCount / 10, 1);
    const normalizedStreak = Math.min(successStreak / 10, 1);

    // Score de performance (0-1)
    const performanceScore = (
      normalizedAccuracy * 0.4 +
      (1 - normalizedReactionTime) * 0.2 +
      (1 - normalizedErrors) * 0.2 +
      normalizedStreak * 0.2
    );

    const latency = performance.now() - startTime; // ← MEDIÇÃO DE LATÊNCIA FINALIZADA

    // Log para análise (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[IA Performance] Latência: ${latency.toFixed(2)}ms | Score: ${(performanceScore * 100).toFixed(1)}%`);
    }

    // Alerta se latência muito alta
    if (latency > 50) {
      console.warn(`⚠️ IA Latency HIGH: ${latency.toFixed(2)}ms (meta: <50ms)`);
    }

    this.performanceHistory.push({
      score: performanceScore,
      timestamp: Date.now(),
      latency, // ← SALVAR LATÊNCIA NO HISTÓRICO
      gameData
    });

    // Manter apenas últimas 50 sessões
    if (this.performanceHistory.length > 50) {
      this.performanceHistory.shift();
    }

    return { 
      performanceScore, 
      latency, // ← RETORNAR LATÊNCIA
      timestamp: Date.now()
    };
  }

  // Recomendar próximo nível de dificuldade
  recommendDifficulty(currentDifficulty, performanceScore) {
    // Lógica adaptativa baseada em performance
    let recommendation = currentDifficulty;

    if (performanceScore > 0.85) {
      // Excelente performance - aumentar dificuldade
      recommendation = Math.min(10, currentDifficulty + 1);
    } else if (performanceScore > 0.7) {
      // Boa performance - manter ou aumentar levemente
      recommendation = currentDifficulty + (Math.random() > 0.5 ? 1 : 0);
    } else if (performanceScore < 0.4) {
      // Performance baixa - reduzir dificuldade
      recommendation = Math.max(1, currentDifficulty - 1);
    } else if (performanceScore < 0.55) {
      // Performance média-baixa - considerar reduzir
      recommendation = Math.max(1, currentDifficulty - (Math.random() > 0.5 ? 1 : 0));
    }

    return recommendation;
  }

  // Detectar padrões de dificuldade
  detectPatterns() {
    if (this.performanceHistory.length < 5) {
      return { trend: 'insufficient_data', confidence: 0 };
    }

    const recent = this.performanceHistory.slice(-10);
    const scores = recent.map(h => h.score);
    
    // Calcular tendência
    const avgRecent = scores.slice(-5).reduce((a, b) => a + b, 0) / 5;
    const avgOlder = scores.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
    
    let trend = 'stable';
    if (avgRecent > avgOlder + 0.1) trend = 'improving';
    if (avgRecent < avgOlder - 0.1) trend = 'declining';

    // Calcular variância (consistência)
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const consistency = 1 - Math.min(variance * 2, 1);

    return {
      trend,
      consistency,
      averageScore: mean,
      recentScore: avgRecent,
      confidence: Math.min(this.performanceHistory.length / 20, 1)
    };
  }

  // Gerar insights personalizados
  generateInsights() {
    const patterns = this.detectPatterns();
    const insights = [];

    if (patterns.trend === 'improving') {
      insights.push({
        type: 'positive',
        message: 'Ótimo progresso! Seu desempenho está melhorando consistentemente.',
        icon: '📈'
      });
    } else if (patterns.trend === 'declining') {
      insights.push({
        type: 'attention',
        message: 'Que tal fazer uma pausa? Descansar ajuda na concentração.',
        icon: '☕'
      });
    }

    if (patterns.consistency > 0.8) {
      insights.push({
        type: 'positive',
        message: 'Você está muito consistente! Continue assim.',
        icon: '🎯'
      });
    } else if (patterns.consistency < 0.4) {
      insights.push({
        type: 'tip',
        message: 'Tente manter um ritmo constante para melhores resultados.',
        icon: '💡'
      });
    }

    if (patterns.averageScore > 0.8) {
      insights.push({
        type: 'achievement',
        message: 'Desempenho excepcional! Você está dominando este jogo.',
        icon: '🏆'
      });
    }

    return insights;
  }

  // Prever tempo ideal de sessão
  predictOptimalSessionTime() {
    if (this.performanceHistory.length < 10) return 15; // Default 15 minutos

    // Analisar quando performance começa a cair
    const sessions = this.performanceHistory.slice(-20);
    const timePerformance = sessions.map(s => ({
      time: s.gameData.timeSpent,
      score: s.score
    }));

    // Encontrar ponto onde performance cai significativamente
    let optimalTime = 15;
    for (let i = 5; i < timePerformance.length; i++) {
      const recent = timePerformance.slice(i - 5, i);
      const avgScore = recent.reduce((a, b) => a + b.score, 0) / recent.length;
      
      if (avgScore < 0.6) {
        optimalTime = Math.max(10, Math.min(30, recent[0].time));
        break;
      }
    }

    return optimalTime;
  }

  // Sugerir próximo jogo baseado em áreas de melhoria
  suggestNextGame(currentGame, allGames) {
    const patterns = this.detectPatterns();
    
    // Se está indo bem, sugerir jogo mais desafiador
    if (patterns.averageScore > 0.75) {
      const harder = allGames.filter(g => 
        g.difficulty > currentGame.difficulty && 
        g.category === currentGame.category
      );
      return harder[0] || currentGame;
    }
    
    // Se está com dificuldade, sugerir jogo complementar mais fácil
    if (patterns.averageScore < 0.5) {
      const easier = allGames.filter(g => 
        g.difficulty < currentGame.difficulty && 
        g.category === currentGame.category
      );
      return easier[easier.length - 1] || currentGame;
    }

    // Performance média - sugerir jogo de categoria diferente para variedade
    const different = allGames.filter(g => g.category !== currentGame.category);
    return different[Math.floor(Math.random() * different.length)] || currentGame;
  }

  // Exportar dados para análise
  exportData() {
    return {
      performanceHistory: this.performanceHistory,
      patterns: this.detectPatterns(),
      insights: this.generateInsights(),
      optimalSessionTime: this.predictOptimalSessionTime(),
      latencyStats: this.getLatencyStats() // ← ADICIONAR ESTATÍSTICAS DE LATÊNCIA
    };
  }

  // Obter estatísticas de latência da IA
  getLatencyStats() {
    if (this.performanceHistory.length === 0) {
      return {
        average: 0,
        min: 0,
        max: 0,
        p95: 0,
        withinTarget: 0
      };
    }

    const latencies = this.performanceHistory
      .filter(h => h.latency !== undefined)
      .map(h => h.latency);

    if (latencies.length === 0) {
      return {
        average: 0,
        min: 0,
        max: 0,
        p95: 0,
        withinTarget: 0
      };
    }

    const sorted = [...latencies].sort((a, b) => a - b);
    const average = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const p95Index = Math.floor(sorted.length * 0.95);
    const p95 = sorted[p95Index];
    const withinTarget = (latencies.filter(l => l < 50).length / latencies.length) * 100;

    return {
      average: parseFloat(average.toFixed(2)),
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      p95: parseFloat(p95.toFixed(2)),
      withinTarget: parseFloat(withinTarget.toFixed(1)),
      totalMeasurements: latencies.length
    };
  }

  // Limpar histórico
  reset() {
    this.performanceHistory = [];
  }
}

const aiAdaptationInstance = new AIAdaptation();
export default aiAdaptationInstance;
