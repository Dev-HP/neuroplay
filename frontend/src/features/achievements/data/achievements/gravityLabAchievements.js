/**
 * Gravity Lab Achievements
 * 
 * Conquistas específicas do jogo Gravity Lab.
 * 
 * @module achievements/gravityLabAchievements
 * @version 1.0.0
 */

export const gravityLabAchievements = [
  {
    id: 'first_experiment',
    name: 'Primeiro Experimento',
    description: 'Complete seu primeiro jogo no Gravity Lab',
    icon: '🔬',
    category: 'progress',
    game: 'gravityLab',
    xp: 20,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.gravityLab.gamesPlayed >= 1,
    hint: null
  },
  {
    id: 'rule_switcher',
    name: 'Mestre da Mudança',
    description: 'Adapte-se a 20 mudanças de regra',
    icon: '🔄',
    category: 'mastery',
    game: 'gravityLab',
    xp: 75,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.gravityLab.ruleSwitches >= 20,
    hint: null
  },
  {
    id: 'cognitive_flexibility',
    name: 'Flexibilidade Cognitiva',
    description: 'Alcance 85% de acurácia no jogo',
    icon: '🧩',
    category: 'mastery',
    game: 'gravityLab',
    xp: 100,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.gravityLab.avgAccuracy >= 0.85,
    hint: null
  },
  {
    id: 'trap_master',
    name: 'Mestre das Armadilhas',
    description: 'Evite 10 armadilhas cognitivas',
    icon: '🎯',
    category: 'mastery',
    game: 'gravityLab',
    xp: 125,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.gravityLab.trapAvoided >= 10,
    hint: null
  },
  {
    id: 'scientist',
    name: 'Cientista',
    description: 'Jogue 30 partidas no Gravity Lab',
    icon: '👨‍🔬',
    category: 'persistence',
    game: 'gravityLab',
    xp: 100,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.gravityLab.gamesPlayed >= 30,
    hint: null
  }
];
