# Research: Search and Type Filter

**Feature**: 005-search-type-filter
**Date**: 2026-04-13

## R1: Prefetch All 151 on List Load

**Decision**: Add `fetchAllPokemon()` to `pokemonService` that
fetches the first page with `pageSize = MAX_POKEMON` (151). The
list hook calls this once on mount and caches the result in
component state for the lifetime of the page.

**Rationale**: Per Clarifications Q1. At 151 entries with
parallel detail requests, the full fetch completes in ~2 s on
broadband. After that, every filter and page change is an O(151)
array operation — effectively instantaneous — which gives the
feature a first-class feel and satisfies FR-013.

**Alternatives considered**:
- **Filter only the currently loaded page**: Broken by design —
  searching for "Mew" while on page 1 would show nothing.
- **Switch to full-fetch only when filters are active**: Creates a
  jarring delay the first time any filter is used, AND complicates
  state reconciliation between paginated and full modes.
- **Static compile-time index**: Requires build-time data fetching
  or bundled JSON. Not justified for 151 entries.

## R2: Debounced Search Input — Custom Hook

**Decision**: Create a small `useDebouncedValue(value, 200)` hook
in `src/hooks/` that returns the input value delayed by 200 ms.
The `SearchInput` component exposes an immediate input value for
the UI (controlled) and a debounced value for the consumer (URL
sync).

**Rationale**: Per Clarifications Q2. Isolating the debounce in a
custom hook keeps `SearchInput` presentational and makes the
debounce unit-testable with fake timers.

**Alternatives considered**:
- **Inline `setTimeout` in SearchInput**: Works but couples timing
  to the component; harder to test and reuse.
- **`lodash.debounce`**: Adds a dependency for a 15-line primitive.
  Violates Principle V.
- **Use `useDeferredValue`**: React-native deferral is not
  debouncing — it cannot guarantee the 200 ms window FR-013
  specifies.

## R3: URL-Driven Filter State

**Decision**: Extend the existing `useSearchParams()` approach from
feature 004. The list hook reads `q`, `types`, and `page` from the
URL. A new `useFilteredPokemon` hook composes the full list with
these params to produce `{ pageEntries, totalFiltered, pageCount, ... }`.

**Rationale**: Feature 004 already established URL-driven
pagination. Extending the same pattern to filters keeps state
management consistent — no new mental model — and satisfies FR-009
(deep-link restore) and SC-004 (bookmarkable filtered URLs).

**Alternatives considered**:
- **Local component state**: Loses bookmarkability and breaks the
  back-navigation behavior established by 004.
- **React Context**: Unnecessary indirection for a single consumer.

## R4: Type Chip Component — 18 Colored Toggles

**Decision**: Create a `TypeFilterChips` core component that
renders all 18 type buttons horizontally with flex-wrap. Each chip
is a `<button>` with `aria-pressed` reflecting its selected state.
Colors come from existing `--color-type-*` tokens via the already-
published `getTypeColorVar` utility. Selected chips get a strong
border and full opacity; unselected chips get reduced opacity.

**Rationale**: Using `<button>` with `aria-pressed` is the standard
toggle-button pattern, keyboard-accessible by default. Flex-wrap
keeps the row responsive without JS. Reusing existing tokens
guarantees consistent visual language with list cards.

**Alternatives considered**:
- **Multi-select combobox**: Heavier UI, less scannable for only
  18 options.
- **Checkbox list**: Works but less visually engaging than colored
  chips and doesn't match the rest of the app's chip/badge pattern.
- **Existing Badge component**: Badge is non-interactive. Wrapping
  in a `<button>` is required for keyboard + ARIA correctness.

## R5: Filter Predicate — Pure Helpers

**Decision**: Implement two pure helpers in
`src/utils/filterPokemon.ts`:
- `matchesQuery(pokemon, query)` — case-insensitive substring
  match on the trimmed query.
