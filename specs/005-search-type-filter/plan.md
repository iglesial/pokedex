# Implementation Plan: Search and Type Filter

**Branch**: `005-search-type-filter` | **Date**: 2026-04-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-search-type-filter/spec.md`

## Summary

Add a name search input and a row of 18 type-filter chips above the
Pokémon grid. Per the clarification session, the list page now
prefetches all 151 Kanto Pokémon on first load and filters entirely
client-side; this lets the search and type filters work consistently
across pagination with zero perceived latency after the initial
fetch. Filter state is mirrored in the URL (`?q=…&types=…&page=…`)
so views are bookmarkable and survive refresh/back navigation.
Search input debounces at 200 ms. Result-count changes are
announced via a polite ARIA live region.

## Technical Context

**Language/Version**: TypeScript 5.6 (strict mode)
**Primary Dependencies**: React 19, React Router DOM 7, native `fetch`
**Storage**: In-memory React state; URL query string for filter + page state
**Testing**: Vitest + @testing-library/react + @testing-library/user-event + vitest-axe + MSW
**Target Platform**: Modern evergreen browsers (latest 2 of Chrome, Firefox, Safari, Edge)
**Project Type**: Single-page web application
**Performance Goals**: Prefetch completes under ~3 s on broadband; filter/chip clicks update the visible grid in <16 ms after the debounce fires
**Constraints**: WCAG 2.1 AA; debounce fixed at 200 ms; no new state library; no new fetching library
**Scale/Scope**: 151 entries × small payload → ~1 MB JSON total; single-digit millisecond filter cost

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| I | Component-First Architecture | ✅ PASS | New `SearchInput`, `TypeFilterChips` core components; filter logic in a `useFilteredPokemon` hook; list page wires them together |
| II | Design Token System | ✅ PASS | Reuses existing type-color tokens for chips; search input styled via existing Input component tokens |
| III | Test-Driven Quality | ✅ PASS | Colocated tests for new hook, components, and updated page; MSW continues to mock fetches |
| IV | Type Safety | ✅ PASS | Filter state types explicit; URL parsing functions typed with union of valid type names |
| V | Simplicity & YAGNI | ✅ PASS | Native `setTimeout` for debounce (one use only); client-side filtering is O(151); no indexing library |

All gates pass.

## Project Structure

### Documentation (this feature)

```text
specs/005-search-type-filter/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── contracts/           # Phase 1 output — hook + component contracts
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── services/
│   ├── pokemonService.ts      # UPDATED — add fetchAllPokemon() for prefetch
│   └── pokemonService.test.ts # UPDATED
├── hooks/
│   ├── useListPokemon.ts      # UPDATED — prefetch + client-side slicing
│   ├── useListPokemon.test.tsx
│   └── useFilteredPokemon.ts  # NEW — derives filtered set from URL params
│   └── useFilteredPokemon.test.tsx
├── utils/
│   ├── filterPokemon.ts       # NEW — pure filter helpers (matchesQuery, matchesTypes)
│   └── filterPokemon.test.ts
├── components/core/
│   ├── SearchInput/           # NEW — search text input w/ clear button + debounce
│   ├── TypeFilterChips/       # NEW — 18 toggleable colored chips
│   └── index.ts               # UPDATED — add barrel exports
├── pages/
│   ├── HomePage.tsx           # UPDATED — integrate filter row + live region
│   ├── HomePage.css
│   └── HomePage.test.tsx
```

**Structure Decision**: Pure filter helpers in `utils/` keep logic
testable in isolation. `useFilteredPokemon` hook composes the full
list from the refactored `useListPokemon` with URL-driven filter
state to produce the paginated filtered view. UI chips + search
input are core components for future reuse (e.g., on a type-only
index page).

## Complexity Tracking

No constitution violations. Table not applicable.
