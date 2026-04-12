import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { renderWithAxe } from '../../../test/helpers'
import { ProgressBar } from './ProgressBar'

describe('ProgressBar', () => {
  it('renders with accessible label', async () => {
    await renderWithAxe(<ProgressBar value={50} label="Download progress" />)
    expect(
      screen.getByRole('progressbar', { name: /download progress/i }),
    ).toHaveAttribute('aria-valuenow', '50')
  })

  it.each([
    [0, 0],
    [50, 50],
    [100, 100],
  ])('renders value %i with aria-valuenow=%i', (value, expected) => {
    const { unmount } = render(<ProgressBar value={value} label="P" />)
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      String(expected),
    )
    unmount()
  })

  it('clamps out-of-range values', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { rerender } = render(<ProgressBar value={150} label="P" />)
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100',
    )
    rerender(<ProgressBar value={-10} label="P" />)
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '0',
    )
    warnSpy.mockRestore()
  })
})
