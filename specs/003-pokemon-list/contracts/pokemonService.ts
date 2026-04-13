/**
 * Contract for the PokéAPI service layer.
 *
 * Implementation lives in src/services/pokemonService.ts.
 * Tests mock network calls via MSW (src/test/msw-handlers.ts).
 */

import type { Pokemon } from '../../../src/types/pokemon'

/**
 * Lightweight list entry used by UI.
 */
export interface PokemonListEntry {
  id: number
  name: string
  spriteUrl: string | null
  types: string[]
}

/**
 * Result of fetching a single page plus Pokémon details.
 */
export interface FetchPokemonPageResult {
  entries: PokemonListEntry[]
  totalCount: number
  /** Whether more pages remain after this one. */
  hasMore: boolean
}

export interface FetchPokemonPageOptions {
  /** Number of entries to request (PokéAPI `limit`). Default: 20. */
  pageSize?: number
  /** Offset into the list (PokéAPI `offset`). Default: 0. */
  offset?: number
  /** AbortSignal to cancel in-flight requests. */
  signal?: AbortSignal
}

/**
 * Fetches a page of Pokémon list entries, calling the list endpoint
 * once and each detail endpoint in parallel. Maps PokeAPI Pokemon to
 * PokemonListEntry.
 *
 * @throws Error with a human-readable message on any HTTP or network failure.
 */
export declare function fetchPokemonPage(
  options?: FetchPokemonPageOptions,
): Promise<FetchPokemonPageResult>

/**
 * Low-level helper — exposed for tests and potential reuse.
 * Projects a full PokéAPI Pokemon into the UI-facing entry shape.
 */
export declare function toListEntry(pokemon: Pokemon): PokemonListEntry
