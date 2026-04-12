import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '../test/setup'
import { useGetPokemon } from './useGetPokemon'

describe('useGetPokemon', () => {
  it('loads a Pokémon by id', async () => {
    const { result } = renderHook(() => useGetPokemon(1))
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.pokemon?.id).toBe(1)
    expect(result.current.error).toBeNull()
    expect(result.current.notFound).toBe(false)
  })

  it('sets notFound=true for out-of-range id without fetching', async () => {
    const { result } = renderHook(() => useGetPokemon(999))
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.notFound).toBe(true)
    expect(result.current.pokemon).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('sets notFound=true for non-numeric id', async () => {
    const { result } = renderHook(() => useGetPokemon('abc'))
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.notFound).toBe(true)
  })

  it('sets error on HTTP failure', async () => {
    server.use(
      http.get('https://pokeapi.co/api/v2/pokemon/:id', () =>
        HttpResponse.text('server error', { status: 500 }),
      ),
    )
    const { result } = renderHook(() => useGetPokemon(1))
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.error).toMatch(/HTTP 500/)
    expect(result.current.notFound).toBe(false)
  })

  it('reloads when id changes', async () => {
    const { result, rerender } = renderHook(
      ({ id }: { id: number }) => useGetPokemon(id),
      { initialProps: { id: 1 } },
    )
    await waitFor(() => {
      expect(result.current.pokemon?.id).toBe(1)
    })
    rerender({ id: 25 })
    await waitFor(() => {
      expect(result.current.pokemon?.id).toBe(25)
    })
  })
})
