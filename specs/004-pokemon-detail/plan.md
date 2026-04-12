# Implementation Plan: Pokémon Detail Page

**Branch**: `004-pokemon-detail` | **Date**: 2026-04-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-pokemon-detail/spec.md`

## Summary

Add a dedicated Pokémon detail page at route `/pokemon/:id` that
shows a large sprite, name, zero-padded number, type badges, height,
weight, a hexagonal radar chart of the six base stats (colored by
primary type), abilities (with hidden flag), and a scrollable grid
of move chips. Includes a Back button that returns to the list page
while preserving the last visited page via URL query string
(`?page=N`). Deep-link loads to `/pokemon/:id` work out of the box.

## Technical Context

**Language/Version**: TypeScript 5.6 (strict mode)
**Primary Dependencies**: React 19, React Router DOM 7, native `fetch`
**Storage**: In-memory React state; URL query string for list page number
**Testing**: Vitest + @testing-library/react + @testing-library/user-event + vitest-axe + MSW
**Target Platform**: Modern evergreen browsers (latest 2 of Chrome, Firefox, Safari, Edge)
**Project Type**: Single-page web application
**Performance Goals**: Detail page first paint < 1 s after data arrives (SC-002 implies 3 s total on broadband)
**Constraints**: WCAG 2.1 AA compliance; radar chart MUST expose accessible text alternative; no charting library (native SVG); reuse existing design tokens
**Scale/Scope**: 151 detail routes (Gen I); each Pokémon has 6 stats, 1–3 abilities, 50–90 moves

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| I | Component-First Architecture | ✅ PASS | New reusable `StatRadar` core component; DetailPage in `src/pages/`; data fetching isolated in `useGetPokemon` hook in `src/hooks/`; reuses Badge, Alert, Spinner, Button from feature 002 |
| II | Design Token System | ✅ PASS | All colors/spacing/radius from tokens; radar fill reuses existing `--color-type-*` tokens |
| III | Test-Driven Quality | ✅ PASS | Colocated tests for hook, page, and `StatRadar`; MSW mocks detail fetches; axe assertion on loaded page |
| IV | Type Safety | ✅ PASS | Reuses existing `Pokemon` type from feature 001; new `PokemonStatsSnapshot` derived type for radar input |
| V | Simplicity & YAGNI | ✅ PASS | No charting library — native SVG polygon; move damage class/power deferred; evolution chains deferred |

All gates pass.

## Project Structure

### Documentation (this feature)

```text
specs/004-pokemon-detail/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── contracts/           # Phase 1 output — service + hook + component contracts
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── services/
│   ├── pokemonService.ts        # UPDATED — add fetchPokemon(id, signal)
│   └── pokemonService.test.ts   # UPDATED — cover new function
├── hooks/
│   ├── useGetPokemon.ts         # NEW — fetches a single Pokémon by id
│   ├── useGetPokemon.test.ts
│   └── useListPokemon.ts        # UPDATED — read/write ?page= in URL
├── components/core/
│   └── StatRadar/               # NEW — hexagonal SVG radar chart
│       ├── StatRadar.tsx
│       ├── StatRadar.css
│       └── StatRadar.test.tsx
├── pages/
│   ├── DetailPage.tsx           # NEW
│   ├── DetailPage.css
│   └── DetailPage.test.tsx
├── config/
│   └── routes.tsx               # UPDATED — add /pokemon/:id route
└── utils/
    └── formatPokemon.ts         # UPDATED — add height/weight formatters
```

**Structure Decision**: DetailPage composes existing core
components + a new `StatRadar`. Routing adds a parameterized route.
The list hook is extended to read/write `?page=` so Back navigation
naturally restores state.

## Complexity Tracking

No constitution violations. Table not applicable.
