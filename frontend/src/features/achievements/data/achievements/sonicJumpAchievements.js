/**
 * Sonic Jump Achievements
 * 
 * Conquistas específicas do jogo Sonic Jump.
 * 
 * @module achievements/sonicJumpAchievements
 * @version 1.0.0
 */

export const sonicJumpAchievements = [
  {
    id: 'first_jump',
    name: 'Primeiro Salto',
    description: 'Complete seu primeiro jogo no Sonic Jump',
    icon: '🦘',
    category: 'progress',
    game: 'sonicJump',
    xp: 20,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.sonicJump.gamesPlayed >= 1,
    hint: null
  },
  {
    id: 'phoneme_expert',
    name: 'Expert em Fonemas',
    description: 'Acerte 50 fonemas corretamente',
    icon: '🎵',
    category: 'mastery',
    game: 'sonicJump',
    xp: 75,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.sonicJump.phonemesCorrect >= 50,
    hint: null
  },
  {
    id: 'sky_high',
    name: 'Nas Alturas',
    description: 'Alcance altura de 1000 pixels',
    icon: '☁️',
    category: 'mastery',
    game: 'sonicJump',
    xp: 50,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.sonicJump.maxHeight >= 1000,
    hint: null
  },
  {
    id: 'perfect_ear',
    name: 'Ouvido Perfeito',
    description: 'Alcance 90% de acurácia no jogo',
    icon: '👂',
    category: 'mastery',
    game: 'sonicJump',
    xp: 100,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.sonicJump.avgAccuracy >= 0.90,
    hint: null
  },
  {
    id: 'flawless_run',
    name: 'Corrida Impecável',
    description: 'Complete uma partida sem erros',
    icon: '✨',
    category: 'mastery',
    game: 'sonicJump',
    xp: 150,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.sonicJump.perfectRuns >= 1,
    hint: null
  }
];
