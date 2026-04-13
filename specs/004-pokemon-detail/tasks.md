# Tasks: Pokémon Detail Page

**Input**: Design documents from `/specs/004-pokemon-detail/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included — constitution Principle III mandates colocated tests. Tests cover service, hooks, StatRadar, and DetailPage.

**Organization**: Tasks grouped by user story. US1 (identity) and US2 (stats) both P1 — they share the DetailPage shell so tasks are interleaved. US3 (abilities/moves) is P2 additive. US4 (Back + URL pagination) is P1 but depends on the DetailPage existing and modifies the list.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no deps)
- **[Story]**: [US1], [US2], [US3], [US4]
- Exact file paths in every description

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Verify dependencies are in place — no new deps needed

- [X] T001 Verify React Router DOM is installed (from feature 001); confirm `useParams` and `useSearchParams` are importable
- [X] T002 Verify `src/pages/`, `src/hooks/`, `src/services/`, `src/components/core/`, `src/utils/` directories exist (all from prior features)

**Checkpoint**: All dependencies and directories ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared utilities and service extensions used by all user stories

- [X] T003 [P] Add `formatHeight(decimetres: number): string` → `"0.4 m"` and `formatWeight(hectograms: number): string` → `"6.0 kg"` to `src/utils/formatPokemon.ts` per research R7; one decimal place
- [X] T004 [P] Extend `src/utils/formatPokemon.test.ts` with test cases for `formatHeight` (e.g. 4 → "0.4 m", 100 → "10.0 m") and `formatWeight` (e.g. 60 → "6.0 kg", 10000 → "1000.0 kg")
- [X] T005 Add `PokemonNotFoundError` class and `fetchPokemon(id, options?)` function to `src/services/pokemonService.ts` per contract [contracts/pokemonService.ts](contracts/pokemonService.ts); validate id is integer in [1, MAX_POKEMON] before calling API, throw `PokemonNotFoundError` for invalid/out-of-range ids, reuse existing `fetchJson` for HTTP
- [X] T006 Extend `src/services/pokemonService.test.ts` — test `fetchPokemon(1)` returns a Pokémon, `fetchPokemon('abc')` throws `PokemonNotFoundError`, `fetchPokemon(200)` throws `PokemonNotFoundError`, `fetchPokemon(1, { signal: abortedSignal })` rejects, HTTP 500 throws readable Error

**Checkpoint**: Service layer and utilities ready for hook/page work

---

## Phase 3: User Story 1 + 2 — Core Identity + Stats (Priority: P1) MVP

**Goal**: DetailPage renders at `/pokemon/:id` showing sprite, name, number, types, height, weight, and the hexagonal stat radar.

**Independent Test**: Navigate to `/pokemon/25` (or click Pikachu on the list); see large sprite, "Pikachu", "#025", Electric type badge, height "0.4 m", weight "6.0 kg", and a hexagonal radar chart with 6 labeled axes filled with electric-yellow.

### Hook Layer

- [X] T007 [P] [US1] Implement `src/hooks/useGetPokemon.ts` per contract [contracts/useGetPokemon.ts](contracts/useGetPokemon.ts): state `{ pokemon, loading, error, notFound }`; `useEffect` on `id` change calls `fetchPokemon`; catch `PokemonNotFoundError` → set `notFound=true`; AbortController on id change / unmount
- [X] T008 [US1] Create `src/hooks/useGetPokemon.test.ts` — test successful fetch populates `pokemon`, out-of-range id sets `notFound=true` without fetching, fetch error sets `error` message, id change aborts prior request, unmount aborts in-flight request; uses MSW + `renderHook`

### StatRadar Core Component

- [X] T009 [P] [US2] Implement `src/components/core/StatRadar/StatRadar.tsx` per contract [contracts/StatRadar.ts](contracts/StatRadar.ts): SVG `<svg viewBox="-120 -120 240 240">` with 6 vertex polygon; compute vertex `(r·cos(θ), r·sin(θ))` for θ = -π/2 + k·π/3 at r = (value/max)·100; draw grid polygons at 20/40/60/80/100% radius; draw axis lines; render `<text>` labels with stat name + value outside each vertex; wrap in `<figure>` with SR-only `<figcaption>` per research R4
- [X] T010 [P] [US2] Implement `src/components/core/StatRadar/StatRadar.css` — `.stat-radar__grid` stroke via `--color-text-light` at low opacity, `.stat-radar__shape` fill via `fillColor` prop (inline style), stroke via same color at 100%, `.stat-radar__label` uses token typography, SR-only class for figcaption
- [X] T011 [US2] Create `src/components/core/StatRadar/StatRadar.test.tsx` — test renders SVG with `role="img"`, renders 6 axis labels with correct stat names and values, polygon points reflect scaled magnitudes (e.g., all-100 stats produce a regular hexagon), SR-only caption includes all 6 stat values, axe assertion passes
- [X] T012 [US2] Export `StatRadar` and `StatRadarProps` from `src/components/index.ts`

### Page Layer

- [X] T013 [US1,US2] Create `src/pages/DetailPage.tsx` — use `useParams<{ id: string }>()`, call `useGetPokemon(id)`; render `<main>` with `<h1>` containing the Pokémon name; show Spinner while `loading && !pokemon`; show error Alert when `error`; show "Not Found" view when `notFound` (matches US1 acceptance 3 fallback); when loaded, render large sprite with onError fallback (reuse pattern from PokemonCard), number pill, type badges (reuse type-color styling from 003), height/weight as labeled metrics, and `<StatRadar>` filled with primary type color
- [X] T014 [US1,US2] Create `src/pages/DetailPage.css` — responsive two-column layout on desktop (sprite+meta on left, stats radar on right), single column on mobile; uses design tokens only
- [X] T015 [US1,US2] Create `src/pages/DetailPage.test.tsx` — renders heading with name, renders number, renders type badges, renders height/weight, renders StatRadar component, shows Spinner initially, shows error Alert on fetch fail, shows Not Found view when id invalid, sprite fallback on image error, axe assertion on loaded state; uses MSW

### Routing & Linking

- [X] T016 [US1] Update `src/config/routes.tsx` — add `{ path: '/pokemon/:id', element: <DetailPage /> }` route (before the dev-only preview guard block so production includes it); lazy-load via `lazy: () => import('../pages/DetailPage').then((m) => ({ Component: m.DetailPage }))` for code-splitting
- [X] T017 [US1] Update `src/components/core/PokemonCard/PokemonCard.tsx` — wrap the card in a React Router `<Link to={`/pokemon/${pokemon.id}`}>` with `className="pokemon-card__link"` and `aria-label={`View ${toTitleCase(pokemon.name)} details`}`; remove default underline/color inheritance from the link in CSS
- [X] T018 [US1] Update `src/components/core/PokemonCard/PokemonCard.css` — style `.pokemon-card__link` to inherit color, remove underline, make the whole card focusable with visible `:focus-visible` outline around the card using `--color-focus-ring`
- [X] T019 [US1] Update `src/components/core/PokemonCard/PokemonCard.test.tsx` — wrap renders in `<MemoryRouter>`, assert the card is a link with correct `to` (`/pokemon/25`) and accessible name (`View Pikachu details`)

**Checkpoint**: MVP functional — clicking a card navigates to detail page with identity + radar stats.

---

## Phase 4: User Story 3 — Abilities & Moves (Priority: P2)

**Goal**: Detail page adds abilities section (with hidden badge) and scrollable move-chip grid.

**Independent Test**: Open a detail page; see an abilities list with at least one badge; hidden abilities marked with a "Hidden:" prefix or visually distinct variant. Scroll through the moves section; see move names as chips.

- [X] T020 [P] [US3] Update `src/pages/DetailPage.tsx` — add `<section aria-labelledby="abilities-heading">` rendering each ability as a Badge; non-hidden → `variant="neutral"`, hidden → `variant="secondary"` with "Hidden: " prefix per research R9; empty-state "No abilities listed" when `pokemon.abilities.length === 0`
- [X] T021 [US3] Update `src/pages/DetailPage.tsx` — add `<section aria-labelledby="moves-heading">` with a scrollable container containing a CSS-grid of move chips per research R8; each chip displays `toTitleCase(move.move.name.replace('-', ' '))`; empty-state "No moves listed" when empty
- [X] T022 [US3] Update `src/pages/DetailPage.css` — `.detail-page__moves-container { max-height: 20rem; overflow-y: auto; }`; `.detail-page__move-chip` styled with `--radius-full`, neutral token background tinted by primary type at ~10% opacity (via `color-mix`), `var(--font-size-sm)` text
- [X] T023 [US3] Extend `src/pages/DetailPage.test.tsx` — abilities section renders all ability names, hidden ability shows "Hidden:" prefix, moves section renders all move chips, empty-state messages render when arrays are empty, scroll container exists (check for overflow style or role)

**Checkpoint**: US3 complete — full combat profile visible.

---

## Phase 5: User Story 4 — Back Button + URL Pagination (Priority: P1)

**Goal**: Back button returns user to the list at the page they were on. `useListPokemon` reads/writes `?page=` in the URL.

**Independent Test**: Open `/?page=3` → click Pokémon on page 3 → detail page loads → click Back → lands at `/?page=3`. Directly open `/pokemon/25` → click Back → lands at `/?page=1`.

### URL-based pagination for the list

- [X] T024 [US4] Update `src/hooks/useListPokemon.ts` — read initial page from `useSearchParams()` (default 1); when `setPage(n)` is called, call `setSearchParams({ page: n.toString() })` to reflect in URL; when URL `?page=` changes externally (e.g., back nav), the hook's `page` state must reconcile
- [X] T025 [US4] Update `src/hooks/useListPokemon.test.ts` — wrap renders in `<MemoryRouter initialEntries={['/?page=3']}>`; test hook reads initial page from URL, `setPage(2)` updates URL to `/?page=2`, back/forward in history updates the hook's page

### Detail page Back button

- [X] T026 [US4] Update `src/pages/DetailPage.tsx` — add a `<Button variant="ghost" onClick={handleBack}>← Back</Button>` near the top of the page; `handleBack` calls `navigate(-1)` when `window.history.state?.idx > 0` (SPA back available), else `navigate('/?page=1')` per research R6
- [X] T027 [US4] Extend `src/pages/DetailPage.test.tsx` — Back button exists and is keyboard-focusable, clicking Back calls navigate(-1) in normal flow, Back falls back to `/?page=1` when no prior history; use `<MemoryRouter>` with known initial entries

### NotFound view

- [X] T028 [US4] Ensure the Not Found view inside DetailPage includes a `<Link to="/?page=1">Back to list</Link>` satisfying FR-015 and US4 fallback

**Checkpoint**: Full list↔detail↔list loop works with URL persistence.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T029 [P] Run `npm run lint` and resolve any warnings to zero
- [X] T030 [P] Run `npm run format` for consistent formatting
- [X] T031 Run full `npm test` and confirm all new + existing tests pass (expected ~120 tests total)
- [X] T032 Run `npm run build` and confirm production build succeeds; verify `/pokemon/:id` route is included (not dev-only); verify `/preview` still excluded
- [X] T033 Manual browser verification (`npm run dev`): follow the quickstart validation checklist — click through list → detail → back; test deep link to `/pokemon/1`, `/pokemon/151`, `/pokemon/500` (not found), `/pokemon/abc` (not found); verify radar shape changes across Pokémon; verify move grid scrolls for high-move-count Pokémon (e.g. Mew)
- [X] T034 Run quickstart.md validation end-to-end — every code snippet matches implementation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No deps — immediate
- **Foundational (Phase 2)**: Depends on Setup; utilities + service extension are prereqs
- **US1+US2 (Phase 3)**: Depends on Foundational; DetailPage + hook + StatRadar
- **US3 (Phase 4)**: Depends on Phase 3 (DetailPage must exist to extend it)
- **US4 (Phase 5)**: Depends on Phase 3 (DetailPage must exist); also modifies `useListPokemon` from feature 003
- **Polish (Phase 6)**: Depends on all prior phases

### Within Phase 3

- T007 (hook) can start immediately after service is done
- T009–T012 (StatRadar) parallel to hook work (different files)
- T013–T015 (DetailPage) depend on hook (T007) and StatRadar (T009–T012)
- T016 (routes) depends on DetailPage existing
- T017–T019 (Card linking) depend on T016 (route must exist to link to)

### Parallel Opportunities

- **Phase 2**: T003 + T004 parallel; T005 blocks T006
- **Phase 3**: T007 parallel with T009+T010; T011 parallel with T015 (different test files) after components exist
- **Phase 4**: T020 + T021 both modify DetailPage — sequential
- **Phase 5**: T024+T025 (hook) parallel with T026+T027 (page)
- **Phase 6**: T029 + T030 parallel

---

## Implementation Strategy

### MVP (Phases 1–3)

1. Install/verify deps + utilities
2. Implement service+hook+StatRadar+DetailPage+routing+card-linking
3. **STOP and VALIDATE**: Click a card → see identity + stats radar
4. Ship MVP (US1 + US2 delivered)

### Incremental Delivery

1. Foundational → Service + utilities
2. Phase 3 → Identity + stats + navigation from list → Demo
3. Phase 4 → Abilities + moves → Demo
4. Phase 5 → Back button + URL pagination → Demo
5. Phase 6 → Final validation

---

## Notes

- Existing `Pokemon` type from feature 001 is fully reused — do NOT redefine
- Do NOT add a charting library — native SVG per research R3
- Back button uses `navigate(-1)` with a deep-link fallback — not a custom history stack
- PokemonCard wrapped in a Link must preserve its current visual design; a11y focus outline is NEW
- Commit after each major task group (utilities, hook, StatRadar, DetailPage, Card linking, pagination) for atomic history
- The move `.name` from PokéAPI uses hyphens (e.g., `thunder-shock`); normalize for display with `replace('-', ' ')` before `toTitleCase`
