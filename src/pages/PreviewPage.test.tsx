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

  it('renders all three category sections', () => {
    render(<PreviewPage />)
    expect(
      screen.getByRole('heading', { level: 2, name: /feedback & status/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /form inputs/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /layout & overlays/i }),
    ).toBeInTheDocument()
  })
})
