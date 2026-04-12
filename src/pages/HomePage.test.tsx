import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('renders the Pokédex heading', () => {
    render(<HomePage />)
    expect(
      screen.getByRole('heading', { level: 1, name: /pokédex/i }),
    ).toBeInTheDocument()
  })

  it('renders welcome message', () => {
    render(<HomePage />)
    expect(screen.getByText(/welcome to the pokédex/i)).toBeInTheDocument()
  })

  it('uses semantic HTML structure', () => {
    render(<HomePage />)
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('has no WCAG 2.1 AA accessibility violations', async () => {
    const { container } = render(<HomePage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
