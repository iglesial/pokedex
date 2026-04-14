import { MAX_POKEMON } from '../services/pokemonService'
import type {
  ChainLink,
  EvolutionNode,
  FlattenedChain,
} from '../types/evolutionChain'

const SPECIES_URL_RE = /\/pokemon-species\/(\d+)\/?$/

export function parseSpeciesIdFromUrl(url: string): number {
  const match = SPECIES_URL_RE.exec(url)
  if (!match) return Number.NaN
  return Number.parseInt(match[1], 10)
}

export function spriteUrlForId(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id.toString()}.png`
}

export function chainLinkToNode(link: ChainLink): EvolutionNode {
  const id = parseSpeciesIdFromUrl(link.species.url)
  const inKantoRange = Number.isInteger(id) && id >= 1 && id <= MAX_POKEMON
  return {
    id,
    name: link.species.name,
    spriteUrl: Number.isInteger(id) ? spriteUrlForId(id) : null,
    inKantoRange,
  }
}

/**
 * Flattens the recursive ChainLink tree into a `{ root, branches }`
 * structure for rendering. Each branch lists the stages AFTER the
 * root in evolution order.
 *
 * - Single-stage Pokémon → `branches: []`
 * - Linear chain → exactly one branch
 * - Branching chain (Eevee) → one branch per leaf path
 */
export function flattenEvolutionChain(chain: ChainLink): FlattenedChain {
  const root = chainLinkToNode(chain)
  const branches: EvolutionNode[][] = []

  const walk = (link: ChainLink, prefix: EvolutionNode[]): void => {
    if (link.evolves_to.length === 0) {
      // Leaf: prefix is one complete branch (excluding the root).
      if (prefix.length > 0) branches.push(prefix)
      return
    }
    for (const child of link.evolves_to) {
      const node = chainLinkToNode(child)
      walk(child, [...prefix, node])
    }
  }

  walk(chain, [])

  return { root, branches }
}
