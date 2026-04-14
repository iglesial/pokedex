/**
 * Pure filter helpers contract. Implementation lives in
 * src/utils/filterPokemon.ts.
 */

import type { PokemonListEntry } from '../../../src/services/pokemonService'

export interface FilterCriteria {
  /** Search query (case-insensitive substring). Empty = match all. */
  query?: string
  /** Required types (AND semantics). Empty = match all. */
  types?: readonly string[]
}

/** Case-insensitive substring match on name. */
export declare function matchesQuery(
  pokemon: PokemonListEntry,
  query: string,
): boolean

/** AND match: pokemon must have EVERY type in `types`. */
export declare function matchesAllTypes(
  pokemon: PokemonListEntry,
  types: readonly string[],
): boolean

/** Compose both predicates over a list. */
export declare function filterPokemon(
  list: readonly PokemonListEntry[],
  criteria: FilterCriteria,
): PokemonListEntry[]

/** The canonical set of 18 Pokémon types. */
export declare const KNOWN_TYPES: readonly string[]

/** Strip unknown types from a comma-separated URL value. */
export declare function parseTypesParam(raw: string | null): string[]
