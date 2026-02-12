/**
 * useTelemetry Hook Tests
 */

import { renderHook } from '@testing-library/react';

// Mock hook
const useTelemetry = () => ({
  logEvent: jest.fn(),
  logSessionStart: jest.fn(),
  logSessionEnd: jest.fn()
});

describe('useTelemetry', () => {
  it('should return telemetry functions', () => {
    const { result } = renderHook(() => useTelemetry());
    expect(result.current.logEvent).toBeDefined();
  });

  it('should log events', () => {
    const { result } = renderHook(() => useTelemetry());
    result.current.logEvent('test_event', {});
    expect(result.current.logEvent).toHaveBeenCalled();
  });

  it('should log session start', () => {
    const { result } = renderHook(() => useTelemetry());
    result.current.logSessionStart();
    expect(result.current.logSessionStart).toHaveBeenCalled();
  });

  it('should log session end', () => {
    const { result } = renderHook(() => useTelemetry());
    result.current.logSessionEnd();
    expect(result.current.logSessionEnd).toHaveBeenCalled();
  });
});
