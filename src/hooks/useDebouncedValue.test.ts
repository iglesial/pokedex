import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebouncedValue } from './useDebouncedValue'

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('hello', 200))
    expect(result.current).toBe('hello')
  })

  it('keeps the old value before the delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ v }: { v: string }) => useDebouncedValue(v, 200),
      { initialProps: { v: 'a' } },
    )
    rerender({ v: 'b' })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current).toBe('a')
  })

  it('emits the new value once the delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ v }: { v: string }) => useDebouncedValue(v, 200),
      { initialProps: { v: 'a' } },
    )
    rerender({ v: 'b' })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current).toBe('b')
  })

  it('coalesces rapid changes into a single emission', () => {
    const { result, rerender } = renderHook(
      ({ v }: { v: string }) => useDebouncedValue(v, 200),
      { initialProps: { v: 'a' } },
    )
    rerender({ v: 'b' })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    rerender({ v: 'c' })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    // Only 100 ms since last change → still 'a'
    expect(result.current).toBe('a')
    act(() => {
      vi.advanceTimersByTime(100)
    })
    // Now 200 ms since last change → 'c'
    expect(result.current).toBe('c')
  })

  it('respects a custom delay', () => {
    const { result, rerender } = renderHook(
      ({ v, d }: { v: string; d: number }) => useDebouncedValue(v, d),
      { initialProps: { v: 'a', d: 500 } },
    )
    rerender({ v: 'b', d: 500 })
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(result.current).toBe('a')
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current).toBe('b')
  })
})
