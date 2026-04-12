# Data Model: Core Component Library

**Feature**: 002-core-components
**Date**: 2026-04-12

This feature has no data model in the classical sense — components
are purely presentational. Instead, this document captures the
**Props contract** for each component.

See [contracts/props.ts](contracts/props.ts) for the TypeScript
source of truth.

## Summary Table

| Component | Wraps HTML element | Required Props | Key State Props |
| --------- | ------------------ | -------------- | --------------- |
| Alert | `<div role>` | `severity`, `children` | — |
| Badge | `<span>` | `children` | `variant` |
| Button | `<button>` | `children` | `variant`, `loading`, `disabled` |
| Card | `<article>` | `children` | `heading?`, `footer?` |
| FormField | `<div>` | `label`, `children` (render prop) | `error?`, `help?` |
| Hero | `<section>` | `heading` | `subheading?`, `action?` |
| Input | `<input>` | — (all optional) | `type`, `disabled`, `invalid` |
| Modal | `<dialog>` | `open`, `onClose`, `children` | `heading?`, `dismissible` |
| ProgressBar | `<div role="progressbar">` | `value` | `max`, `label?` |
| Select | `<select>` | `children` (options) | `disabled`, `invalid` |
| Spinner | `<span role="status">` | — (all optional) | `label`, `size` |
| Textarea | `<textarea>` | — (all optional) | `disabled`, `invalid`, `rows` |

## Variant Enums

```ts
type AlertSeverity = 'info' | 'success' | 'warning' | 'error'
type BadgeVariant = 'neutral' | 'primary' | 'secondary'
type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type SpinnerSize = 'sm' | 'md' | 'lg'
```

## State Transitions

### Modal

```text
closed  ──(open=true)──► opening ──(next tick)──► open
open    ──(Escape / onClose / backdrop click)──► closing ──► closed
```

Invariant: only one modal may be `open` at a time (dev `console.warn` if violated).

### Button

```text
idle ──(loading=true)──► loading (disabled, spinner visible, aria-busy)
loading ──(loading=false)──► idle
```

### ProgressBar

```text
value ──(clamp to [0, max])──► rendered value
out-of-range value ──(clamp + console.warn in dev)──► valid render
```

## Validation Rules

- **Alert.severity**: must be one of the enum values (TS enforced).
- **Button.loading** + `onClick`: when loading, `onClick` MUST NOT
  fire (handled by `disabled`).
- **FormField**: MUST produce a stable `id` via `useId()` and pass
  it to its rendered input; error text MUST be linked via
  `aria-describedby`.
- **Modal.open = true**: invalid if another Modal is already open
  (warn in dev).
- **ProgressBar.value**: clamped to `[0, max]`. `max` defaults to 100.
- **Select.children**: MUST be `<option>` or `<optgroup>` elements.

## Relationships

```text
FormField ──wraps──► Input | Select | Textarea
Button   ──may contain──► Spinner (when loading)
Modal    ──may contain──► any core component (opaque container)
Card     ──may contain──► any core component
Hero     ──may contain──► Button (as action slot)
```

No data persistence. No cross-component shared state.
