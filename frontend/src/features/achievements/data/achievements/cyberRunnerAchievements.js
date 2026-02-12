/**
 * Cyber-Runner Achievements
 * 
 * Conquistas específicas do jogo Cyber-Runner.
 * 
 * @module achievements/cyberRunnerAchievements
 * @version 1.0.0
 */

export const cyberRunnerAchievements = [
  {
    id: 'first_run',
    name: 'Primeira Corrida',
    description: 'Complete seu primeiro jogo no Cyber-Runner',
    icon: '🏃',
    category: 'progress',
    game: 'cyberRunner',
    xp: 20,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.cyberRunner.gamesPlayed >= 1,
    hint: null
  },
  {
    id: 'math_master',
    name: 'Mestre da Matemática',
    description: 'Acerte 10 desafios matemáticos seguidos',
    icon: '🧮',
    category: 'mastery',
    game: 'cyberRunner',
    xp: 50,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.cyberRunner.mathStreak >= 10,
    hint: null
  },
  {
    id: 'speed_demon',
    name: 'Velocista',
    description: 'Alcance velocidade 10x no jogo',
    icon: '⚡',
    category: 'mastery',
    game: 'cyberRunner',
    xp: 75,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.cyberRunner.maxSpeed >= 10,
    hint: null
  },
  {
    id: 'combo_king',
    name: 'Rei do Combo',
    description: 'Alcance combo de 20 acertos seguidos',
    icon: '👑',
    category: 'mastery',
    game: 'cyberRunner',
    xp: 100,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.cyberRunner.maxCombo >= 20,
    hint: null
  },
  {
    id: 'perfect_score',
    name: 'Pontuação Perfeita',
    description: 'Alcance 1000 pontos em uma partida',
    icon: '💯',
    category: 'mastery',
    game: 'cyberRunner',
    xp: 150,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.cyberRunner.maxScore >= 1000,
    hint: null
  }
];
