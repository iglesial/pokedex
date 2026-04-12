# Data Model: Application Structure Initialization

**Feature**: 001-app-structure-init
**Date**: 2026-04-12

## Entities

### NamedAPIResource

Reusable reference type used throughout the PokéAPI responses.

| Field  | Type     | Description               |
| ------ | -------- | ------------------------- |
| `name` | `string` | Resource name (lowercase) |
| `url`  | `string` | Full API URL              |

---

### Pokemon

Comprehensive type matching the PokéAPI `GET /api/v2/pokemon/{id}`
response. Defined in `src/types/pokemon.ts`.

| Field                        | Type                    | Description                        |
| ---------------------------- | ----------------------- | ---------------------------------- |
| `id`                         | `number`                | National Pokédex number            |
| `name`                       | `string`                | Lowercase name                     |
| `base_experience`            | `number`                | Base XP yield                      |
| `height`                     | `number`                | Height in decimeters               |
| `weight`                     | `number`                | Weight in hectograms               |
| `is_default`                 | `boolean`               | Whether this is the default form   |
| `order`                      | `number`                | Sort order                         |
| `location_area_encounters`   | `string`                | URL to encounter data              |
| `species`                    | `NamedAPIResource`      | Species reference                  |
| `forms`                      | `NamedAPIResource[]`    | Available forms                    |
| `abilities`                  | `PokemonAbility[]`      | Abilities list                     |
| `game_indices`               | `VersionGameIndex[]`    | Game-specific index numbers        |
| `held_items`                 | `PokemonHeldItem[]`     | Wild-held items                    |
| `moves`                      | `PokemonMove[]`         | Learnable moves                    |
| `past_types`                 | `PokemonPastType[]`     | Historical type changes            |
| `sprites`                    | `PokemonSprites`        | Sprite images (complex nested)     |
| `cries`                      | `PokemonCries`          | Audio cry URLs                     |
| `stats`                      | `PokemonStat[]`         | Base stats                         |
| `types`                      | `PokemonType[]`         | Type assignments                   |

---

### PokemonAbility

| Field       | Type               | Description          |
| ----------- | ------------------ | -------------------- |
| `ability`   | `NamedAPIResource` | Ability reference    |
| `is_hidden` | `boolean`          | Hidden ability flag  |
| `slot`      | `number`           | Ability slot (1-3)   |

### VersionGameIndex

| Field        | Type               | Description          |
| ------------ | ------------------ | -------------------- |
| `game_index` | `number`           | Game-internal index  |
| `version`    | `NamedAPIResource` | Version reference    |

### PokemonHeldItem

| Field             | Type                        | Description       |
| ----------------- | --------------------------- | ----------------- |
| `item`            | `NamedAPIResource`          | Item reference    |
| `version_details` | `PokemonHeldItemVersion[]`  | Per-version rarity|

### PokemonHeldItemVersion

| Field     | Type               | Description          |
| --------- | ------------------ | -------------------- |
| `rarity`  | `number`           | Encounter rarity %   |
| `version` | `NamedAPIResource` | Version reference    |

### PokemonMove

| Field                   | Type                     | Description         |
| ----------------------- | ------------------------ | ------------------- |
| `move`                  | `NamedAPIResource`       | Move reference      |
| `version_group_details` | `PokemonMoveVersion[]`   | Per-version details |

### PokemonMoveVersion

| Field               | Type               | Description             |
| ------------------- | ------------------ | ----------------------- |
| `level_learned_at`  | `number`           | Level learned (0=other) |
| `move_learn_method` | `NamedAPIResource` | How the move is learned |
| `version_group`     | `NamedAPIResource` | Version group reference |

### PokemonType

| Field  | Type               | Description        |
| ------ | ------------------ | ------------------ |
| `slot` | `number`           | Type slot (1 or 2) |
| `type` | `NamedAPIResource` | Type reference     |

### PokemonPastType

| Field        | Type               | Description                  |
| ------------ | ------------------ | ---------------------------- |
| `generation` | `NamedAPIResource` | Generation of type change    |
| `types`      | `PokemonType[]`    | Types in that generation     |

### PokemonStat

| Field       | Type               | Description          |
| ----------- | ------------------ | -------------------- |
| `base_stat` | `number`           | Base stat value      |
| `effort`    | `number`           | EV yield             |
| `stat`      | `NamedAPIResource` | Stat reference       |

### PokemonCries

| Field    | Type     | Description              |
| -------- | -------- | ------------------------ |
| `latest` | `string` | URL to latest cry audio  |
| `legacy` | `string` | URL to legacy cry audio  |

### PokemonSprites

Top-level sprite URLs plus nested `other` and `versions` objects.

| Field                  | Type                     | Description              |
| ---------------------- | ------------------------ | ------------------------ |
| `front_default`        | `string \| null`         | Default front sprite     |
| `front_shiny`          | `string \| null`         | Shiny front sprite       |
| `front_female`         | `string \| null`         | Female front sprite      |
| `front_shiny_female`   | `string \| null`         | Shiny female front       |
| `back_default`         | `string \| null`         | Default back sprite      |
| `back_shiny`           | `string \| null`         | Shiny back sprite        |
| `back_female`          | `string \| null`         | Female back sprite       |
| `back_shiny_female`    | `string \| null`         | Shiny female back        |
| `other`                | `PokemonSpritesOther`    | Additional sprite sets   |
| `versions`             | `PokemonSpritesVersions` | Generation-specific      |

**Note on `other`**: Contains `dream_world`, `home`,
`official-artwork`, and `showdown` sprite sets with varying
subsets of the 8 directional sprite fields.

**Note on `versions`**: Keyed by generation (`generation-i` through
`generation-viii`), each containing version-specific sprite sets.
Uses hyphenated keys requiring quoted property names in TypeScript.

---

### Design Token (CSS Entity)

Not a TypeScript type — defined as CSS custom properties in
`src/index.css`. See research.md (R3) for full token list.

| Category   | Token prefix       | Count |
| ---------- | ------------------ | ----- |
| Colors     | `--color-*`        | 8     |
| Spacing    | `--spacing-*`      | 5     |
| Radius     | `--radius-*`       | 4     |
| Shadows    | `--shadow-*`       | 2     |
| Typography | `--font-*`         | 7     |
| **Total**  |                    | **26**|

## Relationships

```text
Pokemon
  ├── has many → PokemonAbility
  ├── has many → VersionGameIndex
  ├── has many → PokemonHeldItem → has many → PokemonHeldItemVersion
  ├── has many → PokemonMove → has many → PokemonMoveVersion
  ├── has many → PokemonPastType → has many → PokemonType
  ├── has many → PokemonStat
  ├── has many → PokemonType
  ├── has one  → PokemonSprites
  ├── has one  → PokemonCries
  ├── has one  → NamedAPIResource (species)
  └── has many → NamedAPIResource (forms)
```

## State Transitions

No state transitions in this feature. Pokémon data is read-only.

## Validation Rules

- `Pokemon.id` MUST be a positive integer.
- `Pokemon.name` MUST be a non-empty lowercase string.
- All `NamedAPIResource.url` values MUST be valid URL strings.
- Sprite URLs are nullable — consumers MUST handle `null` gracefully.
