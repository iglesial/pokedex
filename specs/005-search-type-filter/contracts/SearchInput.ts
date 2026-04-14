/**
 * Contract for the SearchInput core component.
 * Implementation: src/components/core/SearchInput/SearchInput.tsx.
 */

import type { HTMLAttributes } from 'react'

export interface SearchInputProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Current value (controlled). */
  value: string
  /** Fires on every keystroke for immediate UI feedback. */
  onChange: (value: string) => void
  /**
   * Fires with the debounced value (default 200 ms).
   * Use this to update the URL / filter state.
   */
  onDebouncedChange: (value: string) => void
  /** Debounce duration in ms. Default: 200. */
  debounceMs?: number
  /** Placeholder text. */
  placeholder?: string
  /** Accessible label (required). */
  label: string
}
