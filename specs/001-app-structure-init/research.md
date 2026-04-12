# Research: Application Structure Initialization

**Feature**: 001-app-structure-init
**Date**: 2026-04-12

## R1: Vite + React + TypeScript Scaffolding

**Decision**: Use `npm create vite@latest . -- --template react-ts`
to scaffold the base project, then customize the generated structure.

**Rationale**: Vite's official React-TS template provides TypeScript
strict mode, fast HMR, and ESBuild-powered dev server out of the box.
It is the constitution-mandated scaffolding approach.

**Alternatives considered**:
- Create React App: Deprecated, slow, no longer maintained.
- Next.js: Server-side rendering not required; adds unnecessary
  complexity for a client-only SPA.
- Manual webpack setup: Excessive boilerplate for no added benefit.

## R2: Routing Strategy

**Decision**: React Router DOM v6+ with `createBrowserRouter` for
route definitions.

**Rationale**: React Router is the de facto standard for React SPAs.
v6 supports lazy loading and data loaders, enabling future route-level
code splitting. The `/preview` route can be conditionally excluded
from production via `import.meta.env.DEV`.

**Alternatives considered**:
- TanStack Router: Type-safe but adds learning curve; not justified
  per Principle V (Simplicity) for an initial scaffold.
- Wouter: Lighter weight but fewer features for future needs.

## R3: Design Token Palette (Classic Pokédex)

**Decision**: Define CSS custom properties inspired by the classic
red Pokédex device.

**Rationale**: Clarification session confirmed classic red/white theme.
WCAG 2.1 AA requires minimum 4.5:1 contrast ratio for normal text.

**Token values** (verified for AA contrast):
- `--color-primary`: `#DC0A2D` (Pokédex red)
- `--color-primary-dark`: `#A00020` (hover/active red)
- `--color-secondary`: `#30A7D7` (Pokéball blue accent)
- `--color-background`: `#F5F5F5` (light gray)
- `--color-surface`: `#FFFFFF` (card/panel white)
- `--color-text`: `#1A1A2E` (near-black, 12.6:1 on white)
- `--color-text-light`: `#6B7280` (gray-500, 4.6:1 on white)
- `--color-text-on-primary`: `#FFFFFF` (white on red, 4.5:1)
- `--spacing-xs`: `0.25rem` (4px)
- `--spacing-sm`: `0.5rem` (8px)
- `--spacing-md`: `1rem` (16px)
- `--spacing-lg`: `1.5rem` (24px)
- `--spacing-xl`: `2rem` (32px)
- `--radius-sm`: `0.25rem` (4px)
- `--radius-md`: `0.5rem` (8px)
- `--radius-lg`: `1rem` (16px)
- `--radius-full`: `9999px` (pill)
- `--shadow-sm`: `0 1px 2px rgba(0,0,0,0.05)`
- `--shadow-md`: `0 4px 6px rgba(0,0,0,0.1)`
- `--font-family`: `Inter, system-ui, -apple-system, sans-serif`
- `--font-size-sm`: `0.875rem`
- `--font-size-base`: `1rem`
- `--font-size-lg`: `1.25rem`
- `--font-size-xl`: `1.5rem`
- `--font-size-2xl`: `2rem`

**Alternatives considered**:
- Tailwind CSS: Constitution mandates plain CSS with custom properties.
- CSS Modules with JS tokens: Adds build complexity; raw CSS vars
  are simpler and more portable.

## R4: ESLint + Prettier Configuration

**Decision**: ESLint with `@eslint/js` recommended rules,
`typescript-eslint` strict preset, `eslint-plugin-react-hooks`, and
`eslint-plugin-jsx-a11y` for accessibility. Prettier for formatting.

**Rationale**: Constitution requires zero-warning linting and WCAG
2.1 AA compliance. `jsx-a11y` catches common accessibility issues
at lint time.

**Alternatives considered**:
- Biome: Faster but less ecosystem support for React-specific and
  a11y rules.
- Standard/Airbnb configs: Opinionated presets that conflict with
  Prettier defaults.

## R5: Testing Setup

**Decision**: Vitest with `@testing-library/react`,
`@testing-library/jest-dom`, and `jsdom` environment.

**Rationale**: Constitution mandates Vitest + Testing Library. jsdom
is the standard browser environment for component testing.

**Alternatives considered**:
- Jest: Slower, requires separate TS transform configuration.
- happy-dom: Faster than jsdom but less complete DOM implementation;
  risk of false negatives.

## R6: PokéAPI Type Definitions

**Decision**: Create comprehensive TypeScript interfaces matching the
PokéAPI `/pokemon/{id}` response shape in `src/types/pokemon.ts`.

**Rationale**: Clarification session confirmed full PokéAPI schema
from day one. Types are forward-looking — no data fetching in this
feature but future features will import these types directly.

**Alternatives considered**:
- pokeapi-typescript package: External dependency; violates
  Principle V unless justified. Hand-written types are simple and
  require no dependency.
- Partial types expanded later: Clarification explicitly chose
  comprehensive types to avoid rework.

## R7: Preview Route Exclusion in Production

**Decision**: Guard the `/preview` route with `import.meta.env.DEV`
conditional in the route configuration. Vite tree-shakes dead code
behind `import.meta.env` checks during production builds.

**Rationale**: No runtime cost in production. The preview page
component and its imports are excluded from the production bundle
entirely.

**Alternatives considered**:
- Separate entry point: Over-engineered for a single route.
- Environment variable flag: `import.meta.env.DEV` is already
  built-in; no custom variable needed.
