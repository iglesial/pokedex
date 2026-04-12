import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithAxe } from '../../../test/helpers'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders with default neutral variant', async () => {
    await renderWithAxe(<Badge>Hello</Badge>)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it.each(['neutral', 'primary', 'secondary'] as const)(
    'renders variant "%s"',
    (variant) => {
      const { unmount, container } = render(
        <Badge variant={variant}>Tag</Badge>,
      )
      expect(container.querySelector(`.badge--${variant}`)).toBeInTheDocument()
      unmount()
    },
  )
})
