import { Alert, Pagination, PokemonCard, Spinner } from '../components'
import { useListPokemon } from '../hooks/useListPokemon'
import './HomePage.css'

export function HomePage() {
  const { pokemon, loading, error, page, totalPages, setPage } = useListPokemon()

  return (
    <main className="home-page">
      <header className="home-header">
        <h1>Pokédex</h1>
      </header>
      <section className="home-content">
        {loading && pokemon.length === 0 && (
          <div className="home-center">
            <Spinner size="lg" label="Loading Pokémon" />
          </div>
        )}

        {error && (
          <Alert severity="error" title="Failed to load Pokémon">
            {error}
          </Alert>
        )}

        {!loading && !error && pokemon.length === 0 && (
          <Alert severity="info" title="No Pokémon">
            No Pokémon found. Check back later!
          </Alert>
        )}

        {pokemon.length > 0 && (
          <>
            <ul className="pokemon-grid" aria-label="Pokémon list">
              {pokemon.map((p) => (
                <li key={p.id} className="pokemon-grid__item">
                  <PokemonCard pokemon={p} />
                </li>
              ))}
            </ul>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              label="Pokédex pagination"
            />
          </>
        )}
      </section>
    </main>
  )
}
