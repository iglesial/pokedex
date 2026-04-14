import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Pagination,
  PokemonCard,
  SearchInput,
  Spinner,
  TypeFilterChips,
} from '../components'
import { useFilteredPokemon } from '../hooks/useFilteredPokemon'
import './HomePage.css'

export function HomePage() {
  const {
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
  } = useFilteredPokemon()

  // Local search value for instant UI feedback; the hook syncs it to the URL after debounce.
  const [searchValue, setSearchValue] = useState(query)

  // Keep local input in sync when URL changes externally (e.g., clearFilters, back nav).
  useEffect(() => {
    setSearchValue(query)
  }, [query])

  const hasActiveFilters = query !== '' || types.length > 0 || page !== 1

  return (
    <main className="home-page">
      <header className="home-header">
        <h1>Pokédex</h1>
      </header>
      <section className="home-content">
        <div className="home-filters" role="region" aria-label="Filters">
          <SearchInput
            label="Search Pokémon by name"
            placeholder="e.g. char"
            value={searchValue}
            onChange={setSearchValue}
            onDebouncedChange={setQuery}
          />
          <TypeFilterChips selected={types} onChange={setTypes} />
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="home-clear"
            >
              Clear filters
            </Button>
          )}
        </div>

        <div role="status" aria-live="polite" className="home-sr-only">
          {loading ? '' : `${totalFiltered.toString()} Pokémon found`}
        </div>

        {loading && pageEntries.length === 0 && (
          <div className="home-center">
            <Spinner size="lg" label="Loading Pokémon" />
          </div>
        )}

        {error && (
          <Alert severity="error" title="Failed to load Pokémon">
            {error}
          </Alert>
        )}

        {!loading && !error && pageEntries.length === 0 && (
          <Alert severity="info" title="No matches">
            No Pokémon match your filters.
          </Alert>
        )}

        {pageEntries.length > 0 && (
          <>
            <ul className="pokemon-grid" aria-label="Pokémon list">
              {pageEntries.map((p) => (
                <li key={p.id} className="pokemon-grid__item">
                  <PokemonCard pokemon={p} />
                </li>
              ))}
            </ul>
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                label="Pokédex pagination"
              />
            )}
          </>
        )}
      </section>
    </main>
  )
}
