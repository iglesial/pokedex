import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithAxe } from '../../../test/helpers'
import { FormField } from './FormField'
import { Input } from '../Input/Input'

describe('FormField', () => {
  it('associates label with input via htmlFor/id', async () => {
    await renderWithAxe(
      <FormField label="Name">{(ids) => <Input {...ids} />}</FormField>,
    )
    const input = screen.getByLabelText('Name')
    expect(input).toBeInTheDocument()
  })

  it('links help text via aria-describedby when no error', () => {
    render(
      <FormField label="Email" help="We never share your email.">
        {(ids) => <Input {...ids} />}
      </FormField>,
    )
    const input = screen.getByLabelText('Email')
    const describedBy = input.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(screen.getByText(/never share/i).id).toBe(describedBy)
  })

  it('links error text and sets aria-invalid when error is present', async () => {
    await renderWithAxe(
      <FormField label="Password" error="Required field">
        {(ids) => <Input {...ids} type="password" />}
      </FormField>,
    )
    const input = screen.getByLabelText('Password')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    const describedBy = input.getAttribute('aria-describedby')
    expect(screen.getByText('Required field').id).toBe(describedBy)
  })
})
