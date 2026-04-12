import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithAxe } from '../../../test/helpers'
import { Hero } from './Hero'

describe('Hero', () => {
  it('renders with heading', async () => {
    await renderWithAxe(<Hero heading={<h1>Welcome</h1>} />)
    expect(screen.getByRole('heading', { name: 'Welcome' })).toBeInTheDocument()
  })

  it('renders subheading when provided', () => {
    render(<Hero heading={<h1>H</h1>} subheading="Sub text" />)
    expect(screen.getByText('Sub text')).toBeInTheDocument()
  })

  it('renders action when provided', () => {
    render(
      <Hero heading={<h1>H</h1>} action={<button type="button">Go</button>} />,
    )
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument()
  })
})
