# Quickstart: Pokedex Application

**Feature**: 001-app-structure-init

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+

## Setup

```bash
# Clone the repository
git clone <repo-url> pokedex
cd pokedex

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

## Verify Setup

1. Open `http://localhost:5173` — you should see the Pokedex landing
   page with a red header and "Pokedex" heading.
2. Open `http://localhost:5173/preview` — you should see the
   "Component Preview" page (dev only).
3. Run the test suite:
   ```bash
   npm test
   ```
4. Run the linter:
   ```bash
   npm run lint
   ```
5. Build for production:
   ```bash
   npm run build
   ```
   Verify that `/preview` is not accessible when serving the
   production build.

## Available Scripts

| Script          | Command             | Description                      |
| --------------- | ------------------- | -------------------------------- |
| `dev`           | `npm run dev`       | Start Vite dev server with HMR   |
| `build`         | `npm run build`     | Production build to `dist/`      |
| `preview`       | `npm run preview`   | Serve production build locally   |
| `test`          | `npm test`          | Run Vitest test suite            |
| `test:watch`    | `npm run test:watch`| Run Vitest in watch mode         |
| `lint`          | `npm run lint`      | Run ESLint                       |
| `format`        | `npm run format`    | Run Prettier                     |

## Project Structure

```text
src/
├── components/
│   ├── core/          # Reusable UI components
│   └── index.ts       # Barrel exports
├── pages/             # Route-level page components
├── services/          # API service layer
├── hooks/             # Custom React hooks
├── contexts/          # React context providers
├── types/             # TypeScript type definitions
│   └── pokemon.ts     # PokéAPI types
├── utils/             # Utility functions
├── config/            # App configuration
│   └── routes.tsx     # Route definitions
├── test/              # Test setup and helpers
│   └── setup.ts       # Vitest global setup
├── App.tsx            # Root component with router
├── index.css          # Global styles + design tokens
└── main.tsx           # Entry point
```

## Design Tokens

All styling uses CSS custom properties defined in `src/index.css`.
To customize the theme, modify the token values in `:root`:

```css
:root {
  --color-primary: #DC0A2D;    /* Pokédex red */
  --color-background: #F5F5F5; /* Light gray */
  --color-text: #1A1A2E;       /* Near black */
  --spacing-md: 1rem;          /* 16px base */
  /* ... see src/index.css for full list */
}
```

Never hard-code color or spacing values in component CSS — always
reference tokens via `var(--token-name)`.

## Adding a New Component

1. Create directory: `src/components/core/MyComponent/`
2. Add files:
   - `MyComponent.tsx` — component source
   - `MyComponent.css` — component styles (using tokens)
   - `MyComponent.test.tsx` — colocated tests
3. Export from `src/components/index.ts`
4. Add to the `/preview` page for visual verification
