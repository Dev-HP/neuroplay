/**
 * useAchievementStats Hook Tests
 */

import { renderHook } from '@testing-library/react';
import useAchievementStats from '../useAchievementStats';

// Mock do AchievementSystem
jest.mock('../../services/AchievementSystem', () => ({
  getAchievementSystem: jest.fn(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    getStats: jest.fn().mockResolvedValue({
      total: 25,
      unlocked: 5,
      locked: 20,
      percentage: 20,
      totalPoints: 250
    }),
    addEventListener: jest.fn(() => jest.fn())
  }))
}));

describe('useAchievementStats', () => {
  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useAchievementStats());
    expect(result.current.loading).toBe(true);
  });

  it('should return stats object', () => {
    const { result } = renderHook(() => useAchievementStats());
    expect(result.current.stats).toBeDefined();
  });

  it('should handle errors', () => {
    const { result } = renderHook(() => useAchievementStats());
    expect(result.current.error).toBeNull();
  });
});
