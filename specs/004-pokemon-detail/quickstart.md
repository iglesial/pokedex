# Quickstart: Pokémon Detail Page

**Feature**: 004-pokemon-detail

## Navigating to a Detail Page

- From the list: click any Pokémon card — the app navigates to
  `/pokemon/:id`.
- Direct URL: paste `http://localhost:5173/pokemon/25` to open
  Pikachu's detail page.
- URL bookmark/share: both list page (`/?page=3`) and detail URLs
  are bookmarkable.

## Back Navigation

On the detail page, click **Back**. The app returns to the list at
the page you came from (preserved in `?page=`). If you opened the
detail page directly, Back returns to `/?page=1`.

## Using the Hooks

```tsx
import { useGetPokemon } from '../hooks/useGetPokemon'
import { useParams } from 'react-router-dom'

function MyDetailView() {
  const { id } = useParams<{ id: string }>()
  const { pokemon, loading, error, notFound } = useGetPokemon(id ?? '')

  if (notFound) return <NotFoundView />
  if (loading) return <Spinner label="Loading Pokémon" />
  if (error) return <Alert severity="error">{error}</Alert>
  if (!pokemon) return null

  return <PokemonDetail pokemon={pokemon} />
}
```

## Using StatRadar

```tsx
import { StatRadar } from '../components'
import { getTypeColorVar } from '../utils/pokemonTypeColors'

<StatRadar
  stats={[
    { label: 'HP',      value: pokemon.stats[0].base_stat },
    { label: 'Attack',  value: pokemon.stats[1].base_stat },
    { label: 'Defense', value: pokemon.stats[2].base_stat },
    { label: 'Sp.Atk',  value: pokemon.stats[3].base_stat },
    { label: 'Sp.Def',  value: pokemon.stats[4].base_stat },
    { label: 'Speed',   value: pokemon.stats[5].base_stat },
  ]}
  fillColor={getTypeColorVar(pokemon.types[0].type.name)}
  caption={`Base stats for ${pokemon.name}`}
/>
```

## Validation Commands

```bash
npm run dev             # Visit /pokemon/1, /pokemon/25, /pokemon/500
npm test                # All tests (incl. useGetPokemon + DetailPage)
npm run lint            # Zero-warning gate
npm run build           # Production build
```

## Manual Validation Checklist

1. Open `/?page=3`; click any card → URL becomes `/pokemon/:id` →
   click **Back** → URL returns to `/?page=3`.
2. Open `/pokemon/25` in a new tab → Pikachu detail page loads
   directly.
3. Open `/pokemon/500` → "Not found" view with a link back to the
   list.
4. Open `/pokemon/not-a-number` → "Not found" view.
5. Throttle network in devtools → detail page shows Spinner, then
   renders. Block network → shows error Alert.
6. Inspect the radar: shape reflects stat magnitudes; fill color
   matches primary type.
7. Tab through the page → focus is keyboard-visible on Back button
   and on the moves scroll container.
