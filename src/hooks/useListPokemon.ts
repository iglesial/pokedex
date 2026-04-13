import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  fetchPokemonPage,
  type PokemonListEntry,
} from '../services/pokemonService'

export interface UseListPokemonOptions {
  pageSize?: number
}

export interface UseListPokemonResult {
  pokemon: PokemonListEntry[]
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

  const [pokemon, setPokemon] = useState<PokemonListEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
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
    pokemon,
    loading,
    error,
    page,
    totalPages,
    setPage,
  }
}
