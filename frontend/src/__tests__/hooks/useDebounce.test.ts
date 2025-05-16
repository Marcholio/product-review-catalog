import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '../../hooks/useDebounce'

describe('useDebounce hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial value', 500));
    expect(result.current).toBe('initial value');
  });

  it('should update the value after the delay has passed', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial value', delay: 500 } }
    );

    act(() => {
      rerender({ value: 'updated value', delay: 500 });
    });

    // After rerender but before timer, it should still be the initial value
    expect(result.current).toBe('initial value');

    // Fast-forward the timer
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // After the timer, it should be the updated value
    expect(result.current).toBe('updated value');
  });

  it('should reset the timer when the value changes before the delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial value', delay: 500 } }
    );

    // First update
    act(() => {
      rerender({ value: 'first update', delay: 500 });
    });

    // Advance time but not enough to trigger update
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    // Still initial value
    expect(result.current).toBe('initial value');

    // Second update before first update is applied
    act(() => {
      rerender({ value: 'second update', delay: 500 });
    });

    // Still initial value
    expect(result.current).toBe('initial value');

    // Advance enough time to trigger update
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should be the second update, not the first
    expect(result.current).toBe('second update');
  });

  it('should respect changes to the delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial value', delay: 1000 } }
    );

    // Update with a shorter delay
    act(() => {
      rerender({ value: 'updated value', delay: 200 });
    });

    // Advance time less than the original delay but more than the new delay
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Now we should see the updated value because we used the shorter delay
    expect(result.current).toBe('updated value');
  });
});