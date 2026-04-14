# Implementation Plan: Evolution Chain on Detail Page

**Branch**: `006-evolution-chain` | **Date**: 2026-04-14 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-evolution-chain/spec.md`

## Summary

Add an "Evolution" section to the Pokémon detail page showing the
Pokémon's full evolution chain as a row of mini cards connected by
directional arrows. Each chain is fetched via PokéAPI's species →
evolution-chain linkage; the raw tree is flattened into visual
branches. The current Pokémon is highlighted; clicking a sibling
navigates to its detail page. Non-evolving Pokémon show a clear
"This Pokémon does not evolve" message. Out-of-Kanto evolution
children are rendered as non-clickable muted placeholders (per spec
FR-011 option B).

## Technical Context

**Language/Version**: TypeScript 5.6 (strict mode)
**Primary Dependencies**: React 19, React Router DOM 7, native `fetch`
**Storage**: In-memory hook state; no persistence
**Testing**: Vitest + @testing-library/react + @testing-library/user-event + vitest-axe + MSW
**Target Platform**: Modern evergreen browsers (latest 2 of Chrome, Firefox, Safari, Edge)
**Project Type**: Single-page web application
**Performance Goals**: Evolution section visible within 2 s of detail page load; parallel fetches so the chain doesn't block other sections
**Constraints**: WCAG 2.1 AA; no layout shift while evolution data loads; no new chart/tree library
**Scale/Scope**: Kanto chains are typically 1–3 stages; Eevee is the hardest case at 1-to-3 Kanto-eligible branches

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| I | Component-First Architecture | ✅ PASS | New `EvolutionChain` + `EvolutionMiniCard` core components; data fetching isolated in `useEvolutionChain` hook |
| II | Design Token System | ✅ PASS | Reuses existing type-color, spacing, radius, shadow tokens; arrow uses `--color-text-light` |
| III | Test-Driven Quality | ✅ PASS | Colocated tests for service extension, hook, both components, DetailPage update; MSW mocks evolution endpoints |
| IV | Type Safety | ✅ PASS | Explicit types for `EvolutionChainResponse`, `EvolutionNode`, chain flattening return type |
| V | Simplicity & YAGNI | ✅ PASS | No tree library — manual BFS flattening to branches; only Kanto-range Pokémon clickable; no evolution-trigger details |

All gates pass.

## Project Structure

### Documentation (this feature)

```text
specs/006-evolution-chain/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── contracts/           # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── services/
│   ├── pokemonService.ts       # UPDATED — add fetchEvolutionChainForPokemon(id)
│   └── pokemonService.test.ts
├── hooks/
│   ├── useEvolutionChain.ts    # NEW
│   └── useEvolutionChain.test.tsx
├── utils/
│   ├── evolutionChain.ts       # NEW — pure flattening
│   └── evolutionChain.test.ts
├── types/
│   └── evolutionChain.ts       # NEW
├── components/core/
│   ├── EvolutionMiniCard/      # NEW
│   │   ├── EvolutionMiniCard.tsx
│   │   ├── EvolutionMiniCard.css
│   │   └── EvolutionMiniCard.test.tsx
│   └── EvolutionChain/         # NEW
│       ├── EvolutionChain.tsx
│       ├── EvolutionChain.css
│       └── EvolutionChain.test.tsx
└── pages/
    ├── DetailPage.tsx          # UPDATED
    └── DetailPage.test.tsx     # UPDATED
```

**Structure Decision**: Pure chain-flattening lives in `utils/` for
isolated unit testing. The `useEvolutionChain` hook handles the
async fetch + state transitions. Two core components split the
concerns: `EvolutionMiniCard` (one node) and `EvolutionChain` (the
container with layout + arrows + branching). The DetailPage drops in
`<EvolutionChain pokemonId={pokemon.id} />` below its existing
sections.

## Complexity Tracking

No constitution violations. Table not applicable.
