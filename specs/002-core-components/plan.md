# Implementation Plan: Core Component Library

**Branch**: `002-core-components` | **Date**: 2026-04-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-core-components/spec.md`

## Summary

Implement 12 presentational React core components in
`src/components/core/`: Alert, Badge, Button, Card, FormField, Hero,
Input, Modal, ProgressBar, Select, Spinner, Textarea. Each component
is colocated with its CSS and tests, exported from the barrel
`src/components/index.ts`, rendered in `/preview`, and validated with
`vitest-axe` for WCAG 2.1 AA compliance.

## Technical Context

**Language/Version**: TypeScript 5.6 (strict mode)
**Primary Dependencies**: React 19, existing design-token CSS
**Storage**: N/A
**Testing**: Vitest + @testing-library/react + @testing-library/user-event + vitest-axe
**Target Platform**: Modern evergreen browsers (Chrome, Firefox, Safari, Edge — latest 2 versions)
**Project Type**: React component library (purely presentational)
**Performance Goals**: Component render time < 16ms (60fps budget); Modal open/close < 100ms perceived
**Constraints**: WCAG 2.1 AA; no CSS-in-JS; no `any` types; design tokens only; respects `prefers-reduced-motion`
**Scale/Scope**: 12 components × 3 files (tsx, css, test) = 36 files; ~36 test cases minimum

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| I | Component-First Architecture | ✅ PASS | Every component in its own `src/components/core/<Name>/` directory with colocated source/CSS/test; all exported via `src/components/index.ts`; no app-state or routing dependencies (FR-001, FR-002, FR-003) |
| II | Design Token System | ✅ PASS | All CSS references `var(--token-name)` exclusively; no hard-coded values (FR-004, SC-004) |
| III | Test-Driven Quality | ✅ PASS | Colocated `*.test.tsx` for every component; default-render + variant + interaction tests; `vitest-axe` a11y assertions (FR-006, FR-007, SC-002, SC-003) |
| IV | Type Safety | ✅ PASS | Strict mode; Props interfaces extend native HTML attributes; no `any` (FR-003) |
| V | Simplicity & YAGNI | ✅ PASS | Native HTML elements only (no custom combobox, no rich-text widget); Pokémon type colors deferred; no speculative variants (FR-015, Assumptions) |

All gates pass. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/002-core-components/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output — Props contracts per component
├── quickstart.md        # Phase 1 output — how to use and extend components
├── contracts/           # Phase 1 output — Props interface definitions
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/components/
├── core/
│   ├── Alert/
│   │   ├── Alert.tsx
│   │   ├── Alert.css
│   │   └── Alert.test.tsx
│   ├── Badge/           # Same pattern
│   ├── Button/
│   ├── Card/
│   ├── FormField/
│   ├── Hero/
│   ├── Input/
│   ├── Modal/
│   ├── ProgressBar/
│   ├── Select/
│   ├── Spinner/
│   └── Textarea/
└── index.ts             # Barrel exports — 12 components + 12 Props types

src/pages/
└── PreviewPage.tsx      # Updated to import and render every variant
```

**Structure Decision**: One directory per component under
`src/components/core/`, colocated with CSS and tests per
constitution Principle I. Barrel `src/components/index.ts`
re-exports everything.

## Complexity Tracking

No constitution violations. Table not applicable.