- `matchesAllTypes(pokemon, types)` — returns true only if every
  type in `types` is present in the pokemon's types array (AND
  semantics per FR-005).

A `filterPokemon(list, { query, types })` function composes them.

**Rationale**: Pure functions are trivially testable without React
or DOM. Keeping the predicate outside the hook means we can unit-
test edge cases (empty query, invalid types, special characters)
without re-rendering anything.

**Alternatives considered**:
- **Inline filtering in the hook**: Mixes concerns; harder to test.
- **`Array.prototype.filter` chains in JSX**: Re-runs on every
  render, harder to memoize.

## R6: Invalid Type Handling

**Decision**: Define a `KNOWN_TYPES` set (the 18 official types).
When parsing `?types=fire,chaos,water`, the URL reader filters out
anything not in the set — silently per FR-010.

**Rationale**: Silent filter is friendlier than erroring on a
pasted/edited URL. The `?types=chaos` case from an abandoned URL
or typo degrades gracefully to "no type filter".

**Alternatives considered**:
- **Reject and show 404**: Too harsh for a URL param typo.
- **Preserve the invalid value**: Pollutes downstream matching
  logic; chip row would have nothing to highlight.

## R7: Pagination Reconciliation on Filter Change

**Decision**: In the list hook, whenever filters change and the
current `page` parameter exceeds the new `totalFiltered / pageSize`,
the page is automatically reset to 1 (satisfying US3 acceptance 3).
This is detected in a `useEffect` that watches `totalFiltered` and
`page` simultaneously.

**Rationale**: Keeps the UI coherent — a user on page 5 of a 7-page
list who types a query yielding 5 results would otherwise see page
5 of 1 (blank). Automatic reset satisfies the acceptance scenario
without requiring an explicit reset button.

**Alternatives considered**:
- **Clamp silently to the last valid page**: User would land on an
  unexpected page; less predictable than page 1.
- **Throw an "invalid page" error**: Over-engineered.

## R8: Result-Count Live Region

**Decision**: Add an ARIA live region directly in `HomePage.tsx`:

```tsx
<div role="status" aria-live="polite" className="sr-only">
  {resultCount} Pokémon found
</div>
```

The text updates whenever the filtered set changes; screen readers
announce the new count politely (queued, not interrupting).

**Rationale**: Per Clarifications Q3. Polite live regions are the
standard WCAG pattern for non-urgent dynamic content. Visible
result count intentionally omitted to avoid cluttering the UI; only
the a11y announcement is required.

**Alternatives considered**:
- **`aria-live="assertive"`**: Would interrupt the user's current
  speech — disruptive for a benign count change.
- **Visible count text**: User explicitly chose option A (live
  region only).

## R9: Clear-All Filters UX

**Decision**: Render a ghost-variant `<Button>` with label "Clear
filters" to the right of the type chips row, visible only when at
least one filter (search, types, or non-1 page) is active.

**Rationale**: Reusing the existing Button component keeps the
bundle small. Conditional visibility satisfies FR-011's "visible or
enabled only when active" requirement. Clicking calls
`setSearchParams({})`.

**Alternatives considered**:
- **Always-visible but disabled**: More accessible for sighted
  users who want to know the button exists, but clutters the
  toolbar.
- **Link-style text**: Less obviously interactive; button is clearer.

## R10: Prefetch Loading UX

**Decision**: During the initial prefetch, the existing Spinner
continues to serve as the loading indicator (same pattern as
feature 003). No separate "prefetching all Pokémon" message — the
user-visible behavior is identical to the current list page on
first load.

**Rationale**: Minimizes UX churn. Users don't need to understand
that the app is loading a full set vs. a page — they just see the
usual spinner and then the grid.

**Alternatives considered**:
- **Progress indicator (e.g., "42/151 loaded")**: Over-engineered
  and requires streaming the parallel fetches. The all-or-nothing
  Promise.all pattern is simpler.
