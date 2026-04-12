import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PreviewPage } from './PreviewPage'

describe('PreviewPage', () => {
  it('renders the Component Preview heading', () => {
    render(<PreviewPage />)
    expect(
      screen.getByRole('heading', { level: 1, name: /component preview/i }),
    ).toBeInTheDocument()
  })

  it('shows empty gallery message', () => {
    render(<PreviewPage />)
    expect(
      screen.getByText(/no components have been added yet/i),
    ).toBeInTheDocument()
  })
})
