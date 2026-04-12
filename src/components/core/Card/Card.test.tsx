import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithAxe } from '../../../test/helpers'
import { Card } from './Card'

describe('Card', () => {
  it('renders children', async () => {
    await renderWithAxe(<Card>Body</Card>)
    expect(screen.getByText('Body')).toBeInTheDocument()
  })

  it('renders heading when provided', () => {
    render(<Card heading={<h2>Title</h2>}>Body</Card>)
    expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument()
  })

  it('renders footer when provided', () => {
    render(<Card footer={<span>Footer content</span>}>Body</Card>)
    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })
})
