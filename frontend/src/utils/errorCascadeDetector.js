// Detector de Erro em Cascata
// Detecta quando o usuário erra múltiplas vezes seguidas e sugere ações

export class ErrorCascadeDetector {
  constructor(threshold = 4) {
    this.threshold = threshold; // Número de erros consecutivos para detectar cascata
    this.recentAttempts = []; // Buffer das últimas tentativas
  }

  // Adicionar uma tentativa (correta ou incorreta)
  addAttempt(isCorrect) {
    this.recentAttempts.push({
      isCorrect,
      timestamp: Date.now()
    });

    // Manter apenas últimas 10 tentativas
    if (this.recentAttempts.length > 10) {
      this.recentAttempts.shift();
    }

    return this.checkCascade();
  }

  // Verificar se há cascata de erros
  checkCascade() {
    if (this.recentAttempts.length < this.threshold) {
      return { cascade: false };
    }

    // Analisar últimas 5 tentativas
    const lastFive = this.recentAttempts.slice(-5);
    const errors = lastFive.filter(a => !a.isCorrect).length;

    // Detectar cascata (4+ erros em 5 tentativas)
    if (errors >= this.threshold) {
      return {
        cascade: true,
        consecutiveErrors: errors,
        action: 'reduce_difficulty',
        suggestion: 'Oferecer pausa de 30 segundos',
        severity: this.calculateSeverity(errors)
      };
    }

    return { cascade: false };
  }

  // Calcular severidade da cascata
  calculateSeverity(errorCount) {
    if (errorCount >= 5) return 'critical'; // Todos erros
    if (errorCount >= 4) return 'high';     // 4 de 5
    return 'medium';
  }

  // Obter estatísticas das tentativas recentes
  getStats() {
    if (this.recentAttempts.length === 0) {
      return {
        total: 0,
        correct: 0,
        incorrect: 0,
        accuracy: 0
      };
    }

    const correct = this.recentAttempts.filter(a => a.isCorrect).length;
    const incorrect = this.recentAttempts.length - correct;
    const accuracy = (correct / this.recentAttempts.length) * 100;

    return {
      total: this.recentAttempts.length,
      correct,
      incorrect,
      accuracy: parseFloat(accuracy.toFixed(1))
    };
  }

  // Verificar se deve sugerir pausa
  shouldSuggestBreak() {
    const cascade = this.checkCascade();
    return cascade.cascade && cascade.severity === 'critical';
  }

  // Resetar histórico
  reset() {
    this.recentAttempts = [];
  }

  // Obter últimas N tentativas
  getRecentAttempts(count = 5) {
    return this.recentAttempts.slice(-count);
  }

  // Verificar tendência (melhorando, piorando, estável)
  getTrend() {
    if (this.recentAttempts.length < 6) {
      return 'insufficient_data';
    }

    const older = this.recentAttempts.slice(0, 3);
    const recent = this.recentAttempts.slice(-3);

    const olderAccuracy = older.filter(a => a.isCorrect).length / older.length;
    const recentAccuracy = recent.filter(a => a.isCorrect).length / recent.length;

    if (recentAccuracy > olderAccuracy + 0.2) return 'improving';
    if (recentAccuracy < olderAccuracy - 0.2) return 'declining';
    return 'stable';
  }
}

// Criar instância singleton
const errorCascadeDetector = new ErrorCascadeDetector();
export default errorCascadeDetector;
