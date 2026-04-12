# Feature Specification: Core Component Library

**Feature Branch**: `002-core-components`
**Created**: 2026-04-12
**Status**: Draft
**Input**: User description: "Implement the following core components in src/components/core/: Alert, Badge, Button, Card, FormField, Hero, Input, Modal, ProgressBar, Select, Spinner, Textarea"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Feedback & Status Components (Priority: P1)

As a developer building Pokedex features, I need a set of foundational
feedback and status components (Alert, Badge, Spinner, ProgressBar)
so that I can communicate state and outcomes consistently across
every page.

**Why this priority**: These components are required by the most basic
data-loading and user-feedback flows. Every future page that fetches
Pokémon data will need Spinner and Alert at minimum.

**Independent Test**: Navigate to the `/preview` route and verify that
Alert, Badge, Spinner, and ProgressBar render in all documented
variants with correct styling and accessible roles.

**Acceptance Scenarios**:

1. **Given** the preview route is open, **When** I inspect the page,
   **Then** Alert renders in at least 4 severity variants (info,
   success, warning, error) with appropriate visual distinction.
2. **Given** the preview route is open, **When** I inspect Badge,
   **Then** it renders in multiple color variants aligned with the
   design tokens (primary, secondary, neutral, plus one per Pokémon
   type where applicable).
3. **Given** the preview route is open, **When** I inspect Spinner,
   **Then** it animates continuously and exposes an accessible label
   indicating loading state.
4. **Given** the preview route is open, **When** I inspect ProgressBar,
   **Then** it renders at 0%, 50%, and 100% fill states with a visible
   track and fill color.

---

### User Story 2 - Form Input Components (Priority: P2)

As a developer adding search and filter features, I need form input
components (Input, Select, Textarea, FormField, Button) that are
accessible, styled with design tokens, and support standard HTML form
behavior so I can build consistent forms without reinventing them
each time.

**Why this priority**: Forms are the second-most-common UI pattern
after feedback. Search and filter features depend on these
components.

**Independent Test**: Render a sample form in the preview route
combining Input, Select, Textarea, FormField, and Button; verify
labels, error states, disabled states, and keyboard navigation work.

**Acceptance Scenarios**:

1. **Given** the preview route displays a sample form, **When** I
   tab through fields, **Then** focus moves in visual order and focus
   indicators are clearly visible.
2. **Given** a FormField wraps an Input or Select, **When** I inspect
   the rendered markup, **Then** the label is correctly associated
   with the control and error/help text is linked via `aria-describedby`.
3. **Given** the preview displays a Button, **When** I inspect its
   variants, **Then** at least primary, secondary, and ghost
   variants render with distinct styling plus disabled and loading
   states.
4. **Given** an Input has an error message, **When** it is focused
   by a screen reader, **Then** the error text is announced as part
   of the field's accessible description.

---

### User Story 3 - Layout & Overlay Components (Priority: P3)

As a developer building marketing and interactive sections, I need
layout components (Card, Hero) and an overlay component (Modal) to
structure content and display transient dialogs.

**Why this priority**: These components are needed for richer
presentation (Hero for the landing page, Card for Pokémon lists,
Modal for details/confirmations) but are not blocking for the
initial feedback and form patterns.

**Independent Test**: Render Card, Hero, and Modal in the preview
route; verify Modal opens, traps focus, closes on Escape, and
restores focus to the trigger.

**Acceptance Scenarios**:

1. **Given** a Card is rendered, **When** I inspect it, **Then** it
   supports a heading slot, content slot, and optional footer slot
   with consistent padding and shadow per design tokens.
2. **Given** a Hero is rendered, **When** I inspect it, **Then** it
   displays a prominent heading, subheading, and optional call-to-
   action slot spanning the full width of its container.
3. **Given** a Modal is triggered, **When** it opens, **Then** focus
   moves to the modal, Tab cycles within the modal, Escape closes
   it, and focus returns to the trigger element.
4. **Given** a Modal is open, **When** the user clicks the backdrop,
   **Then** the modal closes (unless explicitly marked as non-
   dismissible).

---

### Edge Cases

- What happens when a Button is clicked while in loading state?
  The component MUST prevent duplicate submissions until loading
  clears.
- What happens when a Modal is opened while another Modal is already
  open? The system MUST support stacking OR explicitly document that
  only one modal can be open at a time.
