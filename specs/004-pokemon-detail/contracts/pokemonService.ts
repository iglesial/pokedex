/**
 * Contract additions to src/services/pokemonService.ts for the
 * detail page feature.
 */

import type { Pokemon } from '../../../src/types/pokemon'

/**
 * Thrown when the requested Pokémon id is outside the Gen I range
 * or cannot be parsed. Consumers should render a 404-style view.
 */
export declare class PokemonNotFoundError extends Error {
  readonly id: number | string
  constructor(id: number | string)
}

export interface FetchPokemonOptions {
  signal?: AbortSignal
}

/**
 * Fetches a single Pokémon by id.
 *
 * @throws {PokemonNotFoundError} if id is outside [1, MAX_POKEMON]
 *         or non-numeric.
 * @throws {Error} with a human-readable message on HTTP/network
 *         failure.
 */
export declare function fetchPokemon(
  id: number | string,
  options?: FetchPokemonOptions,
): Promise<Pokemon>
