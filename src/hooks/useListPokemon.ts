import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  fetchAllPokemon,
  type PokemonListEntry,
} from '../services/pokemonService'

export interface UseListPokemonOptions {
  pageSize?: number
}

export interface UseListPokemonResult {
  /** Full prefetched set of Kanto Pokémon. */
  allEntries: PokemonListEntry[]
  /** Current page slice of the full set. */
  pokemon: PokemonListEntry[]
  /** True only during the initial prefetch. */
  loading: boolean
  error: string | null
  page: number
  totalPages: number
  setPage: (page: number) => void
}

function parsePage(raw: string | null): number {
  if (!raw) return 1
  const parsed = Number.parseInt(raw, 10)
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : 1
}

export function useListPokemon({
  pageSize = 20,
}: UseListPokemonOptions = {}): UseListPokemonResult {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parsePage(searchParams.get('page'))

  const [allEntries, setAllEntries] = useState<PokemonListEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError(null)

    fetchAllPokemon({ signal: controller.signal })
      .then((entries) => {
        if (controller.signal.aborted) return
        setAllEntries(entries)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        const message =
          err instanceof Error ? err.message : 'Unknown error loading Pokémon.'
        setError(message)
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => {
      controller.abort()
    }
  }, [])

  const totalCount = allEntries.length
  const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize)
  const pokemon = allEntries.slice((page - 1) * pageSize, page * pageSize)

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

  return {
    allEntries,
    pokemon,
    loading,
    error,
    page,
    totalPages,
    setPage,
  }
}
