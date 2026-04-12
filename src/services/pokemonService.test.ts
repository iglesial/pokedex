import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../test/setup'
import {
  buildListResponse,
  buildPokemonDetail,
  errorListHandler,
} from '../test/msw-handlers'
import { fetchPokemonPage, toListEntry } from './pokemonService'

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
