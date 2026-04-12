import {
  render,
  type RenderOptions,
  type RenderResult,
} from '@testing-library/react'
import { axe } from 'vitest-axe'
import { expect } from 'vitest'
import type { ReactElement } from 'react'

/**
 * Renders a component and asserts it has no WCAG 2.1 AA violations.
 * Returns the full RenderResult so tests can continue assertions.
 */
export async function renderWithAxe(
  ui: ReactElement,
  options?: RenderOptions,
): Promise<RenderResult> {
  const result = render(ui, options)
  const axeResults = await axe(result.container)
  expect(axeResults).toHaveNoViolations()
  return result
}
