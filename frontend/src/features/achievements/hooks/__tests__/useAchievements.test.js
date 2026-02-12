/**
 * useAchievements Hook Tests
 */

import { renderHook } from '@testing-library/react';
import useAchievements from '../useAchievements';

// Mock do AchievementSystem
jest.mock('../../services/AchievementSystem', () => ({
  getAchievementSystem: jest.fn(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    getAllAchievements: jest.fn().mockResolvedValue([
      { id: 'test1', name: 'Test 1', unlocked: false },
      { id: 'test2', name: 'Test 2', unlocked: true }
    ]),
    addEventListener: jest.fn(() => jest.fn())
  }))
}));

describe('useAchievements', () => {
  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useAchievements());
    expect(result.current.loading).toBe(true);
  });

  it('should handle errors', () => {
    const { result } = renderHook(() => useAchievements());
    expect(result.current.error).toBeNull();
  });
});
