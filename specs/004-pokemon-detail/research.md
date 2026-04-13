# Research: Pokémon Detail Page

**Feature**: 004-pokemon-detail
**Date**: 2026-04-12

## R1: Routing — React Router Parameterized Route

**Decision**: Add a new `/pokemon/:id` route in
`src/config/routes.tsx` using React Router's route param syntax.
Use `useParams()` in DetailPage to read `id`.

**Rationale**: React Router is already in the project (from
feature 001). Parameterized routes natively support deep linking,
back/forward navigation, and URL-based state — matching FR-012
(deep-link loads) and the clarification that pagination state lives
in URL query.

**Alternatives considered**:
- Hash-based routing: Unnecessary; HTML5 history API is fine.
- Query-based detail (`/?pokemon=25`): Less RESTful and semantic.

## R2: URL-Based List Pagination

**Decision**: Extend `useListPokemon` to read the initial page from
`?page=` in the URL via React Router's `useSearchParams()`, and
call `setSearchParams({ page: n })` when `setPage` is invoked.

**Rationale**: Satisfies FR-011a from the clarification session.
Makes list state bookmarkable, shareable, and survives refresh.
Back navigation from detail naturally lands at the right page via
browser history.

**Alternatives considered**:
- sessionStorage: Works but requires manual serialization and
  doesn't survive cross-tab navigation; URLs already serve this.
- In-memory only: Fails the "preserved on refresh" use case.

## R3: Radar Chart — Native SVG, No Library

**Decision**: Implement `StatRadar` as a native SVG component.
Compute 6 vertices on a regular hexagon (polar coords) scaled by
`value / max`, join them as a `<polygon>`, fill with
`var(--color-type-*)` at ~40% opacity, stroke at 100%. Overlay
grid polygons (at 20/40/60/80/100% radius) and axis lines for
reference. Label each axis with stat name + value via SVG `<text>`.

**Rationale**: A charting library (chart.js, recharts, d3) is
massive overhead for one chart of 6 static points. Native SVG is
~100 LOC, trivially themeable via CSS custom properties, perfectly
testable, and zero runtime cost. Aligns with Principle V (YAGNI).

**Alternatives considered**:
- **recharts / victory / nivo**: 100+ KB for one small chart.
  Hard veto on Principle V.
- **D3**: Excessive for a static polygon; pulls imperative DOM
  patterns into a declarative React codebase.
- **CSS-only hexagon**: Fragile positioning; harder a11y; harder
  to scale.

## R4: Radar Chart Accessibility

**Decision**: Wrap the SVG in a `<figure>` with a
`<figcaption class="sr-only">` that lists each stat and its
numeric value as a sentence (e.g., "HP 45, Attack 49, Defense 49,
Special Attack 65, Special Defense 65, Speed 45"). The SVG gets
`role="img"` and `aria-labelledby` pointing at the caption's id.

**Rationale**: FR-017 requires WCAG 2.1 AA; SC 1.1.1 (non-text
content) requires an accessible text equivalent. Visual stat values
are already rendered as labels on axes, but a consolidated caption
ensures screen readers receive a single comprehensible summary.

**Alternatives considered**:
- `aria-label` only: Less discoverable; can't list all 6 stats.
- Hidden `<table>` with stats: Redundant with axis labels.

## R5: Fetching a Single Pokémon

**Decision**: Add `fetchPokemon(id, signal)` to
`src/services/pokemonService.ts`. It validates `id` is within
[1, MAX_POKEMON] before making the request; out-of-range throws a
`PokemonNotFoundError` subclass. Network/HTTP failures throw
`Error` with human-readable messages (existing pattern).

**Rationale**: The existing `fetchPokemonPage` already fetches
full Pokémon detail per page entry — we just need a single-entry
variant. Validation at the service boundary keeps the 404 logic in
one place (FR-015).

**Alternatives considered**:
- Reuse `fetchJson<Pokemon>` directly in the hook: Couples hook to
  URL construction; duplicates validation.
- Treat out-of-range as an HTTP 404 from the API: PokéAPI returns
  valid data for 152+; we must enforce the Gen I cap client-side.

## R6: Back Button Behavior

**Decision**: The Back button is a React Router `<Button>` that
calls `navigate(-1)` if `history.state.key` is truthy (indicating
there's a prior entry in the SPA history), else falls back to
`navigate('/?page=1')` (deep-link case per FR-011).

**Rationale**: `navigate(-1)` preserves scroll position and URL
query naturally. The fallback handles the case where the user
arrived via a pasted URL.

**Alternatives considered**:
- Always `navigate('/')`: Loses scroll position and page number.
- Use `window.history.back()`: Same effect; React Router's
  `navigate(-1)` is idiomatic.

## R7: Unit Conversion Helpers

**Decision**: Add `formatHeight(decimetres)` → `"0.4 m"` and
`formatWeight(hectograms)` → `"6.0 kg"` to
`src/utils/formatPokemon.ts`.

**Rationale**: PokéAPI returns height in decimetres (÷10 for m) and
weight in hectograms (÷10 for kg). Centralizing the conversion
avoids scattering `×0.1` literals and gives a single place to
adjust formatting.

**Alternatives considered**:
- Inline in DetailPage: Doesn't compose; harder to test.
- Accept both metric/imperial: Out of scope.

## R8: Move Chip Grid

**Decision**: Render moves as a CSS-grid of small chip elements
inside a `max-height: 20rem; overflow-y: auto` scrollable
container. Each chip is a rounded pill showing the move name in
title case; chips use a neutral background tinted by the Pokémon's
primary type color at ~10% opacity.

**Rationale**: Matches clarification (B). Height-limited scroll
keeps page layout stable. Uniform chip design avoids per-move
metadata (deferred).

**Alternatives considered**:
- Virtualized list (`react-window`): Unnecessary at ~90 items.
- Infinite scroll: Over-engineered for bounded move counts.

## R9: Hidden Ability Visual Distinction

**Decision**: Render each ability as a Badge. Non-hidden abilities
use `variant="neutral"`; hidden abilities use `variant="secondary"`
plus a leading "Hidden:" label inside the badge.

**Rationale**: Reuses existing Badge variants (no new CSS). The
label is explicit and screen-reader friendly (no reliance on
color alone).

**Alternatives considered**:
- Color-only distinction: Violates WCAG 1.4.1 (color not the only
  means of conveying information).
- Separate "Hidden" section: Splits a small list unnecessarily.

## R10: 404 / Out-of-Range Handling

**Decision**: In `useGetPokemon`, catch `PokemonNotFoundError` and
set a distinct `notFound: true` flag (separate from `error`). The
DetailPage branches on this flag to render a dedicated "Not Found"
view with a link back to the list, rather than a generic error.

**Rationale**: A 404 is a user-state, not a fault. Distinguishing
it from network errors lets us show actionable copy (FR-015)
instead of a generic "something went wrong" message.

**Alternatives considered**:
- Conflate with general `error`: Confusing UX ("connection error"
  shown for a user-typed invalid ID).
