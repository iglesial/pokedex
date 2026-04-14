import { useEffect, useState } from 'react'

/**
 * Returns a debounced echo of `value`. The return only updates
 * after the input has stopped changing for `delayMs` milliseconds.
 *
 * Fixed 200 ms is the default; callers may override per research R2.
 */
export function useDebouncedValue<T>(value: T, delayMs = 200): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebounced(value)
    }, delayMs)
    return () => {
      window.clearTimeout(handle)
    }
  }, [value, delayMs])

  return debounced
}
