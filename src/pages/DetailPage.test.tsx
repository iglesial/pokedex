import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { http, HttpResponse } from 'msw'
import { server } from '../test/setup'
import { buildPokemonDetail } from '../test/msw-handlers'
import { DetailPage } from './DetailPage'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/pokemon/:id" element={<DetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('DetailPage', () => {
  it('renders the name as the page heading after load', async () => {
    server.use(
      http.get('https://pokeapi.co/api/v2/pokemon/:id', ({ params }) => {
        const id = Number(params.id)
        return HttpResponse.json(
          buildPokemonDetail(id, {
            name: 'pikachu',
            types: [{ slot: 1, type: { name: 'electric', url: '' } }],
            stats: [
              { base_stat: 35, effort: 0, stat: { name: 'hp', url: '' } },
              { base_stat: 55, effort: 0, stat: { name: 'attack', url: '' } },
              { base_stat: 40, effort: 0, stat: { name: 'defense', url: '' } },
              { base_stat: 50, effort: 0, stat: { name: 'special-attack', url: '' } },
              { base_stat: 50, effort: 0, stat: { name: 'special-defense', url: '' } },
              { base_stat: 90, effort: 0, stat: { name: 'speed', url: '' } },
            ],
            height: 4,
            weight: 60,
          }),
        )
      }),
    )
    renderAt('/pokemon/25')
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: /pikachu/i }),
      ).toBeInTheDocument()
    })
    expect(screen.getByText('#025')).toBeInTheDocument()
    expect(screen.getByText(/Electric/)).toBeInTheDocument()
    expect(screen.getByText('0.4 m')).toBeInTheDocument()
    expect(screen.getByText('6.0 kg')).toBeInTheDocument()
  })

  it('shows Spinner while loading', () => {
    renderAt('/pokemon/1')
    expect(screen.getByRole('status')).toHaveTextContent(/loading pokémon/i)
  })

  it('shows error Alert on fetch failure', async () => {
    server.use(
      http.get('https://pokeapi.co/api/v2/pokemon/:id', () =>
        HttpResponse.text('server error', { status: 500 }),
      ),
    )
    renderAt('/pokemon/1')
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/HTTP 500/)
    })
  })

  it('shows Not Found view for out-of-range id', async () => {
    renderAt('/pokemon/999')
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /pokémon not found/i }),
      ).toBeInTheDocument()
    })
    expect(screen.getByRole('link', { name: /back to list/i })).toHaveAttribute(
      'href',
      '/?page=1',
    )
  })

  it('shows Not Found view for non-numeric id', async () => {
    renderAt('/pokemon/abc')
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /pokémon not found/i }),
      ).toBeInTheDocument()
    })
  })

  it('renders abilities with hidden ability marked', async () => {
    server.use(
      http.get('https://pokeapi.co/api/v2/pokemon/:id', ({ params }) => {
        const id = Number(params.id)
        return HttpResponse.json(
          buildPokemonDetail(id, {
            abilities: [
              {
                ability: { name: 'overgrow', url: '' },
                is_hidden: false,
                slot: 1,
              },
              {
                ability: { name: 'chlorophyll', url: '' },
                is_hidden: true,
                slot: 3,
              },
            ],
          }),
        )
      }),
    )
    renderAt('/pokemon/1')
    await waitFor(() => {
      expect(screen.getByText('Overgrow')).toBeInTheDocument()
    })
    expect(screen.getByText(/Hidden: Chlorophyll/)).toBeInTheDocument()
  })

  it('renders the moves grid and normalizes hyphenated names', async () => {
    server.use(
      http.get('https://pokeapi.co/api/v2/pokemon/:id', ({ params }) => {
        const id = Number(params.id)
        return HttpResponse.json(
          buildPokemonDetail(id, {
            moves: [
              {
                move: { name: 'thunder-shock', url: '' },
                version_group_details: [],
              },
              {
                move: { name: 'quick-attack', url: '' },
                version_group_details: [],
              },
            ],
          }),
        )
      }),
    )
    renderAt('/pokemon/1')
    await waitFor(() => {
      expect(screen.getByText('Thunder Shock')).toBeInTheDocument()
    })
    expect(screen.getByText('Quick Attack')).toBeInTheDocument()
  })

  it('shows empty states when abilities and moves are missing', async () => {
    server.use(
      http.get('https://pokeapi.co/api/v2/pokemon/:id', ({ params }) => {
        const id = Number(params.id)
        return HttpResponse.json(
          buildPokemonDetail(id, { abilities: [], moves: [] }),
        )
      }),
    )
    renderAt('/pokemon/1')
    await waitFor(() => {
      expect(screen.getByText(/no abilities listed/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/no moves listed/i)).toBeInTheDocument()
  })

  it('renders sprite fallback when image errors', async () => {
    renderAt('/pokemon/1')
    await waitFor(() => {
      expect(screen.getByAltText(/sprite/i)).toBeInTheDocument()
    })
    const img = screen.getByAltText(/sprite/i)
    fireEvent.error(img)
    await waitFor(() => {
      expect(screen.getByLabelText(/sprite unavailable/i)).toBeInTheDocument()
    })
  })

  it('renders a Back button in the loaded state', async () => {
    renderAt('/pokemon/1')
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('Back button navigates to list when activated', async () => {
    render(
      <MemoryRouter initialEntries={['/?page=3', '/pokemon/1']} initialIndex={1}>
        <Routes>
          <Route path="/" element={<div>List page</div>} />
          <Route path="/pokemon/:id" element={<DetailPage />} />
        </Routes>
      </MemoryRouter>,
    )
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    await waitFor(() => {
      expect(screen.getByText('List page')).toBeInTheDocument()
    })
  })

  it(
    'has no WCAG 2.1 AA violations in loaded state',
    async () => {
      const { container } = renderAt('/pokemon/1')
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1 }),
        ).toBeInTheDocument()
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    },
    15000,
  )
})
