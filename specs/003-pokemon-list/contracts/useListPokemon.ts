/**
 * Contract for the React hook exposing list state.
 *
 * Implementation lives in src/hooks/useListPokemon.ts.
 */

import type { PokemonListEntry } from './pokemonService'

export interface UseListPokemonOptions {
  /** Batch size per fetch. Default: 20. */
  pageSize?: number
}

export interface UseListPokemonResult {
  /** Accumulated list across all loaded batches. */
  pokemon: PokemonListEntry[]
  /** True while any fetch is in flight (initial or subsequent). */
  loading: boolean
  /** Human-readable error message; null when no error. */
  error: string | null
  /** Whether additional Pokémon remain to be loaded. */
  hasMore: boolean
  /**
   * Triggers the next batch fetch. No-op if `loading` is true
   * or `hasMore` is false. Idempotent.
   */
  loadMore: () => Promise<void>
}

/**
 * React hook that fetches the initial batch on mount and exposes
 * loadMore to append subsequent batches.
 */
export declare function useListPokemon(
  options?: UseListPokemonOptions,
): UseListPokemonResult
