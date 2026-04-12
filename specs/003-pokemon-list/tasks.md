# Tasks: Pokémon List Page

**Input**: Design documents from `/specs/003-pokemon-list/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included — constitution Principle III mandates colocated tests. Tests cover service, hook, utilities, and page.

**Organization**: Tasks grouped by user story. US1 (browse) and US2 (loading/error states) are both P1 and highly coupled — they share the same hook, page, and tests — so they merge into one phase. US3 (Load more) builds on top.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no deps)
- **[Story]**: [US1], [US2], [US3]
- Exact file paths in every description

---

## Phase 1: Setup (Project Initialization)

- [X] T001 Install `msw` as a dev dependency via `npm i -D msw` for test API mocking per research R2
- [X] T002 Verify `src/services/`, `src/hooks/`, `src/utils/` directories exist (created in feature 001); no action if already present

**Checkpoint**: MSW installed and ready for test setup

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Utilities and MSW handlers used by all user story tests

- [X] T003 [P] Create `src/utils/formatPokemon.ts` exporting `toTitleCase(str: string): string` and `formatPokedexNumber(id: number): string` per research R8
- [X] T004 [P] Create `src/utils/formatPokemon.test.ts` with cases for title casing (`'bulbasaur' → 'Bulbasaur'`, compound names with hyphens) and number padding (`1 → '#001'`, `150 → '#150'`, `1025 → '#1025'`)
- [X] T005 Create `src/test/msw-handlers.ts` exporting MSW handlers that intercept `GET https://pokeapi.co/api/v2/pokemon` (list) and `GET https://pokeapi.co/api/v2/pokemon/:id` (detail); factory functions to build fixture responses with configurable count/offset/types
- [X] T006 Wire MSW server into `src/test/setup.ts` — import `setupServer`, add `beforeAll/afterEach/afterAll` hooks to start/reset/stop the server with default handlers from T005

**Checkpoint**: Utilities tested; MSW intercepts PokéAPI in all tests

---

## Phase 3: User Stories 1 + 2 — Browse + Loading/Error (Priority: P1) MVP

**Goal**: Landing page shows Pokémon cards with name/number/sprite/types, with Spinner during load and Alert on error.

**Independent Test**: Open the app; see Spinner → then grid of ≥20 cards. Block `pokeapi.co` in MSW handlers → reload → see error Alert.

### Service Layer

- [X] T007 [P] [US1] Implement `src/services/pokemonService.ts` per contract [contracts/pokemonService.ts](contracts/pokemonService.ts): `fetchPokemonPage({ pageSize, offset, signal })` fetches list, then fetches each detail in parallel via `Promise.all`, maps to `PokemonListEntry[]`; `toListEntry(pokemon)` projects `Pokemon` → `PokemonListEntry`; throw `Error` with human-readable message on non-OK responses or network failures
- [X] T008 [US1] Create `src/services/pokemonService.test.ts` — test successful fetch maps data correctly, test HTTP 500 throws with readable message, test network error throws, test `hasMore` computed from `count` vs `offset+pageSize`, test AbortSignal cancels request; uses MSW handlers to simulate responses

### Hook Layer

- [X] T009 [P] [US2] Implement `src/hooks/useListPokemon.ts` per contract [contracts/useListPokemon.ts](contracts/useListPokemon.ts): internal state `{ pokemon, loading, error, hasMore, offset }`; `useEffect` on mount triggers initial fetch; `loadMore` callback guarded against re-entry while `loading`; AbortController to cancel on unmount
- [X] T010 [US2] Create `src/hooks/useListPokemon.test.ts` — test initial load populates `pokemon` and sets `loading=false`, test error state sets `error` message and leaves `pokemon` empty, test `loadMore` appends and updates `hasMore`, test double `loadMore` call is idempotent while loading, test unmount cancels in-flight request; uses `@testing-library/react` `renderHook` and MSW

### Page Layer

