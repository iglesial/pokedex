import { describe, it, expect } from 'vitest'
import {
  chainLinkToNode,
  flattenEvolutionChain,
  parseSpeciesIdFromUrl,
  spriteUrlForId,
} from './evolutionChain'
import type { ChainLink } from '../types/evolutionChain'

function leaf(id: number, name: string): ChainLink {
  return {
    species: {
      name,
      url: `https://pokeapi.co/api/v2/pokemon-species/${id.toString()}/`,
    },
    evolves_to: [],
    is_baby: false,
  }
}

function withChildren(id: number, name: string, children: ChainLink[]): ChainLink {
  return {
    species: {
      name,
      url: `https://pokeapi.co/api/v2/pokemon-species/${id.toString()}/`,
    },
    evolves_to: children,
    is_baby: false,
  }
}

describe('parseSpeciesIdFromUrl', () => {
  it('parses standard species URLs', () => {
    expect(
      parseSpeciesIdFromUrl('https://pokeapi.co/api/v2/pokemon-species/25/'),
    ).toBe(25)
    expect(
      parseSpeciesIdFromUrl('https://pokeapi.co/api/v2/pokemon-species/151'),
    ).toBe(151)
  })

  it('returns NaN for malformed URLs', () => {
    expect(parseSpeciesIdFromUrl('not-a-url')).toBeNaN()
    expect(parseSpeciesIdFromUrl('https://example.com/foo/bar/')).toBeNaN()
  })
})

describe('spriteUrlForId', () => {
  it('builds the GitHub CDN URL for a Pokémon id', () => {
    expect(spriteUrlForId(25)).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    )
  })
})

describe('chainLinkToNode', () => {
  it('marks Kanto Pokémon (id ≤ 151) as in range', () => {
    const node = chainLinkToNode(leaf(25, 'pikachu'))
    expect(node).toEqual({
      id: 25,
      name: 'pikachu',
      spriteUrl: spriteUrlForId(25),
      inKantoRange: true,
    })
  })

  it('marks non-Kanto Pokémon (id > 151) as out of range', () => {
    const node = chainLinkToNode(leaf(169, 'crobat'))
    expect(node.inKantoRange).toBe(false)
    expect(node.id).toBe(169)
  })
})

describe('flattenEvolutionChain', () => {
  it('returns no branches for a single-stage Pokémon (Mew)', () => {
    const chain = leaf(151, 'mew')
    const result = flattenEvolutionChain(chain)
    expect(result.root.id).toBe(151)
    expect(result.branches).toEqual([])
  })

  it('flattens a linear chain (Bulbasaur → Ivysaur → Venusaur)', () => {
    const chain = withChildren(1, 'bulbasaur', [
      withChildren(2, 'ivysaur', [leaf(3, 'venusaur')]),
    ])
    const result = flattenEvolutionChain(chain)
    expect(result.root.id).toBe(1)
    expect(result.branches).toHaveLength(1)
    expect(result.branches[0].map((n) => n.id)).toEqual([2, 3])
  })

  it('flattens a branching chain (Eevee → 3 evolutions)', () => {
    const chain = withChildren(133, 'eevee', [
      leaf(134, 'vaporeon'),
      leaf(135, 'jolteon'),
      leaf(136, 'flareon'),
    ])
    const result = flattenEvolutionChain(chain)
    expect(result.root.id).toBe(133)
    expect(result.branches).toHaveLength(3)
    expect(
      result.branches.map((b) => b[0].id).sort((a, b) => a - b),
    ).toEqual([134, 135, 136])
    // Each branch is exactly one stage after the root
    result.branches.forEach((b) => {
      expect(b).toHaveLength(1)
    })
  })

  it('preserves out-of-Kanto stages in the chain (Zubat → Golbat → Crobat)', () => {
    const chain = withChildren(41, 'zubat', [
      withChildren(42, 'golbat', [leaf(169, 'crobat')]),
    ])
    const result = flattenEvolutionChain(chain)
    expect(result.root.inKantoRange).toBe(true)
    expect(result.branches).toHaveLength(1)
    const [golbat, crobat] = result.branches[0]
    expect(golbat.id).toBe(42)
    expect(golbat.inKantoRange).toBe(true)
    expect(crobat.id).toBe(169)
    expect(crobat.inKantoRange).toBe(false)
  })

  it('handles deep branching (Oddish → Gloom → Vileplume / Bellossom)', () => {
    const chain = withChildren(43, 'oddish', [
      withChildren(44, 'gloom', [
        leaf(45, 'vileplume'),
        leaf(182, 'bellossom'),
      ]),
    ])
    const result = flattenEvolutionChain(chain)
    expect(result.root.id).toBe(43)
    expect(result.branches).toHaveLength(2)
    // Each branch is [gloom, vileplume] or [gloom, bellossom]
    expect(result.branches[0][0].id).toBe(44)
    expect(result.branches[1][0].id).toBe(44)
    const leaves = result.branches.map((b) => b[1].id).sort((a, b) => a - b)
    expect(leaves).toEqual([45, 182])
  })
})
