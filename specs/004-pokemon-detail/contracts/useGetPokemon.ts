/**
 * Contract for the single-Pokémon React hook.
 *
 * Implementation lives in src/hooks/useGetPokemon.ts.
 */

import type { Pokemon } from '../../../src/types/pokemon'

export interface UseGetPokemonResult {
  pokemon: Pokemon | null
  loading: boolean
  error: string | null
  /** True when the id is outside the Gen I range (1–151) or invalid. */
  notFound: boolean
}

/**
 * Fetches a single Pokémon on mount and whenever `id` changes.
 * Aborts any in-flight request on id change or unmount.
 */
export declare function useGetPokemon(
  id: number | string,
): UseGetPokemonResult
