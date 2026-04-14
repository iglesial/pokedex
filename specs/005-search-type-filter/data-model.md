# Data Model: Search and Type Filter

**Feature**: 005-search-type-filter
**Date**: 2026-04-13

## Entities

### PokemonListEntry (reused, unchanged)

Already defined in `src/services/pokemonService.ts` (feature 003).

| Field       | Type                 | Description                   |
| ----------- | -------------------- | ----------------------------- |
| `id`        | `number`             | Pokédex number                |
| `name`      | `string`             | Lowercase name                |
| `spriteUrl` | `string \| null`     | Sprite URL                    |
| `types`     | `string[]`           | Lowercase type names (1–2)    |

### FilterState (new, derived from URL)

Shape of the filter state derived from `useSearchParams`.

| Field   | Type         | Description                                      |
| ------- | ------------ | ------------------------------------------------ |
| `query` | `string`     | Trimmed search query; empty string = no filter   |
| `types` | `string[]`   | Selected type names in canonical order; empty = no filter |
| `page`  | `number`     | 1-based current page                             |

### FilteredListResult (new)

Output of `useFilteredPokemon`.

| Field             | Type                 | Description                                 |
| ----------------- | -------------------- | ------------------------------------------- |
| `allEntries`      | `PokemonListEntry[]` | Full 151-entry set (for debugging/ref)      |
| `filteredEntries` | `PokemonListEntry[]` | Full filtered set (pre-pagination)          |
| `pageEntries`     | `PokemonListEntry[]` | Current page of filtered results            |
| `totalFiltered`   | `number`             | Count of `filteredEntries`                  |
| `totalPages`      | `number`             | `Math.ceil(totalFiltered / pageSize)`       |
| `loading`         | `boolean`            | True during initial prefetch                |
| `error`           | `string \| null`     | Error message if prefetch failed            |

## State Transitions

### Initial prefetch

```text
idle
  → loading  (fetchAllPokemon)
  → loaded   (allEntries populated)
  | error    (error set; filteredEntries = [])
```

### Filter change

```text
loaded
  → recompute filteredEntries (pure, synchronous)
  → recompute totalPages
  → (if page > totalPages) reset page to 1
  → recompute pageEntries
```

No async work after the initial prefetch — filter changes are
synchronous derived state.

## Filtering Rules

- **Query match**: `name.toLowerCase().includes(query.trim().toLowerCase())`.
  Empty query matches everything.
- **Type match**: For every type `t` in `FilterState.types`,
  `pokemon.types.includes(t)` must be true. Empty types array
  matches everything. Invalid types in the URL are stripped before
  they enter `FilterState.types`.
- **Combined**: A Pokémon is included if both the query predicate
  and the types predicate return true.

## URL Parameters

| Param   | Format                       | Example             |
| ------- | ---------------------------- | ------------------- |
| `q`     | URL-encoded string           | `?q=char`           |
| `types` | Comma-separated type names   | `?types=fire,flying`|
| `page`  | Positive integer, omitted if 1 | `?page=3`         |

All parameters are optional. Any combination is valid.

## Validation Rules

- `query` is trimmed; leading/trailing whitespace is stripped
  before matching AND before URL sync.
- `types` is filtered to the 18 `KNOWN_TYPES` before storage;
  unknown values are silently dropped (FR-010).
- `page` defaults to 1 if missing, non-integer, < 1, or exceeds
  `totalPages` after filtering.
- When `filteredEntries.length === 0`, `totalPages = 0` and the
  pagination control MUST be hidden.
