# Feature Specification: Pokémon Detail Page

**Feature Branch**: `004-pokemon-detail`
**Created**: 2026-04-12
**Status**: Draft
**Input**: User description: "Pokémon detail page — clicking a card on the list navigates to a dedicated page showing the Pokémon's full info: large sprite, name, Pokédex number, types, height, weight, base stats, abilities, and moves. Include a back button to return to the list."

## Clarifications

### Session 2026-04-12

- Q: How should the moves list be displayed given Gen I Pokémon can have 60–80+ moves? → A: Compact grid of move "chips" inside a height-limited scrollable container
- Q: How should base stats be visualized? → A: Radar (hexagonal spider) plot filled with the Pokémon's primary type color
- Q: How should list page position be preserved when returning from the detail page? → A: Store current page in URL query string (`/?page=N`)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View a Pokémon's Core Identity (Priority: P1)

As a Pokémon fan browsing the Pokédex, I want to click on a card and
see a dedicated page with the Pokémon's large image, name, number,
and types so that I can get a focused, readable view of a single
Pokémon.

**Why this priority**: The primary user intent from the list is "tell
me more about this one." Without at minimum a large sprite, name,
number, and types, the detail page adds no value over the card.

**Independent Test**: From the list, click any Pokémon card;
verify the URL changes, a detail page loads, and it displays the
large sprite, full name, Pokédex number, and type badges.

**Acceptance Scenarios**:

1. **Given** I am viewing the list page, **When** I click any
   Pokémon card, **Then** the page navigates to `/pokemon/{id}`
   and displays that Pokémon's detail view.
2. **Given** the detail page is open for Pokémon #25 (Pikachu),
   **When** I inspect the page, **Then** I see a large Pikachu
   sprite, the name "Pikachu", the number "#025", and its Electric
   type badge.
3. **Given** I open `/pokemon/1` directly in the browser,
   **When** the page loads, **Then** it fetches and displays
   Bulbasaur's details without requiring me to visit the list first.

---

### User Story 2 - View Physical and Base Stats (Priority: P1)

As a Pokémon fan, I want to see the Pokémon's height, weight, and
base stats so that I can understand its physical characteristics
and combat potential at a glance.

**Why this priority**: Height, weight, and base stats are the core
"stat card" information on any Pokédex. A detail page without them
would feel incomplete.

**Independent Test**: Open a Pokémon detail page and verify that
height (in meters), weight (in kilograms), and all six base stats
(HP, Attack, Defense, Special Attack, Special Defense, Speed) are
displayed — stats as a hexagonal radar chart colored by primary
type, with axis labels showing each stat name and numeric value.

**Acceptance Scenarios**:

1. **Given** the detail page is open, **When** I inspect the
   physical information, **Then** I see height in meters and weight
   in kilograms (e.g., "Height: 0.4 m", "Weight: 6.0 kg").
2. **Given** the detail page is open, **When** I inspect the base
   stats section, **Then** all six stats are shown on a hexagonal
   radar chart with axis labels naming each stat and displaying its
   numeric value.
3. **Given** the detail page is open, **When** I inspect the radar
   chart, **Then** the filled polygon's shape accurately reflects
   the stat magnitudes (scaled to a common max of 255) and its fill
   color is the Pokémon's primary type color.

---

### User Story 3 - View Abilities and Moves (Priority: P2)

As a Pokémon fan planning battles or collecting info, I want to see
the Pokémon's abilities and a list of its moves so that I can
understand its combat options.

**Why this priority**: Complements the stats section for a complete
combat profile, but the page is already useful with just the
identity and stats sections.

**Independent Test**: Open a detail page; confirm the abilities
section lists at least one ability (marked hidden if applicable) and
the moves section displays a scrollable or paginated list of moves
with their names.

**Acceptance Scenarios**:

1. **Given** the detail page is open, **When** I inspect the
   abilities section, **Then** each ability is listed by name, with
   hidden abilities clearly marked as such.
2. **Given** the detail page is open, **When** I inspect the moves
   section, **Then** I see the full list of moves the Pokémon can
   learn, with each move presented as a clear, titled entry.
3. **Given** a Pokémon has a large number of moves, **When** the
   moves section is displayed, **Then** the layout remains usable
   (e.g., grouped, scrollable container, or paginated) without
   overwhelming the page.

---

### User Story 4 - Back Navigation (Priority: P1)

As a user on the detail page, I want a clear Back button to return
to the list so that I can quickly continue browsing without losing
my place in the list.

**Why this priority**: Navigation is essential for a
list-detail-list browsing pattern. Without a Back button, users rely
on the browser's back button alone, which is not discoverable.

**Independent Test**: On the detail page, click the Back button;
verify the browser returns to the list page at the same scroll
position or page as before.

**Acceptance Scenarios**:

1. **Given** I am on the detail page reached from the list,
   **When** I click the Back button, **Then** the app navigates
   back to the list page.
2. **Given** I navigated from page 3 of the list to a detail page,
   **When** I click Back, **Then** the list page reopens at page 3
   (URL contains `?page=3`) exactly as before.
3. **Given** I arrived at the detail page directly via URL (not
   from the list), **When** I click the Back button, **Then** the
   app navigates to the list at `?page=1` as a safe default.

---

### Edge Cases

- What happens when a user opens a detail URL for a Pokémon ID
  outside the Gen I range (e.g., `/pokemon/500`)? The page MUST
  display a clear "Not found" message with a link back to the list.
- What happens when the detail API request fails? The page MUST
  show an error message with a retry affordance (or clear
  instruction), not an indefinite loading indicator.
