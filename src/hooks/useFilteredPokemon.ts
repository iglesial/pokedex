import { useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { PokemonListEntry } from '../services/pokemonService'
import { filterPokemon, parseTypesParam } from '../utils/filterPokemon'
import { useListPokemon } from './useListPokemon'

export interface UseFilteredPokemonOptions {
  pageSize?: number
}

export interface UseFilteredPokemonResult {
  allEntries: PokemonListEntry[]
  filteredEntries: PokemonListEntry[]
  pageEntries: PokemonListEntry[]
  totalFiltered: number
  totalPages: number
  page: number
  query: string
  types: string[]
  loading: boolean
  error: string | null
  setPage: (page: number) => void
  setQuery: (query: string) => void
  setTypes: (types: string[]) => void
  clearFilters: () => void
}

function parsePage(raw: string | null): number {
  if (!raw) return 1
  const parsed = Number.parseInt(raw, 10)
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : 1
}

export function useFilteredPokemon({
  pageSize = 20,
}: UseFilteredPokemonOptions = {}): UseFilteredPokemonResult {
  const { allEntries, loading, error } = useListPokemon({ pageSize })
  const [searchParams, setSearchParams] = useSearchParams()

  const query = (searchParams.get('q') ?? '').trim()
  const types = useMemo(
    () => parseTypesParam(searchParams.get('types')),
    [searchParams],
  )
  const rawPage = parsePage(searchParams.get('page'))

  const filteredEntries = useMemo(
    () => filterPokemon(allEntries, { query, types }),
    [allEntries, query, types],
  )

  const totalFiltered = filteredEntries.length
  const totalPages =
    totalFiltered === 0 ? 0 : Math.ceil(totalFiltered / pageSize)

  // Clamp page to valid range; auto-reset to 1 when current page exceeds totalPages
  const page = totalPages === 0 ? 1 : Math.min(rawPage, totalPages)

  const pageEntries = useMemo(
    () => filteredEntries.slice((page - 1) * pageSize, page * pageSize),
    [filteredEntries, page, pageSize],
  )

  // If the URL's page is out of range after filtering, reset it
  useEffect(() => {
    if (totalPages > 0 && rawPage > totalPages) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('page')
        return next
      })
    }
  }, [rawPage, totalPages, setSearchParams])

  const setPage = useCallback(
    (next: number) => {
      const clamped = Math.max(1, Math.min(next, totalPages || 1))
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev)
        if (clamped === 1) {
          newParams.delete('page')
        } else {
          newParams.set('page', clamped.toString())
        }
        return newParams
      })
    },
    [setSearchParams, totalPages],
  )

  const setQuery = useCallback(
    (next: string) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev)
        const trimmed = next.trim()
        if (trimmed === '') {
          newParams.delete('q')
        } else {
          newParams.set('q', trimmed)
        }
        // Reset to page 1 on filter change
        newParams.delete('page')
        return newParams
      })
    },
    [setSearchParams],
  )

  const setTypes = useCallback(
    (next: string[]) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev)
        if (next.length === 0) {
          newParams.delete('types')
        } else {
          newParams.set('types', next.join(','))
        }
        newParams.delete('page')
        return newParams
      })
    },
    [setSearchParams],
  )

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams())
  }, [setSearchParams])

  return {
    allEntries,
    filteredEntries,
    pageEntries,
    totalFiltered,
    totalPages,
    page,
    query,
    types,
    loading,
    error,
    setPage,
    setQuery,
    setTypes,
    clearFilters,
  }
}
