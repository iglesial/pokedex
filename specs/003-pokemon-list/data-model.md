# Data Model: Pokémon List Page

**Feature**: 003-pokemon-list
**Date**: 2026-04-12

## Entities

### PokemonListResponse (PokéAPI shape)

Returned by `GET /api/v2/pokemon?limit=N&offset=M`.

| Field      | Type                          | Description                             |
| ---------- | ----------------------------- | --------------------------------------- |
| `count`    | `number`                      | Total Pokémon available in the API      |
| `next`     | `string \| null`              | URL of the next page (null on last)     |
| `previous` | `string \| null`              | URL of the previous page                |
| `results`  | `NamedAPIResource[]`          | Array of `{ name, url }` references     |

### Pokemon

Full detail entity already defined in [src/types/pokemon.ts](../../src/types/pokemon.ts)
(feature 001). Fetched from `GET /api/v2/pokemon/{id}` per entry.

Relevant fields for this feature:

| Field                    | Type               | Usage                         |
| ------------------------ | ------------------ | ----------------------------- |
| `id`                     | `number`           | Pokédex number                |
| `name`                   | `string`           | Pokémon name (lowercase)      |
| `sprites.front_default`  | `string \| null`   | Card image source             |
| `types[].type.name`      | `string`           | Type label(s) on badges       |

### PokemonListEntry (derived)

Lightweight shape used by the UI layer. Derived from a full
`Pokemon` object.

| Field       | Type                 | Description                            |
| ----------- | -------------------- | -------------------------------------- |
| `id`        | `number`             | Pokédex number (positive integer)      |
| `name`      | `string`             | Lowercase name from API                |
| `spriteUrl` | `string \| null`     | `sprites.front_default` (may be null)  |
| `types`     | `string[]`           | Type names in slot order (1–2 entries) |

## Page State

Managed by the `useListPokemon` hook.

| Field      | Type                   | Description                                |
| ---------- | ---------------------- | ------------------------------------------ |
| `pokemon`  | `PokemonListEntry[]`   | Accumulated list across all loaded batches |
| `loading`  | `boolean`              | True during initial or subsequent fetch    |
| `error`    | `string \| null`       | Human-readable error message if fetch failed |
| `hasMore`  | `boolean`              | Whether more Pokémon are available         |
| `loadMore` | `() => Promise<void>`  | Triggers the next batch fetch              |

## State Transitions

### Initial load

```text
idle
  → loading (fetch list + details)
  → loaded | error | empty
```

### Load more

```text
loaded (hasMore=true)
  → loading (append)
  → loaded | error
```

### Error

```text
error
  → (page refresh) → idle → loading
```

## Validation Rules

- `id` MUST be a positive integer.
- `name` MUST be a non-empty string.
- `types` MUST contain between 1 and 2 entries in slot order.
- `spriteUrl` MAY be null; UI MUST handle null via a text fallback.
- `loadMore` MUST be idempotent while a request is in flight (no
  duplicate fetches; no duplicate entries appended).

## Relationships

```text
PokemonListResponse
  └── results[] → NamedAPIResource (name + url)
         └── fetch detail → Pokemon
                └── project → PokemonListEntry (card props)
```

No persistence. All state lives in React memory for the page's
lifetime.
