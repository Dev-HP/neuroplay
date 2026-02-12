/**
 * useAchievementSystem Hook Tests
 */

import { renderHook } from '@testing-library/react';
import useAchievementSystem from '../useAchievementSystem';

// Mock do AchievementSystem
jest.mock('../../services/AchievementSystem', () => ({
  getAchievementSystem: jest.fn(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    trackEvent: jest.fn().mockResolvedValue([]),
    addEventListener: jest.fn(() => jest.fn())
  }))
}));

describe('useAchievementSystem', () => {
  it('should return achievement system', () => {
    const { result } = renderHook(() => useAchievementSystem());
    expect(result.current).toBeDefined();
  });

  it('should have trackEvent method', () => {
    const { result } = renderHook(() => useAchievementSystem());
    expect(result.current.trackEvent).toBeDefined();
    expect(typeof result.current.trackEvent).toBe('function');
  });

  it('should track events', async () => {
    const { result } = renderHook(() => useAchievementSystem());
    const tracked = await result.current.trackEvent('test_event', {});
    expect(Array.isArray(tracked)).toBe(true);
  });
});
