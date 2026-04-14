/**
 * EvolutionChain component contract. Implementation lives in
 * src/components/core/EvolutionChain/EvolutionChain.tsx.
 */

import type { HTMLAttributes } from 'react'

export interface EvolutionChainProps extends HTMLAttributes<HTMLElement> {
  /**
   * The currently viewed Pokémon's id. Used both to fetch the chain
   * and to highlight the current node within the rendered chain.
   */
  pokemonId: number
}
