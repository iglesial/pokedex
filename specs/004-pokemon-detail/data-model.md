# Data Model: Pokémon Detail Page

**Feature**: 004-pokemon-detail
**Date**: 2026-04-12

## Entities

### Pokemon (reused)

Full detail entity already defined in [src/types/pokemon.ts](../../src/types/pokemon.ts)
(feature 001). No changes.

Fields consumed by this feature:

| Field                           | Type               | Usage                              |
| ------------------------------- | ------------------ | ---------------------------------- |
| `id`                            | `number`           | Pokédex number, route param        |
| `name`                          | `string`           | Display name (title-cased)         |
| `height`                        | `number`           | Decimetres → meters (÷10)          |
| `weight`                        | `number`           | Hectograms → kilograms (÷10)       |
| `sprites.front_default`         | `string \| null`   | Large sprite source                |
| `sprites.other.official-artwork.front_default` | `string \| null` | Preferred larger image source |
| `types[].type.name`             | `string`           | Type badges + primary type color   |
| `stats[].base_stat`             | `number`           | Radar chart magnitude              |
| `stats[].stat.name`             | `string`           | Radar axis label (normalized)      |
| `abilities[].ability.name`      | `string`           | Ability label                      |
| `abilities[].is_hidden`         | `boolean`          | Hidden-ability badge marker        |
| `moves[].move.name`             | `string`           | Move chip label                    |

### PokemonStatsSnapshot (derived)

Shape passed to the `StatRadar` component. Six fixed stats in a
canonical order.

```ts
interface StatPoint {
  label: string    // e.g., "HP", "Attack", "Defense"
  value: number    // raw base_stat
}

type PokemonStatsSnapshot = [
  StatPoint, // HP
  StatPoint, // Attack
  StatPoint, // Defense
  StatPoint, // Special Attack
  StatPoint, // Special Defense
  StatPoint, // Speed
]
```

### Detail Page State

Managed by the `useGetPokemon(id)` hook.

| Field      | Type                  | Description                                   |
| ---------- | --------------------- | --------------------------------------------- |
| `pokemon`  | `Pokemon \| null`     | Loaded Pokémon or null while loading/unresolved |
| `loading`  | `boolean`             | True during fetch                             |
| `error`    | `string \| null`      | Network/HTTP error message                    |
| `notFound` | `boolean`             | True when id is outside Gen I range           |

## State Transitions

### Initial load

```text
idle
  → loading (fetch /pokemon/:id)
  → loaded   (pokemon = data, loading = false)
  | error    (error = message, loading = false)
  | notFound (notFound = true, loading = false)
```

### ID change (user navigates from /pokemon/1 to /pokemon/2)

```text
loaded
  → loading (new fetch, abort previous)
  → loaded | error | notFound
```

## Validation Rules

- `id` from route param MUST parse as a positive integer in [1, 151].
  - Non-numeric → `notFound = true`, skip fetch.
  - Outside range → `notFound = true`, skip fetch.
- Each of the 6 stats MUST be present in API response; missing stats
  render with value 0 on the radar but display "—" in text.
- `abilities` MAY be empty; render empty-state text "No abilities listed".
- `moves` MAY be empty; render empty-state text "No moves listed".
- Sprite URL MAY be null; render text fallback (see feature 003 pattern).

## Relationships

```text
Pokemon
  ├── types[]     → Badge (colored) ×N
  ├── stats[]     → PokemonStatsSnapshot → StatRadar
  ├── abilities[] → Badge (neutral/secondary) ×N
  └── moves[]     → move-chip ×N (height-limited scroll)
```

No persistence. URL (`/pokemon/:id` + `?page=` on list) is the only
location-addressable state.
