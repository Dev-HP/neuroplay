/**
 * useAchievements Hook
 * 
 * Hook React para acessar conquistas com filtros.
 * 
 * @module hooks/useAchievements
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { useAchievementSystem } from './useAchievementSystem';

export const useAchievements = (filters = {}) => {
  const { system, initialized } = useAchievementSystem();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!initialized) return;

    const loadAchievements = async () => {
      try {
        setLoading(true);
        let data = [];

        if (filters.category) {
          data = await system.getAchievementsByCategory(filters.category);
        } else {
          data = await system.getAllAchievements();
        }

        // Apply filters
        if (filters.unlocked !== undefined) {
          data = data.filter(a => a.unlocked === filters.unlocked);
        }

        if (filters.rarity) {
          data = data.filter(a => a.rarity === filters.rarity);
        }

        // Sort
        if (filters.sortBy === 'points') {
          data.sort((a, b) => b.points - a.points);
        } else if (filters.sortBy === 'recent') {
          data.sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0));
        } else if (filters.sortBy === 'name') {
          data.sort((a, b) => a.name.localeCompare(b.name));
        }

        setAchievements(data);
        setError(null);
      } catch (err) {
        console.error('[useAchievements] Error loading achievements:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAchievements();

    // Listen for achievement updates
    const unsubscribe = system.addEventListener((event, data) => {
      if (event === 'achievements_unlocked') {
        loadAchievements();
      }
    });

    return unsubscribe;
  }, [system, initialized, filters.category, filters.unlocked, filters.rarity, filters.sortBy]);

  return {
    achievements,
    loading,
    error
  };
};

export default useAchievements;
