import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithAxe } from '../../../test/helpers'
import { Select } from './Select'

describe('Select', () => {
  it('renders options and supports selection change', async () => {
    await renderWithAxe(
      <Select aria-label="Type" defaultValue="fire">
        <option value="fire">Fire</option>
        <option value="water">Water</option>
        <option value="grass">Grass</option>
      </Select>,
    )
    const select = screen.getByRole('combobox', { name: 'Type' })
    await userEvent.selectOptions(select, 'water')
    expect(select).toHaveValue('water')
  })

  it('sets aria-invalid when invalid', () => {
    render(
      <Select aria-label="T" invalid>
        <option>a</option>
      </Select>,
    )
    expect(screen.getByRole('combobox', { name: 'T' })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })

  it('can be disabled', () => {
    render(
      <Select aria-label="D" disabled>
        <option>a</option>
      </Select>,
    )
    expect(screen.getByRole('combobox', { name: 'D' })).toBeDisabled()
  })
})
