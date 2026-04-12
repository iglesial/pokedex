<!--
  Sync Impact Report
  Version change: 0.0.0 → 1.0.0 (MAJOR: initial constitution)
  Modified principles: N/A (first version)
  Added sections:
    - Core Principles (5 principles)
    - Technology Stack
    - Development Workflow
    - Governance
  Removed sections: N/A
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ aligned (Constitution Check generic)
    - .specify/templates/spec-template.md ✅ aligned (no constitution-specific refs)
    - .specify/templates/tasks-template.md ✅ aligned (phase structure compatible)
  Follow-up TODOs: none
-->

# Pokedex Constitution

## Core Principles

### I. Component-First Architecture

All UI features MUST be built as self-contained, reusable components
inside `src/components/core/`.

- Each component MUST colocate its source file, CSS module, and test
  file in the same directory.
- Every core component and its Props type MUST be exported from the
  barrel file `src/components/index.ts`.
- Props interfaces MUST extend native HTML element attributes when the
  component wraps a single HTML element.
- No component may depend on app-level state or routing; pass data
  via props or context only.

**Rationale**: Colocation reduces cognitive overhead and makes each
component independently portable and testable.

### II. Design Token System

All visual styling MUST go through CSS custom properties defined in
`src/index.css`.

- Color, spacing, shadow, border-radius, and typography tokens MUST
  be declared as CSS custom properties.
- Component CSS MUST reference tokens via `var(--token-name)` — hard-
  coded color or spacing values are forbidden.
- A dev-only `/preview` route MUST render every core component with
  all variant combinations to verify token usage.

**Rationale**: A single source of truth for design tokens ensures
visual consistency and simplifies future theming or dark-mode work.

### III. Test-Driven Quality

Every user-facing component and utility MUST have colocated tests
written with Vitest and Testing Library.

- Test files MUST follow the naming convention
  `<Component>.test.tsx` or `<util>.test.ts`.
- Tests MUST cover the default render, each visual variant, and at
  least one interaction (click, keyboard) where applicable.
- The test suite MUST pass (`npm test`) before any code is merged.

**Rationale**: Colocated tests make it easy to keep coverage in sync
with component evolution and catch regressions early.

### IV. Type Safety

TypeScript strict mode MUST be enabled project-wide.

- All component props, service return types, and API response shapes
  MUST be explicitly typed — no `any` escape hatches.
- Shared types MUST live in `src/types/` and be imported from there.
- Generic utility types are preferred over type assertions.

**Rationale**: Strict typing catches a large class of bugs at compile
time and serves as living documentation for data shapes.

### V. Simplicity & YAGNI

Start with the simplest implementation that satisfies the current
requirement.

- No abstraction MUST be introduced until it is needed in at least
  two concrete places.
- External dependencies MUST be justified — prefer platform APIs and
  small, focused libraries over large frameworks.
- Code that is not required by any current user story MUST NOT be
  added speculatively.

**Rationale**: Premature abstraction and unused code increase
maintenance burden and obscure intent.

## Technology Stack

- **Framework**: React 18+ with Vite and the `react-ts` template.
- **Language**: TypeScript in strict mode.
- **Styling**: Plain CSS with custom properties (no CSS-in-JS).
- **Testing**: Vitest + React Testing Library.
- **Data Source**: PokéAPI (`pokeapi.co`) as the sole external API.
- **Directory layout**: `src/` organized by responsibility —
  `components/`, `pages/`, `services/`, `hooks/`, `contexts/`,
  `types/`, `utils/`, `config/`, `test/`.
- **Package manager**: npm.
- **Scaffolding**: `npm create vite@latest <name> -- --template react-ts`.

## Development Workflow

- **Branching**: One feature branch per spec, numbered sequentially.
- **Commits**: Atomic commits tied to a single task or logical change.
- **Code review**: All changes MUST be reviewed against this
  constitution before merge.
- **Lint & format**: ESLint and Prettier MUST be configured; CI MUST
  enforce zero warnings.
- **Preview route**: The `/preview` route MUST be kept up to date
  whenever a core component is added or modified.

## Governance

This constitution is the highest-authority document for the Pokedex
project. All implementation decisions, code reviews, and plan
approvals MUST comply with the principles above.

- **Amendments** require: (1) a written proposal describing the
  change and its rationale, (2) an update to this file with a
  version bump, and (3) a propagation check across all `.specify/`
  templates.
- **Versioning** follows Semantic Versioning — MAJOR for principle
  removal or redefinition, MINOR for new principles or material
  expansions, PATCH for wording clarifications.
- **Compliance review**: Every plan produced by `/speckit-plan` MUST
  include a Constitution Check section that verifies alignment with
  all five principles.

**Version**: 1.0.0 | **Ratified**: 2026-04-12 | **Last Amended**: 2026-04-12
