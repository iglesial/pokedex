# Feature Specification: Evolution Chain on Detail Page

**Feature Branch**: `006-evolution-chain`
**Created**: 2026-04-14
**Status**: Draft
**Input**: User description: "Evolution chain on the Pokémon detail page — below the stats section, add an 'Evolution' section that fetches the Pokémon's evolution chain and displays each stage as a mini Pokémon card, connected by arrow indicators showing the progression direction (left-to-right on desktop, top-to-bottom on mobile). Clicking any card in the chain navigates to that Pokémon's detail page. The current Pokémon is visually highlighted within the chain. Pokémon with no evolutions (e.g., Mew, Tauros) show a 'This Pokémon does not evolve' message. Handle branching evolutions (e.g., Eevee) by rendering each branch as a separate path from the common ancestor."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See a Linear Evolution Chain (Priority: P1)

As a Pokémon fan viewing a detail page, I want to see the Pokémon's
evolution path (where it came from and what it becomes) so I can
understand its family lineage and explore related Pokémon.

**Why this priority**: Evolution is one of the most recognizable
mechanics in Pokémon; the detail page feels incomplete without it.
Linear chains (the majority of Pokémon) represent the core case.

**Independent Test**: Open Charmander's detail page (`/pokemon/4`).
Below the base stats, see an "Evolution" section showing three
cards left-to-right: Charmander → Charmeleon → Charizard, with
directional arrows between them. Charmander's card is visually
highlighted to indicate it's the current Pokémon.

**Acceptance Scenarios**:

1. **Given** I am viewing Charmander's detail page, **When** the
   evolution section renders, **Then** I see three mini cards
   (Charmander, Charmeleon, Charizard) arranged left-to-right with
   arrow indicators between them.
2. **Given** the evolution chain is displayed, **When** I inspect
   the current Pokémon's card, **Then** it is visually distinct
   from the other cards (e.g., thicker border, accent ring).
3. **Given** the evolution section is displayed, **When** I click
   any other card, **Then** the app navigates to that Pokémon's
   detail page and that Pokémon becomes the highlighted one.

---

### User Story 2 - See Non-Evolving Pokémon Handled Gracefully (Priority: P1)

As a user viewing a Pokémon that does not evolve (Mew, Mewtwo,
Tauros, etc.), I want a clear statement about this so I'm not
confused by a missing or empty section.

**Why this priority**: Roughly 30% of Kanto Pokémon have no
evolution. Without an explicit empty state, users would see an
incomplete detail page and wonder if the feature is broken.

**Independent Test**: Open Mew's detail page (`/pokemon/151`). The
Evolution section is present and displays the message "This
Pokémon does not evolve" — not an empty container, not a loading
spinner, not a broken layout.

**Acceptance Scenarios**:

1. **Given** I am viewing Mew's detail page, **When** the Evolution
   section renders, **Then** I see the message "This Pokémon does
   not evolve" inside the section.
2. **Given** I am viewing any other non-evolving Pokémon (e.g.,
   Tauros, Kangaskhan, Lapras), **When** the Evolution section
   renders, **Then** the same message is displayed.
3. **Given** the Evolution section shows the "does not evolve"
   message, **When** I inspect the layout, **Then** the section
   header "Evolution" is still visible so users understand what
   the section is.

---

### User Story 3 - See Branching Evolutions (Priority: P2)

As a user viewing a Pokémon with multiple evolution paths (Eevee,
Oddish, Poliwag), I want to see all branches so I can understand
every possible outcome of evolving that Pokémon.

**Why this priority**: Branching evolutions are iconic (Eevee
especially) but less common than linear chains. They add
significant visual complexity and are worth shipping after the
linear case is solid.

