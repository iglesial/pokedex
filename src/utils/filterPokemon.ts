import type { PokemonListEntry } from '../services/pokemonService'

/** Canonical alphabetical list of the 18 official Pokémon types. */
export const KNOWN_TYPES = [
  'bug',
  'dark',
  'dragon',
  'electric',
  'fairy',
  'fighting',
  'fire',
  'flying',
  'ghost',
  'grass',
  'ground',
  'ice',
  'normal',
  'poison',
  'psychic',
  'rock',
  'steel',
  'water',
] as const

const KNOWN_TYPES_SET: ReadonlySet<string> = new Set(KNOWN_TYPES)

export interface FilterCriteria {
  query?: string
  types?: readonly string[]
}

export function matchesQuery(
  pokemon: PokemonListEntry,
  query: string,
): boolean {
  const normalized = query.trim().toLowerCase()
  if (normalized === '') return true
  return pokemon.name.toLowerCase().includes(normalized)
}

export function matchesAllTypes(
  pokemon: PokemonListEntry,
  types: readonly string[],
): boolean {
  if (types.length === 0) return true
  const pokemonTypes = new Set(pokemon.types.map((t) => t.toLowerCase()))
  return types.every((t) => pokemonTypes.has(t.toLowerCase()))
}

export function filterPokemon(
  list: readonly PokemonListEntry[],
  { query = '', types = [] }: FilterCriteria = {},
): PokemonListEntry[] {
  return list.filter(
    (p) => matchesQuery(p, query) && matchesAllTypes(p, types),
  )
}

/**
 * Parses the `?types=` URL param into a sanitized list of valid
 * Pokémon type names. Unknown values are silently dropped
 * (FR-010). Duplicates are removed while preserving first-seen
 * order.
 */
export function parseTypesParam(raw: string | null): string[] {
  if (!raw) return []
  const seen = new Set<string>()
  const result: string[] = []
  for (const rawPart of raw.split(',')) {
    const normalized = rawPart.trim().toLowerCase()
    if (!normalized) continue
    if (!KNOWN_TYPES_SET.has(normalized)) continue
    if (seen.has(normalized)) continue
    seen.add(normalized)
    result.push(normalized)
  }
  return result
}
