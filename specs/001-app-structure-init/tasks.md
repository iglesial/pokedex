# Tasks: Application Structure Initialization

**Input**: Design documents from `/specs/001-app-structure-init/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Included — constitution Principle III mandates colocated tests for all user-facing components.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- Tests colocated with components per constitution Principle I

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Scaffold the Vite React-TS project and install all dependencies

- [X] T001 Scaffold project with `npm create vite@latest . -- --template react-ts` in repository root
- [X] T002 Create all required directories under `src/`: `components/core/`, `pages/`, `services/`, `hooks/`, `contexts/`, `types/`, `utils/`, `config/`, `test/`
- [X] T003 [P] Install and configure ESLint with `@eslint/js`, `typescript-eslint` strict preset, `eslint-plugin-react-hooks`, and `eslint-plugin-jsx-a11y` in `eslint.config.js`
- [X] T004 [P] Install and configure Prettier with default settings in `.prettierrc`
- [X] T005 [P] Install and configure Vitest with `@testing-library/react`, `@testing-library/jest-dom`, `vitest-axe`, and `jsdom` environment in `vite.config.ts`

**Checkpoint**: Project compiles with `npm run dev`, lint/format/test scripts available

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**WARNING**: No user story work can begin until this phase is complete

- [X] T006 Define 26 CSS design tokens (classic Pokédex red/white theme) as custom properties in `:root` of `src/index.css` — colors (8), spacing (5), radius (4), shadows (2), typography (7) per research.md R3
- [X] T007 [P] Create comprehensive PokéAPI TypeScript type definitions matching `/pokemon/{id}` response shape in `src/types/pokemon.ts` — all 18+ interfaces from data-model.md (Pokemon, PokemonAbility, PokemonType, PokemonStat, PokemonSprites, etc.)
- [X] T008 [P] Create empty barrel export file at `src/components/index.ts` with placeholder comment
- [X] T009 [P] Create Vitest global test setup with Testing Library matchers in `src/test/setup.ts`
- [X] T010 Install `react-router-dom` and create route configuration with `createBrowserRouter` in `src/config/routes.tsx` — root route `/` pointing to HomePage, `/preview` route guarded by `import.meta.env.DEV`
- [X] T011 Wire `App.tsx` with `RouterProvider` using the router from `src/config/routes.tsx`
- [X] T012 Update `src/main.tsx` entry point to render App component with StrictMode

**Checkpoint**: Foundation ready — `npm run dev` serves app with routing, design tokens loaded, types available

---

## Phase 3: User Story 1 — Scaffold Project Foundation (Priority: P1) MVP

**Goal**: Landing page renders with Pokedex heading, all directories exist, dev server starts cleanly

**Independent Test**: Run `npm run dev`, open browser to `http://localhost:5173`, verify Pokedex heading and placeholder message render with zero console errors

### Implementation for User Story 1

- [X] T013 [P] [US1] Create `HomePage.tsx` in `src/pages/` — render semantic HTML with `<h1>Pokedex</h1>` heading and welcome placeholder message
- [X] T014 [P] [US1] Create `HomePage.css` in `src/pages/` — style landing page using only design token CSS variables (`var(--color-primary)`, `var(--spacing-md)`, etc.), no hard-coded values
- [X] T015 [US1] Create `HomePage.test.tsx` in `src/pages/` — test default render (heading present), semantic structure, and that component renders without errors (constitution Principle III)

**Checkpoint**: User Story 1 fully functional — landing page loads at `/` with Pokedex heading, styled with design tokens, test passes

---

## Phase 4: User Story 2 — Design Token Foundation (Priority: P2)

**Goal**: All visual styling goes through design tokens; changing a token value updates the UI; WCAG 2.1 AA contrast verified

**Independent Test**: Modify a token value in `src/index.css`, refresh browser, confirm visual change propagates to the landing page

### Implementation for User Story 2

- [X] T016 [US2] Refactor `HomePage.css` in `src/pages/` to replace any remaining hard-coded color, spacing, or radius values with `var(--token-name)` references per constitution Principle II
- [X] T017 [US2] Add WCAG 2.1 AA contrast verification comment block in `src/index.css` documenting verified ratios (text on background ≥ 4.5:1, text-on-primary on primary ≥ 4.5:1) and add `vitest-axe` a11y assertion to `HomePage.test.tsx` in `src/pages/`

**Checkpoint**: User Story 2 complete — all styles use tokens exclusively, contrast ratios verified for AA compliance

---

## Phase 5: User Story 3 — Developer Preview Route (Priority: P3)

**Goal**: `/preview` route available in dev mode showing component gallery placeholder, excluded from production builds

**Independent Test**: Navigate to `http://localhost:5173/preview` and see "Component Preview" heading; run `npm run build` and verify `/preview` is not in the production bundle

### Implementation for User Story 3

- [X] T018 [P] [US3] Create `PreviewPage.tsx` in `src/pages/` — render "Component Preview" heading and message indicating no components have been added yet; import and display components from `src/components/index.ts` barrel
- [X] T019 [P] [US3] Create `PreviewPage.css` in `src/pages/` — style preview gallery layout using design tokens
- [X] T020 [US3] Verify `/preview` route guard in `src/config/routes.tsx` — confirm `import.meta.env.DEV` conditional excludes route from production router
- [X] T021 [US3] Create `PreviewPage.test.tsx` in `src/pages/` — test that preview page renders heading and empty gallery message (constitution Principle III)

**Checkpoint**: All user stories independently functional — landing page, design tokens, and preview route all working

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all user stories

- [X] T022 [P] Run ESLint across all files and resolve any warnings to achieve zero-warning lint pass per constitution Development Workflow
- [X] T023 [P] Run Prettier across all files to enforce consistent formatting
- [X] T024 Run full Vitest suite (`npm test`) and confirm all tests pass
- [X] T025 Build for production (`npm run build`) and verify `/preview` route is excluded from `dist/` output
- [X] T026 Run quickstart.md validation — follow setup instructions from scratch and verify all steps succeed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed sequentially in priority order (P1 → P2 → P3)
  - US2 depends on US1 (audits HomePage styles created in US1)
  - US3 is independent of US1 and US2
- **Polish (Phase 6)**: Depends on all user stories being complete

### Within Each User Story

- CSS and TSX files marked [P] can be created in parallel
- Tests depend on the component they test
- Story complete before moving to next priority

### Parallel Opportunities

- T003, T004, T005 can all run in parallel (different config files)
- T007, T008, T009 can all run in parallel (different files, no deps)
- T013, T014 can run in parallel (component + styles)
- T018, T019 can run in parallel (component + styles)
- T022, T023 can run in parallel (lint + format)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Verify landing page renders with tokens applied
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Demo (MVP!)
3. Add User Story 2 → Audit tokens, verify a11y → Demo
4. Add User Story 3 → Test preview route → Demo
5. Polish → Final validation pass

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Test tasks included per constitution Principle III (colocated tests mandatory)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
