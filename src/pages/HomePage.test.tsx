import { render as rtlRender, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactElement } from 'react'

const render = (ui: ReactElement) =>
  rtlRender(<MemoryRouter>{ui}</MemoryRouter>)

import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { http, HttpResponse } from 'msw'
import { server } from '../test/setup'
import {
  buildListResponse,
  emptyListHandler,
  errorListHandler,
} from '../test/msw-handlers'
import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('shows the Pokédex heading', () => {
    render(<HomePage />)
    expect(
      screen.getByRole('heading', { level: 1, name: /pokédex/i }),
    ).toBeInTheDocument()
  })

  it('shows a loading spinner while fetching', () => {
    render(<HomePage />)
    expect(screen.getByRole('status')).toHaveTextContent(/loading pokémon/i)
  })

  it('renders a grid of Pokémon cards after successful fetch', async () => {
    render(<HomePage />)
    await waitFor(() => {
      expect(
        screen.getByRole('list', { name: /pokémon list/i }),
      ).toBeInTheDocument()
    })
    const items = screen.getAllByRole('listitem')
    expect(items.length).toBeGreaterThan(0)
    expect(screen.getAllByText(/^#\d{3,}$/)[0]).toBeInTheDocument()
    expect(screen.getAllByText(/Grass/i)[0]).toBeInTheDocument()
  })

  it('shows an error alert when fetch fails', async () => {
    server.use(errorListHandler)
    render(<HomePage />)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/HTTP 500/)
    })
  })

  it('shows empty-state message when no Pokémon returned', async () => {
    server.use(emptyListHandler)
    render(<HomePage />)
    await waitFor(() => {
      expect(screen.getByText(/no pokémon found/i)).toBeInTheDocument()
    })
  })

  it('shows sprite fallback when image fails to load', async () => {
    render(<HomePage />)
    await waitFor(() => {
      expect(
        screen.getByRole('list', { name: /pokémon list/i }),
      ).toBeInTheDocument()
    })
    const firstImg = screen.getAllByAltText(/sprite/i)[0] as HTMLImageElement
    fireEvent.error(firstImg)
    await waitFor(() => {
      expect(screen.getAllByLabelText(/sprite unavailable/i)[0]).toBeInTheDocument()
    })
  })

  it('renders pagination with Previous disabled on page 1', async () => {
    render(<HomePage />)
    await waitFor(() => {
      expect(
        screen.getByRole('list', { name: /pokémon list/i }),
      ).toBeInTheDocument()
    })
    expect(
      screen.getByRole('navigation', { name: /pokédex pagination/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /previous page/i }),
    ).toBeDisabled()
  })

  it('navigates to page 2 and replaces the list', async () => {
    render(<HomePage />)
    await waitFor(() => {
      expect(
        screen.getByRole('list', { name: /pokémon list/i }),
      ).toBeInTheDocument()
    })
    const firstPageFirstCard = screen.getAllByText(/^#\d{3,}$/)[0].textContent
    await userEvent.click(screen.getByRole('button', { name: 'Page 2' }))
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Page 2' }),
      ).toHaveAttribute('aria-current', 'page')
    })
    const page2FirstCard = screen.getAllByText(/^#\d{3,}$/)[0].textContent
    expect(page2FirstCard).not.toBe(firstPageFirstCard)
  })

  it('hides pagination when total pages is 1 or less', async () => {
    server.use(
      http.get('https://pokeapi.co/api/v2/pokemon', ({ request }) => {
        const url = new URL(request.url)
        const limit = Number(url.searchParams.get('limit') ?? '20')
        const offset = Number(url.searchParams.get('offset') ?? '0')
        return HttpResponse.json(
          buildListResponse({ limit, offset, count: Math.min(limit, 5) }),
        )
      }),
    )
    render(<HomePage />)
    await waitFor(() => {
      expect(
        screen.getByRole('list', { name: /pokémon list/i }),
      ).toBeInTheDocument()
    })
    expect(
      screen.queryByRole('navigation', { name: /pagination/i }),
    ).not.toBeInTheDocument()
  })

  it(
    'has no WCAG 2.1 AA violations in loaded state',
    async () => {
      server.use(
        http.get('https://pokeapi.co/api/v2/pokemon', ({ request }) => {
          const url = new URL(request.url)
          const offset = Number(url.searchParams.get('offset') ?? '0')
          // Smaller fixture keeps the axe check fast
          return HttpResponse.json(
            buildListResponse({ limit: 3, offset, count: 9 }),
          )
        }),
      )
      const { container } = render(<HomePage />)
      await waitFor(() => {
        expect(
          screen.getByRole('list', { name: /pokémon list/i }),
        ).toBeInTheDocument()
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    },
    15000,
  )
})
