import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { PokemonCard } from './PokemonCard'
import type { PokemonListEntry } from '../../../services/pokemonService'

const sample: PokemonListEntry = {
  id: 25,
  name: 'pikachu',
  spriteUrl: 'https://example.com/pikachu.png',
  types: ['electric'],
}

function renderCard(pokemon: PokemonListEntry) {
  return render(
    <MemoryRouter>
      <PokemonCard pokemon={pokemon} />
    </MemoryRouter>,
  )
}

describe('PokemonCard', () => {
  it('renders name, zero-padded number, and type badge', async () => {
    const { container } = renderCard(sample)
    expect(
      screen.getByRole('heading', { level: 2, name: /pikachu/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('#025')).toBeInTheDocument()
    expect(screen.getByText('Electric')).toBeInTheDocument()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('wraps the card in a link to the detail page', () => {
    renderCard(sample)
    const link = screen.getByRole('link', { name: /view pikachu details/i })
    expect(link).toHaveAttribute('href', '/pokemon/25')
  })

  it('shows sprite image with alt text', () => {
    renderCard(sample)
    expect(screen.getByAltText(/pikachu sprite/i)).toBeInTheDocument()
  })

  it('falls back to placeholder when sprite fails to load', () => {
    renderCard(sample)
    const img = screen.getByAltText(/pikachu sprite/i)
    fireEvent.error(img)
    expect(
      screen.getByLabelText(/pikachu sprite unavailable/i),
    ).toBeInTheDocument()
  })

  it('shows placeholder when spriteUrl is null', () => {
    renderCard({ ...sample, spriteUrl: null })
    expect(screen.getByLabelText(/sprite unavailable/i)).toBeInTheDocument()
  })

  it('renders both types when Pokémon has two', async () => {
    const dual: PokemonListEntry = {
      id: 1,
      name: 'bulbasaur',
      spriteUrl: 'https://example.com/bulbasaur.png',
      types: ['grass', 'poison'],
    }
    const { container } = renderCard(dual)
    expect(screen.getByText('Grass')).toBeInTheDocument()
    expect(screen.getByText('Poison')).toBeInTheDocument()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
