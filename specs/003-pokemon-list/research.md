# Research: Pokémon List Page

**Feature**: 003-pokemon-list
**Date**: 2026-04-12

## R1: PokéAPI List Endpoint Strategy

**Decision**: Fetch the list from `/api/v2/pokemon?limit=N&offset=M`,
then fetch each entry's full details from `/api/v2/pokemon/{id}` in
parallel via `Promise.all`. Use the already-typed `Pokemon`
interface (feature 001) for detail responses.

**Rationale**: The list endpoint returns only `{ name, url }` per
entry — insufficient for cards (no types, no sprite). The detail
endpoint returns the full `Pokemon` shape including types and
sprites. 20 parallel requests complete in under 1 second on typical
connections and reuse HTTP/2 multiplexing.

**Alternatives considered**:
- **Construct sprite URLs from ID only** (no detail fetch): Works
  for sprites but not types — would still need detail for type
  badges. Partial solution.
- **GraphQL (`beta.pokeapi.co/graphql/v1beta`)**: Single request,
  but adds a dependency on a beta endpoint and a GraphQL client.
  Violates Principle V (Simplicity).
- **Batch via `/pokemon-species`**: Returns species metadata but
  not Pokémon sprites/types directly; would still need detail.

## R2: Test Mocking — MSW

**Decision**: Use Mock Service Worker (`msw`) v2 to intercept
`fetch` calls in tests for deterministic, network-free assertions.

**Rationale**: MSW is the de-facto standard for React test mocking.
It intercepts at the network layer, so both `fetch` and any future
HTTP client behave identically. The hook and service can be tested
against realistic response shapes without coupling tests to a
mock `fetch` spy.

**Alternatives considered**:
- **`vi.fn()` on global fetch**: Works but couples tests to
  implementation details; harder to simulate realistic HTTP behavior
  (headers, status codes).
- **`nock`**: Node-oriented; less ergonomic for jsdom environment.

## R3: State Management — Custom Hook, No Library

**Decision**: Implement a `useListPokemon({ pageSize })` hook
exposing `{ pokemon, loading, error, hasMore, loadMore }`. Internal
state managed with `useState` + `useEffect`. No Redux, Zustand,
TanStack Query, or SWR.

**Rationale**: Constitution Principle V mandates simplicity. A
single-page feature with local state does not justify a state
library. No cross-component sharing or cache invalidation logic is
required.

**Alternatives considered**:
- **TanStack Query**: Excellent for caching/retry, but premature for
  this scope; adds a dependency and a mental model. Can be adopted
  later when multiple features need shared caching.
- **SWR**: Similar tradeoff to TanStack Query.
- **Redux Toolkit**: Massive over-engineering for one page.

## R4: Sprite Fallback

**Decision**: Each card renders the sprite using `<img>` with an
`onError` handler that swaps to a text-only placeholder (the
Pokémon's Pokédex number in a large, centered span). The `alt`
attribute is always populated with `"{name} sprite"`.

**Rationale**: Matches FR-008 (alt text) and FR-009 (placeholder on
failure) cleanly without pulling in an image-loading library.
Keeps layout stable since the placeholder occupies the same
dimensions as the image.

**Alternatives considered**:
- **Inline SVG fallback**: Adds an SVG asset for a rare edge case.
- **Second image attempt (official-artwork → default sprite)**:
  Partially useful but adds complexity; the single `front_default`
  sprite is nearly always present.

## R5: Load-More vs. Infinite Scroll

**Decision**: Explicit "Load more" button per FR-011. No infinite
scroll.

**Rationale**: Button control is explicitly accessible, keyboard-
focusable, and avoids the a11y pitfalls of scroll-triggered
loading (screen reader confusion, focus management, keyboard-only
users). FR-012 and FR-013 map directly to button enabled/disabled
states.

**Alternatives considered**:
- **Infinite scroll with IntersectionObserver**: Trendy but harder
  to test, harder to make accessible. YAGNI.

## R6: Responsive Grid

**Decision**: CSS Grid with `repeat(auto-fill, minmax(220px, 1fr))`
and a gap from `var(--spacing-md)`.

**Rationale**: Native CSS; no JS media-query logic. Grid
auto-adjusts column count from 1 (mobile) to 5+ (desktop) without
explicit breakpoints.

**Alternatives considered**:
- **Flexbox with breakpoints**: More CSS, less elegant for cards.

## R7: Empty State Messaging

**Decision**: When the API returns an empty list, render an
`Alert severity="info"` with "No Pokémon found. Check back later!"
in place of the grid.

**Rationale**: Reuses the existing Alert component (feature 002).
Info severity (not error) since this is a valid but unexpected
empty response.

**Alternatives considered**:
- **Dedicated EmptyState component**: Over-engineered for one use;
  Alert covers the case cleanly.

## R8: Title Casing Utility

**Decision**: Implement `toTitleCase(str)` and `formatPokedexNumber(id)`
helpers in `src/utils/formatPokemon.ts`.

**Rationale**: Pure functions, easy to unit test, reusable by future
features (detail page, search results). Keeps formatting concerns
out of the card component.

**Alternatives considered**:
- **Inline JSX expressions**: Repetitive across cards.
- **Third-party library (`lodash.startcase`)**: External dependency
  for two tiny helpers. YAGNI.

## R9: Error Recovery

**Decision**: On error, display an Alert with a human-readable
message. The user can retry by refreshing the page (FR-006, edge
case from spec). No inline "Retry" button in this iteration — can
be added later if user research demands it.

**Rationale**: Matches spec's Independent Test for US2 which
explicitly mentions page refresh as the retry mechanism. Keeps
initial scope tight.

**Alternatives considered**:
- **Inline Retry button**: Easy to add but out of MVP scope.
- **Automatic exponential backoff**: Opaque UX; not requested.
