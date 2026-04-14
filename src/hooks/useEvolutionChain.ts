import { useEffect, useState } from 'react'
import { fetchEvolutionChainForPokemon } from '../services/pokemonService'
import { flattenEvolutionChain } from '../utils/evolutionChain'
import type { FlattenedChain } from '../types/evolutionChain'

export interface UseEvolutionChainResult {
  chain: FlattenedChain | null
  loading: boolean
  error: string | null
}

export function useEvolutionChain(
  pokemonId: number,
): UseEvolutionChainResult {
  const [chain, setChain] = useState<FlattenedChain | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError(null)
    setChain(null)

    fetchEvolutionChainForPokemon(pokemonId, { signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return
        setChain(flattenEvolutionChain(response.chain))
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        const message =
          err instanceof Error ? err.message : 'Unknown error loading evolutions.'
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
  }, [pokemonId])

  return { chain, loading, error }
}
