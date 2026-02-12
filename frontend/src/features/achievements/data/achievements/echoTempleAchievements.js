/**
 * Echo Temple Achievements
 * 
 * Conquistas específicas do jogo Echo Temple.
 * 
 * @module achievements/echoTempleAchievements
 * @version 1.0.0
 */

export const echoTempleAchievements = [
  {
    id: 'memory_awakens',
    name: 'Memória Desperta',
    description: 'Complete seu primeiro jogo no Echo Temple',
    icon: '🧠',
    category: 'progress',
    game: 'echoTemple',
    xp: 20,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.echoTemple.gamesPlayed >= 1,
    hint: null
  },
  {
    id: 'sequence_master',
    name: 'Mestre das Sequências',
    description: 'Acerte sequência de 10 posições',
    icon: '🔢',
    category: 'mastery',
    game: 'echoTemple',
    xp: 75,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.echoTemple.maxSequenceLength >= 10,
    hint: null
  },
  {
    id: 'photographic_memory',
    name: 'Memória Fotográfica',
    description: 'Alcance 95% de acurácia no jogo',
    icon: '📸',
    category: 'mastery',
    game: 'echoTemple',
    xp: 100,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.echoTemple.avgAccuracy >= 0.95,
    hint: null
  },
  {
    id: 'nback_champion',
    name: 'Campeão N-Back',
    description: 'Alcance nível 5-back',
    icon: '🏅',
    category: 'mastery',
    game: 'echoTemple',
    xp: 150,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.echoTemple.nBackLevel >= 5,
    hint: null
  },
  {
    id: 'temple_guardian',
    name: 'Guardião do Templo',
    description: 'Jogue 50 partidas no Echo Temple',
    icon: '🛡️',
    category: 'persistence',
    game: 'echoTemple',
    xp: 100,
    secret: false,
    levels: 1,
    condition: (p) => p.stats.echoTemple.gamesPlayed >= 50,
    hint: null
  }
];
