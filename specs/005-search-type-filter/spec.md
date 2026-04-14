# Feature Specification: Search and Type Filter

**Feature Branch**: `005-search-type-filter`
**Created**: 2026-04-13
**Status**: Draft
**Input**: User description: "Search and type filter on the list page — add a text input to filter Pokémon by name (case-insensitive substring match) and a row of type badges that act as toggle filters (AND semantics: a Pokémon must match every selected type). Filters are reflected in the URL as ?q=&types=fire,water so they're bookmarkable and persist through pagination. Clearing all filters restores the full list."

## Clarifications

### Session 2026-04-13

- Q: What data strategy should the list page use to support filtering across all 151 Pokémon? → A: Prefetch all 151 on list load; filter entirely client-side
- Q: How should search input keystrokes trigger filtering? → A: 200 ms debounce after the user pauses typing
- Q: How should result-count changes be announced to screen readers? → A: ARIA live region (`aria-live="polite"`) announces "N Pokémon found" after each filter change

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search by Name (Priority: P1)

As a Pokémon fan on the list page, I want to type a few letters of a
Pokémon's name and see the list filter in real time so I can find a
specific Pokémon quickly without scrolling through pages.

**Why this priority**: The highest-frequency user task for a 151-item
Pokédex is "find this specific Pokémon." Name search delivers that
value on its own and is valuable without the type filter.

**Independent Test**: Type "pika" into the search field on the list
page; verify only Pikachu (and any other names containing "pika")
remains visible. Clear the field; the full list returns.

**Acceptance Scenarios**:

1. **Given** the list page is showing the first page of Pokémon,
   **When** I type "char" into the search input, **Then** the list
   filters to show only Pokémon whose names contain "char"
   (Charmander, Charmeleon, Charizard), regardless of case.
