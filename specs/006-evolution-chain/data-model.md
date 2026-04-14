# Data Model: Evolution Chain on Detail Page

**Feature**: 006-evolution-chain
**Date**: 2026-04-14

## Entities

### PokemonSpeciesResponse (PokéAPI shape, partial)

Returned by `GET /api/v2/pokemon-species/{id}`. Only fields used
by this feature are listed.

| Field             | Type               | Description                              |
| ----------------- | ------------------ | ---------------------------------------- |
| `id`              | `number`           | Species id (== Pokémon id for Gen I)     |
| `name`            | `string`           | Species name                             |
| `evolution_chain` | `{ url: string }`  | Pointer to the evolution-chain resource  |

### EvolutionChainResponse (PokéAPI shape)

Returned by `GET /api/v2/evolution-chain/{id}`.

| Field    | Type         | Description                          |
| -------- | ------------ | ------------------------------------ |
| `id`     | `number`     | Chain id                             |
| `chain`  | `ChainLink`  | Root of the recursive chain tree     |

### ChainLink (recursive node, PokéAPI shape)

| Field         | Type                  | Description                              |
| ------------- | --------------------- | ---------------------------------------- |
| `species`     | `NamedAPIResource`    | The species at this stage                |
| `evolves_to`  | `ChainLink[]`         | Branches that evolve from this stage     |
| `is_baby`     | `boolean`             | Pre-baby stage flag (mostly ignored v1)  |

`NamedAPIResource.url` looks like
`https://pokeapi.co/api/v2/pokemon-species/{id}/`. The species id
is parsed from the URL.

### EvolutionNode (derived, app-internal)

A single rendered card in the chain.

| Field          | Type     | Description                                       |
| -------------- | -------- | ------------------------------------------------- |
| `id`           | `number` | National Pokédex number                           |
| `name`         | `string` | Species name (lowercase)                          |
| `spriteUrl`    | `string \| null` | Sprite URL (constructed from id)          |
| `inKantoRange` | `boolean` | True when `id` is in [1, MAX_POKEMON]            |

Note: We compute `spriteUrl` deterministically from the id using
the public PokéAPI sprite CDN
(`.../sprites/pokemon/{id}.png`) so we don't need a second fetch
per chain stage. If the id is out of Kanto range, we still build
the URL but the card is rendered as a non-clickable placeholder.

### FlattenedChain (derived, app-internal)

The output of the pure flattening utility. Renders as one or more
parallel paths from a shared ancestor.

```ts
interface FlattenedChain {
  /** The ancestor (root) node, rendered once on the left. */
  root: EvolutionNode
  /**
   * Each branch is a list of stages AFTER the root. Linear chains
   * have a single branch; branching evolutions (Eevee) have N
   * branches.
   */
  branches: EvolutionNode[][]
}
```

For Bulbasaur:
```ts
{ root: bulbasaur, branches: [[ivysaur, venusaur]] }
```

For Eevee (Kanto only):
```ts
{ root: eevee, branches: [[vaporeon], [jolteon], [flareon]] }
```

For Mew (no evolutions):
```ts
{ root: mew, branches: [] }
```

### Section State (managed by `useEvolutionChain`)

| Field    | Type                    | Description                              |
| -------- | ----------------------- | ---------------------------------------- |
| `chain`  | `FlattenedChain \| null` | Loaded chain or null                    |
| `loading`| `boolean`               | True while species + chain are fetching  |
| `error`  | `string \| null`        | Error message if either request failed   |

## State Transitions

### Initial load

```text
idle
  → loading  (fetch species → fetch chain → flatten)
  → loaded   (chain set; loading=false)
  | error    (error set; loading=false)
```

### Pokémon id changes (e.g., user clicks a sibling card)

```text
loaded
  → loading (abort prior; refetch for new id)
  → loaded | error
```

### Empty case (no evolutions)

```text
loaded with chain.branches.length === 0
  → render "This Pokémon does not evolve" message
```

## Validation Rules

- `id` from species URL MUST parse as a positive integer; if
  parsing fails, that node is silently dropped.
- `branches` is empty when the chain has only the root stage.
- The flattening utility MUST visit every leaf of the raw tree to
  produce a branch — depth-first traversal.
- Each branch's nodes MUST appear in evolution order (root → leaf).

## Relationships

```text
Pokemon (from feature 001/004)
  └── (id) → fetchSpecies(id) → PokemonSpeciesResponse
                                   └── evolution_chain.url → fetchEvolutionChain(url)
                                                              └── chain (ChainLink tree)
                                                                  → flatten() → FlattenedChain
                                                                                  └── root + branches[][]
                                                                                       └── EvolutionNode → EvolutionMiniCard
```

The current Pokémon's id is used as the highlight key — any
`EvolutionNode` whose `id` matches the current `pokemonId` is
rendered with the "current" treatment.
