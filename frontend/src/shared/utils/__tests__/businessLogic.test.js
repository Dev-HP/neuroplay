/**
 * TESTES DE LÓGICA DE NEGÓCIO - CRÍTICOS
 * Cálculos e regras que definem o funcionamento do sistema
 */

describe('Business Logic: Score Calculation', () => {
  const calculateScore = (correct, time, difficulty) => {
    const baseScore = correct * 10;
    const timeBonus = Math.max(0, 100 - time);
    const difficultyMultiplier = 1 + (difficulty * 0.5);
    return Math.round((baseScore + timeBonus) * difficultyMultiplier);
  };

  it('should calculate base score correctly', () => {
    const score = calculateScore(5, 50, 0);
    expect(score).toBe(100); // (5*10 + 50) * 1
  });

  it('should apply time bonus', () => {
    const fastScore = calculateScore(5, 20, 0);
    const slowScore = calculateScore(5, 80, 0);
    expect(fastScore).toBeGreaterThan(slowScore);
  });

  it('should apply difficulty multiplier', () => {
    const easyScore = calculateScore(5, 50, 0);
    const hardScore = calculateScore(5, 50, 1);
    expect(hardScore).toBeGreaterThan(easyScore);
  });

  it('should handle edge cases', () => {
    expect(calculateScore(0, 0, 0)).toBe(100);
    expect(calculateScore(10, 200, 2)).toBeGreaterThan(0);
  });
});

describe('Business Logic: Difficulty Adaptation', () => {
  const adaptDifficulty = (accuracy, consecutiveCorrect, currentDifficulty) => {
    if (accuracy > 0.9 && consecutiveCorrect >= 5) {
      return Math.min(1, currentDifficulty + 0.1);
    }
    if (accuracy < 0.5 && consecutiveCorrect === 0) {
      return Math.max(0, currentDifficulty - 0.1);
    }
    return currentDifficulty;
  };

  it('should increase difficulty on high performance', () => {
    const newDifficulty = adaptDifficulty(0.95, 6, 0.5);
    expect(newDifficulty).toBe(0.6);
  });

  it('should decrease difficulty on low performance', () => {
    const newDifficulty = adaptDifficulty(0.4, 0, 0.5);
    expect(newDifficulty).toBe(0.4);
  });

  it('should maintain difficulty on average performance', () => {
    const newDifficulty = adaptDifficulty(0.7, 3, 0.5);
    expect(newDifficulty).toBe(0.5);
  });

  it('should not exceed maximum difficulty', () => {
    const newDifficulty = adaptDifficulty(0.95, 6, 0.95);
    expect(newDifficulty).toBeLessThanOrEqual(1);
  });

  it('should not go below minimum difficulty', () => {
    const newDifficulty = adaptDifficulty(0.3, 0, 0.05);
    expect(newDifficulty).toBeGreaterThanOrEqual(0);
  });
});

describe('Business Logic: Achievement Unlock Conditions', () => {
  const checkAchievementUnlock = (type, value, threshold) => {
    switch (type) {
      case 'score':
        return value >= threshold;
      case 'accuracy':
        return value >= threshold;
      case 'streak':
        return value >= threshold;
      case 'time':
        return value <= threshold; // Menor é melhor
      default:
        return false;
    }
  };

  it('should unlock score-based achievements', () => {
    expect(checkAchievementUnlock('score', 1000, 1000)).toBe(true);
    expect(checkAchievementUnlock('score', 999, 1000)).toBe(false);
  });

  it('should unlock accuracy-based achievements', () => {
    expect(checkAchievementUnlock('accuracy', 0.95, 0.9)).toBe(true);
    expect(checkAchievementUnlock('accuracy', 0.85, 0.9)).toBe(false);
  });

  it('should unlock streak-based achievements', () => {
    expect(checkAchievementUnlock('streak', 10, 10)).toBe(true);
    expect(checkAchievementUnlock('streak', 9, 10)).toBe(false);
  });

  it('should unlock time-based achievements', () => {
    expect(checkAchievementUnlock('time', 30, 60)).toBe(true);
    expect(checkAchievementUnlock('time', 70, 60)).toBe(false);
  });
});

describe('Business Logic: XP and Level Calculation', () => {
  const calculateLevel = (xp) => {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  };

  const xpForNextLevel = (currentLevel) => {
    return Math.pow(currentLevel, 2) * 100;
  };

  it('should calculate level from XP', () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(100)).toBe(2);
    expect(calculateLevel(400)).toBe(3);
    expect(calculateLevel(900)).toBe(4);
  });

  it('should calculate XP needed for next level', () => {
    expect(xpForNextLevel(1)).toBe(100);
    expect(xpForNextLevel(2)).toBe(400);
    expect(xpForNextLevel(3)).toBe(900);
  });

  it('should have consistent level progression', () => {
    const level = 5;
    const xpNeeded = xpForNextLevel(level);
    const calculatedLevel = calculateLevel(xpNeeded);
    expect(calculatedLevel).toBe(level + 1);
  });
});

describe('Business Logic: Session Timeout', () => {
  const isSessionValid = (lastActivity, maxInactiveMinutes = 30) => {
    const now = Date.now();
    const inactiveTime = (now - lastActivity) / 1000 / 60;
    return inactiveTime < maxInactiveMinutes;
  };

  it('should validate active session', () => {
    const now = Date.now();
    expect(isSessionValid(now)).toBe(true);
  });

  it('should invalidate expired session', () => {
    const thirtyOneMinutesAgo = Date.now() - (31 * 60 * 1000);
    expect(isSessionValid(thirtyOneMinutesAgo)).toBe(false);
  });

  it('should respect custom timeout', () => {
    const sixMinutesAgo = Date.now() - (6 * 60 * 1000);
    expect(isSessionValid(sixMinutesAgo, 5)).toBe(false);
    expect(isSessionValid(sixMinutesAgo, 10)).toBe(true);
  });
});
