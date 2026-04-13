import { useCallback, useEffect, useState } from 'react'
import {
  fetchPokemonPage,
  type PokemonListEntry,
} from '../services/pokemonService'

export interface UseListPokemonOptions {
  pageSize?: number
  initialPage?: number
}

export interface UseListPokemonResult {
  pokemon: PokemonListEntry[]
  loading: boolean
  error: string | null
  page: number
  totalPages: number
  setPage: (page: number) => void
}

export function useListPokemon({
  pageSize = 20,
  initialPage = 1,
}: UseListPokemonOptions = {}): UseListPokemonResult {
  const [page, setPage] = useState(initialPage)
  const [pokemon, setPokemon] = useState<PokemonListEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    // Reset UI state at the start of each page load. The async fetch below
    // feeds subsequent state updates; the rule flags sync sets in effects
    // but this pattern is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError(null)

    fetchPokemonPage({
      pageSize,
      offset: (page - 1) * pageSize,
      signal: controller.signal,
    })
      .then((result) => {
        if (controller.signal.aborted) return
        setPokemon(result.entries)
        setTotalCount(result.totalCount)
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
  }, [page, pageSize])

  const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize)

  const setPageSafe = useCallback(
    (next: number) => {
      const clamped = Math.max(1, Math.min(next, totalPages || 1))
      setPage(clamped)
    },
    [totalPages],
  )

  return {
    pokemon,
    loading,
    error,
    page,
    totalPages,
    setPage: setPageSafe,
  }
}
