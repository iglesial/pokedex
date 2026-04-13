import { useEffect, useState } from 'react'
import {
  fetchPokemon,
  PokemonNotFoundError,
} from '../services/pokemonService'
import type { Pokemon } from '../types/pokemon'

export interface UseGetPokemonResult {
  pokemon: Pokemon | null
  loading: boolean
  error: string | null
  notFound: boolean
}

export function useGetPokemon(id: number | string): UseGetPokemonResult {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError(null)
    setNotFound(false)
    setPokemon(null)

    fetchPokemon(id, { signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return
        setPokemon(result)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        if (err instanceof PokemonNotFoundError) {
          setNotFound(true)
          return
        }
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
  }, [id])

  return { pokemon, loading, error, notFound }
}
