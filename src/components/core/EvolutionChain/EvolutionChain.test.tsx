import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { http, HttpResponse } from 'msw'
import { server } from '../../../test/setup'
import {
  buildEvolutionChainResponse,
  buildSpeciesResponse,
  evolutionChainErrorHandler,
} from '../../../test/msw-handlers'
import { EvolutionChain } from './EvolutionChain'

function renderChain(pokemonId: number, initialPath = '/pokemon/1') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/pokemon/:id"
          element={<EvolutionChain pokemonId={pokemonId} />}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('EvolutionChain', () => {
  it('renders the section heading', () => {
    renderChain(1)
    expect(
      screen.getByRole('heading', { level: 2, name: /evolution/i }),
    ).toBeInTheDocument()
  })

  it('shows a loading spinner while fetching', () => {
    renderChain(1)
    expect(screen.getByRole('status')).toHaveTextContent(
      /loading evolutions/i,
    )
  })

  it('renders a linear chain (Bulbasaur → Ivysaur → Venusaur)', async () => {
    server.use(
      http.get(
        'https://pokeapi.co/api/v2/pokemon-species/:id',
        () => HttpResponse.json(buildSpeciesResponse(1, 1)),
      ),
      http.get(
        'https://pokeapi.co/api/v2/evolution-chain/:id',
        () => HttpResponse.json(buildEvolutionChainResponse([[1, 2, 3]])),
      ),
    )
    renderChain(1)
    await waitFor(() => {
      expect(screen.getByText('Pokemon 1')).toBeInTheDocument()
    })
    expect(screen.getByText('Pokemon 2')).toBeInTheDocument()
    expect(screen.getByText('Pokemon 3')).toBeInTheDocument()
  })

  it('shows the no-evolve message for single-stage Pokémon', async () => {
    server.use(
      http.get(
        'https://pokeapi.co/api/v2/pokemon-species/:id',
        () => HttpResponse.json(buildSpeciesResponse(151, 151)),
      ),
      http.get(
        'https://pokeapi.co/api/v2/evolution-chain/:id',
        () =>
          HttpResponse.json(buildEvolutionChainResponse([[151]], 151)),
      ),
    )
    renderChain(151)
    await waitFor(() => {
      expect(
        screen.getByText(/this pokémon does not evolve/i),
      ).toBeInTheDocument()
    })
  })

  it('shows an error Alert when the chain fetch fails', async () => {
    server.use(evolutionChainErrorHandler)
    renderChain(1)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/HTTP 500/)
    })
  })

  it('marks the current Pokémon with aria-current="page"', async () => {
    server.use(
      http.get(
        'https://pokeapi.co/api/v2/pokemon-species/:id',
        () => HttpResponse.json(buildSpeciesResponse(2, 1)),
      ),
      http.get(
        'https://pokeapi.co/api/v2/evolution-chain/:id',
        () => HttpResponse.json(buildEvolutionChainResponse([[1, 2, 3]])),
      ),
    )
    renderChain(2)
    await waitFor(() => {
      expect(screen.getByText('Pokemon 2')).toBeInTheDocument()
    })
    const ivysaurCard = screen.getByText('Pokemon 2').closest('.evo-mini')
    expect(ivysaurCard).toHaveAttribute('aria-current', 'page')
  })

  it('navigates to a sibling card when clicked', async () => {
    server.use(
      http.get(
        'https://pokeapi.co/api/v2/pokemon-species/:id',
        () => HttpResponse.json(buildSpeciesResponse(1, 1)),
      ),
      http.get(
        'https://pokeapi.co/api/v2/evolution-chain/:id',
        () => HttpResponse.json(buildEvolutionChainResponse([[1, 2, 3]])),
      ),
    )
    render(
      <MemoryRouter initialEntries={['/pokemon/1']}>
        <Routes>
          <Route
            path="/pokemon/:id"
            element={<EvolutionChain pokemonId={1} />}
          />
        </Routes>
      </MemoryRouter>,
    )
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /view pokemon 2 details/i }),
      ).toBeInTheDocument()
    })
    // Just verifying the button exists and is clickable; we don't test the
    // navigation target itself here (covered by DetailPage tests).
    await userEvent.click(
      screen.getByRole('button', { name: /view pokemon 2 details/i }),
    )
  })

  describe('branching evolutions (US3)', () => {
    it('renders Eevee branching to 3 Kanto evolutions without duplicating ancestor', async () => {
      server.use(
        http.get(
          'https://pokeapi.co/api/v2/pokemon-species/:id',
          () => HttpResponse.json(buildSpeciesResponse(133, 1)),
        ),
        http.get(
          'https://pokeapi.co/api/v2/evolution-chain/:id',
          () =>
            HttpResponse.json(
              buildEvolutionChainResponse([
                [133, 134],
                [133, 135],
                [133, 136],
              ]),
            ),
        ),
      )
      renderChain(133)
      await waitFor(() => {
        expect(screen.getByText('Pokemon 133')).toBeInTheDocument()
      })
      expect(screen.getAllByText('Pokemon 133')).toHaveLength(1)
      expect(screen.getByText('Pokemon 134')).toBeInTheDocument()
      expect(screen.getByText('Pokemon 135')).toBeInTheDocument()
      expect(screen.getByText('Pokemon 136')).toBeInTheDocument()
    })

    it('renders out-of-Kanto stages as muted non-clickable placeholders', async () => {
      server.use(
        http.get(
          'https://pokeapi.co/api/v2/pokemon-species/:id',
          () => HttpResponse.json(buildSpeciesResponse(41, 1)),
        ),
        http.get(
          'https://pokeapi.co/api/v2/evolution-chain/:id',
          () =>
            HttpResponse.json(
              buildEvolutionChainResponse([[41, 42, 169]]),
            ),
        ),
      )
      renderChain(41)
      await waitFor(() => {
        expect(screen.getByText('Pokemon 41')).toBeInTheDocument()
      })
      expect(screen.getByText('Gen II+')).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /view pokemon 169 details/i }),
      ).not.toBeInTheDocument()
    })
  })

  it('has no WCAG 2.1 AA violations in loaded state', async () => {
    server.use(
      http.get(
        'https://pokeapi.co/api/v2/pokemon-species/:id',
        () => HttpResponse.json(buildSpeciesResponse(1, 1)),
      ),
      http.get(
        'https://pokeapi.co/api/v2/evolution-chain/:id',
        () => HttpResponse.json(buildEvolutionChainResponse([[1, 2, 3]])),
      ),
    )
    const { container } = renderChain(1)
    await waitFor(() => {
      expect(screen.getByText('Pokemon 3')).toBeInTheDocument()
    })
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