2. **Given** I have typed a search query, **When** no Pokémon match,
   **Then** an empty-state message is shown ("No Pokémon match your
   search").
3. **Given** I have typed a search query, **When** I clear the input,
   **Then** the full list (subject to any active type filters) is
   restored.
4. **Given** I refresh the page with a search query in the URL
   (`?q=char`), **When** the page loads, **Then** the input is
   pre-filled with "char" and the list is already filtered.

---

### User Story 2 - Filter by Type (Priority: P1)

As a Pokémon fan, I want to click a type (e.g., "Fire") and see only
Pokémon of that type so I can browse by elemental affinity. I can
combine multiple types for Pokémon that match all of them (AND
semantics), e.g., Fire AND Flying returns Charizard and Moltres.

**Why this priority**: Type filtering is the second-most-requested
browsing mode for Pokémon fans after name search, and it's the core
value of "browse by category" for a Pokédex. Delivered alongside
US1 as P1 because together they form a complete filtering
experience.

**Independent Test**: Click the "Fire" type badge in the filter row;
verify only Fire-type Pokémon are shown. Click "Flying" as well;
verify only Pokémon with BOTH Fire AND Flying types appear.
Click "Fire" again to deselect; list expands accordingly.

**Acceptance Scenarios**:

1. **Given** the list page is showing the first page, **When** I
   click the "Fire" type chip, **Then** the chip becomes visually
   "selected" and the list filters to Fire-type Pokémon only.
2. **Given** "Fire" is selected, **When** I additionally click
   "Flying", **Then** the list filters to Pokémon with BOTH Fire
   AND Flying types (e.g., Charizard, Moltres).
3. **Given** "Fire" and "Flying" are both selected, **When** I click
   "Fire" again, **Then** "Fire" deselects and the list updates to
   show Flying-only Pokémon.
4. **Given** I have type filters selected, **When** I refresh with
   `?types=fire,water` in the URL, **Then** Fire and Water chips are
   pre-selected and the list is filtered accordingly.
5. **Given** all 18 type chips are visible, **When** I inspect their
   colors, **Then** each chip uses its official type color,
   consistent with card type badges.

---

### User Story 3 - Combine Search + Types + Pagination (Priority: P1)

As a user with active filters, I want pagination to respect those
filters so that paging through results is always within the filtered
set, and the URL captures all three dimensions at once.

**Why this priority**: Without this integration, filters would reset
on page changes (breaking user flow) or pagination would show empty
pages. The three must compose for the feature to feel correct.

**Independent Test**: Select the "Water" type filter; verify the
pagination reflects the filtered count (e.g., 32 Water Pokémon → 2
pages). Navigate to page 2; verify URL contains both `types=water`
and `page=2`; verify results continue from the filtered set.

**Acceptance Scenarios**:

1. **Given** I have selected "Water" as a type filter, **When** I
   look at the pagination control, **Then** the page count reflects
   only the filtered results (e.g., Water Pokémon count / page
   size).
2. **Given** I have a filter active and am on page 2, **When** I
   clear all filters, **Then** the URL resets and I return to page 1
   of the full list.
3. **Given** I am on page 3 of the full list, **When** I enter a
   search query that matches only 5 Pokémon, **Then** I am taken
   back to page 1 of the filtered results (because page 3 is no
   longer valid).
4. **Given** I have both a search query and type filters active,
   **When** I inspect the URL, **Then** all three parameters are
   present (`?q=…&types=…&page=…`), and the list shows only Pokémon
   matching every filter.

---

### User Story 4 - Clear All Filters (Priority: P2)

As a user with multiple filters active, I want a clear way to reset
everything at once so I can quickly return to the full list without
manually undoing each filter.

**Why this priority**: Quality-of-life feature. Individual filter
clearing works already (US1 + US2); a single "Clear" control just
accelerates the reset flow.

**Independent Test**: With at least one search query and one type
filter active, click the "Clear filters" control. Verify all
filters are cleared, the URL query parameters are removed, and the
full list at page 1 is shown.

**Acceptance Scenarios**:

1. **Given** I have a search query and type filters active, **When**
   I click "Clear filters", **Then** the search input empties, all
   type chips deselect, the pagination resets to page 1, and the
   URL contains no filter/search/page parameters.
2. **Given** no filters are active, **When** I inspect the UI,
   **Then** the "Clear filters" control is either hidden or
   disabled (no-op if clicked).

---

### Edge Cases

- What happens when a user types rapidly? The search MUST debounce
  keystrokes by 200 ms; the final typed string is the effective
  filter once the user pauses. The URL updates only after the
  debounce fires (not per keystroke).
- What happens when the search query has leading/trailing
  whitespace? It MUST be trimmed before matching.
- What happens with special characters in the search (e.g., "é" in
  "Pokémon")? Search MUST be Unicode-safe; "é" should match "é" but
  the spec doesn't require diacritic folding (e.g., "e" → "é") in
  v1.
- What happens when the URL contains a type name that isn't a valid
  Pokémon type (e.g., `?types=chaos`)? The invalid type MUST be
  ignored; remaining valid types MUST still apply.
- What happens when the search + filters return zero results?
  Pagination MUST hide (or show "Page 0 of 0"); an empty-state
  message MUST be shown.
- What happens when the user navigates to a detail page and back?
  The URL query reflects the filter state, so Back navigation
  MUST restore the exact filter view (leveraging the URL-based
  state from feature 003/004).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The list page MUST provide a text input above the
  grid where users can type a search query to filter Pokémon by
  name.
- **FR-002**: Name matching MUST be a case-insensitive substring
  match against the Pokémon name after trimming whitespace (e.g.,
  "Char" matches "charmander").
- **FR-003**: The list page MUST display a row of all 18 Pokémon
  type chips as toggle filters, each colored with its official type
  color.
- **FR-004**: Clicking a type chip MUST toggle its selected state;
  selected chips are visually distinct from unselected chips.
- **FR-005**: When multiple types are selected, the filter MUST use
  AND semantics: only Pokémon possessing every selected type are
  shown.
- **FR-006**: The search query MUST be reflected in the URL as the
  `q` query parameter (e.g., `?q=char`).
- **FR-007**: The selected types MUST be reflected in the URL as the
  `types` query parameter, comma-separated
  (e.g., `?types=fire,flying`).
- **FR-008**: Filters and pagination MUST compose: selecting filters
  also updates the URL's `page` parameter to 1 when the current
  page would be invalid after filtering.
- **FR-009**: Opening the list with filter parameters in the URL
  MUST restore the exact filter state (search input populated, type
  chips selected) and display the filtered results on load.
- **FR-010**: Invalid type names in the URL (not one of the 18
  official types) MUST be silently ignored; valid types in the same
  parameter MUST still apply.
- **FR-011**: A "Clear filters" control MUST be available on the
  list page; clicking it MUST remove all filter state and return to
  the full list at page 1. The control MUST be visible only when at
  least one filter is active (hidden when `query`, `types`, and
  non-default `page` are all inactive).
- **FR-012**: When the filter result is empty, the page MUST show
  an empty-state message ("No Pokémon match your filters") and
  hide the pagination control.
- **FR-013**: Filter application MUST feel instantaneous — type
  chip toggles apply immediately; search input MUST debounce
  keystrokes by 200 ms so the filter (and URL update) fires
  after the user pauses typing.
- **FR-014**: The filter UI and results MUST meet WCAG 2.1 AA
  compliance (keyboard-navigable chips, accessible labels on the
  search input).
- **FR-015**: Result-count changes MUST be announced to screen
  readers via an ARIA live region with `aria-live="polite"` that
  reads a message like "N Pokémon found" after every filter or
  search application (including clear-all).

### Key Entities

- **Search Query**: A case-insensitive substring used to match
  Pokémon names. Trimmed. Empty string means "no name filter".
- **Type Filter Set**: An ordered set of selected Pokémon type
  names (e.g., `['fire', 'flying']`). Empty set means "no type
  filter".
- **Filtered List State**: The full set of Pokémon that match all
  active filters. Pagination is applied on top of this set.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can find any specific Pokémon in the Kanto
  Pokédex by typing part of its name and reach the result in
  under 2 seconds.
- **SC-002**: A user can filter the list to a single Pokémon type
  in one click, and to a two-type combination in two clicks.
- **SC-003**: Applying or clearing a filter refreshes the visible
  list in under 200 ms on a typical device.
- **SC-004**: Bookmarking a filtered URL (e.g.,
  `/?q=char&types=fire&page=1`) and reopening it later reproduces
  the exact same filtered view.
- **SC-005**: With no filters active, the list page displays
  identically to the pre-feature baseline (100% backward-visual
  compatibility).
- **SC-006**: The filter UI passes automated WCAG 2.1 AA
  accessibility checks with zero violations.
- **SC-007**: Clearing all filters via the clear-all control
  removes all search/types/page parameters from the URL in a
  single user action.

## Assumptions

- Filtering is performed entirely client-side against the full
  set of 151 Kanto Pokémon, which is prefetched once when the list
  page loads (per Clarifications Q1). This ensures filter results
  are always complete regardless of the current visible page.
- A brief initial loading indicator is acceptable while the full
  set is being prefetched; afterwards, all filter and pagination
  interactions feel instantaneous.
- The search is a **substring** match, not fuzzy (no typo
  tolerance). A typo like "pikahu" returns zero results.
- Diacritic-insensitive matching (e.g., "e" matching "é") is out
  of scope for v1.
- The 18 type chips are always visible (no collapse/expand) on
  desktop. Mobile may wrap to multiple rows but remain fully
  visible (no hidden types). Chips are rendered in canonical
  alphabetical order (bug, dark, dragon, electric, fairy, fighting,
  fire, flying, ghost, grass, ground, ice, normal, poison, psychic,
  rock, steel, water) so the row position is stable across sessions.
- Search debounce is fixed at 200 ms per FR-013 and Clarifications
  Q2.
- Keyboard-only users can operate chips via Tab/Enter/Space and can
  focus the search input as normal.
- No server-side or persistent filter history beyond the URL.
