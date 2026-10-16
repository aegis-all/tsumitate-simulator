import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSimulatorInputs } from './useSimulatorInputs';
import { DEFAULT_INPUTS } from '../domain/constraints';

describe('useSimulatorInputs (要件 §8-8 URL 同期)', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('URL から復元する', () => {
    window.history.replaceState(null, '', '/?age=40&years=10&monthly=50000&r=1,2,3');
    const { result } = renderHook(() => useSimulatorInputs());
    expect(result.current.inputs).toEqual({
      age: 40,
      years: 10,
      monthly: 50_000,
      rates: { a: 1, b: 2, c: 3 },
    });
  });

  it('不正な URL は既定値で起動する', () => {
    window.history.replaceState(null, '', '/?age=xyz&years=999');
    const { result } = renderHook(() => useSimulatorInputs());
    expect(result.current.inputs).toEqual({ ...DEFAULT_INPUTS, years: 50 });
  });

  it('変更が 300ms 後に URL に反映される', () => {
    vi.useFakeTimers();
    try {
      const { result } = renderHook(() => useSimulatorInputs());
      act(() => result.current.update({ years: 25 }));
      expect(window.location.search).toBe('');
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(window.location.search).toBe('?age=30&years=25&monthly=30000&r=3%2C5%2C7');
      act(() => result.current.setRate('c', 9.9));
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(window.location.search).toContain('r=3%2C5%2C9.9');
      act(() => result.current.reset());
      expect(result.current.inputs).toEqual(DEFAULT_INPUTS);
      expect(window.location.search).toBe('');
    } finally {
      vi.useRealTimers();
    }
  });
});
