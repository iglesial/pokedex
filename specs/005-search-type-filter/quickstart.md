# Quickstart: Search and Type Filter

**Feature**: 005-search-type-filter

## Using the Filters

- Open `/` — list page now prefetches all 151 Kanto Pokémon on load
- **Search**: type into the input above the grid; results filter
  200 ms after you pause typing
- **Types**: click any of the 18 colored type chips to toggle. With
  multiple selected, only Pokémon matching ALL selected types appear
- **Clear filters**: appears when any filter is active; resets
  search, types, and page in one click
- URL reflects state: `?q=char&types=fire,flying&page=2` — copy,
  share, bookmark

## Developer Integration

### Consuming the filtered list

```tsx
import { useFilteredPokemon } from '../hooks/useFilteredPokemon'

function MyList() {
  const {
    pageEntries, totalPages, page, setPage,
    query, setQuery, types, setTypes, clearFilters,
    loading, error,
  } = useFilteredPokemon()

  if (loading) return <Spinner label="Loading Pokédex" />
  if (error) return <Alert severity="error">{error}</Alert>
  if (pageEntries.length === 0) {
    return <Alert severity="info">No Pokémon match your filters.</Alert>
  }

  return (
    <>
      {pageEntries.map(p => <PokemonCard key={p.id} pokemon={p} />)}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </>
  )
}
```

### Using the filter helpers directly

```ts
import {
  filterPokemon,
  matchesQuery,
  matchesAllTypes,
  parseTypesParam,
  KNOWN_TYPES,
} from '../utils/filterPokemon'

matchesQuery(pokemon, 'char')         // true if name contains "char"
matchesAllTypes(pokemon, ['fire'])    // true if pokemon has fire
matchesAllTypes(pokemon, ['fire','flying'])  // AND — both required

parseTypesParam('fire,chaos,water')   // ['fire', 'water'] — invalid stripped
```

## Validation Checklist

1. Open `/` — list shows the first 20 Pokémon after prefetch
2. Type "char" → Charmander, Charmeleon, Charizard visible; URL has
   `?q=char`
3. Click the Fire chip → only fire Pokémon among matches; URL adds
   `&types=fire`
4. Click Flying too → only Charizard remains; URL has
   `?q=char&types=fire,flying`
5. Click "Clear filters" → URL resets to `/`, all 151 paginated again
6. Bookmark `/?q=char&types=fire&page=1` → reopen → identical view
7. Open `/?types=chaos` → silently ignored, full list shown

## Commands

```bash
npm run dev       # Visit /
npm test          # All tests (utils, hook, components, page)
npm run lint      # Zero-warning gate
npm run build     # Production build
```
