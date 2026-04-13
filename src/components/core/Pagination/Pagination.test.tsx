import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { renderWithAxe } from '../../../test/helpers'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('renders nothing when totalPages <= 1', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders all pages when total is small', async () => {
    await renderWithAxe(
      <Pagination currentPage={2} totalPages={5} onPageChange={() => {}} />,
    )
    for (let p = 1; p <= 5; p++) {
      expect(
        screen.getByRole('button', { name: `Page ${p.toString()}` }),
      ).toBeInTheDocument()
    }
  })

  it('marks the current page with aria-current="page"', () => {
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />,
    )
    expect(
      screen.getByRole('button', { name: 'Page 3' }),
    ).toHaveAttribute('aria-current', 'page')
  })

  it('disables Previous on the first page', () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />,
    )
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /next page/i })).not.toBeDisabled()
  })

  it('disables Next on the last page', () => {
    render(
      <Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />,
    )
    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled()
    expect(
      screen.getByRole('button', { name: /previous page/i }),
    ).not.toBeDisabled()
  })

  it('calls onPageChange when a page button is clicked', async () => {
    const onPageChange = vi.fn()
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Page 3' }))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('renders ellipses for large page counts', () => {
    render(
      <Pagination currentPage={20} totalPages={65} onPageChange={() => {}} />,
    )
    // Shows first, last, and window around current
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 65' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 20' })).toBeInTheDocument()
    // Ellipses are aria-hidden; find via text
    expect(screen.getAllByText('…').length).toBeGreaterThanOrEqual(1)
    // Not all 65 page buttons exist
    expect(
      screen.queryByRole('button', { name: 'Page 10' }),
    ).not.toBeInTheDocument()
  })
})
