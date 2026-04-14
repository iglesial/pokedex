import { act, renderHook, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import type { PropsWithChildren } from 'react'
import { useFilteredPokemon } from './useFilteredPokemon'

function wrapperAt(initialPath: string) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <MemoryRouter initialEntries={[initialPath]}>{children}</MemoryRouter>
  }
}

describe('useFilteredPokemon', () => {
  it('prefetches all 151 entries on mount', async () => {
    const { result } = renderHook(() => useFilteredPokemon({ pageSize: 20 }), {
      wrapper: wrapperAt('/'),
    })
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.allEntries).toHaveLength(151)
    expect(result.current.filteredEntries).toHaveLength(151)
    expect(result.current.totalPages).toBe(8) // ceil(151/20)
    expect(result.current.pageEntries).toHaveLength(20)
  })

  it('filters by query from URL', async () => {
    // Fixture names are `pokemon-1`, `pokemon-2`, ... — so "pokemon-5" matches 5, 50-59, 150, 51-59
    const { result } = renderHook(() => useFilteredPokemon({ pageSize: 20 }), {
      wrapper: wrapperAt('/?q=pokemon-25'),
    })
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.query).toBe('pokemon-25')
    expect(result.current.filteredEntries).toHaveLength(1)
    expect(result.current.filteredEntries[0].id).toBe(25)
  })

  it('filters by types from URL', async () => {
    // Default fixture gives every Pokémon types: [grass, poison]
    const { result } = renderHook(() => useFilteredPokemon({ pageSize: 20 }), {
      wrapper: wrapperAt('/?types=grass'),
    })
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.types).toEqual(['grass'])
    expect(result.current.filteredEntries).toHaveLength(151)
  })

  it('applies AND semantics across multiple types', async () => {
    const { result } = renderHook(() => useFilteredPokemon({ pageSize: 20 }), {
      wrapper: wrapperAt('/?types=grass,poison'),
    })
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    // All fixture pokemon have both grass and poison → all match
    expect(result.current.filteredEntries).toHaveLength(151)
  })

  it('silently drops invalid types from URL', async () => {
    const { result } = renderHook(() => useFilteredPokemon({ pageSize: 20 }), {
      wrapper: wrapperAt('/?types=grass,chaos,poison'),
    })
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.types).toEqual(['grass', 'poison'])
  })

  it('setQuery updates URL and resets page to 1', async () => {
    const { result } = renderHook(() => useFilteredPokemon({ pageSize: 20 }), {
      wrapper: wrapperAt('/?page=3'),
    })
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    act(() => {
      result.current.setQuery('char')
    })
    await waitFor(() => {
      expect(result.current.query).toBe('char')
    })
    expect(result.current.page).toBe(1)
  })

  it('setTypes updates URL and resets page to 1', async () => {
    const { result } = renderHook(() => useFilteredPokemon({ pageSize: 20 }), {
      wrapper: wrapperAt('/?page=3'),
    })
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    act(() => {
      result.current.setTypes(['fire'])
    })
    await waitFor(() => {
      expect(result.current.types).toEqual(['fire'])
    })
    expect(result.current.page).toBe(1)
  })

  it('clearFilters removes all q/types/page from URL', async () => {
    const { result } = renderHook(() => useFilteredPokemon({ pageSize: 20 }), {
      wrapper: wrapperAt('/?q=char&types=fire&page=3'),
    })
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    act(() => {
      result.current.clearFilters()
    })
    await waitFor(() => {
      expect(result.current.query).toBe('')
    })
    expect(result.current.types).toEqual([])
    expect(result.current.page).toBe(1)
  })

  it('auto-clamps an out-of-range page after filtering', async () => {
    // pokemon-99 only matches one pokemon → totalPages=1. If URL has page=5, it should clamp.
    const { result } = renderHook(() => useFilteredPokemon({ pageSize: 20 }), {
      wrapper: wrapperAt('/?q=pokemon-99&page=5'),
    })
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.page).toBe(1)
    expect(result.current.totalPages).toBe(1)
  })
})
