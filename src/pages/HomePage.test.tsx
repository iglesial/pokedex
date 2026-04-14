import {
  render as rtlRender,
  act,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { http, HttpResponse } from 'msw'
import type { ReactElement } from 'react'
import { server } from '../test/setup'
import {
  buildPokemonDetail,
  emptyListHandler,
  errorListHandler,
} from '../test/msw-handlers'
import { HomePage } from './HomePage'

const render = (ui: ReactElement, initialPath = '/') =>
  rtlRender(
    <MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>,
  )

describe('HomePage', () => {
  it('shows the Pokédex heading', () => {
    render(<HomePage />)
    expect(
      screen.getByRole('heading', { level: 1, name: /pokédex/i }),
    ).toBeInTheDocument()
  })

  it('shows a loading spinner while prefetching', () => {
    render(<HomePage />)
    expect(screen.getByText(/loading pokémon/i)).toBeInTheDocument()
  })

  // US1+US2+US3 baseline regression: no filters, no query, default page.
  it('with no filters, renders the baseline grid and pagination', async () => {
    render(<HomePage />)
    await waitFor(() => {
      expect(
        screen.getByRole('list', { name: /pokémon list/i }),
      ).toBeInTheDocument()
    })
    // 20 cards on page 1
    const grid = screen.getByRole('list', { name: /pokémon list/i })
    expect(grid.querySelectorAll('.pokemon-grid__item')).toHaveLength(20)
    // Pagination visible with 8 pages (151 / 20 = 8)
    expect(
      screen.getByRole('navigation', { name: /pokédex pagination/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 8' })).toBeInTheDocument()
  })

  it('shows an error alert when prefetch fails', async () => {
    server.use(errorListHandler)
    render(<HomePage />)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/HTTP 500/)
    })
  })

  it('shows empty-state message when the prefetched list is empty', async () => {
    server.use(emptyListHandler)
    render(<HomePage />)
    await waitFor(() => {
      expect(screen.getByText(/no pokémon match/i)).toBeInTheDocument()
    })
  })

  it('shows sprite fallback when image fails to load', async () => {
    render(<HomePage />)
    await waitFor(() => {
      expect(
        screen.getByRole('list', { name: /pokémon list/i }),
      ).toBeInTheDocument()
    })
    const firstImg = screen.getAllByAltText(/sprite/i)[0]
    fireEvent.error(firstImg)
    await waitFor(() => {
      expect(
        screen.getAllByLabelText(/sprite unavailable/i)[0],
      ).toBeInTheDocument()
    })
  })

  it('navigates to page 2 via pagination', async () => {
    render(<HomePage />)
    await waitFor(() => {
      expect(
        screen.getByRole('list', { name: /pokémon list/i }),
      ).toBeInTheDocument()
    })
    const firstCard = screen.getAllByText(/^#\d{3,}$/)[0].textContent
    await userEvent.click(screen.getByRole('button', { name: 'Page 2' }))
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Page 2' }),
      ).toHaveAttribute('aria-current', 'page')
    })
    const newFirstCard = screen.getAllByText(/^#\d{3,}$/)[0].textContent
    expect(newFirstCard).not.toBe(firstCard)
  })

  describe('filtering', () => {
    it('filters the grid when a type chip is clicked', async () => {
      // Give a known subset a distinct type so we can verify filtering.
      server.use(
        http.get('https://pokeapi.co/api/v2/pokemon/:id', ({ params }) => {
          const id = Number(params.id)
          const types =
            id === 4
              ? [{ slot: 1, type: { name: 'fire', url: '' } }]
              : [
                  { slot: 1, type: { name: 'grass', url: '' } },
                  { slot: 2, type: { name: 'poison', url: '' } },
                ]
          return HttpResponse.json(buildPokemonDetail(id, { types }))
        }),
      )
      render(<HomePage />)
      await waitFor(() => {
        expect(
          screen.getByRole('list', { name: /pokémon list/i }),
        ).toBeInTheDocument()
      })
      await userEvent.click(screen.getByRole('button', { name: 'Fire' }))
      await waitFor(() => {
        const items = screen.getAllByRole('listitem')
        // Only pokemon id=4 has 'fire' type in this fixture
        expect(items).toHaveLength(1)
      })
    })

    it('shows empty-state when no Pokémon match the filters', async () => {
      server.use(
        http.get('https://pokeapi.co/api/v2/pokemon/:id', ({ params }) => {
          const id = Number(params.id)
          return HttpResponse.json(
            buildPokemonDetail(id, {
              types: [{ slot: 1, type: { name: 'grass', url: '' } }],
            }),
          )
        }),
      )
      render(<HomePage />)
      await waitFor(() => {
        expect(
          screen.getByRole('list', { name: /pokémon list/i }),
        ).toBeInTheDocument()
      })
      await userEvent.click(screen.getByRole('button', { name: 'Fire' }))
      await waitFor(() => {
        expect(screen.getByText(/no pokémon match/i)).toBeInTheDocument()
      })
    })

    describe('search', () => {
      beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true })
      })

      afterEach(() => {
        vi.useRealTimers()
      })

      it('filters the grid by search query after debounce', async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
        render(<HomePage />)
        await waitFor(() => {
          expect(
            screen.getByRole('list', { name: /pokémon list/i }),
          ).toBeInTheDocument()
        })
        const input = screen.getByLabelText(/search pokémon by name/i)
        await user.type(input, 'pokemon-25')
        // Advance past debounce
        act(() => {
          vi.advanceTimersByTime(250)
        })
        await waitFor(() => {
          expect(screen.getAllByRole('listitem')).toHaveLength(1)
        })
      })
    })
  })

  it('Clear filters button appears only when filters are active', async () => {
    render(<HomePage />, '/?types=fire')
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /clear filters/i }),
      ).toBeInTheDocument()
    })
  })

  it('Clear filters button is hidden with no active filters', async () => {
    render(<HomePage />)
    await waitFor(() => {
      expect(
        screen.getByRole('list', { name: /pokémon list/i }),
      ).toBeInTheDocument()
    })
    expect(
      screen.queryByRole('button', { name: /clear filters/i }),
    ).not.toBeInTheDocument()
  })

  it('Clear filters resets query, types and page', async () => {
    render(<HomePage />, '/?q=char&types=fire&page=2')
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /clear filters/i }),
      ).toBeInTheDocument()
    })
    await userEvent.click(
      screen.getByRole('button', { name: /clear filters/i }),
    )
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /clear filters/i }),
      ).not.toBeInTheDocument()
    })
  })

  it(
    'has no WCAG 2.1 AA violations in loaded state',
    async () => {
      const { container } = render(<HomePage />)
      await waitFor(() => {
        expect(
          screen.getByRole('list', { name: /pokémon list/i }),
        ).toBeInTheDocument()
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    },
    20000,
  )
})
