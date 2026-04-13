import { describe, it, expect } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '../test/setup'
import {
  buildListResponse,
  emptyListHandler,
  errorListHandler,
} from '../test/msw-handlers'
import { useListPokemon } from './useListPokemon'

describe('useListPokemon', () => {
  it('loads initial page on mount', async () => {
    const { result } = renderHook(() => useListPokemon({ pageSize: 3 }))
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.pokemon).toHaveLength(3)
    expect(result.current.page).toBe(1)
    expect(result.current.totalPages).toBeGreaterThan(1)
    expect(result.current.error).toBeNull()
  })

  it('sets error and leaves pokemon empty on failure', async () => {
    server.use(errorListHandler)
    const { result } = renderHook(() => useListPokemon({ pageSize: 3 }))
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.error).toMatch(/HTTP 500/)
    expect(result.current.pokemon).toHaveLength(0)
  })

  it('reports totalPages=0 on empty list', async () => {
    server.use(emptyListHandler)
    const { result } = renderHook(() => useListPokemon({ pageSize: 3 }))
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.pokemon).toHaveLength(0)
    expect(result.current.totalPages).toBe(0)
  })

  it('setPage replaces list with new page entries', async () => {
    const { result } = renderHook(() => useListPokemon({ pageSize: 3 }))
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    const firstPageNames = result.current.pokemon.map((p) => p.name)
    act(() => {
      result.current.setPage(2)
    })
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.page).toBe(2)
    expect(result.current.pokemon).toHaveLength(3)
    // Page 2 fixtures start at id=4 (offset 3)
    expect(result.current.pokemon.map((p) => p.name)).not.toEqual(
      firstPageNames,
    )
  })

  it('setPage clamps values outside valid range', async () => {
    server.use(
      http.get('https://pokeapi.co/api/v2/pokemon', ({ request }) => {
        const url = new URL(request.url)
        const limit = Number(url.searchParams.get('limit') ?? '20')
        const offset = Number(url.searchParams.get('offset') ?? '0')
        return HttpResponse.json(buildListResponse({ limit, offset, count: 9 }))
      }),
    )
    const { result } = renderHook(() => useListPokemon({ pageSize: 3 }))
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.totalPages).toBe(3)
    act(() => {
      result.current.setPage(999)
    })
    expect(result.current.page).toBe(3)
    act(() => {
      result.current.setPage(-5)
    })
    expect(result.current.page).toBe(1)
  })
})
