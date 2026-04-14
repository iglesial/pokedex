import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { TypeFilterChips } from './TypeFilterChips'

describe('TypeFilterChips', () => {
  it('renders all 18 types as buttons with aria-pressed', () => {
    render(<TypeFilterChips selected={[]} onChange={() => {}} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(18)
    buttons.forEach((b) => {
      expect(b).toHaveAttribute('aria-pressed', 'false')
    })
  })

  it('renders types in canonical alphabetical order', () => {
    render(<TypeFilterChips selected={[]} onChange={() => {}} />)
    const buttons = screen.getAllByRole('button').map((b) => b.textContent)
    expect(buttons).toEqual([
      'Bug',
      'Dark',
      'Dragon',
      'Electric',
      'Fairy',
      'Fighting',
      'Fire',
      'Flying',
      'Ghost',
      'Grass',
      'Ground',
      'Ice',
      'Normal',
      'Poison',
      'Psychic',
      'Rock',
      'Steel',
      'Water',
    ])
  })

  it('marks selected chips with aria-pressed="true"', () => {
    render(
      <TypeFilterChips selected={['fire', 'water']} onChange={() => {}} />,
    )
    expect(screen.getByRole('button', { name: 'Fire' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Water' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Grass' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('adds a type to selected when a non-selected chip is clicked', async () => {
    const onChange = vi.fn()
    render(<TypeFilterChips selected={[]} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Fire' }))
    expect(onChange).toHaveBeenCalledWith(['fire'])
  })

  it('removes a type from selected when an already-selected chip is clicked', async () => {
    const onChange = vi.fn()
    render(
      <TypeFilterChips selected={['fire', 'water']} onChange={onChange} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Fire' }))
    expect(onChange).toHaveBeenCalledWith(['water'])
  })

  it('supports keyboard toggling via Enter', async () => {
    const onChange = vi.fn()
    render(<TypeFilterChips selected={[]} onChange={onChange} />)
    const fireBtn = screen.getByRole('button', { name: 'Fire' })
    fireBtn.focus()
    await userEvent.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith(['fire'])
  })

  it('has no WCAG 2.1 AA violations', async () => {
    const { container } = render(
      <TypeFilterChips selected={['fire']} onChange={() => {}} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
