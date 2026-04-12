import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithAxe } from '../../../test/helpers'
import { Spinner } from './Spinner'

describe('Spinner', () => {
  it('renders with default label', async () => {
    await renderWithAxe(<Spinner />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading')
  })

  it('renders with custom label', () => {
    render(<Spinner label="Fetching Pokédex" />)
    expect(screen.getByRole('status')).toHaveTextContent('Fetching Pokédex')
  })

  it.each(['sm', 'md', 'lg'] as const)('renders size "%s"', (size) => {
    const { container, unmount } = render(<Spinner size={size} />)
    expect(container.querySelector(`.spinner--${size}`)).toBeInTheDocument()
    unmount()
  })
})