**Independent Test**: Open Eevee's detail page (`/pokemon/133`).
The Evolution section displays Eevee on the left with three
distinct arrow paths leading to Vaporeon, Jolteon, and Flareon
(Kanto's three Eeveelutions), each in its own branch. Eevee is
highlighted as the current Pokémon.

**Acceptance Scenarios**:

1. **Given** I am viewing Eevee's detail page, **When** the
   Evolution section renders, **Then** Eevee appears once and is
   connected via separate arrows to each of its Kanto evolutions
   (Vaporeon, Jolteon, Flareon).
2. **Given** I am viewing Vaporeon's detail page (a branch child),
   **When** the Evolution section renders, **Then** the full chain
   is still shown (Eevee → Vaporeon, plus the sibling branches to
   Jolteon and Flareon), and Vaporeon is the highlighted card.
3. **Given** a branching chain is displayed, **When** I inspect any
   non-ancestor card, **Then** only the path from the common
   ancestor to that Pokémon is implied visually — no cross-links
   between sibling branches.

---

### Edge Cases

- What happens while the evolution data is loading? The section
  MUST show a loading indicator (e.g., Spinner) — not an empty
  placeholder that causes layout shift.
- What happens when the evolution data fails to load? The section
  MUST show a brief error message inside the section without
  breaking the rest of the detail page; other sections (identity,
  stats, abilities, moves) MUST remain usable.
- What happens when the evolution chain includes a Pokémon outside
  the Kanto range (1–151)? Since the project is Gen I only, those
  stages MUST either be hidden or rendered as non-clickable
  placeholders with a visual hint that they are out of scope.
- What happens when the current Pokémon's sprite in the chain
  fails to load? The mini card MUST show a text placeholder (same
  pattern as list cards) without breaking the row layout.
- What happens when the evolution chain is very deep (e.g., 3+
  stages) on narrow mobile screens? The chain MUST remain readable
  — arrows stack vertically (top-to-bottom) below a breakpoint.
- What happens when a user clicks the currently highlighted card?
  No navigation (or a no-op re-render) — a self-navigation
  shouldn't cause a jarring reload.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every Pokémon detail page MUST include an "Evolution"
  section rendered below the stats/abilities/moves content.
- **FR-002**: The section header MUST read "Evolution".
- **FR-003**: When a Pokémon has an evolution chain of two or more
  stages, the section MUST render each stage as a mini card
  showing the Pokémon's name, zero-padded number, and sprite.
- **FR-004**: Cards MUST be connected by an arrow indicator
  (visual or textual) that shows the direction of progression from
  pre-evolution to evolution.
- **FR-005**: On desktop (wider than a clear breakpoint), the
  chain MUST be laid out horizontally (left-to-right). On mobile,
  it MUST stack vertically (top-to-bottom) with arrows pointing
  downward.
- **FR-006**: The card representing the currently viewed Pokémon
  MUST be visually distinguishable from the others (e.g., accent
  border, ring, or background treatment).
- **FR-007**: Clicking a non-current card MUST navigate to that
  Pokémon's detail page; clicking the current card MUST be a no-op
  or retain the current view without visible disruption.
- **FR-008**: Clickable cards MUST be keyboard-activatable (Enter
  or Space) and MUST expose an accessible name (e.g., "View
  Charmeleon details").
- **FR-009**: When a Pokémon has no evolutions (single-stage
  Pokémon), the section MUST display the message "This Pokémon
  does not evolve" and MUST NOT render any cards or arrows.
- **FR-010**: When a Pokémon has branching evolutions, each
  branch MUST render as its own path from the common ancestor so
  every possible evolution is visible. Only one instance of the
  ancestor Pokémon is shown, shared across all branches.
- **FR-011**: Evolution stages that point to Pokémon outside the
  Kanto range (ids 152+) MUST be either hidden from the chain or
  rendered as non-clickable placeholders with a clear "outside
  Kanto" visual indicator.
- **FR-012**: The Evolution section MUST show a loading indicator
  while the chain data is being fetched.
- **FR-013**: If the chain data fails to load, the section MUST
  show a non-blocking error message (e.g., "Couldn't load
  evolutions") without affecting the rest of the detail page.
- **FR-014**: If the mini card's sprite fails to load, a text
  placeholder MUST be shown without breaking the chain's layout.
- **FR-015**: The Evolution section MUST meet WCAG 2.1 AA
  compliance (keyboard-navigable cards, accessible names, focus
  indicators, readable focus states, and non-color-dependent cues
  for the "current Pokémon" indicator).

### Key Entities

- **Evolution Chain**: An ordered tree of Pokémon stages, rooted
  at the common ancestor (the earliest un-evolved form). Each node
  has a Pokémon reference (id, name, sprite) and zero or more
  child branches.
- **Evolution Chain Node**: A single stage within the chain; may
  have multiple children (branching evolutions) or one child
  (linear evolution) or none (terminal stage).
- **Evolution Section State**: Loading, success (with chain data),
  empty (single-stage Pokémon), or error.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users viewing any Kanto Pokémon with evolutions can
  see the complete chain in one scroll — no collapsing, no
  "Show more" gating.
- **SC-002**: Users can navigate to any Pokémon within the same
  evolution chain in a single click or activation.
- **SC-003**: Branching evolutions (Eevee and similar) render all
  Kanto-range branches without rendering duplicates of the shared
  ancestor.
- **SC-004**: Non-evolving Pokémon display a clear "does not
  evolve" message within 1 second of the detail page loading.
- **SC-005**: On mobile (viewport ≤ 600 px), the chain stacks
  vertically and every mini card remains fully visible without
  horizontal scrolling.
- **SC-006**: The Evolution section passes automated WCAG 2.1 AA
  accessibility checks with zero violations in both loaded and
  empty (no-evolution) states.
- **SC-007**: A failure to load evolution data MUST NOT prevent the
  rest of the detail page (identity, stats, abilities, moves) from
  rendering and functioning.

## Assumptions

- The evolution data is sourced from the same public Pokémon data
  API already used for list and detail fetches; no new integration
  contracts.
- Evolution trigger details (level thresholds, stones, trade
  requirements, held items) are OUT OF SCOPE for this feature.
  Only the chain structure (who evolves into whom) is shown. A
  later feature may add trigger tooltips.
- Mega Evolutions, Regional forms, and Gigantamax are out of
  scope — the Gen I cap means no alt-form handling is needed.
- Evolution chain fetch is assumed to be a single network request
  per detail page load; caching across navigations within the same
  session is not required for v1 but is permitted if trivial.
- The mini card shown in the evolution chain is a smaller, lighter
  variant of the existing list card — it displays only name,
  number, and sprite (no type badges) to keep the chain compact.
- Pokémon 0 (glitches) and Pokémon IDs outside 1–151 never appear
  in the Kanto evolution chains except as outbound evolutions for
  cross-gen species (e.g., Jigglypuff → Wigglytuff is Kanto-only;
  however some Kanto Pokémon evolve into non-Kanto species via
  later generations — those are filtered out per FR-011).
