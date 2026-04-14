/**
 * Contract additions to src/services/pokemonService.ts for the
 * evolution chain feature.
 */

import type {
  EvolutionChainResponse,
} from '../../../src/types/evolutionChain'

export interface FetchEvolutionOptions {
  signal?: AbortSignal
}

/**
 * Fetches a Pokémon's species, then follows the evolution_chain.url
 * to fetch the raw chain tree. Returns the raw EvolutionChainResponse;
 * flattening into branches is the caller's responsibility (use the
 * pure utility in src/utils/evolutionChain.ts).
 *
 * @throws Error with a human-readable message on HTTP/network failure.
 */
export declare function fetchEvolutionChainForPokemon(
  pokemonId: number,
  options?: FetchEvolutionOptions,
): Promise<EvolutionChainResponse>
