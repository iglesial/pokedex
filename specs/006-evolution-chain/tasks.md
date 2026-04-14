# Tasks: Evolution Chain on Detail Page

**Input**: Design documents from `/specs/006-evolution-chain/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included — constitution Principle III mandates colocated tests for service, hook, utility, both components, and DetailPage update.

**Organization**: US1 (linear) and US2 (no-evolve empty) share the entire `EvolutionChain` component shell — merged into one phase. US3 (branching) is purely additive layout work plus a fixture.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no deps)
- **[Story]**: [US1], [US2], [US3]
- Exact file paths in every description

---

## Phase 1: Setup (Project Initialization)

**Purpose**: No new deps; verify existing tooling

- [X] T001 Verify React Router DOM v7 (used by `useNavigate` in the chain), MSW, vitest-axe, and existing service patterns are all in place from prior features
- [X] T002 Verify `src/types/`, `src/utils/`, `src/hooks/`, `src/services/`, `src/components/core/`, `src/test/` directories exist (from prior features)

**Checkpoint**: Tooling ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Types, pure utilities, service extension, and MSW fixtures used by every user story

### Types

- [X] T003 Create `src/types/evolutionChain.ts` exporting: `ChainLink` (recursive raw API shape with `species`, `evolves_to`, `is_baby`), `EvolutionChainResponse` (`{ id, chain }`), `PokemonSpeciesResponse` (partial — only `id`, `name`, `evolution_chain.url`), `EvolutionNode` (derived `{ id, name, spriteUrl, inKantoRange }`), `FlattenedChain` (`{ root, branches }`)

### Pure utilities

- [X] T004 [P] Create `src/utils/evolutionChain.ts` per contract [contracts/evolutionChain.ts](contracts/evolutionChain.ts) exporting: `parseSpeciesIdFromUrl(url)` (extracts numeric id from `…/pokemon-species/{id}/`; returns `NaN` on malformed input), `spriteUrlForId(id)` (constructs `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png`), `chainLinkToNode(link)` (projects `ChainLink` → `EvolutionNode` with `inKantoRange = id ≤ MAX_POKEMON`), `flattenEvolutionChain(chain)` (returns `{ root, branches: EvolutionNode[][] }` via depth-first traversal of `evolves_to`)
- [X] T005 [P] Create `src/utils/evolutionChain.test.ts` with cases for: `parseSpeciesIdFromUrl` valid/invalid, `spriteUrlForId(25)` returns the GitHub CDN URL, `chainLinkToNode` flags `inKantoRange=false` for id=152, `flattenEvolutionChain` returns `branches=[]` for single-stage (Mew), `branches=[[ivysaur, venusaur]]` for Bulbasaur linear chain, `branches=[[vaporeon],[jolteon],[flareon]]` for Eevee branching chain, mixed Kanto/non-Kanto chain (Zubat → Golbat → Crobat) preserves all stages with `inKantoRange` correctly set

### Service layer

- [X] T006 Add `fetchEvolutionChainForPokemon(pokemonId, options?)` to `src/services/pokemonService.ts` per contract [contracts/pokemonService.ts](contracts/pokemonService.ts): fetches `${API_BASE}/pokemon-species/${id}` to get `evolution_chain.url`, then fetches that URL to get the `EvolutionChainResponse`; reuses existing `fetchJson` for HTTP; both requests share the same `signal`
- [X] T007 Extend `src/services/pokemonService.test.ts` — test: `fetchEvolutionChainForPokemon(1)` returns a chain (uses MSW fixture), HTTP failures throw readable errors, AbortSignal cancels both requests

### MSW fixture extensions

- [X] T008 Extend `src/test/msw-handlers.ts` — add: `buildSpeciesResponse(id, chainId)` returning a minimal species object with `evolution_chain.url`; `buildEvolutionChainResponse(branches)` accepting a simple list-of-lists representation (e.g. `[[1,2,3]]` for Bulbasaur, `[[133,134],[133,135],[133,136]]` for Eevee — pre-merged at root) and constructing the recursive `ChainLink` tree; default handlers for `GET /pokemon-species/:id` and `GET /evolution-chain/:id`; named handler exports for the no-evolution case (e.g. `singleStageEvolutionHandler`) and the error case (`evolutionChainErrorHandler`)

**Checkpoint**: Types, utils, service, and fixtures ready — fully unit-tested before any UI

---

## Phase 3: US1 + US2 — Linear Chain + No-Evolve Empty State (Priority: P1) MVP

**Goal**: DetailPage shows an Evolution section. Linear chains render as `root → … → leaf`. Single-stage Pokémon show "This Pokémon does not evolve". Loading and error states handled.

**Independent Test**: Visit `/pokemon/4` → see Charmander → Charmeleon → Charizard with arrows; Charmander highlighted. Visit `/pokemon/151` → see "This Pokémon does not evolve". Visit `/pokemon/1` (Bulbasaur) → click Ivysaur → URL changes and Ivysaur is now highlighted.

### Hook

- [X] T009 [US1,US2] Create `src/hooks/useEvolutionChain.ts` per contract [contracts/useEvolutionChain.ts](contracts/useEvolutionChain.ts): state `{ chain, loading, error }`; on `pokemonId` change, fetch via `fetchEvolutionChainForPokemon`, then `flattenEvolutionChain`; AbortController on id change / unmount
- [X] T010 [US1,US2] Create `src/hooks/useEvolutionChain.test.tsx` — wrap renders in `<MemoryRouter>` (for `useNavigate` consumers later); test: linear chain populates `chain` correctly with one branch; single-stage returns `chain` with empty `branches`; HTTP failure sets `error`; id change triggers refetch and aborts prior; unmount aborts in-flight request

### EvolutionMiniCard component

- [X] T011 [P] [US1] Create `src/components/core/EvolutionMiniCard/EvolutionMiniCard.tsx` per contract [contracts/EvolutionMiniCard.ts](contracts/EvolutionMiniCard.ts): renders the node's sprite (with `onError` text fallback), `formatPokedexNumber(node.id)`, `toTitleCase(node.name)`; if `current` prop is true, applies `--current` modifier class, sets `aria-current="page"`, and renders as a non-clickable element; if `node.inKantoRange === false`, applies `--out-of-kanto` modifier with a small "Gen II+" label and is non-clickable; otherwise renders as a `<button>` invoking `onClick`
- [X] T012 [P] [US1] Create `src/components/core/EvolutionMiniCard/EvolutionMiniCard.css` — token-only styling; compact layout (sprite top, text below); `--current` adds 3 px solid `--color-primary` ring + offset; `--out-of-kanto` reduces opacity to 0.5 and adds dashed border; `:focus-visible` outline using `--color-focus-ring`
- [X] T013 [US1] Create `src/components/core/EvolutionMiniCard/EvolutionMiniCard.test.tsx` — test: renders sprite + number + name, clicking calls onClick when interactive, current card is non-clickable with `aria-current="page"`, out-of-Kanto card is non-clickable with "Gen II+" label visible, sprite fallback on image error, axe a11y assertion passes

### EvolutionChain container

- [X] T014 [US1,US2] Create `src/components/core/EvolutionChain/EvolutionChain.tsx` per contract [contracts/EvolutionChainComponent.ts](contracts/EvolutionChainComponent.ts): uses `useEvolutionChain(pokemonId)` and `useNavigate`; renders `<section aria-labelledby="evolution-heading">` with `<h2 id="evolution-heading">Evolution</h2>`; while `loading`, shows `<Spinner size="sm" label="Loading evolutions" />`; on `error`, shows `<Alert severity="error" title="Couldn't load evolutions">`; when `chain.branches.length === 0`, shows the message "This Pokémon does not evolve"; otherwise renders a `<ul>` with the root card on the left and each branch as horizontal stages connected by inline-SVG right-arrow indicators
- [X] T015 [US1,US2] Create `src/components/core/EvolutionChain/EvolutionChain.css` — flex row layout for the chain (default), media query `(max-width: 600px)` flips to flex-column; arrow SVG colored via `currentColor` set to `var(--color-text-light)`; arrow rotates 90° in the column layout via a class toggle
- [X] T016 [US1,US2] Create `src/components/core/EvolutionChain/EvolutionChain.test.tsx` — wrap in `<MemoryRouter>`; test: linear Bulbasaur chain renders 3 mini cards in order with arrows between, single-stage Mew renders "does not evolve" message, error state shows Alert without breaking the section structure, loading state shows Spinner, clicking a non-current card calls navigate to `/pokemon/{id}`, current card is highlighted (has `aria-current="page"`); axe assertion in loaded state

### Barrel + DetailPage integration

- [X] T017 [US1,US2] Export `EvolutionMiniCard` + `EvolutionMiniCardProps` and `EvolutionChain` + `EvolutionChainProps` from `src/components/index.ts`
- [X] T018 [US1,US2] Update `src/pages/DetailPage.tsx` — render `<EvolutionChain pokemonId={pokemon.id} />` immediately after the Moves section (above the Back button area, or wherever fits the layout); the section is independent — failures in evolution don't affect rest of page
- [X] T019 [US1,US2] Update `src/pages/DetailPage.test.tsx` — add a test that the Evolution section renders for Pokémon id 1 (Bulbasaur), and that an evolution-chain HTTP error does NOT prevent identity/stats/abilities/moves from rendering (satisfies SC-007)

**Checkpoint**: MVP functional — linear chains render, no-evolve message works, navigation via clicking mini cards works.

---

## Phase 4: US3 — Branching Evolutions (Priority: P2)

**Goal**: Pokémon with branching evolutions (Eevee) render with the ancestor on the left and each branch displayed as its own row to the right.

**Independent Test**: Visit `/pokemon/133` (Eevee) → see Eevee on the left, with three rightward branches: Vaporeon, Jolteon, Flareon. Eevee is highlighted.

- [X] T020 [US3] Update `src/components/core/EvolutionChain/EvolutionChain.tsx` — when `chain.branches.length > 1`, render the ancestor once in its own column, and group all branches in a sibling column displaying each branch as a flex row stacked vertically; ensure the existing linear case (`branches.length === 1`) continues to render unchanged
- [X] T021 [US3] Update `src/components/core/EvolutionChain/EvolutionChain.css` — branching layout via CSS grid: `grid-template-columns: auto 1fr` for the wrapper; the ancestor cell uses `align-self: center`; the branches column uses `display: flex; flex-direction: column; gap: var(--spacing-sm)`; in the mobile column layout, the ancestor stacks above and branches stack below
- [X] T022 [US3] Extend `src/components/core/EvolutionChain/EvolutionChain.test.tsx` — add tests using the Eevee branching fixture: ancestor (Eevee) renders exactly once, all three branch leaves (Vaporeon, Jolteon, Flareon) are visible, no duplicate ancestor render, current-Pokémon highlight follows the URL when navigating from Eevee → Vaporeon
- [X] T023 [US3] Add a fixture-based test using a mixed Kanto/non-Kanto chain (Zubat → Golbat → Crobat) — assert Crobat (#169) renders as a non-clickable muted card

**Checkpoint**: US3 complete — branching chains render correctly without ancestor duplication; out-of-Kanto stages handled.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T024 [P] Run `npm run lint` and resolve any warnings to zero
- [X] T025 [P] Run `npm run format` for consistent formatting
- [X] T026 Run full `npm test` and confirm all new + existing tests pass (expected ~210 tests total)
- [X] T027 Run `npm run build` and verify production build succeeds; confirm DetailPage chunk grows modestly (< 10 KB increase) since EvolutionChain is rendered there
- [X] T028 Manual browser verification (`npm run dev`): visit `/pokemon/4`, `/pokemon/133`, `/pokemon/41`, `/pokemon/151`, `/pokemon/1`; resize to mobile (≤ 600 px) and confirm vertical stacking; throttle/block `pokemon-species`/`evolution-chain` endpoints to verify error handling
- [X] T029 Run quickstart.md validation — every code snippet matches implementation; manual checklist runs end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No deps — immediate
- **Foundational (Phase 2)**: Depends on Setup; types + utilities + service + MSW fixtures unblock all UI work
- **US1+US2 (Phase 3)**: Depends on Foundational; full hook + 2 components + DetailPage integration
- **US3 (Phase 4)**: Depends on Phase 3 (extends `EvolutionChain.tsx` and `.css`)
- **Polish (Phase 5)**: Depends on all prior phases

### Within Phase 2

- T003 (types) blocks T004, T006, T008
- T004+T005 parallel (utility + tests) once T003 is done
- T006+T007 parallel with utility work (different files)
- T008 can be developed in parallel with T004 (different files, different concerns)

### Within Phase 3

- T009 (hook) depends on T006 + T004 (uses both)
- T011+T012+T013 (mini card) parallel with hook work — independent files
- T014+T015+T016 (chain container) depend on T009 + T011 + T012
- T017 (barrel) depends on T011 + T014
- T018 (DetailPage integration) depends on T017
- T019 (DetailPage tests) depends on T018

### Parallel Opportunities

- **Phase 2**: T004+T005 parallel with T006+T007 parallel with T008
- **Phase 3**: T011+T012 parallel; mini-card trio (T011–T013) parallel with hook (T009–T010); container trio (T014–T016) sequential after both
- **Phase 5**: T024 + T025 parallel

---

## Implementation Strategy

### MVP (Phases 1–3)

1. Foundational types + utils + service + MSW fixtures
2. Hook + EvolutionMiniCard + EvolutionChain + DetailPage wiring
3. **STOP and VALIDATE**: linear chains + no-evolve empty state both work end-to-end
4. Ship MVP

### Incremental Delivery

1. Foundational → unit-testable utilities ready
2. Phase 3 → linear + empty states live → Demo (MVP!)
3. Phase 4 → branching support → Demo
4. Phase 5 → final validation

---

## Notes

- `Pokemon` and `MAX_POKEMON` are reused — do NOT redefine
- The pure flattening utility is the heart of the feature — invest in
  thorough unit tests; UI work becomes trivial once the data shape is right
- Sprite URLs are constructed from id (no per-card detail fetch); this
  trades a tiny risk of stale/missing sprites for huge simplicity wins
- Do NOT add a tree-rendering library — the manual `{root, branches}`
  shape + flexbox is sufficient for the full Kanto chain space
- Out-of-Kanto cards are intentionally non-clickable to preserve the
  feature 001 contract; clicking a Crobat (#169) link would land on
  the existing 404 view
- Commit after each major task group (types+utils, service, hook,
  mini card, chain container, DetailPage wiring) for atomic history
