# Research: Core Component Library

**Feature**: 002-core-components
**Date**: 2026-04-12

## R1: Modal Focus Management

**Decision**: Implement focus trap and return manually using native
`<dialog>` element with `showModal()` and `close()` methods.

**Rationale**: The native HTML `<dialog>` element provides:
- Built-in focus trap via browser (since 2022 in all evergreen browsers)
- Built-in Escape-to-close
- Accessible role automatically applied
- Backdrop styleable via `::backdrop` pseudo-element

Saves us from implementing a focus-trap library (YAGNI, Principle V)
and from re-inventing ARIA attributes.

**Alternatives considered**:
- `focus-trap-react` library: Adds a dependency for behavior already
  built into browsers.
- Headless UI / Radix Dialog: Heavy dependencies for a single
  Modal component.
- Custom div + ARIA: Requires reimplementing focus management,
  backdrop rendering, and Escape handling.

## R2: Class Name Composition

**Decision**: Use the `clsx` library pattern inline (array-filtered
by Boolean) — per the Packmind React standard:

```tsx
const className = ['alert', `alert--${variant}`, disabled && 'alert--disabled']
  .filter(Boolean)
  .join(' ')
```

**Rationale**: The project standard (Packmind's React core component
architecture) explicitly prohibits string concatenation and requires
array-filter pattern. No external dependency needed.

**Alternatives considered**:
- `clsx`/`classnames` package: Extra dependency for a trivial pattern.
- Template strings with ternaries: Harder to read, mixes falsy
  behavior.

## R3: Spinner Animation & Reduced Motion

**Decision**: Use CSS `@keyframes` rotation on an SVG. Wrap the
animation in `@media (prefers-reduced-motion: no-preference)` so
that users with reduced-motion settings see a static spinner
(still with accessible loading label).

**Rationale**: WCAG 2.1 SC 2.3.3 requires respecting user motion
preferences. Static fallback preserves loading semantics without
movement.

**Alternatives considered**:
- Pure CSS border-spin: Fewer options for styling; still requires
  reduced-motion handling.
- Replace with progress bar: Different semantic meaning.

## R4: Button Loading State

**Decision**: Button in `loading` state renders an internal Spinner
alongside its children (children hidden via CSS `visibility: hidden`
to preserve button width), sets `aria-busy="true"`, and sets
`disabled` to prevent duplicate submissions.

**Rationale**: Preserving button width avoids layout shift. Hiding
children via visibility (not display) keeps the button's rendered
width consistent. `aria-busy` communicates state to assistive tech.

**Alternatives considered**:
- Replace children with spinner: Causes layout shift.
- Just add spinner without disabling: Allows accidental double-clicks
  (edge case in spec).

## R5: FormField Label/Error Association

**Decision**: FormField generates a unique ID using React's `useId()`
hook, passes it to the wrapped input via React children cloning OR
render-prop pattern, and associates label via `htmlFor` and error
text via `aria-describedby`.

**Rationale**: `useId()` produces stable server-safe IDs without
collision. Automatic association means consumers don't have to
manually wire up a11y.

**Alternatives considered**:
- Require consumer to pass `id` prop: Foot-gun — easy to forget.
- `React.cloneElement`: Fragile with multi-element children.
- Render prop (`children({id, describedby})`): Slightly more verbose
  at call site but explicit — **chosen** for clarity.

## R6: Modal Stacking

**Decision**: Only one Modal open at a time. Document explicitly in
Modal's JSDoc and fail fast in dev via `console.warn` if a second
Modal attempts to open.

**Rationale**: Stacked modals are a UX anti-pattern and add
complexity. The spec's edge case explicitly allows "only one modal
at a time" as a valid choice per Principle V (Simplicity).

**Alternatives considered**:
- Support stacking: Significant complexity (z-index management,
  focus-trap coordination, Escape routing) with unclear real-world
  need.

## R7: Select vs. Custom Combobox

**Decision**: Wrap native `<select>` element. No custom rendering of
options.

**Rationale**: FR-015 explicitly requires native `<select>`. Native
element provides platform-correct keyboard, screen reader, and
mobile picker behavior for free. Custom combobox is a significant
a11y project in its own right.

**Alternatives considered**:
- Custom combobox (Radix/Reach UI): Out of scope; can be added
  later as a `Combobox` component if/when design requires
  customization beyond what native select allows.

## R8: Card/Hero Slot Pattern

**Decision**: Use named props for slots rather than magic children:

```tsx
<Card
  heading={<h2>Title</h2>}
  footer={<Button>Action</Button>}
>
  Body content
</Card>
```

**Rationale**: Explicit props are more discoverable in TypeScript
than relying on children ordering or sub-components. Simpler than
implementing `Card.Heading`/`Card.Footer` sub-component pattern.

**Alternatives considered**:
- Sub-components (`Card.Heading`): Adds boilerplate; harder to type
  correctly; YAGNI for current use cases.
- Plain children only: Forces consumers to re-implement layout
  inside every Card usage.

## R9: Badge Variants Scope

**Decision**: Ship Badge with 3 neutral variants — `neutral`,
`primary`, `secondary`. Pokémon type-specific colors (Fire, Water,
Grass, etc.) are deferred to the feature that introduces type
filtering.

**Rationale**: Premature to build 18 type colors before knowing the
exact usage context. YAGNI per Principle V; confirmed in spec
Assumptions.

**Alternatives considered**:
- Build all 18 type colors now: Violates YAGNI; type palette should
  be designed alongside real usage.

## R10: ProgressBar Value Clamping

**Decision**: ProgressBar accepts `value` (0–100) and `max` props.
Values outside the 0–max range are clamped via `Math.min(Math.max(value, 0), max)`.

**Rationale**: Defensive; prevents broken visuals when consumers
pass unvalidated data. Log a `console.warn` in dev mode for
out-of-range values to surface bugs.

**Alternatives considered**:
- Throw on invalid value: Too aggressive for a display component.
- Allow overflow: Produces visual bugs.