- What happens when the Pokémon has only one type? The detail view
  MUST render a single type badge without a placeholder slot.
- What happens when the Pokémon's sprite image fails to load? A
  text placeholder MUST be shown in place of the image without
  breaking the layout.
- What happens when abilities or moves are missing from the API
  response? The relevant section MUST render an empty-state message
  ("No abilities listed", "No moves listed") instead of breaking.
- What happens when the user clicks the radar chart? It MUST be
  non-interactive (purely presentational) — no hidden affordances.
- What happens for users relying on screen readers? The radar
  chart MUST expose an accessible text alternative listing each
  stat name and value so its information is not conveyed by color
  or shape alone.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST expose a route at `/pokemon/{id}`
  where `{id}` is the Pokémon's national Pokédex number.
- **FR-002**: Each Pokémon card on the list MUST link to its detail
  page, and clicking or activating the card via keyboard MUST
  navigate to that route.
- **FR-003**: The detail page MUST display the Pokémon's sprite
  image at a size noticeably larger than the list card (minimum 2x
  the linear dimension).
- **FR-004**: The detail page MUST display the Pokémon's name in
  title case and the zero-padded Pokédex number (e.g., "#025").
- **FR-005**: The detail page MUST display every type the Pokémon
  has as a colored badge consistent with the list page's type
  colors.
- **FR-006**: The detail page MUST display the Pokémon's height in
  meters and weight in kilograms using one decimal place
  (e.g., "0.4 m", "6.0 kg").
- **FR-007**: The detail page MUST display all six base stats (HP,
  Attack, Defense, Special Attack, Special Defense, Speed) on a
  hexagonal radar/spider chart with one axis per stat, labeled with
  each stat name and numeric value.
- **FR-008**: The radar chart's filled polygon MUST be colored
  using the Pokémon's primary type color (with partial transparency
  so the grid remains visible), and each axis MUST be scaled
  proportionally to a fixed maximum (255) so charts are directly
  comparable across Pokémon.
- **FR-009**: The detail page MUST display the Pokémon's abilities
  by name. Hidden abilities MUST be visually distinguished (e.g.,
  badge label "Hidden").
- **FR-010**: The detail page MUST display the Pokémon's moves as
  a compact grid of chip-style labels inside a height-limited
  container with vertical scrolling; the container's visible height
  MUST be bounded so the page layout remains stable regardless of
  move count.
- **FR-011**: The detail page MUST provide a Back button that
  returns the user to the list page.
- **FR-011a**: The list page MUST reflect its current page number
  in the URL query string (`?page=N`). When the Back button is
  clicked on the detail page, navigation MUST return to the URL the
  user came from (preserving `?page=N`). When the user arrives at
  the detail page via deep link, the Back button MUST navigate to
  the list page at `?page=1` as a safe default.
- **FR-012**: The detail page MUST handle deep-link loads: opening
  `/pokemon/{id}` directly MUST fetch and render that Pokémon
  without requiring the user to visit the list first.
- **FR-013**: The detail page MUST display a loading indicator
  while fetching data.
- **FR-014**: The detail page MUST display an error alert if the
  fetch fails.
- **FR-015**: The detail page MUST display a 404-style message
  when the Pokémon ID is outside the Gen I range (1–151), with a
  link back to the list.
- **FR-016**: When a sprite image fails to load, a text placeholder
  MUST be shown without breaking the layout.
- **FR-017**: The detail page MUST meet WCAG 2.1 AA compliance
  (keyboard navigable including the Back button, semantic HTML with
  one h1, sufficient contrast, proper heading hierarchy).

### Key Entities

- **Pokémon Detail**: The full data for a single Pokémon —
  identity (id, name, sprite, types), physical (height, weight),
  base stats (6 numeric stats with labels), abilities (list of
  ability names with hidden flag), and moves (list of move names).
- **Detail Page State**: Loading flag, fetched detail data, error
  message, and the requested Pokémon ID from the route.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can open any Pokémon's detail page in a single
  click from the list.
- **SC-002**: The detail page renders all core data (sprite, name,
  number, types, height, weight, all 6 base stats, at least one
  ability, and the moves list) within 3 seconds on a typical
  broadband connection.
- **SC-003**: Users can return to the list from a detail page in a
  single click via the Back button without losing the previously
  viewed list page number.
- **SC-004**: Opening a Pokémon detail URL directly (deep link)
  succeeds in rendering the same content as navigation from the
  list.
- **SC-005**: Out-of-range IDs (e.g., 999, 0, non-numeric) display a
  user-friendly "Not found" message within 2 seconds.
- **SC-006**: The detail page passes automated WCAG 2.1 AA
  accessibility checks with zero violations in the loaded state.

## Assumptions

- Detail data is sourced from the same Pokémon data API already used
  by the list page; no new external integrations are required.
- Height and weight conversions from API units (decimetres and
  hectograms) to meters and kilograms are performed client-side
  using standard factors (÷10).
- The Gen I cap (IDs 1–151) from feature 003 applies here; IDs
  outside this range render the "Not found" state rather than
  showing cross-generation data.
- Move damage class, power, and accuracy are out of scope for this
  iteration; only move names are displayed. A future iteration can
  add rich move detail.
- Evolution chains are out of scope for this feature; they will be
  addressed separately.
- Sharing/linking a detail URL is supported via normal browser copy;
  no explicit share button is in scope.
- The card click opens the detail in the same tab; middle-click or
  Cmd/Ctrl-click opens in a new tab via standard browser behavior
  (implied by using a link, not a custom handler).
