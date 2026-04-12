import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithAxe } from '../../../test/helpers'
import { Input } from './Input'

describe('Input', () => {
  it('renders and accepts typed input', async () => {
    await renderWithAxe(<Input aria-label="Name" />)
    const field = screen.getByRole('textbox', { name: 'Name' })
    await userEvent.type(field, 'Pikachu')
    expect(field).toHaveValue('Pikachu')
  })

  it('sets aria-invalid when invalid prop is true', () => {
    render(<Input aria-label="Email" invalid />)
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })

  it('can be disabled', () => {
    render(<Input aria-label="Locked" disabled />)
    expect(screen.getByRole('textbox', { name: 'Locked' })).toBeDisabled()
  })
})
