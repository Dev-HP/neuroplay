// Shared Utils - Barrel Export
export { default as audioFeedback, getAudioFeedback, playSound } from './audioFeedback';
export { default as audioManager } from './audioManager';
export { default as phonemeSynthesizer, getPhonemeSynthesizer } from './phonemeSynthesizer';
export { default as errorCascadeDetector } from './errorCascadeDetector';
export { default as localAdaptation } from './localAdaptation';
export {
  ADAPTATION_POLICY_VERSION,
  DEFAULT_ADAPTATION_LIMITS,
  calculatePerformanceScore,
  evaluateAdaptation,
  applyDifficultyDecision,
  normalizePerformanceMetrics
} from './adaptationPolicy';
export { default as offlineQueue } from './offlineQueue';
