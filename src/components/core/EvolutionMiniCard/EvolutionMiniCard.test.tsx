import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import type { EvolutionNode } from '../../../types/evolutionChain'
import { EvolutionMiniCard } from './EvolutionMiniCard'

const pikachu: EvolutionNode = {
  id: 25,
  name: 'pikachu',
  spriteUrl: 'https://example.com/25.png',
  inKantoRange: true,
}

const crobat: EvolutionNode = {
  id: 169,
  name: 'crobat',
  spriteUrl: 'https://example.com/169.png',
  inKantoRange: false,
}

describe('EvolutionMiniCard', () => {
  it('renders sprite, number and name', async () => {
    const { container } = render(
      <EvolutionMiniCard node={pikachu} onClick={() => {}} />,
    )
    expect(screen.getByText('Pikachu')).toBeInTheDocument()
    expect(screen.getByText('#025')).toBeInTheDocument()
    expect(screen.getByAltText('Pikachu sprite')).toBeInTheDocument()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders as a button and fires onClick when interactive', async () => {
    const onClick = vi.fn()
    render(<EvolutionMiniCard node={pikachu} onClick={onClick} />)
    await userEvent.click(
      screen.getByRole('button', { name: /view pikachu details/i }),
    )
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders as non-button when current with aria-current="page"', () => {
    render(<EvolutionMiniCard node={pikachu} current onClick={() => {}} />)
    expect(
      screen.queryByRole('button', { name: /view pikachu/i }),
    ).not.toBeInTheDocument()
    // The card itself should carry aria-current
    const text = screen.getByText('Pikachu').closest('.evo-mini')
    expect(text).toHaveAttribute('aria-current', 'page')
  })

  it('renders out-of-Kanto card as non-clickable with Gen II+ badge', () => {
    render(<EvolutionMiniCard node={crobat} onClick={() => {}} />)
    expect(
      screen.queryByRole('button', { name: /view crobat/i }),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Gen II+')).toBeInTheDocument()
  })

  it('shows sprite fallback on image error', () => {
    render(<EvolutionMiniCard node={pikachu} onClick={() => {}} />)
    const img = screen.getByAltText('Pikachu sprite')
    fireEvent.error(img)
    expect(
      screen.getByLabelText(/pikachu sprite unavailable/i),
    ).toBeInTheDocument()
  })
})
