# Implementation Plan: Pokémon List Page

**Branch**: `003-pokemon-list` | **Date**: 2026-04-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-pokemon-list/spec.md`

## Summary

Replace the current HomePage placeholder with a responsive grid of
Pokémon cards sourced from the public PokéAPI. Each card renders the
name, zero-padded Pokédex number, sprite image (with fallback), and
type badges. The page handles loading (via Spinner), error (via
Alert), and empty states. Users can paginate additional batches via
a "Load more" button.

## Technical Context

**Language/Version**: TypeScript 5.6 (strict mode)
**Primary Dependencies**: React 19, React Router DOM 7, native `fetch`
**Storage**: In-memory React state (no persistence)
**Testing**: Vitest + @testing-library/react + @testing-library/user-event + vitest-axe; MSW (Mock Service Worker) for API mocking in tests
**Target Platform**: Modern evergreen browsers (Chrome, Firefox, Safari, Edge — latest 2 versions)
**Project Type**: Single-page web application
**Performance Goals**: First 20 cards visible within 3 seconds on broadband (SC-001); initial batch render < 100ms after data arrives
**Constraints**: WCAG 2.1 AA compliance; no state library (use component state + a custom hook); sprite URLs may be null
**Scale/Scope**: ~1,300 total Pokémon in PokéAPI; default batch 20; expected 65 batches max

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| I | Component-First Architecture | ✅ PASS | Data-fetching logic isolated in a `useListPokemon` hook in `src/hooks/`; page component in `src/pages/`; presentational cards reuse existing core components (Card, Badge, Spinner, Alert) from feature 002 |
| II | Design Token System | ✅ PASS | New CSS uses only existing tokens; no new hard-coded values introduced |
| III | Test-Driven Quality | ✅ PASS | Colocated tests for new hook (`useListPokemon.test.ts`), service (`pokemonService.test.ts`), and page (`HomePage.test.tsx`); MSW mocks PokéAPI for deterministic tests; axe assertion on rendered page |
| IV | Type Safety | ✅ PASS | Existing `Pokemon` type (from feature 001) reused; new `PokemonListEntry` derived type documented in data-model |
| V | Simplicity & YAGNI | ✅ PASS | Native `fetch`, no state library, no caching library; search/filter/detail deferred per spec Assumptions |

All gates pass.

## Project Structure

### Documentation (this feature)

```text
specs/003-pokemon-list/
├── plan.md              # This file
├── research.md          # Phase 0 output — decisions
├── data-model.md        # Phase 1 output
├── contracts/           # Phase 1 output — service & hook contracts
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── services/
│   ├── pokemonService.ts        # Fetches list + details from PokéAPI
│   └── pokemonService.test.ts
├── hooks/
│   ├── useListPokemon.ts        # React hook exposing list state
│   └── useListPokemon.test.ts
├── pages/
│   ├── HomePage.tsx             # UPDATED — renders the list
│   ├── HomePage.css             # UPDATED — grid styling
│   └── HomePage.test.tsx        # UPDATED — mocks fetch with MSW
├── test/
│   └── msw-handlers.ts          # NEW — MSW request handlers for tests
└── utils/
    └── formatPokemon.ts         # Title casing, number padding, etc.
```

**Structure Decision**: Service layer encapsulates HTTP concerns;
hook exposes React state; page composes existing core components.
Clear separation per constitution Principle I.

## Complexity Tracking

No constitution violations. Table not applicable.
