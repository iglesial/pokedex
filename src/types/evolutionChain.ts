import type { NamedAPIResource } from './pokemon'

/** Recursive node in the raw PokéAPI evolution chain tree. */
export interface ChainLink {
  species: NamedAPIResource
  evolves_to: ChainLink[]
  is_baby: boolean
}

/** Response from `GET /evolution-chain/{id}`. */
export interface EvolutionChainResponse {
  id: number
  chain: ChainLink
}

/** Partial response from `GET /pokemon-species/{id}`. */
export interface PokemonSpeciesResponse {
  id: number
  name: string
  evolution_chain: { url: string }
}

/** App-internal node, derived from a ChainLink. */
export interface EvolutionNode {
  id: number
  name: string
  spriteUrl: string | null
  /** True when id is in [1, MAX_POKEMON]. */
  inKantoRange: boolean
}

/** Render-friendly chain shape: one root + N branches of stages. */
export interface FlattenedChain {
  root: EvolutionNode
  branches: EvolutionNode[][]
}