- [X] T011 [US1] Update `src/pages/HomePage.tsx` — call `useListPokemon`; render `<main>` with heading "Pokédex"; if `loading && pokemon.length === 0` render `<Spinner label="Loading Pokémon" />`; if `error` render `<Alert severity="error">{error}</Alert>`; if `pokemon.length === 0 && !loading` render `<Alert severity="info">No Pokémon found.</Alert>`; otherwise render a grid with one `<Card>` per Pokémon containing name (title case), `#001`-formatted ID, `<img>` with `onError` fallback to text placeholder, and type `<Badge>`s
- [X] T012 [US1] Update `src/pages/HomePage.css` — responsive grid via `repeat(auto-fill, minmax(220px, 1fr))` per research R6; card sprite styled as square; type badges arranged inline with `var(--spacing-xs)` gap; all values from design tokens only (no hard-coded colors/spacing)
- [X] T013 [US1] Update `src/pages/HomePage.test.tsx` — keep axe assertion; add tests: renders spinner initially, renders grid after data loads (assert ≥1 card with name/number/type), renders error Alert when MSW returns 500, renders empty-state Alert when MSW returns empty list, sprite `onError` shows text placeholder (dispatch `error` event on `<img>`)

**Checkpoint**: MVP functional — users see cards or appropriate feedback state; all P1 tests pass

---

## Phase 4: User Story 3 — Load More (Priority: P2)

**Goal**: Button below grid to load additional batches; hidden when all loaded; prevents duplicate requests.

**Independent Test**: Scroll to bottom; click "Load more"; additional cards append without replacing existing ones. Click twice quickly → only one new batch fetched.

- [X] T014 [P] [US3] Update `src/pages/HomePage.tsx` — render `<Button onClick={loadMore} loading={loading} disabled={loading}>Load more</Button>` below the grid when `hasMore && pokemon.length > 0`; hide when `!hasMore`
- [X] T015 [US3] Extend `src/pages/HomePage.test.tsx` — add tests: "Load more" button visible after initial load, clicking it appends additional cards, button hidden when `hasMore=false` (mock MSW with total count ≤ pageSize), double-click doesn't trigger duplicate fetches (assert fetch handler called once)

**Checkpoint**: US3 complete — pagination works and is double-click safe

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T016 [P] Run `npm run lint` and resolve any warnings to zero
- [X] T017 [P] Run `npm run format` to ensure consistent formatting
- [X] T018 Run full `npm test` and confirm all new and existing tests pass (expected: ~70 tests total across ~18 files)
- [X] T019 Run `npm run build` and confirm production build succeeds; verify landing page bundle size hasn't regressed significantly (target < 320 KB JS)
- [X] T020 Manually verify in browser (`npm run dev`): open `/` → see spinner → see cards; use devtools to throttle/block network → see error Alert; scroll + click Load more → additional cards append
- [X] T021 Run quickstart.md validation — follow each code example and ensure API matches implementation

---

## Phase 6: Post-Review Scope Expansion (Priority: P1)

**Purpose**: Address stakeholder feedback — type-colored badges, modern card visuals, and numbered pagination replacing Load-more. Triggered after initial delivery of Phases 1–5.

### Design token additions

- [X] T022 Add 19 type-color CSS custom properties to `src/index.css` (`--color-type-normal` through `--color-type-fairy`, plus `--color-type-default`) using the official Pokémon palette

### Type-colored badges

- [X] T023 [P] Create `src/components/core/Badge/Badge.css` rule `.badge--type` that reads from `--badge-bg` and `--badge-fg` CSS variables, setting text color to white and background from the variable; extend `Badge.tsx` to forward a `style` prop (already via spread) so consumers can inline the variables OR extend `BadgeProps` with an optional `type` field that renders `data-type={type}` and colors via a CSS attribute selector
- [X] T024 [P] [US1] Create `src/utils/pokemonTypeColors.ts` exporting a lookup `getTypeColorVar(type: string): string` returning `var(--color-type-{type})` with fallback to `var(--color-type-default)`; add colocated unit tests

### Pagination refactor

- [X] T025 [US3] Refactor `src/hooks/useListPokemon.ts` to page-based semantics: state `{ page, pageSize, pokemon, loading, error, totalPages }`; `setPage(n)` triggers fetch at offset `(n-1) * pageSize` and REPLACES `pokemon` (not append); abort in-flight requests on page change; update unit tests accordingly
- [X] T026 [US3] Create `src/components/core/Pagination/Pagination.tsx`, `.css`, and `.test.tsx` — renders Previous/Next buttons + numbered links with ellipsis for >10 pages; props `{ currentPage, totalPages, onPageChange }`; wired for keyboard a11y (buttons, aria-current="page" on active, aria-label on nav); exports from `src/components/index.ts`

