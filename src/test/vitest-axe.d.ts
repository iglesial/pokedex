import 'vitest'

declare module 'vitest' {
  // Augments vitest's Assertion with vitest-axe's accessibility matcher.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Assertion<T = unknown> {
    toHaveNoViolations(): void
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void
  }
}
