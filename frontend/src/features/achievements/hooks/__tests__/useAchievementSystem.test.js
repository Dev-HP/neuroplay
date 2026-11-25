/**
 * useAchievementSystem Hook Tests
 */

import { renderHook } from '@testing-library/react';
import useAchievementSystem from '../useAchievementSystem';

// Mock do AchievementSystem
vi.mock('../../services/AchievementSystem', () => ({
  getAchievementSystem: vi.fn(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    trackEvent: vi.fn().mockResolvedValue([]),
    addEventListener: vi.fn(() => vi.fn())
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