- What happens when a Select has zero options? The component MUST
  render gracefully (disabled state or empty placeholder) without
  errors.
- What happens when a ProgressBar receives a value outside the
  0–100 range? The component MUST clamp the value to the valid range.
- What happens when a FormField contains no input? The component MUST
  render nothing visible (or a safe empty state) without throwing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each core component MUST live in its own directory
  under `src/components/core/<ComponentName>/` and colocate source,
  styles, and tests.
- **FR-002**: Each component MUST export both its React component and
  its Props type from the barrel file `src/components/index.ts`.
- **FR-003**: Every component's Props interface MUST extend the
  native HTML attributes of the element it wraps (e.g., Button
  extends `ButtonHTMLAttributes`, Input extends `InputHTMLAttributes`).
- **FR-004**: Every component MUST use design tokens exclusively for
  all color, spacing, radius, shadow, and typography values — no
  hard-coded visual values.
- **FR-005**: Every component MUST be added to the `/preview` route
  displaying all documented variants and states.
- **FR-006**: Every component MUST have colocated Vitest +
  Testing Library tests covering default render, each variant, and
  one keyboard/interaction scenario where applicable.
- **FR-007**: Every component MUST pass automated WCAG 2.1 AA
  accessibility checks (via `vitest-axe`) in at least one
  representative variant.
- **FR-008**: Interactive components (Button, Input, Select,
  Textarea, Modal) MUST be fully keyboard-navigable and expose
  visible focus indicators.
- **FR-009**: Modal MUST trap keyboard focus while open, close on
  Escape key, and restore focus to the triggering element on close.
- **FR-010**: FormField MUST associate its label with the nested
  input via `htmlFor`/`id` and link any error or help text via
  `aria-describedby`.
- **FR-011**: Button MUST support at minimum: primary, secondary,
  and ghost visual variants, plus disabled and loading states.
- **FR-012**: Alert MUST support at minimum four severity variants
  (info, success, warning, error) with ARIA role `alert` or
  `status` chosen per severity.
- **FR-013**: Spinner MUST expose an accessible label (e.g., "Loading")
  visible to assistive technologies.
- **FR-014**: Badge MUST support at minimum neutral, primary, and
  secondary color variants aligned with design tokens.
- **FR-015**: Select MUST render a native `<select>` element (not a
  custom combobox) to ensure accessibility and platform consistency.
- **FR-016**: The barrel `src/components/index.ts` MUST export all
  12 components and their Props types.

### Key Entities

- **Core Component**: A reusable UI primitive consisting of a
  TypeScript React component, its Props type, a colocated CSS file
  referencing design tokens, and a colocated test file.
- **Variant**: A named visual style option for a component (e.g.,
  Button primary/secondary/ghost; Alert info/success/warning/error).
- **State**: A runtime modifier of a component's appearance or
  behavior (e.g., disabled, loading, focused, error).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 12 core components render on the `/preview` route
  with 100% of their documented variants visible.
- **SC-002**: 100% of core components have colocated test files with
  at least 3 test cases each (default render, variant, interaction
  or a11y).
- **SC-003**: 100% of core components pass `vitest-axe` accessibility
  assertions with zero WCAG 2.1 AA violations in at least one
  representative variant.
- **SC-004**: Zero hard-coded color, spacing, or radius values in
  any core component CSS file (verified by code review or
  automated scan).
- **SC-005**: A developer can import any core component and its
  Props type from `src/components` (the barrel) without knowing
  the internal file structure.
- **SC-006**: Keyboard-only navigation succeeds for every interactive
  component: users can reach, operate, and leave each interactive
  element without a mouse.
- **SC-007**: Modal focus management passes standard a11y criteria
  (focus trap, Escape to close, focus restoration) verified by
  automated test.

## Assumptions

- Components are purely presentational — no app-level state, no
  routing, no data fetching.
- Components are styled with plain CSS referencing the design tokens
  defined in feature 001.
- Only native HTML element wrappers are used; no custom combobox,
  datepicker, or rich-text widgets in this scope.
- Animations are minimal and respect the `prefers-reduced-motion`
  media query.
- Localization/internationalization is out of scope for this feature;
  accessible labels are in English.
- The Pokémon type-specific badge color palette (Fire, Water, Grass,
  etc.) is deferred — the Badge component ships with generic
  variants and will be extended later when type-filtering features
  require it.
