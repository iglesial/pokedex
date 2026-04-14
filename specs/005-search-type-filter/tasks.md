# Tasks: Search and Type Filter

**Input**: Design documents from `/specs/005-search-type-filter/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included — constitution Principle III mandates colocated tests. Tests cover filter utils, the filtered hook, both new components, and the updated page.

**Organization**: US1 (search) and US2 (type filter) both P1 and share the same hook + page — merged into one phase for efficiency. US3 (pagination composition) depends on both and is covered incrementally. US4 (clear-all) is a small additive task.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no deps)
- **[Story]**: [US1], [US2], [US3], [US4]
- Exact file paths in every description

---

## Phase 1: Setup (Project Initialization)

**Purpose**: No new deps needed; verify existing tooling is ready

- [X] T001 Verify `react-router-dom` v7 is installed (from feature 001) — `useSearchParams` used extensively in this feature
- [X] T002 Verify `src/utils/`, `src/hooks/`, `src/components/core/` directories exist (from prior features)

**Checkpoint**: Tooling ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Pure filter helpers, debounce hook, and service extension for prefetch-all — all used by every user story

### Service layer

- [X] T003 Add `fetchAllPokemon(options?)` to `src/services/pokemonService.ts` that returns all `MAX_POKEMON` (151) entries in one call — internally calls the existing `fetchPokemonPage({ pageSize: MAX_POKEMON, offset: 0 })` and returns `entries` per research R1
- [X] T004 Extend `src/services/pokemonService.test.ts` with a test: `fetchAllPokemon()` returns 151 entries, uses the fixture count, can be aborted via signal

### Filter utilities (pure, testable in isolation)

- [X] T005 [P] Create `src/utils/filterPokemon.ts` per contract [contracts/filterPokemon.ts](contracts/filterPokemon.ts) exporting: `KNOWN_TYPES` (const array of 18 official types), `matchesQuery(pokemon, query)`, `matchesAllTypes(pokemon, types)`, `filterPokemon(list, { query, types })`, `parseTypesParam(raw)`; all pure functions operating on `PokemonListEntry`
- [X] T006 [P] Create `src/utils/filterPokemon.test.ts` with cases for: empty query matches all, case-insensitive substring match, whitespace-trimmed query, single-type AND, two-type AND semantics (Charizard matches `[fire,flying]` but Charmander does not), empty `types` matches all, `parseTypesParam('fire,chaos,water')` returns `['fire','water']`, `parseTypesParam(null)` returns `[]`, `parseTypesParam('')` returns `[]`

### Debounce hook

- [X] T007 [P] Create `src/hooks/useDebouncedValue.ts` — generic `useDebouncedValue<T>(value: T, delayMs: number): T` hook using `useState` + `useEffect` + `setTimeout` with cleanup; no external dependency
- [X] T008 [P] Create `src/hooks/useDebouncedValue.test.ts` — uses Vitest fake timers (`vi.useFakeTimers()`) to verify: immediate value is initial; advancing timer < delay keeps old value; advancing timer ≥ delay returns latest value; rapid value changes only fire once at the end

**Checkpoint**: Filter utils + debounce hook exist, fully unit-tested, usable by any caller

---

## Phase 3: US1 + US2 + US3 — Search, Type Chips, Pagination Composition (Priority: P1) MVP

**Goal**: List page prefetches all 151 Pokémon, renders a search input and 18 type chips above the grid; filtering and pagination compose via the URL; empty state displays when no matches.

**Independent Test**: Open `/`; after brief spinner see full list. Type "char" → Charmander, Charmeleon, Charizard. Click Fire chip → filter narrows. Click Flying → only Charizard. Pagination reflects filtered count. URL shows `?q=char&types=fire,flying`.

### Service + list hook refactor

- [X] T009 [US1,US2] Refactor `src/hooks/useListPokemon.ts` to prefetch the full 151-entry set via `fetchAllPokemon()` on mount instead of paginated requests; store the full set in state; existing `page`, `totalPages`, `setPage` behavior preserved but now computed from the local full set + a `pageSize` slice (no more per-page fetches). `loading` MUST be true ONLY during the initial prefetch; `setPage(n)` MUST NOT trigger `loading=true` since pagination becomes pure array slicing.
- [X] T010 [US1,US2] Update `src/hooks/useListPokemon.test.tsx` to reflect the single-fetch behavior: assert only one request is made on mount; `setPage(2)` does not trigger another fetch; existing assertions about URL-driven page and error state continue to pass

### useFilteredPokemon hook

- [X] T011 [US1,US2,US3] Create `src/hooks/useFilteredPokemon.ts` per contract [contracts/useFilteredPokemon.ts](contracts/useFilteredPokemon.ts): composes `useListPokemon` with `useSearchParams` to read `q`, `types`, `page`; derives `filteredEntries` via `filterPokemon` helper (memoized with `useMemo` keyed on `allEntries`, query, types); derives `pageEntries` via slice (memoized on filteredEntries, page, pageSize); exposes `setPage`, `setQuery`, `setTypes`, `clearFilters`; auto-resets page to 1 when current page exceeds new `totalPages` per research R7
- [X] T012 [US1,US2,US3] Create `src/hooks/useFilteredPokemon.test.tsx` — wrap renders in `<MemoryRouter>`; test: initial prefetch populates `allEntries`; query `?q=char` filters name; `?types=fire` filters by type; `?types=fire,flying` applies AND; `?types=fire,chaos` silently drops `chaos`; page auto-resets to 1 when filter change reduces pages; `clearFilters()` removes q, types, and page from URL; `setQuery` / `setTypes` / `setPage` update URL correctly

### SearchInput core component

- [X] T013 [P] [US1] Create `src/components/core/SearchInput/SearchInput.tsx` per contract [contracts/SearchInput.ts](contracts/SearchInput.ts): controlled `<input type="search">` wrapped in a styled container; internally wires `useDebouncedValue` over the current value with the `debounceMs` prop (default 200); fires `onChange` on every keystroke (immediate UI value) and `onDebouncedChange` after the debounce fires; includes a clear button (×) inside the input when the value is non-empty
- [X] T014 [P] [US1] Create `src/components/core/SearchInput/SearchInput.css` — token-only styling; accessible focus-visible outline; clear button positioned inside the input
- [X] T015 [US1] Create `src/components/core/SearchInput/SearchInput.test.tsx` — test: renders with label and placeholder, typing fires `onChange` immediately, typing fires `onDebouncedChange` only after 200 ms (use `vi.useFakeTimers`), clicking the × clears the value and fires both callbacks with `''`, keyboard focus + Escape to clear (if implemented), axe assertion passes

### TypeFilterChips core component

- [X] T016 [P] [US2] Create `src/components/core/TypeFilterChips/TypeFilterChips.tsx` per contract [contracts/TypeFilterChips.ts](contracts/TypeFilterChips.ts): renders the 18 types in **canonical alphabetical order** as `<button aria-pressed={isSelected}>` elements; each chip's background uses `getTypeColorVar(type)`; clicking toggles the type in/out of `selected` and calls `onChange` with the new list; container has `role="group"` + `aria-label`
- [X] T017 [P] [US2] Create `src/components/core/TypeFilterChips/TypeFilterChips.css` — flex-wrap layout, selected vs. unselected visual states (unselected: reduced opacity + muted border; selected: full opacity + stronger border/ring), `:focus-visible` outline using `--color-focus-ring`
- [X] T018 [US2] Create `src/components/core/TypeFilterChips/TypeFilterChips.test.tsx` — test: renders all 18 chips, unselected state shows `aria-pressed="false"`, clicking a chip calls `onChange` with that type added, clicking a selected chip removes it, multiple selections work, keyboard Tab + Enter/Space toggle, axe assertion passes

### Barrel updates

- [X] T019 [US1,US2] Export `SearchInput` + `SearchInputProps` and `TypeFilterChips` + `TypeFilterChipsProps` from `src/components/index.ts`

### HomePage integration

- [X] T020 [US1,US2,US3] Update `src/pages/HomePage.tsx` — replace `useListPokemon()` with `useFilteredPokemon()`; render a filter toolbar above the grid containing `<SearchInput>` and `<TypeFilterChips>`; wire `query`/`setQuery` and `types`/`setTypes`; add an `aria-live="polite"` div announcing the result count per research R8; empty-state shows `<Alert severity="info">No Pokémon match your filters.</Alert>` when `pageEntries.length === 0 && !loading && !error`; hide `<Pagination>` when `totalPages === 0`
- [X] T021 [US1,US2,US3] Update `src/pages/HomePage.css` — toolbar layout: `SearchInput` aligned left, `TypeFilterChips` wrapping below or beside (responsive); `.home-sr-only` helper for the live region (position: absolute; width: 1px; clip: rect(0,0,0,0); etc.)
- [X] T022 [US1,US2,US3] Update `src/pages/HomePage.test.tsx` — add tests: (1) **no-filter baseline regression**: when URL has no `q`/`types`/`page`, the page renders the same 20 cards and 8-page Pagination as before 005 (satisfies SC-005); (2) typing in search input filters visible cards (use `vi.useFakeTimers` to advance past debounce); (3) clicking a type chip filters the grid; (4) both filters together use AND semantics; (5) empty state renders when no matches; (6) live region content updates ("N Pokémon found"); ensure all existing tests still pass

**Checkpoint**: MVP functional — search + type filters + pagination all compose with URL persistence.

---

## Phase 4: US4 — Clear All Filters (Priority: P2)

**Goal**: A single control clears search query, type filters, and resets page to 1.

**Independent Test**: With at least one filter active, the "Clear filters" button appears; clicking it resets everything.

- [X] T023 [US4] Update `src/pages/HomePage.tsx` — render a ghost-variant `<Button onClick={clearFilters}>Clear filters</Button>` inside the filter toolbar, visible only when `query !== '' || types.length > 0 || page !== 1`; `clearFilters` is already exposed by `useFilteredPokemon`
- [X] T024 [US4] Extend `src/pages/HomePage.test.tsx` — test: Clear filters button is hidden when no filters active; visible after typing a query; clicking it empties the search input, deselects all chips, resets page, and strips q/types/page from the URL

**Checkpoint**: US4 complete — one-click reset works.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T025 [P] Run `npm run lint` and resolve any warnings to zero
- [X] T026 [P] Run `npm run format` for consistent formatting
- [X] T027 Run full `npm test` and confirm all new + existing tests pass (expected ~165 tests total)
- [X] T028 Run `npm run build` and verify bundle size hasn't regressed significantly; confirm `/preview` still dev-only and `/pokemon/:id` still code-split
- [X] T029 Manual browser verification (`npm run dev`): test quickstart flows end-to-end — prefetch spinner, type search with debounce feel, chip toggles, AND filtering, clear-all, deep-link URL reload, back-navigation preserves filters, empty state on zero matches
- [X] T030 Run quickstart.md validation — every code sample runs as documented

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No deps — immediate
- **Foundational (Phase 2)**: Depends on Setup; filter utils + debounce hook + service extension prereq everything else
- **US1+US2+US3 (Phase 3)**: Depends on Foundational; reorders the list hook and introduces the filter hook + UI
- **US4 (Phase 4)**: Depends on Phase 3 (requires `clearFilters` from `useFilteredPokemon`)
- **Polish (Phase 5)**: Depends on all prior phases

### Within Phase 3

- T009 (list hook refactor) → T010 (list hook tests) sequential
- T011 (filter hook) depends on T009 being done
- T013–T015 (SearchInput) parallel to hook work — independent file set
- T016–T018 (TypeFilterChips) parallel to SearchInput — independent file set
- T019 (barrel) depends on T013 + T016
- T020–T022 (HomePage) depend on T011, T013, T016, T019

### Parallel Opportunities

- **Phase 2**: T005+T006 parallel with T007+T008 (utils vs. debounce hook)
- **Phase 3**: SearchInput trio (T013–T015) parallel with TypeFilterChips trio (T016–T018)
- **Phase 5**: T025 + T026 parallel

---

## Implementation Strategy

### MVP (Phases 1–3)

1. Utils + debounce hook (Phase 2)
2. Prefetch-all refactor + filter hook + UI components + HomePage wiring (Phase 3)
3. **STOP and VALIDATE**: search + type filters + pagination all work with URL persistence
4. Ship MVP

### Incremental Delivery

1. Phase 2 → pure utilities tested in isolation
2. Phase 3 → full filter UI live → Demo (MVP!)
3. Phase 4 → one-click reset → Demo
4. Phase 5 → final validation

---

## Notes

- `PokemonListEntry` type is reused — no new entity types needed
- Debounce is fixed at 200 ms per spec (Clarifications Q2); do not make it configurable per-page
- The prefetch replaces paginated fetching in `useListPokemon`; the hook's public API (`page`, `setPage`, `totalPages`, `pokemon`, `loading`, `error`) stays the same so dependent code doesn't break
- Live region content should be plain text ("N Pokémon found") — avoid rich nodes; screen readers read text only
- `KNOWN_TYPES` is the canonical source of truth for valid type names; reuse the same list for the chip row, URL sanitization, and any future feature that deals with types
- Commit after each major task group (utils, hook, components, page wiring) for atomic history
