/**
 * Error Cascade Detector
 * 
 * Detecta padrões de erro consecutivos em jogos e sugere ações
 * para prevenir frustração e sobrecarga cognitiva em crianças com TEA.
 * 
 * Funcionalidades:
 * - Detecta 4+ erros consecutivos
 * - Classifica severidade (warning, critical)
 * - Sugere redução de dificuldade
 * - Recomenda pausas
 */

class ErrorCascadeDetector {
  constructor(threshold = 4) {
    this.threshold = threshold; // Número de erros para considerar cascata
    this.recentAttempts = []; // Buffer das últimas 10 tentativas
    this.maxBufferSize = 10;
    this.cascadeDetected = false;
    this.lastCascadeTime = null;
  }

  /**
   * Adiciona uma tentativa ao buffer e verifica cascata
   * @param {boolean} isCorrect - Se a tentativa foi correta
   * @returns {Object} Resultado da análise com ações recomendadas
   */
  addAttempt(isCorrect) {
    const attempt = {
      isCorrect,
      timestamp: Date.now()
    };

    // Adicionar ao buffer
    this.recentAttempts.push(attempt);

    // Manter apenas últimas 10 tentativas
    if (this.recentAttempts.length > this.maxBufferSize) {
      this.recentAttempts.shift();
    }

    // Verificar cascata
    return this.checkCascade();
  }

  /**
   * Verifica se há cascata de erros
   * @returns {Object} Resultado da análise
   */
  checkCascade() {
    // Precisa de pelo menos 'threshold' tentativas
    if (this.recentAttempts.length < this.threshold) {
      return {
        cascade: false,
        consecutiveErrors: 0,
        severity: 'none',
        action: null,
        suggestion: null
      };
    }

    // Contar erros consecutivos recentes
    let consecutiveErrors = 0;
    for (let i = this.recentAttempts.length - 1; i >= 0; i--) {
      if (!this.recentAttempts[i].isCorrect) {
        consecutiveErrors++;
      } else {
        break; // Para ao encontrar um acerto
      }
    }

    // Verificar se atingiu o threshold
    if (consecutiveErrors >= this.threshold) {
      const now = Date.now();
      const timeSinceLastCascade = this.lastCascadeTime 
        ? now - this.lastCascadeTime 
        : Infinity;

      // Evitar alertas repetidos (mínimo 30 segundos entre alertas)
      if (timeSinceLastCascade < 30000) {
        return {
          cascade: true,
          consecutiveErrors,
          severity: 'acknowledged',
          action: null,
          suggestion: null,
          cooldown: true
        };
      }

      this.cascadeDetected = true;
      this.lastCascadeTime = now;

      // Determinar severidade
      let severity = 'warning';
      let suggestion = 'Que tal fazer uma pausa de 30 segundos? Isso pode ajudar!';
      let action = 'reduce_difficulty';

      if (consecutiveErrors >= 6) {
        severity = 'critical';
        suggestion = 'Vamos fazer uma pausa? Você está indo muito bem, só precisa descansar um pouco! 😊';
        action = 'reduce_difficulty_and_pause';
      }

      return {
        cascade: true,
        consecutiveErrors,
        severity,
        action,
        suggestion,
        timestamp: now,
        cooldown: false
      };
    }

    // Resetar flag se houve melhora
    if (consecutiveErrors === 0 && this.cascadeDetected) {
      this.cascadeDetected = false;
    }

    return {
      cascade: false,
      consecutiveErrors,
      severity: 'none',
      action: null,
      suggestion: null
    };
  }

  /**
   * Obtém estatísticas do buffer atual
   * @returns {Object} Estatísticas
   */
  getStats() {
    if (this.recentAttempts.length === 0) {
      return {
        totalAttempts: 0,
        correctAttempts: 0,
        incorrectAttempts: 0,
        accuracy: 0,
        recentAccuracy: 0
      };
    }

    const totalAttempts = this.recentAttempts.length;
    const correctAttempts = this.recentAttempts.filter(a => a.isCorrect).length;
    const incorrectAttempts = totalAttempts - correctAttempts;
    const accuracy = (correctAttempts / totalAttempts) * 100;

    // Acurácia das últimas 5 tentativas
    const recentFive = this.recentAttempts.slice(-5);
    const recentCorrect = recentFive.filter(a => a.isCorrect).length;
    const recentAccuracy = (recentCorrect / recentFive.length) * 100;

    return {
      totalAttempts,
      correctAttempts,
      incorrectAttempts,
      accuracy: parseFloat(accuracy.toFixed(1)),
      recentAccuracy: parseFloat(recentAccuracy.toFixed(1))
    };
  }

  /**
   * Verifica se o jogador está melhorando
   * @returns {boolean}
   */
  isImproving() {
    if (this.recentAttempts.length < 6) return false;

    const older = this.recentAttempts.slice(0, 5);
    const recent = this.recentAttempts.slice(-5);

    const olderAccuracy = older.filter(a => a.isCorrect).length / older.length;
    const recentAccuracy = recent.filter(a => a.isCorrect).length / recent.length;

    return recentAccuracy > olderAccuracy;
  }

  /**
   * Gera mensagem encorajadora baseada no desempenho
   * @returns {string}
   */
  getEncouragementMessage() {
    const stats = this.getStats();

    if (stats.accuracy >= 80) {
      return 'Você está indo muito bem! Continue assim! 🌟';
    } else if (stats.accuracy >= 60) {
      return 'Bom trabalho! Você está melhorando! 👍';
    } else if (this.isImproving()) {
      return 'Ótimo progresso! Continue tentando! 💪';
    } else {
      return 'Não desista! Cada tentativa é um aprendizado! 🎯';
    }
  }

  /**
   * Reseta o detector (útil ao iniciar novo jogo)
   */
  reset() {
    this.recentAttempts = [];
    this.cascadeDetected = false;
    this.lastCascadeTime = null;
  }

  /**
   * Exporta dados para análise
   * @returns {Object}
   */
  exportData() {
    return {
      recentAttempts: this.recentAttempts,
      stats: this.getStats(),
      cascadeDetected: this.cascadeDetected,
      lastCascadeTime: this.lastCascadeTime,
      isImproving: this.isImproving()
    };
  }
}

// Instância singleton para uso global
const errorCascadeDetectorInstance = new ErrorCascadeDetector();

export default errorCascadeDetectorInstance;
