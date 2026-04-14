import { http, HttpResponse } from 'msw'
import type { Pokemon } from '../types/pokemon'

interface ListFixtureOptions {
  count?: number
  offset?: number
  limit?: number
  names?: string[]
}

export function buildListResponse({
  count = 1302,
  offset = 0,
  limit = 20,
  names,
}: ListFixtureOptions = {}) {
  const actualNames =
    names ?? Array.from({ length: limit }, (_, i) => `pokemon-${(offset + i + 1).toString()}`)
  return {
    count,
    next:
      offset + limit < count
        ? `https://pokeapi.co/api/v2/pokemon?offset=${(offset + limit).toString()}&limit=${limit.toString()}`
        : null,
    previous:
      offset > 0
        ? `https://pokeapi.co/api/v2/pokemon?offset=${Math.max(0, offset - limit).toString()}&limit=${limit.toString()}`
        : null,
    results: actualNames.map((name, i) => ({
      name,
      url: `https://pokeapi.co/api/v2/pokemon/${(offset + i + 1).toString()}/`,
    })),
  }
}

export function buildPokemonDetail(
  id: number,
  overrides: Partial<Pokemon> = {},
): Pokemon {
  return {
    id,
    name: `pokemon-${id.toString()}`,
    base_experience: 64,
    height: 7,
    weight: 69,
    is_default: true,
    order: id,
    location_area_encounters: '',
    species: { name: `species-${id.toString()}`, url: '' },
    forms: [],
    abilities: [],
    game_indices: [],
    held_items: [],
    moves: [],
    past_types: [],
    sprites: {
      front_default: `https://sprites.example/${id.toString()}.png`,
      front_shiny: null,
      front_female: null,
      front_shiny_female: null,
      back_default: null,
      back_shiny: null,
      back_female: null,
      back_shiny_female: null,
      other: {
        dream_world: { front_default: null, front_female: null },
        home: {
          front_default: null,
          front_female: null,
          front_shiny: null,
          front_shiny_female: null,
        },
        'official-artwork': { front_default: null, front_shiny: null },
        showdown: {
          front_default: null,
          front_shiny: null,
          front_female: null,
          front_shiny_female: null,
          back_default: null,
          back_shiny: null,
          back_female: null,
          back_shiny_female: null,
        },
      },
      versions: {} as Pokemon['sprites']['versions'],
    },
    cries: { latest: '', legacy: '' },
    stats: [],
    types: [
      { slot: 1, type: { name: 'grass', url: '' } },
      { slot: 2, type: { name: 'poison', url: '' } },
    ],
    ...overrides,
  }
}

/**
 * Build a minimal species response that points at a specific
 * evolution chain id.
 */
export function buildSpeciesResponse(id: number, chainId: number) {
  return {
    id,
    name: `pokemon-${id.toString()}`,
    evolution_chain: {
      url: `https://pokeapi.co/api/v2/evolution-chain/${chainId.toString()}/`,
    },
  }
}

interface ChainLinkLike {
  species: { name: string; url: string }
  evolves_to: ChainLinkLike[]
  is_baby: boolean
}

function buildSpeciesRef(id: number) {
  return {
    name: `pokemon-${id.toString()}`,
    url: `https://pokeapi.co/api/v2/pokemon-species/${id.toString()}/`,
  }
}

/**
 * Builds a recursive ChainLink tree from a list of branches.
 * Each branch is a list of species ids starting with the common
 * ancestor.
 *
 * Examples:
 * - Linear (Bulbasaur): [[1, 2, 3]]
 * - Single-stage (Mew): [[151]]
 * - Branching (Eevee → V/J/F): [[133, 134], [133, 135], [133, 136]]
 */
export function buildEvolutionChainResponse(
  branches: number[][],
  chainId = 1,
) {
  if (branches.length === 0) {
    throw new Error('buildEvolutionChainResponse requires at least one branch')
  }
  const rootId = branches[0][0]
  // Group children by parent id, level by level
  const byParent = new Map<number, Set<number>>()
  for (const branch of branches) {
    for (let i = 0; i < branch.length - 1; i++) {
      const parent = branch[i]
      const child = branch[i + 1]
      const set = byParent.get(parent) ?? new Set<number>()
      set.add(child)
      byParent.set(parent, set)
    }
  }
  const buildLink = (id: number): ChainLinkLike => ({
    species: buildSpeciesRef(id),
    evolves_to: Array.from(byParent.get(id) ?? []).map(buildLink),
    is_baby: false,
  })
  return {
    id: chainId,
    chain: buildLink(rootId),
  }
}

/** Default handlers: successful list + detail responses. */
export const defaultHandlers = [
  http.get('https://pokeapi.co/api/v2/pokemon', ({ request }) => {
    const url = new URL(request.url)
    const limit = Number(url.searchParams.get('limit') ?? '20')
    const offset = Number(url.searchParams.get('offset') ?? '0')
    return HttpResponse.json(buildListResponse({ limit, offset }))
  }),
  http.get('https://pokeapi.co/api/v2/pokemon/:id', ({ params }) => {
    const id = Number(params.id)
    return HttpResponse.json(buildPokemonDetail(id))
  }),
  // Default species: every Pokémon points to its own chain id (= pokemon id).
  http.get(
    'https://pokeapi.co/api/v2/pokemon-species/:id',
    ({ params }) => {
      const id = Number(params.id)
      return HttpResponse.json(buildSpeciesResponse(id, id))
    },
  ),
  // Default evolution chain: linear single-stage (just the requesting Pokémon).
  // Tests that need richer chains override this handler.
  http.get(
    'https://pokeapi.co/api/v2/evolution-chain/:id',
    ({ params }) => {
      const id = Number(params.id)
      return HttpResponse.json(buildEvolutionChainResponse([[id]], id))
    },
  ),
]

/** Handler that returns 500 for the list endpoint (error-state tests). */
export const errorListHandler = http.get(
  'https://pokeapi.co/api/v2/pokemon',
  () => new HttpResponse('Internal Server Error', { status: 500 }),
)

/** Handler that returns 500 for the evolution-chain endpoint. */
export const evolutionChainErrorHandler = http.get(
  'https://pokeapi.co/api/v2/evolution-chain/:id',
  () => new HttpResponse('Internal Server Error', { status: 500 }),
)

/** Handler that returns an empty list (empty-state tests). */
export const emptyListHandler = http.get(
  'https://pokeapi.co/api/v2/pokemon',
  () =>
    HttpResponse.json({
      count: 0,
      next: null,
      previous: null,
      results: [],
    }),
)
