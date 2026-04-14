/**
 * Pure utility contract. Implementation lives in
 * src/utils/evolutionChain.ts.
 */

import type {
  ChainLink,
  EvolutionNode,
  FlattenedChain,
} from '../../../src/types/evolutionChain'

/**
 * Flattens the recursive ChainLink tree into a root + branches
 * structure suitable for rendering. Each branch is the list of
 * stages AFTER the root, in evolution order.
 *
 * Single-stage Pokémon (no evolves_to) yield `branches: []`.
 * Linear chains yield exactly one branch.
 * Branching chains yield one branch per leaf path.
 */
export declare function flattenEvolutionChain(
  chain: ChainLink,
): FlattenedChain

/**
 * Parses the species id from a PokéAPI species URL like
 * `https://pokeapi.co/api/v2/pokemon-species/25/`.
 * Returns NaN if the URL is malformed.
 */
export declare function parseSpeciesIdFromUrl(url: string): number

/**
 * Builds a deterministic sprite URL for a Pokémon id.
 * Used by EvolutionMiniCard so we don't fetch each Pokémon's
 * full detail just to display a sprite.
 */
export declare function spriteUrlForId(id: number): string

/**
 * Converts a ChainLink's species reference into an EvolutionNode.
 */
export declare function chainLinkToNode(link: ChainLink): EvolutionNode
