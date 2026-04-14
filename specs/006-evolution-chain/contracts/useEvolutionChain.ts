/**
 * Hook contract. Implementation lives in
 * src/hooks/useEvolutionChain.ts.
 */

import type { FlattenedChain } from '../../../src/types/evolutionChain'

export interface UseEvolutionChainResult {
  /** Flattened chain or null while loading / on error. */
  chain: FlattenedChain | null
  /** True during the species + chain fetch. */
  loading: boolean
  /** Human-readable error message if either fetch failed. */
  error: string | null
}

/**
 * Loads the evolution chain for a Pokémon by id.
 * Aborts any in-flight request when `pokemonId` changes or on unmount.
 */
export declare function useEvolutionChain(
  pokemonId: number,
): UseEvolutionChainResult
