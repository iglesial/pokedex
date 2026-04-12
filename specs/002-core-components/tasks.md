# Tasks: Core Component Library

**Input**: Design documents from `/specs/002-core-components/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/props.ts, quickstart.md

**Tests**: Included — constitution Principle III mandates colocated tests for all user-facing components. Each test file includes default render, at least one variant, one interaction (where applicable), and a `vitest-axe` a11y assertion.

**Organization**: Tasks grouped by user story; components within a story are fully parallelizable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: [US1], [US2], [US3]
- Exact file paths in every description

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Ensure all dependencies for interactive testing are installed

- [X] T001 Verify `@testing-library/user-event` is installed in `package.json` (install with `npm i -D @testing-library/user-event` if missing)
- [X] T002 Verify `src/components/index.ts` exists and is empty (ready for barrel exports)

**Checkpoint**: Dependencies ready; test suite and preview route functional

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared test utilities and preview-page scaffolding used by all user stories

- [X] T003 Create test helper `renderWithAxe` wrapping `render()` with axe assertion in `src/test/helpers.tsx` to reduce boilerplate across component tests
- [X] T004 Refactor `src/pages/PreviewPage.tsx` to establish sectioned layout with placeholder `<section>` blocks for three categories: "Feedback & Status", "Form Inputs", "Layout & Overlays" (empty bodies for now)
- [X] T005 Refactor `src/pages/PreviewPage.css` with grid layout tokens for the three-section structure

**Checkpoint**: Preview page renders 3 empty category sections; test helper available

---

## Phase 3: User Story 1 — Feedback & Status Components (Priority: P1) MVP

**Goal**: Alert, Badge, Spinner, ProgressBar components rendered in preview with full variant coverage

**Independent Test**: Navigate to `/preview`; verify all 4 components render with documented variants; run `npm test` and confirm all US1 tests pass including axe assertions

### Implementation for User Story 1

**Alert** (severity: info, success, warning, error)

- [X] T006 [P] [US1] Create `src/components/core/Alert/Alert.tsx` — implement `AlertProps` from contracts/props.ts with severity variants, optional title, optional onDismiss close button; apply ARIA role `alert` for error/warning and `status` for info/success
- [X] T007 [P] [US1] Create `src/components/core/Alert/Alert.css` — style all 4 severity variants using only design tokens; use token-based color for each severity (error=primary red, warning=accent, success=green token if available else secondary, info=secondary blue)
- [X] T008 [US1] Create `src/components/core/Alert/Alert.test.tsx` — test default render, each severity variant, onDismiss callback fires on close click, and axe a11y assertion

**Badge** (variant: neutral, primary, secondary)

- [X] T009 [P] [US1] Create `src/components/core/Badge/Badge.tsx` — implement `BadgeProps`, default variant `neutral`, render as `<span>`
- [X] T010 [P] [US1] Create `src/components/core/Badge/Badge.css` — style 3 variants using color/background/text tokens; include small and default sizing
- [X] T011 [US1] Create `src/components/core/Badge/Badge.test.tsx` — test default render, each variant, and axe a11y assertion

**Spinner** (size: sm, md, lg)

- [X] T012 [P] [US1] Create `src/components/core/Spinner/Spinner.tsx` — implement `SpinnerProps` with size variants and accessible label (default "Loading"); use `role="status"` with visually-hidden label text
- [X] T013 [P] [US1] Create `src/components/core/Spinner/Spinner.css` — CSS rotation animation inside `@media (prefers-reduced-motion: no-preference)` per research R3; static fallback outside the media query; size tokens drive dimensions
- [X] T014 [US1] Create `src/components/core/Spinner/Spinner.test.tsx` — test default render, each size variant, accessible label present in DOM, and axe a11y assertion

**ProgressBar**

- [X] T015 [P] [US1] Create `src/components/core/ProgressBar/ProgressBar.tsx` — implement `ProgressBarProps` with value clamping per research R10 (Math.min/max), optional label, `role="progressbar"`, aria-valuenow/min/max attributes
- [X] T016 [P] [US1] Create `src/components/core/ProgressBar/ProgressBar.css` — track and fill styling using tokens; fill width driven by inline style percentage
- [X] T017 [US1] Create `src/components/core/ProgressBar/ProgressBar.test.tsx` — test default render, 0/50/100 values, out-of-range value clamping, and axe a11y assertion

**Barrel & Preview Integration**

- [X] T018 [US1] Update `src/components/index.ts` to export Alert, Badge, Spinner, ProgressBar components and their Props types
- [X] T019 [US1] Update `src/pages/PreviewPage.tsx` "Feedback & Status" section to render all 4 components with every variant/state combination

**Checkpoint**: US1 complete — 4 components live at `/preview`, all tests pass

---

## Phase 4: User Story 2 — Form Input Components (Priority: P2)

**Goal**: Input, Select, Textarea, FormField, Button components with full variant coverage; sample form renders in preview

**Independent Test**: Navigate to `/preview` form section; verify tab order, focus indicators, label/error associations; run `npm test` and confirm all US2 tests pass

### Implementation for User Story 2

**Input**

- [X] T020 [P] [US2] Create `src/components/core/Input/Input.tsx` — implement `InputProps` extending `InputHTMLAttributes`, with `invalid` prop setting aria-invalid and error styling
- [X] T021 [P] [US2] Create `src/components/core/Input/Input.css` — style default, focus-visible (token outline), disabled, and invalid states
- [X] T022 [US2] Create `src/components/core/Input/Input.test.tsx` — test default render, typing via user-event, invalid state sets aria-invalid, disabled state, and axe a11y assertion

**Select**

- [X] T023 [P] [US2] Create `src/components/core/Select/Select.tsx` — implement `SelectProps` wrapping native `<select>` per FR-015 and research R7
- [X] T024 [P] [US2] Create `src/components/core/Select/Select.css` — style default, focus-visible, disabled, invalid states using tokens
- [X] T025 [US2] Create `src/components/core/Select/Select.test.tsx` — test default render with child options, selection change via user-event, disabled state, and axe a11y assertion

**Textarea**

- [X] T026 [P] [US2] Create `src/components/core/Textarea/Textarea.tsx` — implement `TextareaProps` extending `TextareaHTMLAttributes` with `invalid` prop
- [X] T027 [P] [US2] Create `src/components/core/Textarea/Textarea.css` — style default, focus-visible, disabled, invalid states with vertical-resize
- [X] T028 [US2] Create `src/components/core/Textarea/Textarea.test.tsx` — test default render, typing, invalid/disabled states, and axe a11y assertion

**FormField** (render-prop wrapper)

- [X] T029 [P] [US2] Create `src/components/core/FormField/FormField.tsx` — implement `FormFieldProps` with `useId()` hook per research R5, generate unique field id and error/help ids, associate label via htmlFor, link error/help via aria-describedby; render-prop children signature `(ids) => ReactNode`
- [X] T030 [P] [US2] Create `src/components/core/FormField/FormField.css` — style label, field wrapper, help text, error text using tokens; error text uses error color token
- [X] T031 [US2] Create `src/components/core/FormField/FormField.test.tsx` — test label-for association by id, error text linked via aria-describedby, help text linked via aria-describedby when no error, and axe a11y assertion using FormField wrapping an Input

**Button** (uses Spinner from US1)

- [X] T032 [P] [US2] Create `src/components/core/Button/Button.tsx` — implement `ButtonProps` with variants primary/secondary/ghost, loading state per research R4 (internal Spinner, aria-busy, disabled, children visibility:hidden)
- [X] T033 [P] [US2] Create `src/components/core/Button/Button.css` — style 3 variants, disabled, loading (children visibility:hidden, spinner centered via position:absolute) using tokens
- [X] T034 [US2] Create `src/components/core/Button/Button.test.tsx` — test default render, each variant, disabled prevents onClick, loading state shows spinner and prevents onClick (user-event double-click test), and axe a11y assertion

**Barrel & Preview Integration**

- [X] T035 [US2] Update `src/components/index.ts` to export Input, Select, Textarea, FormField, Button components and their Props types
- [X] T036 [US2] Update `src/pages/PreviewPage.tsx` "Form Inputs" section to render a sample form combining FormField + Input, FormField + Select, FormField + Textarea, plus standalone Button variants (primary/secondary/ghost) in default/disabled/loading states

**Checkpoint**: US2 complete — form components live at `/preview`, all tests pass

---

## Phase 5: User Story 3 — Layout & Overlay Components (Priority: P3)

**Goal**: Card, Hero, Modal rendered in preview; Modal demonstrates focus trap and Escape-to-close

**Independent Test**: Open preview; click trigger to open Modal; verify focus traps inside, Escape closes, focus returns to trigger; run `npm test` and confirm all US3 tests pass

### Implementation for User Story 3

**Card** (heading slot, footer slot, children body)

- [X] T037 [P] [US3] Create `src/components/core/Card/Card.tsx` — implement `CardProps` rendered as `<article>`, optional heading and footer slots, body children; use named-props slot pattern per research R8
- [X] T038 [P] [US3] Create `src/components/core/Card/Card.css` — style card with surface token background, radius, shadow, padded sections for heading/body/footer
- [X] T039 [US3] Create `src/components/core/Card/Card.test.tsx` — test default render with children only, render with heading, render with footer, and axe a11y assertion

**Hero** (heading, optional subheading, optional action)

- [X] T040 [P] [US3] Create `src/components/core/Hero/Hero.tsx` — implement `HeroProps` rendered as `<section>`, required heading, optional subheading and action slots
- [X] T041 [P] [US3] Create `src/components/core/Hero/Hero.css` — style full-width hero with primary color background, text-on-primary heading color, padding tokens, action positioned below subheading
- [X] T042 [US3] Create `src/components/core/Hero/Hero.test.tsx` — test render with heading only, with subheading, with action slot, and axe a11y assertion

**Modal** (native `<dialog>`, focus trap, Escape to close)

- [X] T043 [P] [US3] Create `src/components/core/Modal/Modal.tsx` — implement `ModalProps` using native `<dialog>` per research R1; useEffect to call `showModal()` when `open=true` and `close()` otherwise; listen for close event to call onClose; handle `dismissible=false` by preventing Escape and backdrop dismissal; dev-mode `console.warn` if second modal opens per research R6
- [X] T044 [P] [US3] Create `src/components/core/Modal/Modal.css` — style dialog element (surface token background, radius, shadow), `::backdrop` pseudo-element with semi-transparent dark overlay, heading area; respect prefers-reduced-motion for any transitions
- [X] T045 [US3] Create `src/components/core/Modal/Modal.test.tsx` — test renders children when open, onClose fires on Escape (user-event keyboard), focus moves to dialog when opened, focus returns to trigger when closed, dismissible=false ignores Escape, and axe a11y assertion
- [X] T046 [US3] Add `dialog::backdrop` styles to `src/index.css` global stylesheet (backdrop is not scoped by component CSS)

**Barrel & Preview Integration**

- [X] T047 [US3] Update `src/components/index.ts` to export Card, Hero, Modal components and their Props types
- [X] T048 [US3] Update `src/pages/PreviewPage.tsx` "Layout & Overlays" section to render Card with heading+footer, Hero with full content, and a Modal-trigger Button that opens a Modal with sample content

**Checkpoint**: All 12 components live at `/preview`, all tests pass

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and regression prevention

- [X] T049 [P] Run `npm run lint` across all files and achieve zero warnings per constitution Development Workflow
- [X] T050 [P] Run `npm run format` to ensure consistent formatting across all new files
- [X] T051 Run `npm test` and confirm all component tests pass (12 components × ≥3 tests = 36+ passing assertions)
- [X] T052 Run `npm run build` and confirm production build succeeds with zero TypeScript errors
- [X] T053 Audit every new CSS file in `src/components/core/**/*.css` for hard-coded color/spacing/radius values — verify zero violations (SC-004)
- [X] T054 Run full quickstart.md validation — follow the "Using a Component" example and "Adding a New Core Component" steps to ensure docs match implementation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup
- **US1 (Phase 3)**: Depends on Foundational; MVP — blocks Button (in US2) which uses Spinner
- **US2 (Phase 4)**: Depends on US1 (Button imports Spinner)
- **US3 (Phase 5)**: Depends on US2 (PreviewPage uses Button as Modal trigger); layout components themselves are independent of US1/US2
- **Polish (Phase 6)**: Depends on US1 + US2 + US3 complete

### Within Each User Story

- All `*.tsx` + `*.css` tasks for a component are marked [P] (different files, no dependencies)
- Test tasks for a component come after that component's tsx + css exist
- Barrel and preview updates come last within a phase

### Parallel Opportunities

- **Phase 3**: T006+T007, T009+T010, T012+T013, T015+T016 can run in parallel (8 tasks across 4 components); tests T008, T011, T014, T017 can run in parallel after
- **Phase 4**: T020+T021, T023+T024, T026+T027, T029+T030, T032+T033 can run in parallel (10 tasks across 5 components); tests in parallel after
- **Phase 5**: T037+T038, T040+T041, T043+T044 parallel (6 tasks across 3 components); tests in parallel after
- **Phase 6**: T049+T050 parallel

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 1 + 2
2. Complete Phase 3: Alert, Badge, Spinner, ProgressBar
3. **STOP and VALIDATE**: Preview page shows Feedback & Status components; future features can depend on Spinner + Alert for loading/error UX
4. Demo

### Incremental Delivery

1. Setup + Foundational → Base
2. US1 (Feedback & Status) → Demo loading/alert patterns
3. US2 (Form Inputs) → Demo form patterns (uses Spinner from US1)
4. US3 (Layout & Overlays) → Demo Card list + Modal (uses Button from US2)
5. Polish → Final validation

### Parallel Team Strategy

With multiple developers after Foundational:
- Dev A: US1 components (parallel execution of T006–T017 in batches)
- Dev B: Starts US3 Card + Hero (T037–T042) — these don't depend on US1/US2
- Dev C: After US1 Spinner is merged, picks up US2 Button (T032–T034)

---

## Notes

- Every component's Props interface MUST match `contracts/props.ts` exactly
- Every test file MUST include a `vitest-axe` assertion per FR-007
- CSS audit (T053) is the gate for SC-004 (zero hard-coded values)
- Commit after each component (3 files) for atomic history
- Modal's `dialog::backdrop` styles live in global `src/index.css` (not scoped) since `::backdrop` cannot be reached from component styles
