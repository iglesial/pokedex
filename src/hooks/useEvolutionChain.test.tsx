import { renderHook, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import type { PropsWithChildren } from 'react'
import { server } from '../test/setup'
import {
  buildEvolutionChainResponse,
  buildSpeciesResponse,
  evolutionChainErrorHandler,
} from '../test/msw-handlers'
import { useEvolutionChain } from './useEvolutionChain'

function Wrapper({ children }: PropsWithChildren) {
  return <MemoryRouter>{children}</MemoryRouter>
}

describe('useEvolutionChain', () => {
  it('loads a linear chain (Bulbasaur)', async () => {
    server.use(
      http.get(
        'https://pokeapi.co/api/v2/pokemon-species/:id',
        () => HttpResponse.json(buildSpeciesResponse(1, 1)),
      ),
      http.get(
        'https://pokeapi.co/api/v2/evolution-chain/:id',
        () => HttpResponse.json(buildEvolutionChainResponse([[1, 2, 3]])),
      ),
    )
    const { result } = renderHook(() => useEvolutionChain(1), {
      wrapper: Wrapper,
    })
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.chain?.root.id).toBe(1)
    expect(result.current.chain?.branches).toHaveLength(1)
    expect(result.current.chain?.branches[0].map((n) => n.id)).toEqual([2, 3])
    expect(result.current.error).toBeNull()
  })

  it('loads a single-stage chain (Mew) with no branches', async () => {
    server.use(
      http.get(
        'https://pokeapi.co/api/v2/pokemon-species/:id',
        () => HttpResponse.json(buildSpeciesResponse(151, 151)),
      ),
      http.get(
        'https://pokeapi.co/api/v2/evolution-chain/:id',
        () => HttpResponse.json(buildEvolutionChainResponse([[151]], 151)),
      ),
    )
    const { result } = renderHook(() => useEvolutionChain(151), {
      wrapper: Wrapper,
    })
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.chain?.branches).toEqual([])
  })

  it('sets error on chain fetch failure', async () => {
    server.use(evolutionChainErrorHandler)
    const { result } = renderHook(() => useEvolutionChain(1), {
      wrapper: Wrapper,
    })
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.error).toMatch(/HTTP 500/)
    expect(result.current.chain).toBeNull()
  })

  it('refetches when pokemonId changes', async () => {
    const { result, rerender } = renderHook(
      ({ id }: { id: number }) => useEvolutionChain(id),
      { initialProps: { id: 1 }, wrapper: Wrapper },
    )
    await waitFor(() => {
      expect(result.current.chain?.root.id).toBe(1)
    })
    rerender({ id: 25 })
    await waitFor(() => {
      expect(result.current.chain?.root.id).toBe(25)
    })
  })
})
