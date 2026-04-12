# Quickstart: Pokémon List Page

**Feature**: 003-pokemon-list

## Using the List Page

After merging this feature, opening the app root (`/`) displays the
Pokémon list directly. No additional setup is required beyond `npm
install` and `npm run dev`.

## Developer Integration

### Fetching a Pokémon page

```ts
import { fetchPokemonPage } from '../services/pokemonService'

const page = await fetchPokemonPage({ pageSize: 20, offset: 0 })
console.log(page.entries)       // PokemonListEntry[]
console.log(page.totalCount)    // e.g. 1302
console.log(page.hasMore)       // true
```

### Using the hook in a component

```tsx
import { useListPokemon } from '../hooks/useListPokemon'

function MyList() {
  const { pokemon, loading, error, hasMore, loadMore } = useListPokemon()

  if (loading && pokemon.length === 0) return <Spinner label="Loading Pokémon" />
  if (error) return <Alert severity="error">{error}</Alert>
  if (pokemon.length === 0) return <Alert severity="info">No Pokémon found.</Alert>

  return (
    <>
      <ul>{pokemon.map(p => <li key={p.id}>{p.name}</li>)}</ul>
      {hasMore && (
        <Button onClick={loadMore} loading={loading}>Load more</Button>
      )}
    </>
  )
}
```

### Formatting helpers

```ts
import { toTitleCase, formatPokedexNumber } from '../utils/formatPokemon'

toTitleCase('bulbasaur')   // "Bulbasaur"
formatPokedexNumber(1)     // "#001"
formatPokedexNumber(150)   // "#150"
formatPokedexNumber(1025)  // "#1025"
```

## Running Tests

Tests mock the PokéAPI using MSW handlers defined in
`src/test/msw-handlers.ts`. No live network calls during `npm test`.

```bash
npm test                   # All tests
npm test pokemonService    # Just the service
npm test useListPokemon    # Just the hook
npm test HomePage          # Just the page
```

## Validation Checklist

1. Open `http://localhost:5173` — should see a Pokédex grid after a
   brief spinner.
2. Block `pokeapi.co` in devtools → reload → should see an error
   alert with a clear message.
3. Scroll to the bottom of the first batch → "Load more" button
   visible and focusable.
4. Click "Load more" → additional cards append to the list.
5. `npm run lint` → zero warnings.
6. `npm run build` → succeeds.
