import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { renderWithAxe } from '../../../test/helpers'
import { Alert } from './Alert'

describe('Alert', () => {
  it('renders with default severity and content', async () => {
    await renderWithAxe(<Alert severity="info">Info message</Alert>)
    expect(screen.getByText('Info message')).toBeInTheDocument()
  })

  it.each(['info', 'success', 'warning', 'error'] as const)(
    'renders severity variant "%s" with appropriate role',
    (severity) => {
      const { unmount } = render(<Alert severity={severity}>msg</Alert>)
      const expectedRole =
        severity === 'error' || severity === 'warning' ? 'alert' : 'status'
      expect(screen.getByRole(expectedRole)).toBeInTheDocument()
      unmount()
    },
  )

  it('invokes onDismiss when close button is clicked', async () => {
    const onDismiss = vi.fn()
    render(
      <Alert severity="error" onDismiss={onDismiss}>
        Error
      </Alert>,
    )
    await userEvent.click(screen.getByRole('button', { name: /dismiss/i }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('renders optional title', async () => {
    await renderWithAxe(
      <Alert severity="warning" title="Heads up">
        Body
      </Alert>,
    )
    expect(screen.getByText('Heads up')).toBeInTheDocument()
  })
})
