/**
 * Contract for the TypeFilterChips core component.
 * Implementation: src/components/core/TypeFilterChips/TypeFilterChips.tsx.
 */

import type { HTMLAttributes } from 'react'

export interface TypeFilterChipsProps extends HTMLAttributes<HTMLElement> {
  /** Currently selected type names (canonical order). */
  selected: readonly string[]
  /** Called with the new selected list when a chip is toggled. */
  onChange: (selected: string[]) => void
  /** Optional aria-label for the container. Default: "Filter by type". */
  label?: string
}
