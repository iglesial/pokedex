/**
 * Contract for the composite list + filter hook. Implementation
 * lives in src/hooks/useFilteredPokemon.ts.
 */

import type { PokemonListEntry } from '../../../src/services/pokemonService'

export interface UseFilteredPokemonOptions {
  /** Page size for pagination. Default: 20. */
  pageSize?: number
}

export interface UseFilteredPokemonResult {
  /** Full 151-entry set (after initial prefetch). */
  allEntries: PokemonListEntry[]
  /** All entries matching the current filters. */
  filteredEntries: PokemonListEntry[]
  /** Current page slice of filteredEntries. */
  pageEntries: PokemonListEntry[]
  /** Count of filteredEntries. */
  totalFiltered: number
  /** Total pages = ceil(totalFiltered / pageSize). */
  totalPages: number
  /** Current 1-based page number (clamped to valid range). */
  page: number
  /** Trimmed search query from URL. */
  query: string
  /** Selected types (valid subset) from URL. */
  types: string[]
  /** True during initial prefetch only. */
  loading: boolean
  /** Prefetch error message if any. */
  error: string | null

  setPage: (page: number) => void
  setQuery: (query: string) => void
  setTypes: (types: string[]) => void
  clearFilters: () => void
}

/**
 * Composes URL-driven filter state with the prefetched Pokémon set
 * to produce the current paginated filtered view.
 */
export declare function useFilteredPokemon(
  options?: UseFilteredPokemonOptions,
): UseFilteredPokemonResult
