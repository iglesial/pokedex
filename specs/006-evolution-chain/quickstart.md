# Quickstart: Evolution Chain on Detail Page

**Feature**: 006-evolution-chain

## Using the Feature

- Open `/pokemon/4` (Charmander) → see the Evolution section below
  the stats showing **Charmander → Charmeleon → Charizard**
- Open `/pokemon/151` (Mew) → see "This Pokémon does not evolve"
- Open `/pokemon/133` (Eevee) → see Eevee branching to Vaporeon,
  Jolteon, Flareon
- Open `/pokemon/41` (Zubat) → see Zubat → Golbat, with **Crobat**
  rendered as a muted non-clickable "Gen II" placeholder
- Resize to mobile width (≤ 600 px) → chain stacks vertically

## Developer Integration

### Drop-in usage on the detail page

```tsx
import { EvolutionChain } from '../components'

<EvolutionChain pokemonId={pokemon.id} />
```

### Using the hook

```ts
import { useEvolutionChain } from '../hooks/useEvolutionChain'

const { chain, loading, error } = useEvolutionChain(25)
if (loading) return <Spinner label="Loading evolutions" />
if (error) return <Alert severity="error">{error}</Alert>
if (!chain) return null
if (chain.branches.length === 0) return <p>This Pokémon does not evolve</p>
// Render chain.root + chain.branches[]
```

### Pure utilities

```ts
import {
  flattenEvolutionChain,
  parseSpeciesIdFromUrl,
  spriteUrlForId,
} from '../utils/evolutionChain'

parseSpeciesIdFromUrl(
  'https://pokeapi.co/api/v2/pokemon-species/25/'
)  // 25

spriteUrlForId(25)
// 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'

flattenEvolutionChain(rawChainLink)  // FlattenedChain
```

## Validation Checklist

1. `/pokemon/1` Bulbasaur → 3-stage linear chain visible
2. `/pokemon/4` Charmander → 3-stage linear chain visible
3. `/pokemon/133` Eevee → 3 branches (Vaporeon, Jolteon, Flareon)
4. `/pokemon/41` Zubat → Golbat clickable, Crobat (#169) muted
5. `/pokemon/151` Mew → "This Pokémon does not evolve"
6. Click a sibling card → URL changes, current highlight moves
7. Click the current card → no navigation; UI stable
8. Block `/evolution-chain/*` in devtools → see error Alert in
   the Evolution section but identity/stats/abilities/moves still
   render
9. Resize to ≤ 600 px → chain stacks vertically with downward
   arrows
10. `npm test` → all tests pass; `npm run lint` zero warnings;
    `npm run build` succeeds with code-split DetailPage chunk
