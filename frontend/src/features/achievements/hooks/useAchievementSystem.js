/**
 * useAchievementSystem Hook
 * 
 * Hook React para acessar o AchievementSystem.
 * 
 * @module hooks/useAchievementSystem
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { getAchievementSystem } from '../services/AchievementSystem';

export const useAchievementSystem = () => {
  const [system] = useState(() => getAchievementSystem());
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        await system.initialize();
        setInitialized(true);
        setError(null);
      } catch (err) {
        console.error('[useAchievementSystem] Initialization error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [system]);

  const trackEvent = useCallback(async (eventType, data) => {
    if (!initialized) {
      console.warn('[useAchievementSystem] System not initialized');
      return [];
    }
    return await system.trackEvent(eventType, data);
  }, [system, initialized]);

  const getAllAchievements = useCallback(async () => {
    if (!initialized) return [];
    return await system.getAllAchievements();
  }, [system, initialized]);

  const getAchievementsByCategory = useCallback(async (category) => {
    if (!initialized) return [];
    return await system.getAchievementsByCategory(category);
  }, [system, initialized]);

  const getStats = useCallback(async () => {
    if (!initialized) return null;
    return await system.getStats();
  }, [system, initialized]);

  const reset = useCallback(async () => {
    if (!initialized) return;
    await system.reset();
  }, [system, initialized]);

  return {
    system,
    initialized,
    loading,
    error,
    trackEvent,
    getAllAchievements,
    getAchievementsByCategory,
    getStats,
    reset
  };
};

export default useAchievementSystem;