### Page integration & modern card visuals

- [X] T027 [US1, US3] Update `src/pages/HomePage.tsx` — replace Load-more Button with `<Pagination>` beneath the grid; apply type color to each `<Badge>` via inline `style={{ backgroundColor: getTypeColorVar(type), color: 'var(--color-text-on-primary)' }}`; refresh card markup for modern look (sprite on tinted background of first type's color, larger name, number as muted overlay)
- [X] T028 [US1] Update `src/pages/HomePage.css` — modernize card: larger border radius (`var(--radius-lg)`), transition on hover (subtle lift + shadow increase within `prefers-reduced-motion`), sprite wrapper gets first-type background tint via inline var, refined typography hierarchy

### Test & validation

- [X] T029 Update `src/pages/HomePage.test.tsx` — remove Load-more tests; add Pagination tests (renders controls, clicking page 2 replaces list, Previous disabled on page 1, Next disabled on last page, ellipsis for large totals); keep sprite fallback + loading + error + empty + axe tests
- [X] T030 Run full `npm test`, `npm run lint`, `npm run build`; browser-verify the updated UI

**Checkpoint**: Type-colored badges visible, modern card visuals, numbered pagination navigation works.

---

## Phase 7: Gen I Cap + PokemonCard Extraction

- [X] T031 Cap the list at the first 151 Pokémon (Gen I) in `src/services/pokemonService.ts` by clamping `totalCount` to `Math.min(list.count, 151)` and truncating results accordingly
- [X] T032 [P] Extract the inline `PokemonCard` and `PokemonSprite` from `src/pages/HomePage.tsx` into a new reusable component at `src/components/core/PokemonCard/PokemonCard.tsx` + `.css` + `.test.tsx`; export from `src/components/index.ts`
- [X] T033 [P] Modernize `PokemonCard` visual design — gradient background tinted by primary type, circular sprite halo, prominent name, Pokédex number as a pill in the header corner, refined type badge layout
- [X] T034 Update `src/pages/HomePage.tsx` to import and use the new `PokemonCard` component; remove the inline definitions
- [X] T035 Run `npm test`, `npm run lint`, `npm run build` and verify the 151-cap behavior plus new card visuals

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No deps — immediate
- **Foundational (Phase 2)**: Depends on Setup (needs MSW installed)
- **US1 + US2 (Phase 3)**: Depends on Foundational (needs MSW handlers, format utils)
- **US3 (Phase 4)**: Depends on Phase 3 (extends HomePage and uses existing hook)
- **Polish (Phase 5)**: Depends on all prior phases

### Within Phase 3

- T007 (service) must complete before T008 (service tests) — tests import service
- T009 (hook) must complete before T010 (hook tests) — tests import hook
- T009 uses T007 → hook depends on service
- T011/T012/T013 (page) depend on T009 (hook) and T007 (service)

### Parallel Opportunities

- **Phase 2**: T003 + T004 parallel (utils + tests in same file pair); T005 and T006 sequential
- **Phase 3**: T007 can start immediately; T009 can start once T007 is drafted (not strictly before tests); T012 (CSS) parallel with T011 (TSX); T008 + T010 + T013 tests parallel after their implementations exist
- **Phase 5**: T016 + T017 parallel

---

## Implementation Strategy

### MVP (Phases 1–3)

1. Install MSW (Phase 1)
2. Build utilities + MSW handlers (Phase 2)
3. Implement service → hook → page (Phase 3)
4. **STOP and VALIDATE**: User sees Pokémon cards OR clear error/loading state
5. Ship MVP

### Incremental Delivery

1. Setup + Foundational → Test infrastructure ready
2. Phase 3 → Working Pokédex browse with graceful states → Demo (MVP!)
3. Phase 4 → Pagination → Demo
4. Phase 5 → Final validation

---

## Notes

- The service layer is the contract boundary — tests MUST mock HTTP at the network (MSW), not mock the service itself
- Every test file MUST include (at least one) `vitest-axe` assertion for a11y coverage where a DOM renders (page tests; hook tests use `renderHook` so no DOM a11y)
- Commit after each major task group (service, hook, page, pagination) for atomic history
- `Pokemon` type from feature 001 is fully reused — do NOT redefine
- Do NOT add TanStack Query, SWR, or any state library — constitution Principle V and research R3 explicitly defer this
