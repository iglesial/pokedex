import { describe, it, expect } from 'vitest'
import type { PokemonListEntry } from '../services/pokemonService'
import {
  KNOWN_TYPES,
  filterPokemon,
  matchesAllTypes,
  matchesQuery,
  parseTypesParam,
} from './filterPokemon'

const bulbasaur: PokemonListEntry = {
  id: 1,
  name: 'bulbasaur',
  spriteUrl: null,
  types: ['grass', 'poison'],
}
const charmander: PokemonListEntry = {
  id: 4,
  name: 'charmander',
  spriteUrl: null,
  types: ['fire'],
}
const charizard: PokemonListEntry = {
  id: 6,
  name: 'charizard',
  spriteUrl: null,
  types: ['fire', 'flying'],
}
const pikachu: PokemonListEntry = {
  id: 25,
  name: 'pikachu',
  spriteUrl: null,
  types: ['electric'],
}

describe('matchesQuery', () => {
  it('returns true for empty query', () => {
    expect(matchesQuery(bulbasaur, '')).toBe(true)
  })

  it('trims whitespace', () => {
    expect(matchesQuery(bulbasaur, '   bulba   ')).toBe(true)
  })

  it('is case-insensitive', () => {
    expect(matchesQuery(pikachu, 'PIKA')).toBe(true)
    expect(matchesQuery(pikachu, 'Pika')).toBe(true)
  })

  it('substring-matches anywhere in the name', () => {
    expect(matchesQuery(bulbasaur, 'saur')).toBe(true)
    expect(matchesQuery(bulbasaur, 'bulb')).toBe(true)
  })

  it('returns false when the query is not present', () => {
    expect(matchesQuery(pikachu, 'mew')).toBe(false)
  })
})

describe('matchesAllTypes', () => {
  it('returns true for empty types array', () => {
    expect(matchesAllTypes(charmander, [])).toBe(true)
  })

  it('matches single type', () => {
    expect(matchesAllTypes(charmander, ['fire'])).toBe(true)
    expect(matchesAllTypes(charmander, ['water'])).toBe(false)
  })

  it('AND semantics — Pokémon must have every requested type', () => {
    expect(matchesAllTypes(charizard, ['fire', 'flying'])).toBe(true)
    expect(matchesAllTypes(charmander, ['fire', 'flying'])).toBe(false)
  })

  it('is case-insensitive', () => {
    expect(matchesAllTypes(charmander, ['Fire'])).toBe(true)
  })
})

describe('filterPokemon', () => {
  const all = [bulbasaur, charmander, charizard, pikachu]

  it('returns all entries with no criteria', () => {
    expect(filterPokemon(all)).toEqual(all)
  })

  it('filters by query only', () => {
    expect(filterPokemon(all, { query: 'char' })).toEqual([
      charmander,
      charizard,
    ])
  })

  it('filters by types only', () => {
    expect(filterPokemon(all, { types: ['fire'] })).toEqual([
      charmander,
      charizard,
    ])
  })

  it('combines query AND types', () => {
    expect(
      filterPokemon(all, { query: 'char', types: ['fire', 'flying'] }),
    ).toEqual([charizard])
  })
})

describe('parseTypesParam', () => {
  it('returns empty array for null/empty', () => {
    expect(parseTypesParam(null)).toEqual([])
    expect(parseTypesParam('')).toEqual([])
  })

  it('returns valid lowercase types', () => {
    expect(parseTypesParam('fire,water')).toEqual(['fire', 'water'])
  })

  it('strips unknown types silently (FR-010)', () => {
    expect(parseTypesParam('fire,chaos,water')).toEqual(['fire', 'water'])
    expect(parseTypesParam('nope')).toEqual([])
  })

  it('is case-insensitive and trims whitespace', () => {
    expect(parseTypesParam('Fire, WATER ,  Grass')).toEqual([
      'fire',
      'water',
      'grass',
    ])
  })

  it('removes duplicates while preserving first-seen order', () => {
    expect(parseTypesParam('fire,water,fire,water')).toEqual([
      'fire',
      'water',
    ])
  })
})

describe('KNOWN_TYPES', () => {
  it('contains the 18 official Pokémon types in canonical alphabetical order', () => {
    expect(KNOWN_TYPES).toHaveLength(18)
    const sorted = [...KNOWN_TYPES].sort()
    expect(Array.from(KNOWN_TYPES)).toEqual(sorted)
  })
})
