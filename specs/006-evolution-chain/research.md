# Research: Evolution Chain on Detail Page

**Feature**: 006-evolution-chain
**Date**: 2026-04-14

## R1: PokéAPI Evolution Chain Lookup Path

**Decision**: Fetch `/pokemon-species/{id}` to get the species URL,
then follow `species.evolution_chain.url` to get the chain itself.
This is PokéAPI's documented indirection: the `pokemon` endpoint
does NOT include the evolution chain directly.

**Rationale**: A Pokémon's species entity is the authoritative link
to its chain. Two sequential requests keep the code simple and the
network cost bounded (~2 small requests per detail page).

**Alternatives considered**:
- **Single request to `/pokemon/{id}` and scraping from its sub-
  resources**: Doesn't exist; the endpoint doesn't expose the
  chain. Non-starter.
- **Prefetch ALL 151 evolution chains**: ~70 unique chains for
  Kanto; would add multiple seconds to the already-running 005
  prefetch. Deferred; per-detail-page lazy fetching is fine.

## R2: Chain Shape — Tree → Branches (List of Paths)

**Decision**: Flatten the raw `ChainLink` tree into a list of
branches (paths from root to leaf). A linear chain yields one
branch; Eevee yields N branches where N = number of Eevee's
evolution children. The root ancestor is deduplicated visually via
the render (rendered once on the left; branches diverge from it).

**Rationale**: The raw API shape is a recursive
`{ species, evolves_to: ChainLink[] }` tree. Rendering this shape
directly is awkward for CSS flexbox/grid. A list of branches is
trivially renderable as one flex row per branch, with the first
card in each branch being the common ancestor. Branching layouts
then use a simple render trick: render the ancestor once, then the
remaining stages of each branch stacked vertically to its right.

**Alternatives considered**:
- **Render the raw tree recursively**: Harder CSS, harder tests,
  harder keyboard focus order. More complexity than value.
- **Flatten to a flat list with parent references**: Still requires
  tree reconstruction at render time.

## R3: Out-of-Kanto Evolution Children — Muted Placeholders

**Decision**: For evolution stages whose Pokémon id > 151 (or
species url indicates non-Gen I), render the mini card as a
non-clickable placeholder with a "Gen II+" badge or muted styling.
Do NOT hide them entirely.

**Rationale**: Hiding children (e.g., hiding Crobat as Golbat's
evolution) would misrepresent the canonical chain. Muted
placeholders preserve accuracy while respecting the app's Kanto-
only scope. The user still learns that Golbat evolves into Crobat;
they just can't navigate to Crobat's page within this app.

**Alternatives considered**:
- **Hide entirely**: Users looking at Golbat's page would see no
  post-evolution indicator, which is misleading.
- **Clickable but show a "not found" page**: Breaks the Gen I
  contract (feature 001) and creates a dead-end navigation.

## R4: Mini Card Composition — Minimal

**Decision**: `EvolutionMiniCard` shows sprite, Pokédex number,
name — NO type badges. Smaller visual footprint; the detail page
already shows types for the current Pokémon; the chain's purpose is
relational, not informational.

**Rationale**: Chain row readability improves when each card is
compact. Type badges per mini card would dominate horizontal space
and distract from the progression arrows.

**Alternatives considered**:
- **Reuse existing `PokemonCard`**: Full-size; turns the chain
  into a second list, not a lineage. Bad visual density.
- **Include type badges**: Visually noisy for 3–4 cards in a row.

## R5: Current Pokémon Highlight — Accent Ring + aria-current

**Decision**: The currently viewed Pokémon's card gets a 3 px
accent ring in `--color-primary`, a non-clickable state (`aria-
disabled="true"`, still visible as a button for structural
consistency but with `onClick` disabled), and `aria-current="page"`
for screen readers.

**Rationale**: Ring + `aria-current` is the standard pattern. The
non-color cue (the ring + its non-interactive state) satisfies WCAG
1.4.1 (color not the only means of conveying information).

**Alternatives considered**:
- **Color-only highlight (different background)**: Fails WCAG 1.4.1
  for color-blind users.
- **Render as text label "(current)"**: Works but visually
  cluttered inside a compact card.

## R6: Responsive Layout — Horizontal ↔ Vertical via CSS

**Decision**: Use CSS flexbox with `flex-direction: row` by default
and a `@media (max-width: 600px)` query that flips to `column`.
Arrows rotate 90° in the vertical layout via a separate CSS class.

**Rationale**: No JS breakpoint detection; pure CSS. `600px` is
the standard tablet-to-mobile cutoff used elsewhere in the app.

**Alternatives considered**:
- **JS-based breakpoint hook**: Adds unnecessary runtime; flex/CSS
  media queries are sufficient.

## R7: Arrow Indicator — Inline SVG `<svg>`

**Decision**: Inline SVG arrow rendered between cards. The SVG is
aria-hidden (decorative); semantic direction is implied by the
ordered list structure. One arrow orientation (right-pointing) with
CSS `transform: rotate(90deg)` for the vertical layout.

**Rationale**: Inline SVG is cheap, crisp at any resolution, and
easy to color via `currentColor` tied to `--color-text-light`. No
external icon library needed.

**Alternatives considered**:
- **Unicode arrow character**: Inconsistent rendering across fonts.
- **Icon library (e.g., lucide-react)**: Overkill for one icon.

## R7: Branching Render Strategy

**Decision**: For branching chains (where a node has >1 child), the
container uses `display: grid` within that stage's slot, stacking
the branch children vertically. The ancestor appears once on the
left; branches are grouped on the right.

Visual:
```
Eevee →  Vaporeon
      →  Jolteon
      →  Flareon
```

**Rationale**: Preserves the "one ancestor" constraint (SC-003) and
is readable. Non-branching nodes render as a single horizontal row.

**Alternatives considered**:
- **Separate full-row per branch (duplicated ancestor)**: Violates
  SC-003; visually confusing.

## R8: Loading / Error / Empty States (Mirror List Page Patterns)

**Decision**: Reuse the same patterns as the list page (feature
003/005):
- Loading: centered `<Spinner size="sm" label="Loading
  evolutions" />` inside the section
- Error: `<Alert severity="error" title="Couldn't load
  evolutions">` — non-blocking; the rest of the detail page still
  works (SC-007)
- Empty (no evolutions): prose paragraph "This Pokémon does not
  evolve" styled consistently with other empty states

**Rationale**: Consistency across the app. Users already know
these patterns from the list page.

## R9: Caching / Deduplication

**Decision**: No cross-navigation caching in v1. Each detail page
load fetches fresh. AbortController cancels in-flight requests on
navigation to avoid stale updates.

**Rationale**: 70 chains × minimal data is cheap. Adding a cache
(even in-memory) introduces invalidation complexity. YAGNI.

**Alternatives considered**:
- **Module-level Map cache keyed by species id**: Works but adds
  complexity with no clear win given chain data rarely changes
  within a session and network requests are tiny.

## R10: Test Fixture Strategy

**Decision**: Extend `src/test/msw-handlers.ts` with:
- `buildEvolutionChainResponse(branches)` — builds the raw
  `ChainLink` tree from a simple list of branches (e.g., `[[1,2,3]]`
  for Bulbasaur → Ivysaur → Venusaur).
- Add MSW handlers for `GET /pokemon-species/:id` and
  `GET /evolution-chain/:id` to the default handler set.

Deterministic fixtures for linear chains (Bulbasaur line), single-
stage (Mew), and branching (Eevee) cover every user story.

**Rationale**: Follows the established MSW pattern from features
003/004. Fixture builders keep tests concise and shared.
