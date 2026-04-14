/**
 * Component contract. Implementation lives in
 * src/components/core/EvolutionMiniCard/EvolutionMiniCard.tsx.
 */

import type { HTMLAttributes } from 'react'
import type { EvolutionNode } from '../../../src/types/evolutionChain'

export interface EvolutionMiniCardProps
  extends Omit<HTMLAttributes<HTMLElement>, 'onClick'> {
  node: EvolutionNode
  /** True if this card represents the currently viewed Pokémon. */
  current?: boolean
  /**
   * Optional click handler. If omitted (e.g., for current Pokémon
   * or out-of-Kanto stages), the card renders as non-interactive.
   */
  onClick?: () => void
}
