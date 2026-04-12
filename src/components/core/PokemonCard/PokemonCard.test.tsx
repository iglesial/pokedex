import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithAxe } from '../../../test/helpers'
import { PokemonCard } from './PokemonCard'
import type { PokemonListEntry } from '../../../services/pokemonService'

const sample: PokemonListEntry = {
  id: 25,
  name: 'pikachu',
  spriteUrl: 'https://example.com/pikachu.png',
  types: ['electric'],
}

describe('PokemonCard', () => {
  it('renders name, zero-padded number, and type badge', async () => {
    await renderWithAxe(<PokemonCard pokemon={sample} />)
    expect(
      screen.getByRole('heading', { level: 2, name: /pikachu/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('#025')).toBeInTheDocument()
    expect(screen.getByText('Electric')).toBeInTheDocument()
  })

  it('shows sprite image with alt text', () => {
    render(<PokemonCard pokemon={sample} />)
    expect(screen.getByAltText(/pikachu sprite/i)).toBeInTheDocument()
  })

  it('falls back to placeholder when sprite fails to load', () => {
    render(<PokemonCard pokemon={sample} />)
    const img = screen.getByAltText(/pikachu sprite/i)
    fireEvent.error(img)
    expect(
      screen.getByLabelText(/pikachu sprite unavailable/i),
    ).toBeInTheDocument()
  })

  it('shows placeholder when spriteUrl is null', () => {
    render(
      <PokemonCard pokemon={{ ...sample, spriteUrl: null }} />,
    )
    expect(screen.getByLabelText(/sprite unavailable/i)).toBeInTheDocument()
  })

  it('renders both types when Pokémon has two', async () => {
    const dual: PokemonListEntry = {
      id: 1,
      name: 'bulbasaur',
      spriteUrl: 'https://example.com/bulbasaur.png',
      types: ['grass', 'poison'],
    }
    await renderWithAxe(<PokemonCard pokemon={dual} />)
    expect(screen.getByText('Grass')).toBeInTheDocument()
    expect(screen.getByText('Poison')).toBeInTheDocument()
  })
})
