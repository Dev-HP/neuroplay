/**
 * useAchievementStats Hook
 * 
 * Hook React para acessar estatísticas de conquistas.
 * 
 * @module hooks/useAchievementStats
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { useAchievementSystem } from './useAchievementSystem';

export const useAchievementStats = () => {
  const { system, initialized } = useAchievementSystem();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!initialized) return;

    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await system.getStats();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('[useAchievementStats] Error loading stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStats();

    // Listen for achievement updates
    const unsubscribe = system.addEventListener((event) => {
      if (event === 'achievements_unlocked') {
        loadStats();
      }
    });

    return unsubscribe;
  }, [system, initialized]);

  return {
    stats,
    loading,
    error
  };
};

export default useAchievementStats;
