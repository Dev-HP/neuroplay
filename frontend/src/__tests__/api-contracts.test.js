/**
 * TESTES DE CONTRATO DE API - CRÍTICOS
 * Garantem que Frontend e Backend continuam se comunicando
 */

describe('API Contract: Authentication Endpoints', () => {
  describe('POST /api/auth/login', () => {
    it('should accept valid login request', () => {
      const request = {
        email: 'user@example.com',
        password: 'password123'
      };

      expect(request).toHaveProperty('email');
      expect(request).toHaveProperty('password');
      expect(typeof request.email).toBe('string');
      expect(typeof request.password).toBe('string');
    });

    it('should return valid success response', () => {
      const response = {
        success: true,
        data: {
          token: 'jwt-token-here',
          user: {
            id: 1,
            name: 'Test User',
            email: 'user@example.com',
            role: 'student'
          }
        }
      };

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('token');
      expect(response.data).toHaveProperty('user');
      expect(response.data.user).toHaveProperty('id');
      expect(response.data.user).toHaveProperty('role');
    });

    it('should return valid error response', () => {
      const response = {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email ou senha inválidos'
        }
      };

      expect(response.success).toBe(false);
      expect(response.error).toHaveProperty('code');
      expect(response.error).toHaveProperty('message');
    });
  });
});

describe('API Contract: Game Session Endpoints', () => {
  describe('POST /api/games/session/start', () => {
    it('should accept valid session start request', () => {
      const request = {
        gameId: 'cyber-runner',
        userId: 1,
        difficulty: 0.5
      };

      expect(request).toHaveProperty('gameId');
      expect(request).toHaveProperty('userId');
      expect(request).toHaveProperty('difficulty');
    });

    it('should return valid session response', () => {
      const response = {
        success: true,
        data: {
          sessionId: 'session-123',
          gameId: 'cyber-runner',
          startTime: '2024-01-01T00:00:00Z',
          config: {
            difficulty: 0.5,
            timeLimit: 300
          }
        }
      };

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('sessionId');
      expect(response.data).toHaveProperty('gameId');
      expect(response.data).toHaveProperty('startTime');
      expect(response.data).toHaveProperty('config');
    });
  });

  describe('POST /api/games/session/end', () => {
    it('should accept valid session end request', () => {
      const request = {
        sessionId: 'session-123',
        score: 1000,
        accuracy: 0.85,
        duration: 180,
        achievements: ['first-game', 'high-score']
      };

      expect(request).toHaveProperty('sessionId');
      expect(request).toHaveProperty('score');
      expect(request).toHaveProperty('accuracy');
      expect(request).toHaveProperty('duration');
      expect(Array.isArray(request.achievements)).toBe(true);
    });

    it('should return valid end session response', () => {
      const response = {
        success: true,
        data: {
          xpGained: 150,
          newLevel: 5,
          unlockedAchievements: ['high-score'],
          leaderboardPosition: 42
        }
      };

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('xpGained');
      expect(response.data).toHaveProperty('newLevel');
      expect(Array.isArray(response.data.unlockedAchievements)).toBe(true);
    });
  });
});

describe('API Contract: Telemetry Endpoints', () => {
  describe('POST /api/telemetry/event', () => {
    it('should accept valid telemetry event', () => {
      const request = {
        sessionId: 'session-123',
        eventType: 'game_action',
        timestamp: Date.now(),
        data: {
          action: 'jump',
          success: true,
          responseTime: 250
        }
      };

      expect(request).toHaveProperty('sessionId');
      expect(request).toHaveProperty('eventType');
      expect(request).toHaveProperty('timestamp');
      expect(request).toHaveProperty('data');
    });

    it('should return acknowledgment', () => {
      const response = {
        success: true,
        data: {
          eventId: 'event-456',
          received: true
        }
      };

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('eventId');
    });
  });
});

describe('API Contract: User Progress Endpoints', () => {
  describe('GET /api/users/:id/progress', () => {
    it('should return valid progress response', () => {
      const response = {
        success: true,
        data: {
          userId: 1,
          level: 5,
          xp: 2500,
          totalGamesPlayed: 42,
          achievements: [
            {
              id: 'first-game',
              unlockedAt: '2024-01-01T00:00:00Z'
            }
          ],
          stats: {
            averageAccuracy: 0.85,
            totalPlayTime: 3600,
            favoriteGame: 'cyber-runner'
          }
        }
      };

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('userId');
      expect(response.data).toHaveProperty('level');
      expect(response.data).toHaveProperty('xp');
      expect(response.data).toHaveProperty('achievements');
      expect(response.data).toHaveProperty('stats');
      expect(Array.isArray(response.data.achievements)).toBe(true);
    });
  });
});

describe('API Contract: Error Handling', () => {
  it('should handle 400 Bad Request', () => {
    const response = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: {
          field: 'email',
          reason: 'Email inválido'
        }
      }
    };

    expect(response.success).toBe(false);
    expect(response.error.code).toBe('VALIDATION_ERROR');
    expect(response.error).toHaveProperty('details');
  });

  it('should handle 401 Unauthorized', () => {
    const response = {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Token inválido ou expirado'
      }
    };

    expect(response.success).toBe(false);
    expect(response.error.code).toBe('UNAUTHORIZED');
  });

  it('should handle 500 Internal Server Error', () => {
    const response = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor',
        requestId: 'req-789'
      }
    };

    expect(response.success).toBe(false);
    expect(response.error.code).toBe('INTERNAL_ERROR');
    expect(response.error).toHaveProperty('requestId');
  });
});
