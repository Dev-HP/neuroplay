/**
 * Global Achievements - Conquistas Globais
 * 
 * Conquistas que abrangem todos os jogos da plataforma.
 * 
 * @module achievements/globalAchievements
 * @version 1.0.0
 */

export const globalAchievements = [
  {
    id: 'first_steps',
    name: 'Primeiros Passos',
    description: 'Jogue pela primeira vez no NeuroPlay',
    icon: '👣',
    category: 'progress',
    game: null,
    xp: 10,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.global.totalGames >= 1,
    hint: null
  },
  {
    id: 'explorer',
    name: 'Explorador',
    description: 'Jogue todos os 4 jogos do NeuroPlay',
    icon: '🗺️',
    category: 'exploration',
    game: null,
    xp: 100,
    secret: false,
    levels: 1,
    condition: (p) => 
      p.stats.cyberRunner.gamesPlayed > 0 &&
      p.stats.echoTemple.gamesPlayed > 0 &&
      p.stats.sonicJump.gamesPlayed > 0 &&
      p.stats.gravityLab.gamesPlayed > 0,
    hint: null
  },
  {
    id: 'dedicated',
    name: 'Dedicado',
    description: 'Jogue por 7 dias consecutivos',
    icon: '📅',
    category: 'persistence',
    game: null,
    xp: 150,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.global.consecutiveDays >= 7,
    hint: null
  },
  {
    id: 'marathon',
    name: 'Maratonista',
    description: 'Jogue por 10 horas no total',
    icon: '⏱️',
    category: 'persistence',
    game: null,
    xp: 200,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.global.totalTime >= 600, // 600 minutos = 10 horas
    hint: null
  },
  {
    id: 'collector',
    name: 'Colecionador',
    description: 'Desbloqueie 20 conquistas',
    icon: '🏆',
    category: 'special',
    game: null,
    xp: 250,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.global.achievementsUnlocked >= 20,
    hint: null
  }
];
