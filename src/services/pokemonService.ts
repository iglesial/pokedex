import type { Pokemon } from '../types/pokemon'

const API_BASE = 'https://pokeapi.co/api/v2'

/** Cap the list to Gen I (original Kanto Pokédex). */
export const MAX_POKEMON = 151

/**
 * Thrown when a requested Pokémon id is not in the Gen I range or
 * cannot be parsed. Distinct from network/HTTP errors so the UI can
 * render a dedicated "Not Found" view.
 */
export class PokemonNotFoundError extends Error {
  readonly id: number | string

  constructor(id: number | string) {
    super(`Pokémon #${String(id)} is not in the Kanto Pokédex (1–${String(MAX_POKEMON)}).`)
    this.name = 'PokemonNotFoundError'
    this.id = id
  }
}

export interface FetchPokemonOptions {
  signal?: AbortSignal
}

export interface PokemonListEntry {
  id: number
  name: string
  spriteUrl: string | null
  types: string[]
}

export interface FetchPokemonPageResult {
  entries: PokemonListEntry[]
  totalCount: number
  hasMore: boolean
}

export interface FetchPokemonPageOptions {
  pageSize?: number
  offset?: number
  signal?: AbortSignal
}

interface PokemonListResponse {
  count: number
  next: string | null
  previous: string | null
  results: { name: string; url: string }[]
}

export function toListEntry(pokemon: Pokemon): PokemonListEntry {
  return {
    id: pokemon.id,
    name: pokemon.name,
    spriteUrl: pokemon.sprites.front_default,
    types: pokemon.types
      .slice()
      .sort((a, b) => a.slot - b.slot)
      .map((t) => t.type.name),
  }
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(
      `Failed to fetch Pokémon data (HTTP ${response.status.toString()}). Please try again.`,
    )
  }
  return (await response.json()) as T
}

export async function fetchPokemon(
  id: number | string,
  { signal }: FetchPokemonOptions = {},
): Promise<Pokemon> {
  const numericId = typeof id === 'number' ? id : Number.parseInt(id, 10)
  if (
    !Number.isInteger(numericId) ||
    numericId < 1 ||
    numericId > MAX_POKEMON
  ) {
    throw new PokemonNotFoundError(id)
  }
  return fetchJson<Pokemon>(
    `${API_BASE}/pokemon/${numericId.toString()}`,
    signal,
  )
}

export async function fetchPokemonPage({
  pageSize = 20,
  offset = 0,
  signal,
}: FetchPokemonPageOptions = {}): Promise<FetchPokemonPageResult> {
  try {
    const list = await fetchJson<PokemonListResponse>(
      `${API_BASE}/pokemon?limit=${pageSize.toString()}&offset=${offset.toString()}`,
      signal,
    )

    // Cap at the first MAX_POKEMON entries (Gen I Kanto Pokédex).
    const cappedTotal = Math.min(list.count, MAX_POKEMON)
    const remainingSlots = Math.max(0, cappedTotal - offset)
    const cappedResults = list.results.slice(0, remainingSlots)

    const details = await Promise.all(
      cappedResults.map((entry) => fetchJson<Pokemon>(entry.url, signal)),
    )

    return {
      entries: details.map(toListEntry),
      totalCount: cappedTotal,
      hasMore: offset + cappedResults.length < cappedTotal,
    }
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'AbortError') throw err
      throw err
    }
    throw new Error('Unknown error while fetching Pokémon data.')
  }
}
