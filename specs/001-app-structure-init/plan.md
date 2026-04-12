# Implementation Plan: Application Structure Initialization

**Branch**: `001-app-structure-init` | **Date**: 2026-04-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-app-structure-init/spec.md`

## Summary

Scaffold the Pokedex React application from scratch using Vite with
the `react-ts` template. Establish the full directory layout defined
in the constitution, configure design tokens following the classic
Pokédex red/white theme, create comprehensive PokéAPI TypeScript
types, set up linting/formatting tooling, and provide a dev-only
`/preview` route for component development.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: React 18+, React Router DOM 6+, Vite 5+
**Storage**: N/A (no persistence in this feature)
**Testing**: Vitest + @testing-library/react + @testing-library/jest-dom
**Target Platform**: Modern evergreen browsers (Chrome, Firefox, Safari, Edge — latest 2 versions)
**Project Type**: Single-page web application
**Performance Goals**: Dev server starts in under 5 seconds; landing page loads in under 1 second
**Constraints**: WCAG 2.1 AA compliance; no CSS-in-JS; no `any` types
**Scale/Scope**: Single developer; ~10 directories; ~20 initial files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| I | Component-First Architecture | ✅ PASS | `src/components/core/` created; barrel `src/components/index.ts` established; no app-level state deps in scaffold components |
| II | Design Token System | ✅ PASS | CSS custom properties in `src/index.css` with Pokédex red/white palette; `/preview` route included (US3) |
| III | Test-Driven Quality | ✅ PASS | Vitest + Testing Library configured; colocated test files planned for landing page component |
| IV | Type Safety | ✅ PASS | TypeScript strict mode; comprehensive PokéAPI types in `src/types/`; no `any` |
| V | Simplicity & YAGNI | ✅ PASS | Only directories and files required by the constitution and spec are created; no speculative features |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-app-structure-init/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── core/            # Reusable UI components (colocated with CSS + tests)
│   └── index.ts         # Barrel re-exports for core components
├── pages/
│   ├── HomePage.tsx      # Landing page with Pokedex heading
│   ├── HomePage.css
│   ├── PreviewPage.tsx   # Dev-only component preview gallery
│   └── PreviewPage.css
├── services/            # API service layer (empty for now)
├── hooks/               # Custom React hooks (empty for now)
├── contexts/            # React context providers (empty for now)
├── types/
│   └── pokemon.ts       # Comprehensive PokéAPI type definitions
├── utils/               # Utility functions (empty for now)
├── config/
│   └── routes.tsx       # Route definitions with dev-only preview
├── test/
│   └── setup.ts         # Vitest global test setup
├── App.tsx              # Root app with router
├── App.css              # App-level styles
├── index.css            # Global styles + design tokens
└── main.tsx             # Entry point
```

**Structure Decision**: Single project layout per constitution.
All source under `src/` organized by responsibility. Tests are
colocated with components per Principle I rather than in a
separate `tests/` tree.

## Complexity Tracking

No constitution violations. Table not applicable.
