# Quickstart: Core Component Library

**Feature**: 002-core-components

## Using a Component

All 12 core components are exported from the barrel
`src/components/index.ts`:

```tsx
import { Alert, Button, Card, Spinner } from '../components'

function MyPage() {
  return (
    <Card heading={<h2>Pokémon</h2>}>
      <Alert severity="info">Loading Pokémon data…</Alert>
      <Spinner label="Fetching Pokédex" />
      <Button variant="primary" onClick={handleRefresh}>
        Refresh
      </Button>
    </Card>
  )
}
```

## Component Reference

### Feedback & Status

- **Alert** — `severity`, `title?`, `onDismiss?`. Variants: info, success, warning, error.
- **Badge** — inline label with `variant`: neutral, primary, secondary.
- **Spinner** — accessible loading indicator with `size` and `label`.
- **ProgressBar** — `value` (clamped to 0–`max`), `label?`.

### Form Inputs

- **Button** — `variant`: primary, secondary, ghost. `loading` state shows Spinner and disables clicks.
- **Input** — wraps `<input>`. `invalid` prop sets error styling.
- **Select** — wraps native `<select>`. Children are `<option>` elements.
- **Textarea** — wraps `<textarea>`.
- **FormField** — render-prop wrapper providing `id` and `aria-describedby` for labeled, error-aware form fields:
  ```tsx
  <FormField label="Name" error={errors.name}>
    {(ids) => <Input {...ids} value={name} onChange={e => setName(e.target.value)} />}
  </FormField>
  ```

### Layout & Overlays

- **Card** — `heading?`, `footer?`, `children`. Rendered as `<article>`.
- **Hero** — `heading`, `subheading?`, `action?`. Full-width section.
- **Modal** — uses native `<dialog>`. `open`, `onClose`, `heading?`, `dismissible`.
  Only one Modal may be open at a time.

## Adding a New Core Component

1. Create directory `src/components/core/MyComponent/`
2. Add files:
   - `MyComponent.tsx` — accepts `MyComponentProps`, extends native HTML attrs
   - `MyComponent.css` — uses only `var(--token-*)` references
   - `MyComponent.test.tsx` — default render + variants + one interaction + `vitest-axe`
3. Export both component and Props from `src/components/index.ts`:
   ```ts
   export { MyComponent } from './core/MyComponent/MyComponent'
   export type { MyComponentProps } from './core/MyComponent/MyComponent'
   ```
4. Add a section to `src/pages/PreviewPage.tsx` rendering all variants

## Validation Commands

```bash
npm test         # Run all component tests
npm run lint     # Enforce zero warnings
npm run dev      # Visit /preview to see every variant
npm run build    # Production build
```

## Style Rules

- **No hard-coded visuals**: only `var(--color-*)`, `var(--spacing-*)`, `var(--radius-*)`, `var(--shadow-*)`, `var(--font-*)`.
- **Class name composition**: array + filter Boolean pattern, not string concatenation.
- **Reduced motion**: wrap all animations in `@media (prefers-reduced-motion: no-preference)`.
- **Focus indicators**: rely on `:focus-visible` with token-based outline.
