import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithAxe } from '../../../test/helpers'
import { Textarea } from './Textarea'

describe('Textarea', () => {
  it('renders and accepts typed input', async () => {
    await renderWithAxe(<Textarea aria-label="Notes" />)
    const field = screen.getByRole('textbox', { name: 'Notes' })
    await userEvent.type(field, 'Hello')
    expect(field).toHaveValue('Hello')
  })

  it('sets aria-invalid when invalid', () => {
    render(<Textarea aria-label="N" invalid />)
    expect(screen.getByRole('textbox', { name: 'N' })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })

  it('can be disabled', () => {
    render(<Textarea aria-label="N" disabled />)
    expect(screen.getByRole('textbox', { name: 'N' })).toBeDisabled()
  })
})
