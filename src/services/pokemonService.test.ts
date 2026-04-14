import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../test/setup'
import {
  buildListResponse,
  buildPokemonDetail,
  errorListHandler,
} from '../test/msw-handlers'
import {
  fetchAllPokemon,
  fetchEvolutionChainForPokemon,
  fetchPokemon,
  fetchPokemonPage,
  PokemonNotFoundError,
  toListEntry,
} from './pokemonService'

describe('pokemonService', () => {
  describe('fetchPokemonPage', () => {
    it('returns entries mapped from list + detail responses', async () => {
      const result = await fetchPokemonPage({ pageSize: 3, offset: 0 })
      expect(result.entries).toHaveLength(3)
      const first = result.entries[0]
      expect(first.id).toBe(1)
      expect(first.name).toMatch(/pokemon/)
      expect(first.spriteUrl).toMatch(/\.png$/)
      expect(first.types).toContain('grass')
    })

    it('caps totalCount at the Gen I limit (151)', async () => {
      // Fixtures simulate 1302 total; service must cap at 151.
      const result = await fetchPokemonPage({ pageSize: 3 })
      expect(result.totalCount).toBe(151)
    })

    it('computes hasMore=true when more entries remain', async () => {
      const result = await fetchPokemonPage({ pageSize: 3, offset: 0 })
      expect(result.hasMore).toBe(true)
    })

    it('computes hasMore=false on the last page', async () => {
      server.use(
        http.get('https://pokeapi.co/api/v2/pokemon', ({ request }) => {
          const url = new URL(request.url)
          const limit = Number(url.searchParams.get('limit') ?? '20')
          const offset = Number(url.searchParams.get('offset') ?? '0')
          return HttpResponse.json(
            buildListResponse({ limit, offset, count: offset + limit }),
          )
        }),
      )
      const result = await fetchPokemonPage({ pageSize: 3, offset: 0 })
      expect(result.hasMore).toBe(false)
    })

    it('throws readable error on HTTP 500', async () => {
      server.use(errorListHandler)
      await expect(fetchPokemonPage({ pageSize: 3 })).rejects.toThrow(
        /HTTP 500/,
      )
    })

    it('cancels via AbortSignal', async () => {
      const controller = new AbortController()
      const promise = fetchPokemonPage({ pageSize: 3, signal: controller.signal })
      controller.abort()
      await expect(promise).rejects.toThrow()
    })
  })

  describe('fetchPokemon', () => {
    it('returns a Pokémon for a valid id', async () => {
      const result = await fetchPokemon(1)
      expect(result.id).toBe(1)
      expect(result.types).toBeDefined()
    })

    it('accepts string ids', async () => {
      const result = await fetchPokemon('25')
      expect(result.id).toBe(25)
    })

    it('throws PokemonNotFoundError for non-numeric id', async () => {
      await expect(fetchPokemon('abc')).rejects.toBeInstanceOf(
        PokemonNotFoundError,
      )
    })

    it('throws PokemonNotFoundError for id below range', async () => {
      await expect(fetchPokemon(0)).rejects.toBeInstanceOf(
        PokemonNotFoundError,
      )
    })

    it('throws PokemonNotFoundError for id above Gen I range', async () => {
      await expect(fetchPokemon(200)).rejects.toBeInstanceOf(
        PokemonNotFoundError,
      )
    })

    it('throws readable error on HTTP 500', async () => {
      server.use(
        http.get('https://pokeapi.co/api/v2/pokemon/:id', () =>
          HttpResponse.text('server error', { status: 500 }),
        ),
      )
      await expect(fetchPokemon(1)).rejects.toThrow(/HTTP 500/)
    })
  })

  describe('fetchAllPokemon', () => {
    it('returns all 151 Gen I entries in one call', async () => {
      const result = await fetchAllPokemon()
      expect(result).toHaveLength(151)
    })

    it('can be aborted via signal', async () => {
      const controller = new AbortController()
      const promise = fetchAllPokemon({ signal: controller.signal })
      controller.abort()
      await expect(promise).rejects.toThrow()
    })
  })

  describe('fetchEvolutionChainForPokemon', () => {
    it('returns an evolution chain via species → chain indirection', async () => {
      const result = await fetchEvolutionChainForPokemon(1)
      expect(result.id).toBeDefined()
      expect(result.chain).toBeDefined()
    })

    it('throws readable error when species fetch fails', async () => {
      server.use(
        http.get(
          'https://pokeapi.co/api/v2/pokemon-species/:id',
          () => HttpResponse.text('server error', { status: 500 }),
        ),
      )
      await expect(fetchEvolutionChainForPokemon(1)).rejects.toThrow(
        /HTTP 500/,
      )
    })

    it('throws readable error when evolution-chain fetch fails', async () => {
      server.use(
        http.get(
          'https://pokeapi.co/api/v2/evolution-chain/:id',
          () => HttpResponse.text('server error', { status: 500 }),
        ),
      )
      await expect(fetchEvolutionChainForPokemon(1)).rejects.toThrow(
        /HTTP 500/,
      )
    })

    it('cancels via AbortSignal', async () => {
      const controller = new AbortController()
      const promise = fetchEvolutionChainForPokemon(1, {
        signal: controller.signal,
      })
      controller.abort()
      await expect(promise).rejects.toThrow()
    })
  })

  describe('toListEntry', () => {
    it('projects Pokemon to PokemonListEntry with types in slot order', () => {
      const entry = toListEntry(
        buildPokemonDetail(25, {
          types: [
            { slot: 2, type: { name: 'flying', url: '' } },
            { slot: 1, type: { name: 'electric', url: '' } },
          ],
        }),
      )
      expect(entry.types).toEqual(['electric', 'flying'])
    })

    it('preserves null spriteUrl', () => {
      const pokemon = buildPokemonDetail(1)
      pokemon.sprites.front_default = null
      expect(toListEntry(pokemon).spriteUrl).toBeNull()
    })
  })
})
