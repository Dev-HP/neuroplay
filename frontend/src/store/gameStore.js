import { create } from 'zustand';

// Store global para gerenciar estado dos jogos
const useGameStore = create((set, get) => ({
  // Estado do usuário
  user: null,
  setUser: (user) => set({ user }),

  // Configurações de áudio
  soundEnabled: true,
  musicEnabled: true,
  volume: 0.7,
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  toggleMusic: () => set((state) => ({ musicEnabled: !state.musicEnabled })),
  setVolume: (volume) => set({ volume }),

  // Sistema de pontuação global
  totalPoints: 0,
  level: 1,
  experience: 0,
  addPoints: (points) => set((state) => {
    const newExp = state.experience + points;
    const newLevel = Math.floor(newExp / 1000) + 1;
    return {
      totalPoints: state.totalPoints + points,
      experience: newExp,
      level: newLevel
    };
  }),

  // Conquistas
  achievements: [],
  unlockAchievement: (achievement) => set((state) => ({
    achievements: [...state.achievements, { ...achievement, unlockedAt: new Date() }]
  })),

  // Estatísticas de jogo
  gameStats: {
    gamesPlayed: 0,
    totalTime: 0,
    bestScores: {},
    streaks: {}
  },
  updateGameStats: (gameId, stats) => set((state) => ({
    gameStats: {
      ...state.gameStats,
      gamesPlayed: state.gameStats.gamesPlayed + 1,
      bestScores: {
        ...state.gameStats.bestScores,
        [gameId]: Math.max(state.gameStats.bestScores[gameId] || 0, stats.score)
      }
    }
  })),

  // Sistema de dificuldade adaptativa
  adaptiveDifficulty: {
    currentLevel: 1,
    performanceHistory: [],
    adjustDifficulty: (performance) => {
      const history = get().adaptiveDifficulty.performanceHistory;
      const newHistory = [...history, performance].slice(-10);
      const avgPerformance = newHistory.reduce((a, b) => a + b, 0) / newHistory.length;
      
      let newLevel = get().adaptiveDifficulty.currentLevel;
      if (avgPerformance > 0.8) newLevel = Math.min(10, newLevel + 1);
      if (avgPerformance < 0.5) newLevel = Math.max(1, newLevel - 1);
      
      set({
        adaptiveDifficulty: {
          currentLevel: newLevel,
          performanceHistory: newHistory
        }
      });
    }
  }
}));

export default useGameStore;
